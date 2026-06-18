"use client";

import { useState, useTransition } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { updateTermsContentAction } from "../actions/update-terms-content.action";
import { Save, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SettingsManagerProps {
  initialTncTimeBased: string;
  initialTncDateOnly: string;
}

export function SettingsManager({
  initialTncTimeBased,
  initialTncDateOnly,
}: SettingsManagerProps) {
  const [tncTimeBased, setTncTimeBased] = useState(initialTncTimeBased);
  const [tncDateOnly, setTncDateOnly] = useState(initialTncDateOnly);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await updateTermsContentAction({
        tncTimeBased,
        tncDateOnly,
      });

      if (response.success) {
        toast.success("Pengaturan Syarat & Ketentuan berhasil diperbarui!");
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
        
        {/* Header App Bar */}
        <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-border/40 bg-background sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-secondary hover:text-primary transition-colors" />
            <span className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold hidden md:block">
              Manajemen Studio Seniman Kamera
            </span>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 px-6 md:px-12 py-10 max-w-[1200px] mx-auto w-full space-y-12">
          
          <div className="space-y-2">
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">Pengaturan S&K</h2>
            <p className="font-sans text-sm text-secondary font-light">
              Kelola teks Syarat & Ketentuan yang akan ditampilkan ke klien sebelum pembayaran Midtrans.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-800 flex items-center gap-2.5 text-xs font-sans">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8">
              {/* Card 1: Time-Based */}
              <div className="border border-border/40 bg-card p-6 space-y-4 rounded-none font-sans text-xs">
                <h3 className="font-serif text-lg text-primary font-semibold flex items-center gap-2 pb-3 border-b border-border/20 uppercase tracking-wider text-xs">
                  <FileText className="w-4 h-4 text-blue-600" />
                  S&K Kategori Waktu (TIME_BASED)
                </h3>
                <p className="text-secondary leading-relaxed mb-2">
                  Ditampilkan untuk paket dengan kategori slot waktu (contoh: Studio, Graduasi, Sesi Singkat).
                </p>
                <textarea
                  rows={10}
                  value={tncTimeBased}
                  onChange={(e) => setTncTimeBased(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary font-sans text-xs leading-relaxed"
                  placeholder="Tuliskan syarat & ketentuan di sini..."
                  required
                />
              </div>

              {/* Card 2: Date-Only */}
              <div className="border border-border/40 bg-card p-6 space-y-4 rounded-none font-sans text-xs">
                <h3 className="font-serif text-lg text-primary font-semibold flex items-center gap-2 pb-3 border-b border-border/20 uppercase tracking-wider text-xs">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  S&K Kategori Harian (DATE_ONLY)
                </h3>
                <p className="text-secondary leading-relaxed mb-2">
                  Ditampilkan untuk paket yang di-booking seharian penuh (contoh: Wedding, Event besar, Dokumentasi Out-door).
                </p>
                <textarea
                  rows={10}
                  value={tncDateOnly}
                  onChange={(e) => setTncDateOnly(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary font-sans text-xs leading-relaxed"
                  placeholder="Tuliskan syarat & ketentuan di sini..."
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isPending}
                className="uppercase tracking-widest py-6 px-10 rounded-none font-bold text-white cursor-pointer flex items-center gap-2 text-xs"
              >
                <Save className="w-4 h-4" />
                {isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
