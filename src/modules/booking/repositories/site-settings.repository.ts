import { prisma } from "@/src/infrastructure/prisma/client";

export class SiteSettingsRepository {
  async getByKey(key: string) {
    return prisma.siteSettings.findUnique({
      where: { key },
    });
  }

  async upsert(key: string, value: string, label?: string) {
    return prisma.siteSettings.upsert({
      where: { key },
      update: { value, label },
      create: { key, value, label },
    });
  }
}
