import { PackageRepository } from "@/src/modules/booking/repositories/package.repository";
import { GetPackagesUseCase } from "@/src/modules/booking/use-cases/get-packages.use-case";
import { CategoryRepository } from "@/src/modules/booking/repositories/category.repository";
import { PricingCatalog } from "@/src/modules/booking/components/pricing-catalog";

export const revalidate = 0; // Dynamic route

export default async function PricingPage() {
  const repository = new PackageRepository();
  const categoryRepository = new CategoryRepository();

  const getPackagesUseCase = new GetPackagesUseCase(repository);

  let packages = [];
  let categories = [];
  let isDbError = false;

  try {
    const [resPackages, resCategories] = await Promise.all([
      getPackagesUseCase.execute(),
      categoryRepository.findAll(),
    ]);
    packages = resPackages || [];
    categories = resCategories || [];
  } catch (error) {
    console.error("Failed to fetch packages and categories for pricing page:", error);
    isDbError = true;
  }

  const serializedPackages = JSON.parse(JSON.stringify(packages));
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return (
    <div className="w-full pb-24">
      {/* Hero Section */}
      <section className="pt-20 pb-12 px-6 md:px-20 w-full max-w-[1440px] mx-auto flex flex-col items-center text-center">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-4 block font-bold">
          Informasi Harga & Katalog Lengkap
        </span>
        <h1 className="font-serif text-4xl md:text-6xl text-primary max-w-4xl mb-6 font-medium">
          Daftar Harga & Kategori Sesi Pemotretan
        </h1>
        <p className="font-sans text-base md:text-lg text-secondary max-w-2xl mx-auto font-light leading-relaxed">
          Temukan seluruh pilihan paket foto dan video studio kami yang dikelompokkan secara lengkap per kategori. Pilih paket terbaik yang sesuai dengan momen berharga Anda.
        </p>
      </section>

      {/* Pricing Catalog Grid */}
      <section className="px-6 md:px-20 w-full max-w-[1440px] mx-auto">
        {isDbError || packages.length === 0 ? (
          <div className="w-full text-center py-20 text-secondary/60 font-sans text-sm border border-dashed border-border/30 rounded bg-muted/10 max-w-2xl mx-auto">
            Belum ada paket layanan yang ditambahkan saat ini.
          </div>
        ) : (
          <PricingCatalog
            initialPackages={serializedPackages}
            categories={serializedCategories}
          />
        )}
      </section>
    </div>
  );
}
