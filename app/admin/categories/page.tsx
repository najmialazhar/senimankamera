import { redirect } from "next/navigation";
import { CategoryRepository } from "@/src/modules/booking/repositories/category.repository";
import { CategoryManager } from "@/src/modules/booking/components/category-manager";
import { createClient } from "@/src/infrastructure/supabase/server";

export const revalidate = 0;

import { enforceAdminRole } from "@/src/modules/auth/services/auth.service";
import { AdminRole } from "@prisma/client";

export default async function AdminCategoriesPage() {
  const admin = await enforceAdminRole([AdminRole.SUPER_ADMIN, AdminRole.ADMIN_CMS]);

  const repo = new CategoryRepository();
  const categories = await repo.findAll();

  // Convert prisma Date objects to string for client rendering if any JSON issues occur,
  // but Prisma Category repository returns plain objects that next.js server components can serialize.
  // We've wrapped responses in actions with JSON.parse(JSON.stringify(category)),
  // but passing to client component from page.tsx is fine if we serialize or if they are plain fields.
  // Let's pass them clean:
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return <CategoryManager initialCategories={serializedCategories} />;
}
