import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const collections = [
    {
      title: "The Main Event",
      category: "01 • Wedding",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCJtimT1j3d4-PVx7xHWgn2DYhN6L8Bl2myAtaFHOb7r7vn_6oyRX2Dez1gfdnPIcn8GEIOPmOElR3_-u67FhZduHFmBuKSElf1OQ5odoJAGRRdZyYWXvHoFpdlVeFVnLxheHsi5VMHQfzSDFVW781DkEVKgRP729VTSrM7rtO7vLv8M5uOkVLWd2TCSOxNtV6k1jBDj5WqpEcGo0GZjW_HHb0fUM-BNd6KQZk0je79bYXiBo8x1IpOxVj63Xk-XbqAmiAOzi5yTDo",
      alt: "Wedding Photography"
    },
    {
      title: "The Prelude",
      category: "02 • Prewedding",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-dGyIedlUDtzm97T6YxpxDWWpxUE_QtuLSe3hDeKC3kjxRQxur1S3yKKV8Nr4uuVUix1OHq84HAk_oBeqkX2M6bWm-i1VGwXHdkfHKa5EH27HhhlLGNiFq1tDE8iXtAU40WoXAZLQjON19uLRLoa3mCjamhQaFXPoF-1_QdHZl0oQQDHBoD38Zq1cfH8q4U7BkjgM2DnU3iUVnnBDN9zwa4nATgrTBMxY0stb_IztypdpQDNppcSTkfo8JPU7j4z98mJOV1eq8slH",
      alt: "Prewedding Photography"
    },
    {
      title: "The Individual",
      category: "03 • Portraits",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-y2iO_u9R60MaruXR8QMXB5m-9Ti8bH4vdhKqR-Okw-QjmIlfkmTsorBjfjLb5_JTqG7IO_4cECBIGlv7WDyKxH-PnA86mkSpgtKb9J8Jo0w1JjTuPmv50xEbhdiVE2RyqGGIdxWPqCzBAt4oVjlhm7J_1v4PRbbUfIxB-N0jqDaqEXeYRUayHLI04KWGB2Kc2B0hNp1mbvjLPomEdL8u2wXa0baYrXHNkuiAuDs4K3S9j7LKM66MVHl19d-mzptdWlDvAe6kdMIE",
      alt: "Portrait Photography"
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] md:h-[90vh] bg-neutral-200 overflow-hidden flex flex-col justify-end">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAKcz3-h3Ge1adEgwY8BpxxJOzbgox6iXFD399PE_qgiJNgT95ONT2RQlmI8vKez4oHOUcfTPIZrqGcSvlptY6neSsNHSwocM6TpmSJ41xcEVSqBclpUCb2ZMiAONCyQuoxASh4r_5zDdMNili5qEGpUpu7S8dRwcJUZAg_594vugUzJeCuUTx2_TJeEnNRTVxeL5wZ_lJxP4novr3aFSyJos4GPXcI1CC-v1NDTOdM4HHay5LOUoxqk2JBUpascNBWojzUde-OyBO1')`
          }}
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

        {/* Hero Content */}
        <div className="relative z-20 w-full px-6 md:px-20 max-w-[1440px] mx-auto pb-16 md:pb-24 text-white">
          <div className="max-w-3xl">
            <span className="font-sans text-xs uppercase tracking-[0.2em] mb-4 block font-bold">
              The Artist Behind The Lens
            </span>
            <h1 className="font-serif text-5xl md:text-7xl mb-6 leading-tight font-medium">
              Capturing profound elegance.
            </h1>
            <p className="font-sans text-base md:text-lg mb-10 max-w-xl font-light opacity-90 leading-relaxed">
              Timeless, editorial-style photography for weddings, intimate elopements, and luxury events. We frame your most significant moments as enduring works of art.
            </p>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-3 border-b border-white pb-2 hover:opacity-75 transition-opacity font-semibold"
            >
              <span>Explore the Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 md:py-32 px-6 md:px-20 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
          <div className="md:col-span-6 lg:col-span-5 md:col-start-2">
            <span className="font-sans text-[10px] uppercase tracking-widest text-secondary block mb-4 font-bold">
              Our Ethos
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-primary mb-6 font-medium">
              Intentional. Quiet. Timeless.
            </h2>
            <p className="font-sans text-base md:text-lg text-secondary mb-6 font-light leading-relaxed">
              Our approach is rooted in observation rather than orchestration. We believe the most powerful images arise from genuine interaction, not forced posing. By maintaining a quiet, unobtrusive presence, we allow the natural beauty of your narrative to unfold, capturing images that feel deeply authentic and artistically profound.
            </p>
            <p className="font-sans text-base md:text-lg text-secondary font-light leading-relaxed">
              Every frame is treated as a piece of fine art, meticulously composed and edited to ensure a cohesive, editorial aesthetic that will stand the test of decades.
            </p>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <div className="aspect-[3/4] overflow-hidden bg-muted relative group border border-border/40">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7TrLGopM5nDCga32v2aev2V_AzsZGQobWWhdNhxg7mNfRiPV0PAwfAcmhloMkRLj8IDuIGKRV2I3reKSt5271erYU-haGMrUtibOR14MBJjJFq2z6p2mKeRgnTlaokDyAwZqA7sA0i4ZVU7Ejmexgle-XXIxlxUOi__uXwqEsj5rLfNnAj2WxAIaUGXV2HNP3Pzq1aq69DysPrkz1kb3vyf6amCPyLDo0jIxvPzDFbJdo2HlwYxGF0RxRKY62yO2S-LDQ3DhDZntk"
                alt="Detail shot"
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Categories Section */}
      <section className="py-24 md:py-32 bg-muted/50 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-20 mb-12 flex justify-between items-end">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-widest text-secondary block mb-3 font-bold">
              Our Artistry
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">
              Curated Collections
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="font-sans text-xs uppercase tracking-widest border-b border-primary pb-1 font-bold text-primary hover:opacity-85"
          >
            View All Work
          </Link>
        </div>

        {/* Collections Row */}
        <div className="flex overflow-x-auto hide-scrollbar gap-8 px-6 md:px-20 max-w-[1440px] mx-auto pb-8 snap-x snap-mandatory">
          {collections.map((item, index) => (
            <div
              key={index}
              className={`min-w-[85vw] md:min-w-[30vw] flex-shrink-0 snap-center group cursor-pointer ${
                index % 2 === 1 ? "md:mt-12" : ""
              }`}
            >
              <div className="aspect-[4/5] overflow-hidden bg-muted mb-6 relative border border-border/20">
                <img
                  src={item.imageUrl}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
              </div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-secondary block mb-2 font-bold">
                {item.category}
              </span>
              <h3 className="font-serif text-2xl text-primary font-medium">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-32 md:py-48 px-6 md:px-20 text-center" id="contact">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-6xl text-primary mb-8 font-medium">
            Commission Your Art
          </h2>
          <p className="font-sans text-base md:text-lg text-secondary mb-12 font-light leading-relaxed">
            We take on a limited number of commissions each year to ensure uncompromising quality and dedicated attention to every client. Let us tell your story.
          </p>
          <a
            href="mailto:hello@senimankamera.com"
            className={cn(
              buttonVariants({ size: "lg" }),
              "font-sans text-xs uppercase tracking-widest px-12 py-7 rounded-none text-center"
            )}
          >
            Inquire Availability
          </a>
        </div>
      </section>
    </div>
  );
}
