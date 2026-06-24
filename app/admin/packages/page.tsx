import { redirect } from "next/navigation";
import { PackageRepository } from "@/src/modules/booking/repositories/package.repository";
import { CategoryRepository } from "@/src/modules/booking/repositories/category.repository";
import { PackageManager } from "@/src/modules/booking/components/package-manager";
import { createClient } from "@/src/infrastructure/supabase/server";

export const revalidate = 0;

import { enforceAdminRole } from "@/src/modules/auth/services/auth.service";
import { AdminRole } from "@prisma/client";

export default async function AdminPackagesPage() {
  const admin = await enforceAdminRole([AdminRole.SUPER_ADMIN, AdminRole.ADMIN_CMS]);

  const packageRepo = new PackageRepository();
  const categoryRepo = new CategoryRepository();

  const [packages, categories] = await Promise.all([
    packageRepo.findAll(),
    categoryRepo.findAll(),
  ]);

  const serializedPackages = JSON.parse(JSON.stringify(packages));
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  // Render client manager and pass database initial records
  return (
    <PackageManager
      initialPackages={serializedPackages}
      initialCategories={serializedCategories}
    />
  );
}
