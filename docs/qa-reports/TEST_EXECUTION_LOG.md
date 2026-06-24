# Test Execution Log - Seniman Kamera

Log aktivitas harian eksekusi pengujian fungsionalitas, keamanan, dan aturan bisnis pada sistem Seniman Kamera.

---

### Tanggal: 25 Juni 2026
* **Penguji**: Senior QA Engineer
* **Environment**: Local Development Server (`localhost:3000`)
* **Basis Data**: PostgreSQL (Supabase Development DB Instance)

---

| Timestamp | Modul / Fitur | Aksi Pengujian | Hasil Pengamatan | Status | Catatan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `09:15` | Autentikasi | Melakukan login menggunakan email `kameraseniman@gmail.com` dan password `#Kameraseniman*`. | Berhasil dialihkan ke dashboard `/admin` dengan sidebar navigasi lengkap. | **PASSED** | Sesi terbuat dengan aman. |
| `09:30` | Autentikasi | Mencoba login dengan password salah. | Muncul kotak error berisi pesan kegagalan otentikasi. | **PASSED** | Akses masuk diblokir. |
| `09:50` | Landing Page | Memeriksa muatan gambar portofolio publik dan modal detailnya di halaman utama `/`. | Grid gambar tampil presisi, klik portofolio berhasil membuka modal resolusi penuh. | **PASSED** | Responsivitas layout rapi. |
| `10:15` | Booking Wizard | Memesan paket pernikahan (DATE_ONLY) untuk tanggal `2035-12-12` sampai memicu pembayaran Midtrans. | Iframe Snap termuat, data tersimpan di DB sebagai PENDING. | **PASSED** | Skenario happy path aman. |
| `10:30` | Booking Wizard | Mencoba memesan tanggal yang sama (`2035-12-12`) pada pemesanan kedua. | Tanggal dinonaktifkan (berwarna merah) di kalender Langkah 3. | **PASSED** | Guard tumpang tindih berfungsi. |
| `10:50` | Integrasi Midtrans | Membuka Snap popup pembayaran booking baru, lalu sengaja menutup popup tersebut. | Server action pembatalan terpicu secara instan, menghapus booking PENDING dan membebaskan slot kalender. | **PASSED** | Bug locking slot terkonfirmasi sudah teratasi. |
| `11:15` | Dashboard Admin | Memeriksa nilai rekap revenue dan booking counter pada dashboard utama. | Menampilkan kalkulasi pendapatan dan counter jumlah total booking secara tepat. | **PASSED** | Data sinkron dengan DB. |
| `11:45` | Kelola Pelanggan | Menambahkan pelanggan baru "Adit Permadi" dengan username Instagram "@adit_permadi". | Sukses tersimpan, kolom IG di tabel merender `@adit_permadi` (single `@`). | **PASSED** | Perbaikan bug double `@` berhasil diverifikasi. |
| `12:15` | Kelola Pelanggan | Melakukan pencarian data pelanggan menggunakan query dengan prefix `@` (misal `@adit_permadi`). | Baris pelanggan "Adit Permadi" tetap muncul dengan akurat. | **PASSED** | Normalisasi search query terkonfirmasi. |
| `12:45` | Kelola Pelanggan | Mencoba menghapus pelanggan yang memiliki relasi pesanan/booking aktif. | Muncul modal alert dialog penolakan penghapusan. | **PASSED** | Cascade guard pencegah korupsi data revenue berhasil diverifikasi. |
| `13:15` | Kelola CMS | Mengunggah gambar baru untuk portfolio galeri admin. | Berhasil diunggah dan disimpan ke bucket Supabase, thumbnail baru langsung muncul di grid. | **PASSED** | Metadata tersimpan ke DB. |
| `13:45` | Manajemen Staf | Menonaktifkan staf admin lain dari menu admins. | Hak akses admin tersebut langsung dicabut dan tidak bisa login kembali. | **PASSED** | RBAC dan status keaktifan sinkron. |
| `14:00` | Sesi & Security | Membiarkan sesi admin idle selama batas waktu timeout. | Sesi otomatis di-logout dan browser dialihkan ke halaman login. | **PASSED** | Proteksi sesi idle berfungsi. |
