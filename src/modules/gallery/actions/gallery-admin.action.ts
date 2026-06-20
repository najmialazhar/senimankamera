"use server";

import { GalleryRepository } from "../repositories/gallery.repository";
import { revalidatePath } from "next/cache";
import { createClient } from "@/src/infrastructure/supabase/server";

export async function createGalleryAction(data: {
  title: string;
  category: string;
  subCategory: string;
  imageUrl: string;
  aspect: string;
  description?: string;
  mediaType?: string;
  storagePath?: string;
  fileSize?: number;
  width?: number;
  height?: number;
}) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const repo = new GalleryRepository();
    const item = await repo.createGallery(data);

    revalidatePath("/portfolio");
    revalidatePath("/admin/galleries");

    return { success: true, data: JSON.parse(JSON.stringify(item)) };
  } catch (error: any) {
    console.error("createGalleryAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal membuat galeri." };
  }
}

export async function deleteGalleryAction(id: number) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

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

export async function updateGalleryAction(
  id: number,
  data: {
    title: string;
    category: string;
    subCategory: string;
    aspect: string;
    description?: string;
    imageUrl?: string;
    mediaType?: string;
    storagePath?: string;
    fileSize?: number;
    width?: number;
    height?: number;
  }
) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    if (!id) {
      throw new Error("ID tidak ditemukan.");
    }

    if (!data.title || !data.category || !data.subCategory || !data.aspect) {
      throw new Error("Mohon lengkapi semua field yang wajib diisi.");
    }

    const repo = new GalleryRepository();
    const existingItem = await repo.findById(id);
    if (!existingItem) {
      throw new Error("Item portofolio tidak ditemukan.");
    }

    const updatedItem = await repo.updateGallery(id, data);

    revalidatePath("/portfolio");
    revalidatePath("/admin/galleries");

    return { success: true, data: JSON.parse(JSON.stringify(updatedItem)) };
  } catch (error: any) {
    console.error("updateGalleryAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal memperbarui media." };
  }
}

