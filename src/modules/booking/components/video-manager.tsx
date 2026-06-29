"use client";

import { useState, useTransition } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminHeader } from "@/components/admin-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import { updateHomepageVideoAction } from "../actions/update-homepage-video.action";
import { Save, AlertCircle, Video, Type, ArrowRight, Eye, Smartphone, Monitor, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { YouTubeDisplayer } from "@/components/youtube-displayer";

interface VideoManagerProps {
  initialData?: {
    youtubeUrl: string;
    tagline: string;
    title: string;
    description1: string;
    description2: string;
    aspectRatio?: "PORTRAIT" | "LANDSCAPE" | "SQUARE";
  };
}

export function VideoManager({ initialData }: VideoManagerProps) {
  // Baseline saved state to track changes
  const [savedData, setSavedData] = useState({
    youtubeUrl: initialData?.youtubeUrl || "",
    tagline: initialData?.tagline || "Showcase Studio",
    title: initialData?.title || "Intensional. Tenang. Abadi.",
    description1:
      initialData?.description1 ||
      "Pendekatan kami berakar pada observasi, bukan orkestrasi. Kami percaya bahwa gambar yang paling kuat lahir dari interaksi yang jujur, bukan pose yang dipaksakan. Dengan menjaga kehadiran yang tenang dan tidak mengganggu, kami membiarkan keindahan alami kisah Anda mengalir.",
    description2:
      initialData?.description2 ||
      "Saksikan visualisasi cerita karya kami melalui video dokumentasi di samping, yang dikomposisikan dan dikurasi secara estetik demi hasil yang abadi.",
    aspectRatio: (initialData?.aspectRatio || "PORTRAIT") as "PORTRAIT" | "LANDSCAPE" | "SQUARE",
  });

  // Form input states
  const [youtubeUrl, setYoutubeUrl] = useState(savedData.youtubeUrl);
  const [tagline, setTagline] = useState(savedData.tagline);
  const [title, setTitle] = useState(savedData.title);
  const [description1, setDescription1] = useState(savedData.description1);
  const [description2, setDescription2] = useState(savedData.description2);
  const [aspectRatio, setAspectRatio] = useState<"PORTRAIT" | "LANDSCAPE" | "SQUARE">(savedData.aspectRatio);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Check if any field has been modified from savedData
  const hasChanges =
    youtubeUrl !== savedData.youtubeUrl ||
    tagline !== savedData.tagline ||
    title !== savedData.title ||
    description1 !== savedData.description1 ||
    description2 !== savedData.description2 ||
    aspectRatio !== savedData.aspectRatio;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || isPending) return;

    setError(null);

    startTransition(async () => {
      const response = await updateHomepageVideoAction({
        youtubeUrl,
        tagline,
        title,
        description1,
        description2,
        aspectRatio,
      });

      if (response.success) {
        setSavedData({
          youtubeUrl,
          tagline,
          title,
          description1,
          description2,
          aspectRatio,
        });
        toast.success("Konten & Video Showcase berhasil diperbarui!");
      } else {
        setError(response.error || "Gagal menyimpan perubahan.");
        toast.error("Gagal menyimpan perubahan.");
      }
    });
  };

  return (
    <SidebarProvider>
      <AdminSidebar variant="sidebar" />
      <SidebarInset className="flex flex-col min-h-screen bg-background text-foreground">
        <AdminHeader title="Manajemen Studio Seniman Kamera" />

        <div className="flex-1 px-6 md:px-12 py-10 max-w-[1200px] mx-auto w-full space-y-12">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/20 pb-6">
            <div className="space-y-2">
              <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">
                Manajemen Showcase Beranda
              </h2>
              <p className="font-sans text-sm text-secondary font-light">
                Kelola judul, deskripsi, bentuk tampilan (rasio), dan URL media (YouTube/Instagram) pada section Showcase beranda publik.
              </p>
            </div>
          </div>

          {/* FORM SHOWCASE */}
          <form onSubmit={handleSubmit} className="space-y-10 max-w-5xl">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-800 flex items-center gap-2.5 text-xs font-sans">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* GRID KONTEN & MEDIA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* KONTEN TEKS SHOWCASE */}
              <div className="border border-border/40 bg-card p-6 md:p-8 space-y-6 rounded-none font-sans text-xs flex flex-col justify-between">
                <div className="space-y-6">
                  <h3 className="font-serif text-lg text-primary font-semibold flex items-center gap-2 pb-3 border-b border-border/20 uppercase tracking-wider text-xs">
                    <Type className="w-4 h-4 text-amber-600" />
                    Konten Teks Showcase
                  </h3>

                  <div className="space-y-2">
                    <label className="font-sans text-xs font-bold text-primary block uppercase tracking-wider">
                      Tagline (Label Atas)
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary font-sans text-xs leading-relaxed"
                      placeholder="Contoh: Showcase Studio / Filosofi Kami"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-sans text-xs font-bold text-primary block uppercase tracking-wider">
                      Judul Utama Section
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary font-sans text-xs leading-relaxed"
                      placeholder="Contoh: Intensional. Tenang. Abadi."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-sans text-xs font-bold text-primary block uppercase tracking-wider">
                      Deskripsi Paragraf 1
                    </label>
                    <textarea
                      rows={4}
                      value={description1}
                      onChange={(e) => setDescription1(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary font-sans text-xs leading-relaxed"
                      placeholder="Tuliskan deskripsi utama..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-sans text-xs font-bold text-primary block uppercase tracking-wider">
                      Deskripsi Paragraf 2
                    </label>
                    <textarea
                      rows={3}
                      value={description2}
                      onChange={(e) => setDescription2(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary font-sans text-xs leading-relaxed"
                      placeholder="Tuliskan deskripsi penutup/pengantar video..."
                    />
                  </div>
                </div>
              </div>

              {/* MEDIA & OPSI RASIO */}
              <div className="border border-border/40 bg-card p-6 md:p-8 space-y-6 rounded-none font-sans text-xs flex flex-col justify-between">
                <div className="space-y-6">
                  <h3 className="font-serif text-lg text-primary font-semibold flex items-center gap-2 pb-3 border-b border-border/20 uppercase tracking-wider text-xs">
                    <Video className="w-4 h-4 text-red-500" />
                    Media Video / Reel (YouTube / Instagram)
                  </h3>

                  <div className="space-y-3">
                    <label className="font-sans text-xs font-bold text-primary block uppercase tracking-wider">
                      URL Media (YouTube / Instagram)
                    </label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary font-sans text-xs leading-relaxed"
                      placeholder="Contoh: https://www.youtube.com/watch?v=... atau https://www.instagram.com/reel/..."
                    />
                    <p className="text-secondary/70 text-[11px] font-light leading-relaxed">
                      Mendukung link YouTube (Shorts/Video) dan Instagram (Reels/Post).
                    </p>
                  </div>

                  {/* PILIHAN RASIO ASPEK */}
                  <div className="space-y-3 pt-3 border-t border-border/20">
                    <label className="font-sans text-xs font-bold text-primary block uppercase tracking-wider">
                      Format Tampilan / Rasio Aspek
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setAspectRatio("PORTRAIT")}
                        className={`p-3 border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                          aspectRatio === "PORTRAIT"
                            ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                            : "border-border/40 text-secondary hover:border-border"
                        }`}
                      >
                        <Smartphone className="w-5 h-5" />
                        <span className="text-[11px]">Portrait (9:16)</span>
                        <span className="text-[9px] font-light opacity-70">Reels / Shorts</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAspectRatio("LANDSCAPE")}
                        className={`p-3 border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                          aspectRatio === "LANDSCAPE"
                            ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                            : "border-border/40 text-secondary hover:border-border"
                        }`}
                      >
                        <Monitor className="w-5 h-5" />
                        <span className="text-[11px]">Landscape (16:9)</span>
                        <span className="text-[9px] font-light opacity-70">Video Biasa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAspectRatio("SQUARE")}
                        className={`p-3 border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                          aspectRatio === "SQUARE"
                            ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                            : "border-border/40 text-secondary hover:border-border"
                        }`}
                      >
                        <Square className="w-5 h-5" />
                        <span className="text-[11px]">Square (1:1)</span>
                        <span className="text-[9px] font-light opacity-70">Post Feed</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/20 flex flex-col gap-2">
                  <Button
                    type="submit"
                    disabled={isPending || !hasChanges}
                    className={`w-full uppercase tracking-widest py-6 px-10 rounded-none font-bold transition-all duration-300 flex items-center justify-center gap-2 text-xs ${
                      hasChanges && !isPending
                        ? "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 shadow-lg cursor-pointer"
                        : "bg-neutral-800/40 text-neutral-400 dark:bg-neutral-900/40 dark:text-neutral-600 border border-neutral-700/30 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    {isPending
                      ? "Menyimpan..."
                      : hasChanges
                      ? "Simpan Perubahan Showcase"
                      : "Belum Ada Perubahan"}
                  </Button>
                  {!hasChanges && (
                    <p className="text-[10px] text-center text-secondary/60 font-light italic">
                      Ubah salah satu teks, rasio, atau link di atas untuk mengaktifkan tombol simpan.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* FULL LIVE PREVIEW SECTION */}
            <div className="border border-border/40 bg-card p-6 md:p-10 space-y-6 rounded-none font-sans">
              <div className="flex items-center justify-between border-b border-border/20 pb-4">
                <h3 className="font-serif text-lg text-primary font-semibold flex items-center gap-2 uppercase tracking-wider text-xs">
                  <Eye className="w-4 h-4 text-blue-500" />
                  Live Preview Tampilan Beranda Publik
                </h3>
                <span className="text-[10px] uppercase tracking-widest text-secondary font-bold bg-muted px-2.5 py-1">
                  Real-time Preview ({aspectRatio})
                </span>
              </div>

              {/* Simulated Public Homepage Section */}
              <div className="bg-background border border-border/30 p-6 md:p-10 rounded-none">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  <div className="lg:col-span-5 space-y-4">
                    {tagline && (
                      <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary block font-bold">
                        {tagline}
                      </span>
                    )}
                    {title && (
                      <h2 className="font-serif text-2xl md:text-3xl text-primary font-medium leading-tight">
                        {title}
                      </h2>
                    )}
                    {description1 && (
                      <p className="font-sans text-xs md:text-sm text-secondary font-light leading-relaxed">
                        {description1}
                      </p>
                    )}
                    {description2 && (
                      <p className="font-sans text-xs md:text-sm text-secondary font-light leading-relaxed">
                        {description2}
                      </p>
                    )}
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 border-b border-primary pb-1 font-sans text-[11px] uppercase tracking-widest font-bold text-primary opacity-90">
                        <span>Lihat Layanan Kami</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                    <YouTubeDisplayer youtubeUrl={youtubeUrl} aspectRatio={aspectRatio} />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
