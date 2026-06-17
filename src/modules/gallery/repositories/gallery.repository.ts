import { prisma } from "@/src/infrastructure/prisma/client";

export class GalleryRepository {
  async findAll() {
    return prisma.gallery.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }
}
