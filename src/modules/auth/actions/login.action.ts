"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  // Simple validation
  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // Set auth cookie (expires in 1 day)
  const cookieStore = await cookies();
  cookieStore.set("auth_session", "true", {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 1 day
  });

  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
  redirect("/login");
}
