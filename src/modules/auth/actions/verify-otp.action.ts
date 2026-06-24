"use server";

import { verifyOtpResetUseCase } from "../use-cases/verify-otp-reset.use-case";

export async function verifyOtpAction(input: {
  identifier: string;
  otp: string;
  newPassword: string;
}) {
  try {
    const result = await verifyOtpResetUseCase.execute(input);
    return result;
  } catch (error: any) {
    console.error("verifyOtpAction error caught:", error);
    return {
      error: error instanceof Error ? error.message : "Terjadi kesalahan sistem.",
    };
  }
}
