import { createAdminClient } from "@/src/infrastructure/supabase/admin";
import { CreateAdminInput, CreateAdminSchema } from "../schemas/create-admin.schema";
import { adminProfileRepository } from "../repositories/admin-profile.repository";
import { AdminProfile } from "@prisma/client";

export class CreateAdminUseCase {
  async execute(input: CreateAdminInput): Promise<AdminProfile> {
    // 1. Validate schema
    const validated = CreateAdminSchema.parse(input);

    // 2. Check for duplicate email
    const existingEmail = await adminProfileRepository.findByEmail(validated.email);
    if (existingEmail) {
      throw new Error("Email sudah terdaftar.");
    }

    // 3. Check for duplicate username
    const existingUsername = await adminProfileRepository.findByUsername(validated.username);
    if (existingUsername) {
      throw new Error("Username sudah terdaftar.");
    }

    // 4. Initialize Supabase Admin Client
    const supabaseAdmin = createAdminClient();

    // 5. Create user in Supabase Auth (auto-confirms email)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Gagal membuat akun auth di Supabase.");
    }

    // 6. Create AdminProfile record in Prisma database
    try {
      const profile = await adminProfileRepository.create({
        supabaseId: authData.user.id,
        name: validated.name,
        email: validated.email,
        username: validated.username,
        role: validated.role,
        isActive: true,
      });

      return profile;
    } catch (dbError) {
      // Rollback: if database record creation fails, delete user from Supabase Auth to maintain consistency
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error("Gagal menyimpan profil admin ke database. Akun dibatalkan.");
    }
  }
}

export const createAdminUseCase = new CreateAdminUseCase();
