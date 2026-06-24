import { createClient } from "@/src/infrastructure/supabase/server";
import { adminProfileRepository } from "@/src/modules/admin-management/repositories/admin-profile.repository";
import { redirect } from "next/navigation";
import { AdminProfile, AdminRole } from "@prisma/client";

/**
 * Mendapatkan profil admin yang sedang login.
 * Jika tidak login, tidak memiliki profil, atau tidak aktif, akan otomatis logout dan redirect ke login.
 */
export async function getCurrentAdmin(): Promise<AdminProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await adminProfileRepository.findBySupabaseId(user.id);
  if (!profile || !profile.isActive) {
    // Force sign out if auth user exists but no profile or is inactive
    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  return profile;
}

/**
 * Membatasi akses page hanya untuk peran tertentu.
 * Jika peran tidak sesuai, redirect ke dashboard admin dengan pesan error.
 */
export async function enforceAdminRole(allowedRoles: AdminRole[]): Promise<AdminProfile> {
  const admin = await getCurrentAdmin();
  if (!allowedRoles.includes(admin.role)) {
    redirect("/admin?error=forbidden");
  }
  return admin;
}
