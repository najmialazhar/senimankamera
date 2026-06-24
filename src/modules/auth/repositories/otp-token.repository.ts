import { prisma } from "@/src/infrastructure/prisma/client";
import { OtpToken } from "@prisma/client";

export class OtpTokenRepository {
  async create(email: string, token: string, expiresAt: Date): Promise<OtpToken> {
    // Delete any existing unused OTP tokens for this email first to prevent clutter
    await prisma.otpToken.deleteMany({
      where: {
        email,
        used: false,
      },
    });

    return prisma.otpToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });
  }

  async findValid(email: string, token: string): Promise<OtpToken | null> {
    return prisma.otpToken.findFirst({
      where: {
        email,
        token,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async markUsed(id: string): Promise<OtpToken> {
    return prisma.otpToken.update({
      where: { id },
      data: { used: true },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.otpToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }
}

export const otpTokenRepository = new OtpTokenRepository();
