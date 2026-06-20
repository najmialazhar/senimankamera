"use server";

import { createClient } from "@/src/infrastructure/supabase/server";
import { TestimonialRepository } from "../repositories/testimonial.repository";
import { revalidatePath } from "next/cache";

export async function createTestimonialAction(data: {
  name: string;
  role: string | null;
  content: string;
  avatarUrl: string | null;
  storagePath: string | null;
}) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    if (!data.name || !data.content) {
      throw new Error("Mohon lengkapi semua field yang wajib diisi (Nama dan Testimoni).");
    }

    const repo = new TestimonialRepository();
    const newItem = await repo.createTestimonial(data);

    revalidatePath("/");
    revalidatePath("/admin/testimonials");

    return { success: true, data: JSON.parse(JSON.stringify(newItem)) };
  } catch (error: any) {
    console.error("createTestimonialAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan testimoni.",
    };
  }
}

export async function updateTestimonialAction(
  id: string,
  data: {
    name: string;
    role: string | null;
    content: string;
    avatarUrl?: string | null;
    storagePath?: string | null;
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

    if (!data.name || !data.content) {
      throw new Error("Mohon lengkapi semua field yang wajib diisi (Nama dan Testimoni).");
    }

    const repo = new TestimonialRepository();
    const existingItem = await repo.findById(id);
    if (!existingItem) {
      throw new Error("Testimoni tidak ditemukan.");
    }

    const updatedItem = await repo.updateTestimonial(id, data);

    revalidatePath("/");
    revalidatePath("/admin/testimonials");

    return { success: true, data: JSON.parse(JSON.stringify(updatedItem)) };
  } catch (error: any) {
    console.error("updateTestimonialAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui testimoni.",
    };
  }
}

export async function deleteTestimonialAction(id: string) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const repo = new TestimonialRepository();
    await repo.deleteTestimonial(id);

    revalidatePath("/");
    revalidatePath("/admin/testimonials");

    return { success: true };
  } catch (error: any) {
    console.error("deleteTestimonialAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus testimoni.",
    };
  }
}
