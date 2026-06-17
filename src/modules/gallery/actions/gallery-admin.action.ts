"use server";

import { GalleryRepository } from "../repositories/gallery.repository";
import { revalidatePath } from "next/cache";

export async function createGalleryAction(data: {
  title: string;
  category: string;
  subCategory: string;
  imageUrl: string;
  aspect: string;
  description?: string;
}) {
  try {
    const repo = new GalleryRepository();
    const item = await repo.createGallery(data);

    revalidatePath("/portfolio");
    revalidatePath("/admin/galleries");

    return { success: true, data: item };
  } catch (error: any) {
    console.error("createGalleryAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal membuat galeri." };
  }
}

export async function deleteGalleryAction(id: number) {
  try {
    const repo = new GalleryRepository();
    await repo.deleteGallery(id);

    revalidatePath("/portfolio");
    revalidatePath("/admin/galleries");

    return { success: true };
  } catch (error: any) {
    console.error("deleteGalleryAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus galeri." };
  }
}
