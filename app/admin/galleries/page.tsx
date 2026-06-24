import { redirect } from "next/navigation";
import { GalleryRepository } from "@/src/modules/gallery/repositories/gallery.repository";
import { CategoryRepository } from "@/src/modules/booking/repositories/category.repository";
import { GalleryManager } from "@/src/modules/gallery/components/gallery-manager";
import { createClient } from "@/src/infrastructure/supabase/server";

export const revalidate = 0;

import { enforceAdminRole } from "@/src/modules/auth/services/auth.service";
import { AdminRole } from "@prisma/client";

export default async function AdminGalleriesPage() {
  const admin = await enforceAdminRole([AdminRole.SUPER_ADMIN, AdminRole.ADMIN_CMS]);

  const galleryRepo = new GalleryRepository();
  const categoryRepo = new CategoryRepository();

  const [galleries, categories] = await Promise.all([
    galleryRepo.findAll(),
    categoryRepo.findAll(),
  ]);

  const serializedGalleries = JSON.parse(JSON.stringify(galleries));
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  // Render client component and pass initial database records
  return (
    <GalleryManager
      initialGalleries={serializedGalleries}
      initialCategories={serializedCategories}
    />
  );
}
