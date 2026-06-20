"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  subCategory: string;
  imageUrl: string;
  aspect: string;
  description: string | null;
}

export function FeaturedCollections({ items }: { items: GalleryItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const itemsCount = items.length;

  // Detect screen size to determine visible items count (used for dots/arrows maxIndex calculation)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleItems(3);
      } else if (window.innerWidth >= 768) {
        setVisibleItems(2);
      } else {
        setVisibleItems(1);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, itemsCount - visibleItems);

  // Clamp current index if it becomes out of bounds on screen resize
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const firstChild = container.firstElementChild as HTMLElement;
    if (!firstChild) return;

    // Item width including gap of 32px (gap-8 is 32px)
    const itemWidth = firstChild.getBoundingClientRect().width + 32;
    
    isProgrammaticScrollRef.current = true;
    container.scrollTo({
      left: index * itemWidth,
      behavior: "smooth",
    });

    // Reset the programmatic scroll flag after transition is complete
    const timeoutId = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 800);

    return () => clearTimeout(timeoutId);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const next = prev >= maxIndex ? 0 : prev + 1;
      scrollToIndex(next);
      return next;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const next = prev <= 0 ? maxIndex : prev - 1;
      scrollToIndex(next);
      return next;
    });
  };

  // Auto slide every 5 seconds
  useEffect(() => {
    if (itemsCount === 0 || maxIndex === 0) return;
    
    timerRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [itemsCount, maxIndex]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (itemsCount > 0 && maxIndex > 0) {
      timerRef.current = setInterval(nextSlide, 5000);
    }
  };

  const handleScroll = () => {
    // Skip scroll detection if programmatically scrolling to avoid jumpiness/feedback loop
    if (isProgrammaticScrollRef.current) return;
    
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const firstChild = container.firstElementChild as HTMLElement;
    if (!firstChild) return;

    const scrollLeft = container.scrollLeft;
    const itemWidth = firstChild.getBoundingClientRect().width + 32; // item width + gap-8

    const index = Math.round(scrollLeft / itemWidth);
    const clampedIndex = Math.min(Math.max(0, index), maxIndex);

    if (clampedIndex !== currentIndex) {
      setCurrentIndex(clampedIndex);
    }
  };

  const categoryTranslations: Record<string, string> = {
    Wedding: "Pernikahan",
    Portraits: "Potret",
    Prewedding: "Pranikah",
    Graduation: "Wisuda",
    Events: "Acara",
  };

  if (itemsCount === 0) return null;

  const slidePositionsCount = maxIndex + 1;

  return (
    <div className="relative w-full overflow-hidden">
      {/* Slides Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onTouchStart={resetTimer}
        onMouseDown={resetTimer}
        className="flex gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth px-6 md:px-20 py-4 pb-8 -mx-6 md:-mx-20 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => {
          const isOddIndex = index % 2 === 1;
          const categoryLabel = categoryTranslations[item.category] || item.category;

          return (
            <div
              key={item.id}
              onClick={resetTimer}
              className={cn(
                "flex-shrink-0 group cursor-pointer select-none px-4 snap-start transition-transform duration-300",
                "w-[82vw] sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)]",
                isOddIndex && "lg:mt-12"
              )}
            >
              <div className="aspect-[4/5] overflow-hidden bg-muted mb-6 relative border border-border/20">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-105"
                  draggable={false}
                />
              </div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-secondary block mb-2 font-bold">
                {categoryLabel} • {item.subCategory}
              </span>
              <h3 className="font-serif text-2xl text-primary font-medium">{item.title}</h3>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls (Dots & Arrows) */}
      {maxIndex > 0 && (
        <div className="max-w-[1440px] mx-auto px-6 md:px-20 mt-12 flex justify-between items-center">
          {/* Dots Indicators */}
          <div className="flex gap-2">
            {Array.from({ length: slidePositionsCount }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  scrollToIndex(idx);
                  resetTimer();
                }}
                className={`h-1.5 transition-all duration-500 rounded-full bg-primary ${
                  currentIndex === idx ? "w-8 opacity-100" : "w-2 opacity-30"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Button Controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                prevSlide();
                resetTimer();
              }}
              className="h-9 w-9 rounded-none border-border"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                nextSlide();
                resetTimer();
              }}
              className="h-9 w-9 rounded-none border-border"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
