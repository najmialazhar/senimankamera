import { z } from "zod";

export const CreateBookingSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap harus diisi minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phoneNumber: z.string().min(8, "Nomor WhatsApp wajib diisi"),
  packageType: z.string().min(1, "Silakan pilih tipe paket"),
  bookingDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Jadwal tanggal tidak valid",
  }),
  eventTime: z.string().min(1, "Waktu acara harus diisi"),
  eventName: z.string().min(2, "Nama acara harus diisi"),
  eventLocation: z.string().min(2, "Lokasi acara harus diisi"),
  notes: z.string().optional().or(z.literal("")),
  paymentType: z.enum(["dp"]),
});

export type CreateBookingInputType = z.infer<typeof CreateBookingSchema>;
