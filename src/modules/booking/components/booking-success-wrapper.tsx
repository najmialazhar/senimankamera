"use client";

import { useState, useEffect } from "react";
import { getBookingByIdAction } from "../actions/get-booking-by-id.action";
import { BookingSuccessView } from "./booking-success-view";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingSuccessWrapperProps {
  orderId: string;
  initialBookingData?: any;
}

export function BookingSuccessWrapper({ orderId, initialBookingData }: BookingSuccessWrapperProps) {
  const [bookingData, setBookingData] = useState<any>(initialBookingData || null);
  const [isPolling, setIsPolling] = useState(!initialBookingData);
  const [pollAttempts, setPollAttempts] = useState(0);

  useEffect(() => {
    if (bookingData) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await getBookingByIdAction(orderId);
        if (!isMounted) return;

        if (res.success && res.data) {
          setBookingData(res.data);
          setIsPolling(false);
          clearInterval(interval);
        } else {
          setPollAttempts((prev) => {
            if (prev >= 6) { // 6 attempts * 2s = 12 seconds max polling
              setIsPolling(false);
              clearInterval(interval);
            }
            return prev + 1;
          });
        }
      } catch (err) {
        console.error("Success wrapper polling error:", err);
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderId, bookingData]);

  if (isPolling) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20 py-24 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-full max-w-md border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/30 p-8 text-center flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin mb-4" />
          <h2 className="font-serif text-2xl text-primary mb-2 font-medium">Memverifikasi Bukti Pembayaran</h2>
          <p className="font-sans text-xs text-secondary font-light leading-relaxed">
            Sistem sedang menyinkronkan data pembayaran DOKU Anda. Harap tunggu sebentar...
          </p>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-full max-w-md border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 p-8 text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-700 dark:text-red-400 mb-4 stroke-1 animate-pulse" />
          <h2 className="font-serif text-2xl text-red-900 dark:text-red-300 mb-2 font-medium">Pemesanan Tidak Ditemukan</h2>
          <p className="font-sans text-xs text-red-700 dark:text-red-400 font-light mb-6 leading-relaxed">
            Kami belum dapat menemukan verifikasi pembayaran resmi untuk Kode Order <strong className="font-mono">{orderId}</strong>. Pastikan Anda telah menyelesaikan pembayaran di portal DOKU.
          </p>
          <a href="/services" className="w-full">
            <Button className="rounded-none font-sans text-xs uppercase tracking-widest py-5 text-white bg-primary hover:opacity-90 w-full cursor-pointer">
              Kembali ke Layanan
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20 py-20">
      <BookingSuccessView booking={bookingData} />
    </div>
  );
}
