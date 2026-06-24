"use server";

import { createClient } from "@/src/infrastructure/supabase/server";
import { adminProfileRepository } from "@/src/modules/admin-management/repositories/admin-profile.repository";
import { createCustomerUseCase } from "../use-cases/create-customer.use-case";
import { updateCustomerUseCase } from "../use-cases/update-customer.use-case";
import { deleteCustomerUseCase } from "../use-cases/delete-customer.use-case";
import { CreateCustomerInput } from "../schemas/create-customer.schema";
import { AdminRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function verifyAuthorizedCaller() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Sesi tidak valid. Silakan login kembali.");
  }

  const callerProfile = await adminProfileRepository.findBySupabaseId(user.id);
  if (
    !callerProfile ||
    (callerProfile.role !== AdminRole.SUPER_ADMIN &&
      callerProfile.role !== AdminRole.ADMIN_PESANAN) ||
    !callerProfile.isActive
  ) {
    throw new Error("Akses ditolak. Anda tidak memiliki izin untuk mengelola data pelanggan.");
  }

  return user;
}

export async function createCustomerAction(input: CreateCustomerInput) {
  try {
    await verifyAuthorizedCaller();

    const profile = await createCustomerUseCase.execute(input);
    revalidatePath("/admin/customers");

    return { success: true, data: profile };
  } catch (error: any) {
    console.error("createCustomerAction error:", error);
    return { error: error instanceof Error ? error.message : "Terjadi kesalahan sistem." };
  }
}

export async function updateCustomerAction(id: string, input: CreateCustomerInput) {
  try {
    await verifyAuthorizedCaller();

    const profile = await updateCustomerUseCase.execute(id, input);
    revalidatePath("/admin/customers");

    return { success: true, data: profile };
  } catch (error: any) {
    console.error("updateCustomerAction error:", error);
    return { error: error instanceof Error ? error.message : "Terjadi kesalahan sistem." };
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    await verifyAuthorizedCaller();

    await deleteCustomerUseCase.execute(id);
    revalidatePath("/admin/customers");

    return { success: true };
  } catch (error: any) {
    console.error("deleteCustomerAction error:", error);
    return { error: error instanceof Error ? error.message : "Terjadi kesalahan sistem." };
  }
}
