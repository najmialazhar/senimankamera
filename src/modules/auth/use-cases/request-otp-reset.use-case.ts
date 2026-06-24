import { adminProfileRepository } from "@/src/modules/admin-management/repositories/admin-profile.repository";
import { otpTokenRepository } from "../repositories/otp-token.repository";
import { TelegramService } from "@/src/infrastructure/telegram/telegram.service";

export class RequestOtpResetUseCase {
  async execute(identifier: string): Promise<{ success: boolean; message: string }> {
    if (!identifier) {
      throw new Error("Email atau username harus diisi.");
    }

    // 1. Find profile by email or username
    const profile = await adminProfileRepository.findByUsernameOrEmail(identifier);
    if (!profile) {
      throw new Error("Email atau username tidak terdaftar.");
    }

    // 2. Check if active
    if (!profile.isActive) {
      throw new Error("Akun Anda telah dinonaktifkan.");
    }

    // 3. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Set expiration to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 5. Save to database
    await otpTokenRepository.create(profile.email, otp, expiresAt);

    // 6. Send via Telegram
    const telegramService = new TelegramService();
    await telegramService.sendOtpMessage({
      otp,
      name: profile.name,
      email: profile.email,
      username: profile.username,
    });

    return {
      success: true,
      message: "Kode OTP telah dikirim ke Telegram.",
    };
  }
}

export const requestOtpResetUseCase = new RequestOtpResetUseCase();
