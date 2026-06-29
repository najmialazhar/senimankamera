"use client";

import { useState, useEffect, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicCalendarAction } from "../actions/get-public-calendar.action";
import { getTimeSlotsAction } from "../actions/get-time-slots.action";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PublicCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function PublicCalendarModal({ isOpen, onClose }: PublicCalendarModalProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [timeBasedDates, setTimeBasedDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Time slot states for selected date
  const [timeSlots, setTimeSlots] = useState<{ startTime: string; endTime: string; status: string }[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getPublicCalendarAction().then((res) => {
        if (res.success && res.data) {
          setBookedDates(res.data.bookedDates);
          setTimeBasedDates(res.data.timeBasedDates);
        }
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  // Load time slots when a date is selected
  useEffect(() => {
    if (selectedDate) {
      setIsFetchingSlots(true);
      getTimeSlotsAction(selectedDate).then((res) => {
        if (res.success && res.data) {
          setTimeSlots(res.data.slots || []);
        } else {
          setTimeSlots([]);
        }
        setIsFetchingSlots(false);
      });
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const monthYearLabel = useMemo(() => {
    return currentDate.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  }, [currentDate]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday
    const totalDays = lastDayOfMonth.getDate();

    const days = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        dateObj: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: true,
        dateObj: new Date(year, month, i),
      });
    }

    // Next month padding days to make 42 grid cells (6 rows)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        dateObj: new Date(year, month + 1, i),
      });
    }

    return days;
  }, [currentDate]);

  if (!isOpen) return null;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleProceedToBooking = () => {
    if (selectedDate) {
      onClose();
      router.push(`/services?date=${selectedDate}`);
    } else {
      onClose();
      router.push("/services");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-2xl bg-card border border-border/60 p-6 md:p-8 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden text-foreground font-sans">
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-border/40 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-widest text-[10px] mb-1">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Cek Ketersediaan Jadwal</span>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-primary font-medium">Jadwal Sesi Pemotretan</h3>
            <p className="text-xs text-secondary font-light mt-1">
              Pantau ketersediaan tanggal & slot waktu secara real-time.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-secondary hover:text-primary transition-colors focus:outline-none"
            aria-label="Tutup Modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Legend Panel */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] bg-muted/20 p-3 border border-border/30 mb-6 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/50 rounded-none" />
            <span className="text-secondary font-medium">Tersedia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-amber-500/20 border border-amber-500/50 rounded-none" />
            <span className="text-secondary font-medium">Ada Sesi Jam</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500/20 border border-red-500/50 rounded-none" />
            <span className="text-secondary font-medium">Penuh (Booked)</span>
          </div>
        </div>

        {/* Calendar Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-secondary">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs tracking-wider">Memuat Kalender...</span>
            </div>
          ) : (
            <>
              {/* Month Controller */}
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <h4 className="font-serif text-lg text-primary capitalize font-medium">{monthYearLabel}</h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 border border-border/40 hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-primary" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 border border-border/40 hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid Header */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] uppercase tracking-wider text-secondary">
                <span>Ming</span>
                <span>Sen</span>
                <span>Sel</span>
                <span>Rab</span>
                <span>Kam</span>
                <span>Jum</span>
                <span>Sab</span>
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {calendarDays.map((cell, index) => {
                  const dateKey = formatDateKey(cell.dateObj);
                  const isPast = cell.dateObj < today;
                  const isFullyBooked = bookedDates.includes(dateKey);
                  const hasTimeSessions = timeBasedDates.includes(dateKey);
                  const isSelected = selectedDate === dateKey;

                  let statusClasses = "border-border/20 text-primary hover:border-primary/50 cursor-pointer";
                  let badge = null;

                  if (!cell.isCurrentMonth) {
                    statusClasses = "opacity-30 text-secondary border-transparent pointer-events-none";
                  } else if (isPast) {
                    statusClasses = "opacity-40 text-secondary bg-muted/20 border-transparent cursor-not-allowed";
                  } else if (isFullyBooked) {
                    statusClasses = "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400 cursor-not-allowed";
                    badge = <span className="text-[9px] font-bold block leading-none mt-0.5 text-red-600">Full</span>;
                  } else if (hasTimeSessions) {
                    statusClasses = "bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-amber-300 hover:border-amber-500 cursor-pointer";
                    badge = <span className="text-[9px] font-bold block leading-none mt-0.5 text-amber-600">Ada Jam</span>;
                  } else {
                    statusClasses = "bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300 hover:border-emerald-500 cursor-pointer";
                  }

                  if (isSelected && cell.isCurrentMonth && !isPast && !isFullyBooked) {
                    statusClasses += " ring-2 ring-primary border-primary font-bold bg-primary/10";
                  }

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (cell.isCurrentMonth && !isPast && !isFullyBooked) {
                          setSelectedDate(dateKey);
                        }
                      }}
                      className={cn(
                        "p-2.5 min-h-[52px] border flex flex-col items-center justify-center transition-all relative",
                        statusClasses
                      )}
                    >
                      <span className="font-mono">{cell.dayNumber}</span>
                      {badge}
                    </div>
                  );
                })}
              </div>

              {/* Selected Date Time Slots Panel */}
              {selectedDate && (
                <div className="p-4 border border-border/40 bg-muted/10 space-y-3 text-xs animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="font-bold text-primary flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Status Tanggal: {new Date(selectedDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5">
                      Tersedia Untuk Booking
                    </span>
                  </div>

                  {isFetchingSlots ? (
                    <div className="py-4 flex items-center justify-center gap-2 text-secondary">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memeriksa slot jam...</span>
                    </div>
                  ) : timeSlots.length > 0 ? (
                    <div>
                      <span className="text-[10px] text-secondary uppercase tracking-wider font-bold block mb-2">
                        Slot Jam Yang Sudah Terisi pada Tanggal Ini:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {timeSlots.map((slot, i) => (
                          <div key={i} className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-mono text-[11px] flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{slot.startTime} – {slot.endTime} WIB (Terisi)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-secondary text-[11px] font-light">
                      Seluruh slot jam & sesi harian pada tanggal ini masih **100% Kosong / Tersedia**.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border/40 pt-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <span className="text-xs text-secondary text-center sm:text-left">
            {selectedDate ? (
              <>Tanggal dipilih: <strong className="text-primary font-mono">{selectedDate}</strong></>
            ) : (
              "Pilih tanggal untuk langsung melakukan pemesanan."
            )}
          </span>
          <Button
            type="button"
            onClick={handleProceedToBooking}
            className="w-full sm:w-auto rounded-none font-sans text-xs uppercase tracking-widest py-6 px-8 text-white bg-primary hover:opacity-90 font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{selectedDate ? `Booking Tanggal Ini` : "Lanjut ke Booking"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
