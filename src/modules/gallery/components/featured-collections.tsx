"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const itemsCount = items.length;

  // Detect screen size to determine visible items count
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

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      if (prev >= maxIndex) {
        return 0; // go back to start
      }
      return prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        return maxIndex; // go to end
      }
      return prev - 1;
    });
  };

  // Auto slide every 5 seconds (right to left)
  useEffect(() => {
    if (itemsCount === 0 || maxIndex === 0) return;
    
    timerRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [itemsCount, maxIndex]);

  const handleInteraction = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (itemsCount > 0 && maxIndex > 0) {
      timerRef.current = setInterval(nextSlide, 5000);
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
      <div className="relative overflow-hidden w-full">
        <div
          className="flex gap-8"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
            transition: "transform 1000ms cubic-bezier(0.25, 1, 0.5, 1)",
            width: `${(itemsCount / visibleItems) * 100}%`,
          }}
        >
          {items.map((item, index) => {
            const isOddIndex = index % 2 === 1;
            const categoryLabel = categoryTranslations[item.category] || item.category;

            return (
              <div
                key={item.id}
                onClick={handleInteraction}
                className={`flex-shrink-0 group cursor-pointer select-none px-4 ${
                  visibleItems === 3 ? "w-[30%]" : visibleItems === 2 ? "w-[45%]" : "w-[85%]"
                } ${visibleItems === 3 && isOddIndex ? "mt-12" : ""}`}
                style={{
                  width: `calc(${100 / itemsCount}% - ${((visibleItems - 1) * 32) / itemsCount}px)`
                }}
              >
                <div className="aspect-[4/5] overflow-hidden bg-muted mb-6 relative border border-border/20">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-105"
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
                  handleInteraction();
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
                handleInteraction();
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
                handleInteraction();
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
