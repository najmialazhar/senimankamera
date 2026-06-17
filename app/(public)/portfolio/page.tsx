import { GalleryRepository } from "@/src/modules/gallery/repositories/gallery.repository";
import { GetGalleriesUseCase } from "@/src/modules/gallery/use-cases/get-galleries.use-case";
import { PortfolioGrid } from "@/src/modules/gallery/components/portfolio-grid";

export const revalidate = 0; // Disable static cache to reflect database changes dynamically

export default async function PortfolioPage() {
  const repository = new GalleryRepository();
  const getGalleriesUseCase = new GetGalleriesUseCase(repository);
  const items = await getGalleriesUseCase.execute();

  return <PortfolioGrid initialItems={items} />;
}
