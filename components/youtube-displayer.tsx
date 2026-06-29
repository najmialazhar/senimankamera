"use client";

import { useState } from "react";
import { Play, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface YouTubeDisplayerProps {
  youtubeUrl: string;
  aspectRatio?: "PORTRAIT" | "LANDSCAPE" | "SQUARE";
  className?: string;
}

/**
 * Helper untuk mengambil ID video YouTube dari berbagai format link
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Helper untuk mengambil Shortcode Instagram (Reel/Post)
 */
export function getInstagramShortcode(url: string): { type: "reel" | "p"; code: string } | null {
  if (!url) return null;
  const regExp = /(?:instagram\.com|instagr\.am)\/(reel|p|tv)\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regExp);
  if (match && match[2]) {
    return {
      type: match[1] === "reel" ? "reel" : "p",
      code: match[2],
    };
  }
  return null;
}

export function YouTubeDisplayer({
  youtubeUrl,
  aspectRatio = "PORTRAIT",
  className,
}: YouTubeDisplayerProps) {
  const ytVideoId = getYouTubeVideoId(youtubeUrl);
  const igData = getInstagramShortcode(youtubeUrl);
  const [isPlaying, setIsPlaying] = useState(false);

  // Penentuan class rasio aspek
  const aspectClasses = {
    PORTRAIT: "aspect-[9/16] max-w-xs md:max-w-sm mx-auto",
    LANDSCAPE: "aspect-video w-full",
    SQUARE: "aspect-square max-w-md mx-auto",
  };

  const currentAspectClass = aspectClasses[aspectRatio] || aspectClasses.PORTRAIT;

  // Tampilan jika link belum diisi atau tidak valid
  if (!ytVideoId && !igData) {
    return (
      <div
        className={cn(
          "w-full bg-muted/40 border border-border/40 flex flex-col items-center justify-center p-6 text-center text-secondary transition-all duration-300 shadow-sm",
          currentAspectClass,
          className
        )}
      >
        <Video className="w-10 h-10 mb-3 opacity-30 stroke-1" />
        <p className="font-sans text-xs uppercase tracking-wider font-medium">Media Showcase Belum Dikonfigurasi</p>
        <p className="font-sans text-[11px] font-light text-secondary/60 mt-1 leading-relaxed max-w-xs">
          Tempelkan link YouTube (Shorts/Video) atau Instagram (Reels/Post) melalui Panel Admin.
        </p>
      </div>
    );
  }

  // JIKA MEDIA ADALAH INSTAGRAM REEL / POST
  if (igData) {
    const igEmbedUrl = `https://www.instagram.com/${igData.type}/${igData.code}/embed`;
    return (
      <div
        className={cn(
          "w-full relative bg-black overflow-hidden border border-border/30 shadow-2xl transition-all duration-300",
          currentAspectClass,
          className
        )}
      >
        <iframe
          src={igEmbedUrl}
          title="Instagram Media Showcase"
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
    );
  }

  // JIKA MEDIA ADALAH YOUTUBE
  const embedUrl = `https://www.youtube-nocookie.com/embed/${ytVideoId}?autoplay=1&rel=0&modestbranding=1`;
  const thumbnailUrl = `https://img.youtube.com/vi/${ytVideoId}/maxresdefault.jpg`;

  return (
    <div
      className={cn(
        "w-full relative bg-black overflow-hidden border border-border/30 shadow-2xl group transition-all duration-300",
        currentAspectClass,
        className
      )}
    >
      {!isPlaying ? (
        <div
          className="relative w-full h-full cursor-pointer overflow-hidden"
          onClick={() => setIsPlaying(true)}
        >
          {/* Thumbnail Image */}
          <img
            src={thumbnailUrl}
            alt="YouTube Video Showcase"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-90 group-hover:brightness-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`;
            }}
          />

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-80" />

          {/* Custom Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-background/90 text-primary flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
              <Play className="w-6 h-6 md:w-7 md:h-7 ml-1 fill-current" />
            </div>
          </div>

          {/* Video Tag Label */}
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
            <span className="font-sans text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/80 font-bold bg-black/40 backdrop-blur-md px-3 py-1.5 border border-white/20">
              {aspectRatio === "PORTRAIT" ? "Shorts / Reel" : "Showcase Video"}
            </span>
          </div>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          title="YouTube Video Showcase"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
}
