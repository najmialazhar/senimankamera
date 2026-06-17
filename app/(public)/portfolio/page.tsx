"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface PortfolioItem {
  id: number;
  title: string;
  category: string;
  subCategory: string;
  imageUrl: string;
  aspect: "portrait" | "square" | "landscape" | "wide";
}

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const categories = ["All", "Wedding", "Prewedding", "Graduation", "Portraits", "Events"];

  const items: PortfolioItem[] = [
    {
      id: 1,
      title: "The Vows",
      category: "Wedding",
      subCategory: "Wedding • Editorial",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSmJaBAe4CdjuoHLvqU-Km175wwOxFHMg9_TRB3KRblnYoPcN9RkgIosSQ8cvM3Oan55Di3kQ8w1vdkDt5VnJ1pW4jb4H7W715r5alSfzDmw7meD52yJHfbmarV5ZQVmLVXiO_GtbigfR5zbmoz4YpI6jV3qYZRtAjcvWbpM5Tnzn8ky7Y5-zBmKx7QIA2yr_EbvqVe5s7LdtfUrs8oQNRn3m3CWX0PPxQejkd5kp_95AIC8Klp4wFLyEDvbP_NZmzOfNfSHNCPSa8",
      aspect: "portrait"
    },
    {
      id: 2,
      title: "Quiet Confidence",
      category: "Portraits",
      subCategory: "Portraits • Studio",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBW-XqRchG1enZOr4Qh03n5_E--qis2aDq25KpXpkU3Zd2qIp_M9tedgLROIybcCpGGm1uxqusuY0U4f13B34_xCC5sccKW-Y_T-Y64wx1h-vIUpNtZkzLM90caCydnJwb_QTjLNNXOmeWRs-GU0fyGOq2UBmoPI0NHayKXs09j-P_owM1oZmtMSvlZmrv4SC4merv04i44DVwhjXEaWz25smWx18r5RWwkvAoXKhLxJlukBgucipeYa2jMolRg_1Im0j4amksUVYHq",
      aspect: "square"
    },
    {
      id: 3,
      title: "Distance & Light",
      category: "Prewedding",
      subCategory: "Prewedding • Architecture",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPpnyNreOiWxPV-QMHlA2IunDlwNY7K9EdQl_DDOIVOjgc7Dcn4YR_fvqmwS8i-iuf_3EQV3tw5teLBC6_KaO8g7ishq9CYsZHhJX7IpJ5KdBpH_PxT1oSqeRID45CH0EzTHJ3vAry0mtGVaIosUgb_mKl6UZuKVd0STNdXvht4KE1FZC2MpgrlLrF9HzttI36khhLn4rJEPQjOp6kH09RUYl77L37VHNSj4XekvjbYjNNXf4hYBVctYDfxOToNHCd7y-sL2pBRwuf",
      aspect: "portrait"
    },
    {
      id: 4,
      title: "The Culmination",
      category: "Graduation",
      subCategory: "Graduation • Milestone",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAb3PLE5cmDF39Mx3nozwHjRn4tYH9GiTjNUVKNFNnsP4AcLWNkw1dhA8ItQai_Qz-U2O9uI7XE5ySd-17TlCxI4smgOlM9pzLF-uzIZ3ro4J2DuDv1cqDAcKs-7E4iI9_x3P8kHWsm3WNis2izbtewpDIHZxN8nLKoWoJyLZODbgVaO55B2UPeCegCwJ8-W7W8J-HplWm8yrvnTGY7THIOQ1Jzhqf9LSE6g2d3I-45xOoCG436NPA7N_N6qk5kHyZ6o7sr360FHR2l",
      aspect: "wide"
    },
    {
      id: 5,
      title: "Curated Moments",
      category: "Events",
      subCategory: "Events • Details",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFquGuAOotqRrlO56_aAiB3jr7Mk3dlRq82z6eOF1ljJhJmzQE228XxnV2cTPsTnQYwTVYly75qFugn3BXVK93NBLcIqFo_vV2FH4kt8XaBs80maNxL05eZladF_M7f5QBy9oPLXk0Map1vpj50e0tUiOFtfqa4nbtkJn0wOwDUptPBWTH85wOUTJKS14MggUuf-TTsm6txQCwlS2EBE7IG4RrxqTpVEbyS_mOija3hmLZddIBRj6RRKHx_qa40clUTpr4bB9bQbLT",
      aspect: "portrait"
    },
    {
      id: 6,
      title: "The Details",
      category: "Wedding",
      subCategory: "Wedding • B&W",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJmiGKVwaTThlLyJlJtnj7cW3IyZxWYaNilqLS951xtRawOZASgqaWYlff5l5ejQNUT2DaTwmOs5CcS9qoFY5xK82y1JtUjKnCsNXP1klI1uO7x_3uQJV0xAy1U8-SgLw7mh-125SGm3GpdO4-tGhXo3OwuZqdqrU5lStsdPjjLW4esKIcatkCy3_iaHPz-G2bVX6x7uS4QZTzdRlaVI-m5w4nVEwMeaJuRFzS6C3JIz3qnB-3_Iu0MF4ETw1fRLKsaVrXo4W4ZyPw",
      aspect: "square"
    }
  ];

  const filteredItems = activeFilter === "All"
    ? items
    : items.filter(item => item.category === activeFilter);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20 py-12 md:py-20">
      {/* Header Section */}
      <section className="flex flex-col items-center text-center mb-16 max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl md:text-6xl text-primary mb-4 font-medium">
          Curated Works
        </h1>
        <p className="font-sans text-base md:text-lg text-secondary font-light leading-relaxed">
          A collection of moments captured through the lens, where light meets emotion in an editorial style.
        </p>
      </section>

      {/* Filter Options */}
      <section className="flex flex-wrap justify-center gap-4 md:gap-8 mb-16 border-b border-border/40 pb-6 font-sans text-xs uppercase tracking-widest font-bold">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={cn(
              "pb-1 transition-all duration-300",
              activeFilter === cat
                ? "text-primary border-b border-primary"
                : "text-secondary hover:text-primary"
            )}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Masonry-Style Grid using CSS Columns */}
      <section className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="break-inside-avoid group cursor-pointer flex flex-col mb-8"
          >
            <div
              className={cn(
                "w-full overflow-hidden bg-muted relative border border-border/30 mb-4",
                item.aspect === "portrait" && "aspect-[3/4]",
                item.aspect === "square" && "aspect-square",
                item.aspect === "wide" && "aspect-[16/9]"
              )}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-[0.8s] group-hover:scale-105"
              />
            </div>
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-secondary block mb-1 font-bold">
                {item.subCategory}
              </span>
              <h3 className="font-serif text-xl md:text-2xl text-primary font-medium">
                {item.title}
              </h3>
            </div>
          </div>
        ))}
      </section>

      {/* Load More Action */}
      <div className="flex justify-center mt-16">
        <button className="border border-primary text-primary bg-transparent font-sans text-xs uppercase tracking-widest px-8 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-bold rounded-none">
          Load More Works
        </button>
      </div>
    </div>
  );
}
