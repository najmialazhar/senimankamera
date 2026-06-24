"use server";

import { requestOtpResetUseCase } from "../use-cases/request-otp-reset.use-case";

export async function requestOtpAction(identifier: string) {
  try {
    const result = await requestOtpResetUseCase.execute(identifier);
    return result;
  } catch (error: any) {
    console.error("requestOtpAction error caught:", error);
    return {
      error: error instanceof Error ? error.message : "Terjadi kesalahan sistem.",
    };
  }
}
