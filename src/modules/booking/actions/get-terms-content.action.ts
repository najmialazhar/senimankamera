"use server";

import { SiteSettingsRepository } from "../repositories/site-settings.repository";

const DEFAULT_TERMS_TIME_BASED = `1. Uang Muka (DP) flat sebesar Rp 150.000 wajib dibayarkan saat booking dan bersifat non-refundable (tidak dapat dikembalikan jika batal).
2. Sisa pelunasan dibayarkan secara cash/transfer setelah sesi pemotretan selesai.
3. Reschedule jadwal diperbolehkan maksimal 1 kali, selambat-lambatnya 3 hari sebelum hari H sesi foto (tergantung ketersediaan slot).
4. Klien wajib datang tepat waktu sesuai jam mulai sesi yang dipesan. Keterlambatan kedatangan Klien akan memotong durasi sesi foto yang telah ditentukan.
5. Hasil foto mentah (raw files) dan hasil edit akan dikirimkan sesuai waktu estimasi paket yang dipilih.`;

const DEFAULT_TERMS_DATE_ONLY = `1. Uang Muka (DP) sebesar 20% dari total harga paket wajib dibayarkan saat booking untuk mengamankan tanggal acara dan bersifat non-refundable.
2. Sisa pelunasan sebesar 80% wajib dibayarkan selambat-lambatnya setelah acara selesai di hari H.
3. Reschedule atau penyesuaian tanggal acara harap dikoordinasikan selambat-lambatnya 7 hari sebelum tanggal pelaksanaan.
4. Klien bertanggung jawab atas penyediaan akses masuk fotografer/videografer ke lokasi acara.
5. Hak cipta foto/video adalah milik Seniman Kamera. Hasil karya dapat digunakan untuk keperluan promosi & portofolio (kecuali ada perjanjian tertulis lain sebelumnya).`;

export async function getTermsContentAction(bookingType: string) {
  try {
    const repo = new SiteSettingsRepository();
    const key = bookingType === "TIME_BASED" ? "tnc_time_based" : "tnc_date_only";
    const setting = await repo.getByKey(key);

    if (setting && setting.value) {
      return { success: true, data: setting.value };
    }

    // Fallback to defaults and seed if empty
    const defaultValue = bookingType === "TIME_BASED" ? DEFAULT_TERMS_TIME_BASED : DEFAULT_TERMS_DATE_ONLY;
    const label = bookingType === "TIME_BASED" ? "Syarat & Ketentuan Sesi Studio (Time-Based)" : "Syarat & Ketentuan Acara/Dokumentasi (Date-Only)";
    
    // Seed in database asynchronously
    await repo.upsert(key, defaultValue, label);

    return { success: true, data: defaultValue };
  } catch (error: any) {
    console.error("getTermsContentAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengambil syarat & ketentuan.",
    };
  }
}
