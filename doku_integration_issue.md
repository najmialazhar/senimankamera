# Issue: Migrasi Payment Gateway dari Midtrans ke DOKU (Jokul Checkout)

## 📌 Deskripsi Issue

Proses verifikasi akun production Midtrans untuk studio **Seniman Kamera** mengalami keterlambatan yang signifikan dan belum kunjung disetujui (under review). Guna mempercepat perilisan sistem pembayaran uang muka (DP) secara live bagi pelanggan, diputuskan untuk memindahkan sistem pembayaran dari **Midtrans Snap** ke **DOKU Checkout (Jokul Checkout)**.

Migrasi ini memerlukan penggantian penuh SDK client-side, endpoint API backend, skema pembuatan tanda tangan (signature verification) untuk webhook/notifikasi, serta konfigurasi environment variables terkait.

---

## 🔍 Detail Perubahan Sistem Pembayaran

### 1. Perubahan Sisi Klien (Frontend)
* **Sebelumnya (Midtrans Snap)**: Menggunakan script `snap.js` untuk membuka pop-up/modal iframe di halaman booking.
* **Sesudahnya (DOKU Checkout)**: 
  * Pelanggan akan diarahkan (redirect) langsung ke URL halaman pembayaran DOKU (`payment.url` yang dihasilkan dari API backend).
  * Atau dapat menggunakan pustaka modal/lightbox DOKU (`jokul-checkout-1.0.0.js`) jika ingin mempertahankan pengalaman di dalam situs, namun redirect langsung ke halaman pembayaran DOKU Hosted Checkout lebih direkomendasikan untuk stabilitas dan responsivitas mobile.

### 2. Perubahan Sisi Server (Backend & Infrastruktur)
* Membuat layanan baru [doku.service.ts](file:///d:/Project/seniman%20kamera/senimankamera/src/infrastructure/doku/doku.service.ts) untuk mengurus permintaan pembuatan pembayaran (payment link) ke API DOKU dan penanganan logika enkripsi/signature.
* Mengganti logika pemanggilan di dalam Use Case [initiate-booking-draft.use-case.ts](file:///d:/Project/seniman%20kamera/senimankamera/src/modules/booking/use-cases/initiate-booking-draft.use-case.ts).
* Mengubah endpoint notifikasi webhook [route.ts](file:///d:/Project/seniman%20kamera/senimankamera/app/api/payment/notification/route.ts) (atau membuat rute baru) agar dapat menerima payload webhook DOKU dan memverifikasi signature-nya sebelum mengubah status booking dari draft ke pesanan aktif.

---

## ⚙️ Spesifikasi Teknis Integrasi DOKU API

### 1. Endpoint DOKU Checkout
* **Sandbox**: `https://api-sandbox.doku.com/checkout/v1/payment`
* **Production**: `https://api.doku.com/checkout/v1/payment`

### 2. Skema Autentikasi Header DOKU
Setiap request ke API DOKU wajib menyertakan header berikut:
```http
Client-Id: <DOKU_CLIENT_ID>
Request-Id: <UUID-Unique-Per-Request>
Request-Timestamp: <ISO-8601-UTC-Timestamp-e.g.-2026-06-25T07:00:00Z>
Signature: HMACSHA256=<Generated-Signature>
```

#### Cara Menghitung `Signature` Request:
1. Hitung **Digest** dari JSON Request Body:
   ```typescript
   const digest = crypto.createHash("sha256").update(JSON.stringify(body)).digest("base64");
   ```
2. Buat **String to Sign** dengan format:
   ```text
   Client-Id:<Client-Id>
   Request-Id:<Request-Id>
   Request-Timestamp:<Request-Timestamp>
   Request-Target:<Request-Target-e.g.-/checkout/v1/payment>
   Digest:<Digest>
   ```
   *(Pemisah baris menggunakan karakter `\n` tanpa newline di akhir).*
3. Hitung HMAC-SHA256 menggunakan **Doku Secret Key (Shared Key)**, kemudian encode hasilnya ke Base64 dan tambahkan prefix `HMACSHA256=`.

### 3. Payload Request Pembuatan Pembayaran (POST `/checkout/v1/payment`)
```json
{
  "order": {
    "amount": 150000,
    "invoice_number": "BOOK-20260625-XXXX",
    "currency": "IDR",
    "callback_url": "https://senimankamera.com/book/success"
  },
  "payment": {
    "payment_due_date": 20
  },
  "customer": {
    "name": "Nama Pelanggan",
    "email": "email@pelanggan.com",
    "phone": "081234567890"
  }
}
```

### 4. Respons API DOKU (Sukses `200 OK`)
```json
{
  "payment": {
    "url": "https://jokul.doku.com/checkout/link/XXXXXX"
  },
  "order": {
    "invoice_number": "BOOK-20260625-XXXX",
    "amount": 150000
  }
}
```
URL `payment.url` tersebut disimpan ke database sebagai pengganti `snapUrl` dan dikirimkan ke frontend untuk redirect halaman pembayaran.

---

## 🔔 Spesifikasi Webhook DOKU (Notification)

Ketika pelanggan menyelesaikan pembayaran, DOKU akan mengirimkan POST request ke URL Webhook kita.

### 1. Payload Webhook DOKU (Contoh)
```json
{
  "service": {
    "id": "SINGLE_PAYMENT"
  },
  "order": {
    "invoice_number": "BOOK-20260625-XXXX",
    "amount": 150000
  },
  "transaction": {
    "status": "SUCCESS",
    "date": "2026-06-25T07:15:30Z",
    "original_amount": 150000
  }
}
```

### 2. Verifikasi Webhook Signature
Langkah verifikasi signature webhook sama dengan pembuatan request signature:
1. Ambil nilai `Client-Id`, `Request-Id`, `Request-Timestamp`, dan `Signature` dari header request webhook.
2. Hitung **Digest** dari raw JSON body webhook.
3. Konstruksikan **String to Sign**:
   ```text
   Client-Id:<Client-Id-dari-header>
   Request-Id:<Request-Id-dari-header>
   Request-Timestamp:<Request-Timestamp-dari-header>
   Request-Target:<Path-Webhook-Target-e.g.-/api/payment/notification>
   Digest:<Digest-hasil-kalkulasi>
   ```
4. Hitung HMAC-SHA256 dari String to Sign menggunakan **Doku Secret Key**, lakukan Base64 encode, dan bandingkan dengan header `Signature` (yang diawali dengan `HMACSHA256=`).

---

## 🛠️ Langkah-Langkah Perubahan Kode (Task Checklist)

- [ ] **1. Menambahkan Environment Variables Baru**
  Update file `.env` dan `.env.example` untuk DOKU:
  ```env
  DOKU_CLIENT_ID="your-doku-client-id"
  DOKU_SECRET_KEY="your-doku-secret-key"
  NEXT_PUBLIC_DOKU_IS_PRODUCTION="false"
  ```

- [ ] **2. Membuat Doku Service (`src/infrastructure/doku/doku.service.ts`)**
  Implementasikan kelas `DokuService` dengan metode:
  * `createCheckoutSession(input: CreateDokuTransactionInput)`: Menghasilkan `payment.url`.
  * `verifyWebhookSignature(headers: any, rawBody: string, requestTarget: string)`: Memvalidasi keaslian webhook.

- [ ] **3. Memodifikasi Booking Draft Use Case (`src/modules/booking/use-cases/initiate-booking-draft.use-case.ts`)**
  * Ganti import `MidtransService` menjadi `DokuService`.
  * Ganti logika generate `snapResult` menjadi pemanggilan `dokuService.createCheckoutSession`.
  * Sesuaikan parameter mapping input ke API DOKU (invoice menggunakan ID draft booking).

- [ ] **4. Memodifikasi Booking Form UI (`src/modules/booking/components/booking-form.tsx`)**
  * Hapus pemuatan script `snap.js` Midtrans secara dinamis.
  * Hapus callback event `(window as any).snap.pay`.
  * Ubah alur setelah sukses memanggil `initiateDraftBookingAction` agar langsung mengarahkan window ke `response.data.snapUrl` (atau `paymentUrl`).

- [ ] **5. Menyesuaikan Webhook Handler (`app/api/payment/notification/route.ts`)**
  * Ubah logika validasi signature untuk menggunakan algoritma DOKU.
  * Sesuaikan pembacaan payload body (DOKU menggunakan `order.invoice_number` sebagai ID pesanan, dan status sukses ditandai dengan `transaction.status === "SUCCESS"`).
  * Pertahankan pemanggilan `ConfirmBookingFromDraftUseCase` untuk memfinalisasi pemesanan ke database dan mengirimkan notifikasi Telegram.

- [ ] **6. Pengujian & Verifikasi (Sandbox)**
  * Lakukan pengujian proses booking dari frontend.
  * Pastikan berhasil ter-redirect ke halaman DOKU Sandbox.
  * Simulasikan pembayaran sukses melalui simulator DOKU.
  * Verifikasi data booking berhasil tersimpan di database PostgreSQL dan notifikasi Telegram terkirim.

---

## ⚠️ Konsekuensi & Mitigasi
* **Pemberhentian Midtrans**: Semua endpoint, API Key, dan service Midtrans akan dinonaktifkan sepenuhnya.
* **Perbedaan Alur UX**: Pelanggan tidak lagi membayar di dalam pop-up modal di situs kita melainkan akan dialihkan sementara ke situs pembayaran DOKU dan dikembalikan setelah selesai. Hal ini perlu diuji dengan baik agar transisi status kembali ke web berjalan mulus.
