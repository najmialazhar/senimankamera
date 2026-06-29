import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/src/infrastructure/prisma/client";
import { FeaturedCollections } from "@/src/modules/gallery/components/featured-collections";
import { FeaturedTestimonials } from "@/src/modules/gallery/components/featured-testimonials";
import { TestimonialRepository } from "@/src/modules/gallery/repositories/testimonial.repository";
import { getHomepageVideoAction } from "@/src/modules/booking/actions/get-homepage-video.action";
import { YouTubeDisplayer } from "@/components/youtube-displayer";

export const revalidate = 0;

export default async function HomePage() {
  let latestGalleries = [];
  let testimonials = [];
  let showcaseData = {
    youtubeUrl: "",
    tagline: "Showcase Studio",
    title: "Intensional. Tenang. Abadi.",
    description1: "Pendekatan kami berakar pada observasi, bukan orkestrasi. Kami percaya bahwa gambar yang paling kuat lahir dari interaksi yang jujur, bukan pose yang dipaksakan. Dengan menjaga kehadiran yang tenang dan tidak mengganggu, kami membiarkan keindahan alami kisah Anda mengalir.",
    description2: "Saksikan visualisasi cerita karya kami melalui video dokumentasi di samping, yang dikomposisikan dan dikurasi secara estetik demi hasil yang abadi.",
    aspectRatio: "PORTRAIT" as "PORTRAIT" | "LANDSCAPE" | "SQUARE",
  };
  let isDbError = false;

  try {
    const testimonialRepo = new TestimonialRepository();
    const [resGalleries, resTestimonials, videoRes] = await Promise.all([
      prisma.gallery.findMany({
        where: {
          mediaType: "image",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 6,
      }),
      testimonialRepo.findAll(),
      getHomepageVideoAction(),
    ]);
    latestGalleries = resGalleries;
    testimonials = resTestimonials;
    if (videoRes.success && videoRes.data) {
      showcaseData = {
        ...showcaseData,
        ...videoRes.data,
      };
    }
  } catch (error) {
    console.error("Prisma error during home page generation:", error);
    isDbError = true;
  }

  const displayItems = latestGalleries;
  const displayTestimonials = testimonials.slice(0, 6);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] md:h-[90vh] bg-neutral-200 overflow-hidden flex flex-col justify-end">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage: `url('/hero.png')`
          }}
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

        {/* Hero Content */}
        <div className="relative z-20 w-full px-6 md:px-20 max-w-[1440px] mx-auto pb-16 md:pb-24 text-white">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl mb-6 leading-tight font-medium">
              Fotografer Bandung.
            </h1>
            <p className="font-sans text-base md:text-lg mb-10 max-w-xl font-light opacity-90 leading-relaxed">
              Capture your Moment before it turns into Memory.
            </p>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-3 border-b border-white pb-2 hover:opacity-75 transition-opacity font-semibold"
            >
              <span>Jelajahi Galeri</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic YouTube Video Showcase Section (Dinamis CMS) */}
      <section className="py-24 md:py-32 px-6 md:px-20 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5">
            {showcaseData.tagline && (
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary block mb-4 font-bold">
                {showcaseData.tagline}
              </span>
            )}
            {showcaseData.title && (
              <h2 className="font-serif text-3xl md:text-5xl text-primary mb-6 font-medium leading-tight">
                {showcaseData.title}
              </h2>
            )}
            {showcaseData.description1 && (
              <p className="font-sans text-base md:text-lg text-secondary mb-6 font-light leading-relaxed">
                {showcaseData.description1}
              </p>
            )}
            {showcaseData.description2 && (
              <p className="font-sans text-base md:text-lg text-secondary font-light leading-relaxed mb-8">
                {showcaseData.description2}
              </p>
            )}
            <Link
              href="/services"
              className="inline-flex items-center gap-3 border-b border-primary pb-1 font-sans text-xs uppercase tracking-widest font-bold text-primary hover:opacity-80 transition-opacity"
            >
              <span>Lihat Layanan Kami</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-7">
            <YouTubeDisplayer youtubeUrl={showcaseData.youtubeUrl} aspectRatio={showcaseData.aspectRatio} />
          </div>
        </div>
      </section>

      {/* Portfolio Categories Section */}
      <section className="py-24 md:py-32 bg-muted/50 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-20 mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-widest text-secondary block mb-3 font-bold">
              Karya Seni Kami
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">
              Koleksi Pilihan
            </h2>
            <p className="text-[11px] md:text-xs text-secondary/70 italic font-light mt-2 max-w-xl">
              *Harap maklum jika kualitas foto di web tidak setajam berkas asli demi kecepatan akses halaman.
            </p>
          </div>
          <Link
            href="/portfolio"
            className="font-sans text-xs uppercase tracking-widest border-b border-primary pb-1 font-bold text-primary hover:opacity-85"
          >
            Lihat Semua Karya
          </Link>
        </div>

        {/* Collections Row */}
        {displayItems.length > 0 ? (
          <FeaturedCollections items={displayItems} />
        ) : (
          <div className="max-w-[1440px] mx-auto px-6 md:px-20 text-center py-16 text-secondary/60 font-sans text-sm border border-dashed border-border/30 rounded bg-muted/10">
            Belum ada koleksi pilihan yang ditambahkan.
          </div>
        )}
      </section>

      {/* Testimonials Section */}
      <section className="py-24 md:py-32 bg-muted/30 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-20 mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-3 block font-bold">
              Pengalaman Klien
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">
              Kata Mereka
            </h2>
          </div>
          <Link
            href="/testimonials"
            className="font-sans text-xs uppercase tracking-widest border-b border-primary pb-1 font-bold text-primary hover:opacity-85"
          >
            Lihat Semua Testimoni
          </Link>
        </div>

        <FeaturedTestimonials items={displayTestimonials} />
      </section>

      {/* Call to Action Section */}
      <section className="py-24 md:py-32 px-6 md:px-20 max-w-[1440px] mx-auto text-center border-t border-border/20">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-4 block font-bold">
          Abadikan Kisah Anda
        </span>
        <h2 className="font-serif text-4xl md:text-6xl text-primary mb-8 font-medium max-w-2xl mx-auto leading-tight">
          Siap Membuat Momen Abadi Bersama Kami?
        </h2>
        <Link
          href="/book"
          className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 uppercase tracking-widest font-sans text-xs font-bold hover:bg-primary/90 transition-colors"
        >
          <span>Pesan Sesi Foto</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
