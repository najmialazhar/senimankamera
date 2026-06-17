import { z } from "zod";

export const CreateBookingSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap harus diisi minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phoneNumber: z.string().optional().or(z.literal("")),
  packageType: z.string().min(1, "Silakan pilih tipe paket"),
  bookingDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Jadwal tanggal tidak valid",
  }),
  notes: z.string().optional().or(z.literal("")),
});

export type CreateBookingInputType = z.infer<typeof CreateBookingSchema>;
