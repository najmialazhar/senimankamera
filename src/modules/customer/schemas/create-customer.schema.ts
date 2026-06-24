import { z } from "zod";

export const CreateCustomerSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap harus diisi"),
  email: z.string().email("Format email tidak valid"),
  phoneNumber: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  instagram: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null;
      const trimmed = val.trim();
      if (trimmed === "") return null;
      // Strip leading '@' if the user entered it
      return trimmed.startsWith("@") ? trimmed.substring(1) : trimmed;
    }),
});

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
