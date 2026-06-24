import { redirect } from "next/navigation";
import { TestimonialRepository } from "@/src/modules/gallery/repositories/testimonial.repository";
import { TestimonialManager } from "@/src/modules/gallery/components/testimonial-manager";
import { createClient } from "@/src/infrastructure/supabase/server";

export const revalidate = 0;

import { enforceAdminRole } from "@/src/modules/auth/services/auth.service";
import { AdminRole } from "@prisma/client";

export default async function AdminTestimonialsPage() {
  const admin = await enforceAdminRole([AdminRole.SUPER_ADMIN, AdminRole.ADMIN_CMS]);

  const repo = new TestimonialRepository();
  const testimonials = await repo.findAll();

  const serializedTestimonials = JSON.parse(JSON.stringify(testimonials));

  return (
    <TestimonialManager initialTestimonials={serializedTestimonials} />
  );
}
