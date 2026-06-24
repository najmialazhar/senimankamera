import { z } from "zod";
import { AdminRole } from "@prisma/client";

export const CreateAdminSchema = z.object({
  name: z.string().min(1, "Nama lengkap harus diisi"),
  email: z.string().email("Format email tidak valid"),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh mengandung huruf, angka, dan underscore")
    .transform((val) => val.toLowerCase()),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.nativeEnum(AdminRole),
});

export type CreateAdminInput = z.infer<typeof CreateAdminSchema>;
