# Test Cases Specification Catalog - Seniman Kamera

Katalog lengkap spesifikasi skenario pengujian fungsionalitas, keamanan, dan alur integrasi sistem Seniman Kamera.

---

## 📌 Modul 1: Autentikasi & Sesi (AUTH)

### TC-001: Login dengan Kredensial Valid
- **Feature**: Autentikasi Pengguna
- **Scenario**: Memastikan pengguna dengan peran admin yang aktif dapat masuk ke sistem.
- **Precondition**: Akun admin terdaftar di database dan berstatus aktif.
- **Steps**:
  1. Akses halaman `/login`.
  2. Input email `"kameraseniman@gmail.com"`.
  3. Input password `"kredensial_valid"`.
  4. Klik tombol "Masuk".
- **Expected Result**: Sesi berhasil dibuat dan dialihkan ke dashboard `/admin`.
- **Status**: PASSED

### TC-002: Login dengan Kredensial Salah
- **Feature**: Autentikasi Pengguna
- **Scenario**: Mencegah akses masuk menggunakan kredensial salah.
- **Precondition**: Halaman login terbuka.
- **Steps**:
  1. Input email `"admin@salah.com"`.
  2. Input password `"salahsandi"`.
  3. Klik tombol "Masuk".
- **Expected Result**: Muncul pesan kesalahan fungsional dan akses masuk ditolak.
- **Status**: PASSED

---

## 📌 Modul 2: Booking & Kalender (BOOK)

### TC-003: Alur Pemesanan Paket Harian (DATE_ONLY) Sukses
- **Feature**: Booking Wizard
- **Scenario**: Melakukan reservasi pemotretan penuh hari (Wedding/Prewedding) hingga terbit tagihan DP Midtrans.
- **Precondition**: Tanggal target pemesanan kosong/tersedia.
- **Steps**:
  1. Buka halaman `/booking`.
  2. Pilih kategori Wedding, pilih paket Signature, pilih tanggal `2035-12-12`.
  3. Isi form data kontak pemesan secara lengkap.
  4. Klik tombol "Bayar DP".
- **Expected Result**: Booking tersimpan di DB dengan status PENDING, terbit token transaksi, dan popup Midtrans Snap muncul.
- **Status**: PASSED

### TC-004: Pencegahan Double Booking Tanggal yang Sama
- **Feature**: Booking Wizard (Jadwal)
- **Scenario**: Menguji sistem agar memblokir pemesanan tanggal yang sudah terisi.
- **Precondition**: Tanggal `2035-12-12` sudah dipesan (TC-003).
- **Steps**:
  1. Buka kembali halaman `/booking` sebagai klien baru.
  2. Masuk ke Langkah 3 (Kalender/Jadwal).
- **Expected Result**: Tanggal `2035-12-12` terblokir (disabled) di kalender dan tidak dapat diklik.
- **Status**: PASSED

---

## 📌 Modul 3: Manajemen Pelanggan (CUSTOMER)

### TC-005: Tambah Pelanggan Baru dengan Normalisasi Instagram
- **Feature**: Customer Management
- **Scenario**: Menambahkan data pelanggan baru dan membersihkan handle Instagram otomatis.
- **Precondition**: Login sebagai Super Admin di `/admin/customers`.
- **Steps**:
  1. Masukkan Nama, Email, dan No WA pada form tambah pelanggan.
  2. Pada input Instagram, masukkan `"@username_klien"`.
  3. Klik tombol "Tambah Pelanggan".
- **Expected Result**: Pelanggan berhasil disimpan, dan visual handle di tabel secara bersih menampilkan `@username_klien` (tanpa risiko duplikasi `@@`).
- **Status**: PASSED

### TC-006: Proteksi Penghapusan Pelanggan dengan Booking Aktif
- **Feature**: Customer Management (Cascade Block)
- **Scenario**: Mencegah hilangnya rekap transaksi akibat penghapusan data pelanggan terkait secara tidak sengaja.
- **Precondition**: Pelanggan memiliki minimal 1 booking/transaksi terdaftar.
- **Steps**:
  1. Klik tombol hapus (ikon sampah) pada baris pelanggan terkait.
  2. Klik tombol "Hapus Permanen" pada modal konfirmasi.
- **Expected Result**: Penghapusan dibatalkan secara aman dan muncul pesan dialog error penolakan penghapusan.
- **Status**: PASSED
