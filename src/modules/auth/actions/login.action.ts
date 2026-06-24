"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/src/infrastructure/supabase/server";

import { adminProfileRepository } from "@/src/modules/admin-management/repositories/admin-profile.repository";

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const identifier = formData.get("email")?.toString()?.trim();
    const password = formData.get("password")?.toString();

    // Simple validation
    if (!identifier || !password) {
      return { error: "Email/username dan password wajib diisi." };
    }

    // Resolve email if a username was entered
    let email = identifier;
    const profile = await adminProfileRepository.findByUsernameOrEmail(identifier);
    if (!profile) {
      return { error: "Email atau username tidak terdaftar." };
    }
    if (!profile.isActive) {
      return { error: "Akun Anda telah dinonaktifkan." };
    }
    email = profile.email;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Jika errornya dari Supabase Auth, tampilkan pesan error
      if (error.message === "Invalid login credentials") {
        return { error: "Email/username atau password salah." };
      }
      return { error: error.message };
    }
  } catch (error: any) {
    console.error("loginAction error caught:", error);
    if (error.digest && error.digest.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: error instanceof Error ? error.message : "Terjadi kesalahan sistem." };
  }

  redirect("/admin");
}


export async function logoutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Error signing out from Supabase:", error.message);
  }

  redirect("/login");
}

