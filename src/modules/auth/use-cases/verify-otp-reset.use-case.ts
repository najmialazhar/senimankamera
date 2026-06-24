import { createAdminClient } from "@/src/infrastructure/supabase/admin";
import { adminProfileRepository } from "@/src/modules/admin-management/repositories/admin-profile.repository";
import { otpTokenRepository } from "../repositories/otp-token.repository";

export class VerifyOtpResetUseCase {
  async execute(input: {
    identifier: string;
    otp: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const { identifier, otp, newPassword } = input;

    if (!identifier || !otp || !newPassword) {
      throw new Error("Semua field harus diisi.");
    }

    if (newPassword.length < 8) {
      throw new Error("Password baru minimal 8 karakter.");
    }

    // 1. Find profile by email or username
    const profile = await adminProfileRepository.findByUsernameOrEmail(identifier);
    if (!profile) {
      throw new Error("Email atau username tidak ditemukan.");
    }

    // 2. Check if profile is active
    if (!profile.isActive) {
      throw new Error("Akun Anda telah dinonaktifkan.");
    }

    // 3. Find and validate the OTP token
    const validToken = await otpTokenRepository.findValid(profile.email, otp);
    if (!validToken) {
      throw new Error("Kode OTP tidak valid atau telah kedaluwarsa.");
    }

    // 4. Update the user password in Supabase Auth using Admin Client
    const supabaseAdmin = createAdminClient();
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.supabaseId,
      { password: newPassword }
    );

    if (authError) {
      throw new Error(authError.message || "Gagal mengubah password.");
    }

    // 5. Mark OTP token as used
    await otpTokenRepository.markUsed(validToken.id);

    return {
      success: true,
      message: "Password berhasil diperbarui. Silakan login.",
    };
  }
}

export const verifyOtpResetUseCase = new VerifyOtpResetUseCase();
