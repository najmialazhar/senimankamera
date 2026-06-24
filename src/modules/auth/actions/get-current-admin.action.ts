"use server";

import { getCurrentAdmin } from "../services/auth.service";

export async function getCurrentAdminAction() {
  try {
    const admin = await getCurrentAdmin();
    return {
      success: true,
      data: {
        name: admin.name,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
    };
  } catch (error) {
    return { success: false, error: "Not logged in or inactive" };
  }
}
