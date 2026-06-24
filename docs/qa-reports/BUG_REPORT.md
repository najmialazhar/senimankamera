# QA Bug Report - Seniman Kamera

Laporan ini mendokumentasikan temuan bug, celah keamanan, dan celah integritas data selama siklus pengujian QA berjalan, beserta status perbaikan (remediasi) masing-masing temuan.

---

## BUG-001: Duplikasi Karakter `@` (Double `@` Handle) pada Tampilan Username Instagram

* **Severity**: Low
* **Feature**: Customer Management (Admin Dashboard)
* **Description**: 
  Setiap pelanggan yang terdaftar melalui halaman booking publik memiliki data username Instagram yang tersimpan secara manual oleh input pengguna dengan/tanpa prefix `@` (misalnya `@username`). Di sisi admin dashboard, terdapat kode rendering yang kembali menambahkan karakter `@` secara statis, menyebabkan kemunculan duplikasi seperti `@@username`.
* **Steps To Reproduce**:
  1. Daftarkan pemesanan di wizard publik, isi input Instagram dengan `"@budisantoso"`.
  2. Selesaikan booking.
  3. Login ke Admin Panel, buka halaman `/admin/customers` atau `/admin/bookings`.
  4. Amati kolom Instagram pada nama pelanggan tersebut.
* **Expected Result**: 
  Username Instagram tampil bersih sebagai `@budisantoso` (prefix single `@`).
* **Actual Result**: 
  Username Instagram tampil sebagai `@@budisantoso`.
* **Impact**: Masalah kosmetik (UX) yang merusak estetika antarmuka dashboard profesional.
* **Evidence**: Terlihat pada kolom INSTAGRAM di tabel data pelanggan admin dashboard.
* **Recommendation**: 
  Terapkan sanitasi menggunakan regex `.replace(/^@+/, "")` pada input sebelum disimpan ke DB dan saat dirender di antarmuka web.
* **Status**: **RESOLVED** (Sudah diperbaiki dan diverifikasi).

---

## BUG-002: Loophole Pemblokiran Slot Kalender Permanen Akibat Pembatalan Pembayaran Midtrans (Orphan Booking)

* **Severity**: Critical
* **Feature**: Booking & Payment Integration (Midtrans Snap)
* **Description**: 
  Ketika pemesan telah memilih jadwal dan dialihkan ke popup Midtrans Snap, data booking langsung dicatat di database sebagai `PENDING` untuk mengamankan slot. Namun, apabila pemesan sengaja menutup modal popup Midtrans Snap atau koneksi internet terputus, data booking `PENDING` tersebut tetap tertinggal di database secara permanen. Hal ini menyebabkan slot kalender terkunci selamanya tanpa adanya pembayaran masuk.
* **Steps To Reproduce**:
  1. Buka formulir booking `/booking`, lakukan pemesanan paket harian (DATE_ONLY) untuk tanggal tertentu.
  2. Di Langkah 5, klik tombol "Bayar DP" hingga modal popup Midtrans Snap muncul.
  3. Klik tombol silang (tutup) pada popup Midtrans Snap secara sengaja.
  4. Kembali ke halaman kalender admin atau ulangi form booking.
* **Expected Result**: 
  Slot jadwal dilepaskan kembali dan booking yang dibatalkan dihapus/dibersihkan dari database.
* **Actual Result**: 
  Slot jadwal terkunci permanen, dan booking `PENDING` tanpa token pembayaran tetap tersimpan di database.
* **Impact**: Kerugian finansial (kehilangan potensi pendapatan) karena klien lain tidak dapat memesan tanggal yang sama padahal status pembayaran booking tersebut tidak valid/batal.
* **Evidence**: Entri database `Booking` berstatus `PENDING` menumpuk tanpa adanya transaksi sukses di Midtrans.
* **Recommendation**: 
  - Batalkan dan hapus data booking `PENDING` jika pengguna menutup popup snap (event `onClose` / `onError` di sisi client memanggil Server Action pembatalan).
  - Lakukan pembatalan transaksi secara transaksional di UseCase jika API Midtrans gagal mengeluarkan token Snap.
* **Status**: **RESOLVED** (Sudah diperbaiki dan diverifikasi menggunakan pembersihan otomatis).

---

## BUG-003: Kurangnya ID Pengenal Unik pada Elemen Interaktif untuk UI Automation

* **Severity**: Medium
* **Feature**: UI Testability (Customer Management & Form)
* **Description**: 
  Elemen-elemen input form (seperti Nama, Email, WA, IG) dan tombol aksi dalam tabel Kelola Pelanggan tidak memiliki ID unik yang deskriptif. Hal ini menyulitkan penulisan script UI Automation (Playwright/Cypress) karena harus bergantung pada posisi CSS locator yang rentan patah (*fragile*).
* **Steps To Reproduce**:
  1. Jalankan inspect element pada halaman `/admin/customers`.
  2. Amati input Nama Lengkap dan tombol Edit/Hapus pada baris tabel.
* **Expected Result**: 
  Setiap input dan tombol interaktif penting memiliki `id` unik (seperti `id="customer-fullname-input"` atau `id="customer-edit-[ID]"`).
* **Actual Result**: 
  Elemen hanya memiliki kelas Tailwind biasa tanpa atribut `id` atau `data-testid` yang memadai.
* **Impact**: Menghambat jalannya proses pengujian otomatis (UI Automation).
* **Evidence**: Hasil DOM inspect di browser.
* **Recommendation**: 
  Tambahkan atribut `id` unik yang deskriptif di seluruh elemen interaktif yang akan diuji oleh mesin.
* **Status**: **RESOLVED** (Atribut ID unik telah diimplementasikan di seluruh halaman Kelola Pelanggan).
