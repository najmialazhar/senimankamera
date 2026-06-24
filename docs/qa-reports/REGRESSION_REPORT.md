# Regression Test Report - Seniman Kamera

Laporan pengujian regresi untuk memverifikasi fungsionalitas sistem setelah perbaikan bug dan penambahan ID penanda UI Automation.

---

## 📌 Status Pengujian Ulang (Re-testing)

| Bug ID | Deskripsi Masalah | Perbaikan yang Dilakukan | Status Akhir | Catatan Verifikasi |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Duplikasi `@` Instagram pada tabel admin. | Penerapan pembersihan regex `.replace(/^@+/, "")` pada form input, database write, serta visual rendering. | **FIXED & PASSED** | Tampilan bersih dengan single `@` terkonfirmasi pada list pelanggan, rekap, riwayat, dan kalender. |
| **BUG-002** | Loophole slot terkunci permanen pada pembatalan Midtrans. | Integrasi callback `onClose` Midtrans Snap untuk memicu server action pembersihan `cancelPendingBookingAction`. | **FIXED & PASSED** | Slot terlepas seketika saat popup snap ditutup tanpa pembayaran. |
| **BUG-003** | Tidak adanya ID unik pada antarmuka admin. | Menyematkan atribut `id` unik (e.g. `customer-fullname-input`) pada form input dan tombol aksi tabel. | **FIXED & PASSED** | Komponen dapat dilacak dengan handal oleh browser automation engine. |

---

## 🔍 Hasil Uji Regresi Dampak Samping (Side-Effects)

Pengujian regresi dijalankan untuk memastikan perbaikan di atas tidak merusak alur kerja domain bisnis lainnya:

1. **Integritas Data Transaksi (Booking & Revenue)**:
   - **Tindakan**: Menghapus pelanggan tanpa booking, dan mencoba menghapus pelanggan yang memiliki booking.
   - **Hasil**: Sistem memblokir penghapusan pelanggan dengan transaksi secara aman, sehingga rekap pendapatan (revenue) di dashboard admin tetap utuh dan akurat.
2. **Fleksibilitas Pencarian & Penyaringan**:
   - **Tindakan**: Melakukan pencarian menggunakan keyword instagram handle dengan/tanpa prefix `@` (misalnya `@najmi` dan `najmi`).
   - **Hasil**: Sistem berhasil mencocokkan baris data yang tepat baik di level database repository maupun visual client-side.
3. **Reschedule & Slot Management**:
   - **Tindakan**: Mengubah jadwal booking (reschedule) dan memastikan pembersihan slot lama.
   - **Hasil**: Slot lama yang kosong langsung dibebaskan dan slot baru terbentuk di tanggal tujuan tanpa ada data yatim (*orphan slots*).
