"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Info, Clock, Calendar as CalendarIcon } from "lucide-react";

interface BookedDateInfo {
  date: string; // ISO String
  eventName: string;
  clientName: string;
  status: string;
}

interface StepPilihTanggalProps {
  bookedDates: BookedDateInfo[];
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string; // HH:MM
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPilihTanggal({
  bookedDates,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  onNext,
  onBack,
}: StepPilihTanggalProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (selectedDate) {
      return new Date(selectedDate);
    }
    return new Date();
  });

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

  // Generate days in the month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 1 is Monday...

    const days: { date: Date; isCurrentMonth: boolean; key: string }[] = [];

    // Prev month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        key: `prev-${prevMonthLastDay - i}`,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        key: `curr-${i}`,
      });
    }

    // Next month padding (to complete a grid of 6 rows usually, or up to 42 cells)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        key: `next-${i}`,
      });
    }

    return days;
  }, [currentDate]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Helper to format date key YYYY-MM-DD
  const formatDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Find booking status for a date
  const getBookingForDate = (date: Date) => {
    const key = formatDateKey(date);
    return bookedDates.find((b) => {
      const bDate = new Date(b.date);
      return formatDateKey(bDate) === key;
    });
  };

  // Selected date's booking info
  const selectedDateBookingInfo = useMemo(() => {
    if (!selectedDate) return null;
    return bookedDates.find((b) => {
      const bDate = new Date(b.date);
      return formatDateKey(bDate) === selectedDate;
    });
  }, [selectedDate, bookedDates]);

  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-md mx-auto">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 block font-bold">
          Langkah 2 dari 5
        </span>
        <h2 className="font-serif text-2xl md:text-3xl text-primary mb-2 font-medium">Pilih Tanggal & Waktu</h2>
        <p className="font-sans text-xs text-secondary font-light leading-relaxed">
          Pilih tanggal yang tersedia pada kalender di bawah ini, lalu tentukan waktu pelaksanaan acara.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Custom Calendar Card */}
        <div className="border border-border/40 bg-card p-5 lg:col-span-7 rounded-none">
          {/* Header calendar */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-base text-primary font-medium capitalize">
              {monthYearLabel}
            </h3>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevMonth}
                className="p-2 h-8 w-8 rounded-none border-border"
              >
                <ChevronLeft className="w-4 h-4 text-primary" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleNextMonth}
                className="p-2 h-8 w-8 rounded-none border-border"
              >
                <ChevronRight className="w-4 h-4 text-primary" />
              </Button>
            </div>
          </div>

          {/* Weekday titles */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekDays.map((day, idx) => (
              <div
                key={day}
                className={cn(
                  "font-sans text-[10px] uppercase tracking-wider font-bold py-1",
                  idx === 0 || idx === 6 ? "text-red-600/80" : "text-secondary"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, isCurrentMonth, key }) => {
              const formattedKey = formatDateKey(date);
              const isPast = date < today;
              const booking = getBookingForDate(date);
              const isSelected = selectedDate === formattedKey;

              let cellStyle = "text-primary bg-transparent border-border/20";
              let statusText = "Tersedia";
              let dotColor = "";

              if (isPast) {
                cellStyle = "text-secondary/30 bg-muted/10 border-transparent cursor-not-allowed";
              } else if (booking) {
                const isPending = booking.status === "PendingApproval";
                if (isPending) {
                  cellStyle = "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30 cursor-not-allowed font-semibold";
                  statusText = "Menunggu Persetujuan";
                  dotColor = "bg-yellow-500";
                } else {
                  cellStyle = "bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900/30 cursor-not-allowed font-semibold";
                  statusText = "Sudah Dipesan";
                  dotColor = "bg-red-500";
                }
              } else if (isSelected) {
                cellStyle = "bg-primary text-primary-foreground border-primary font-bold";
              } else if (!isCurrentMonth) {
                cellStyle = "text-secondary/40 bg-transparent border-transparent hover:bg-muted/10";
              } else {
                cellStyle = "text-primary bg-card border-border/40 hover:border-primary/60 cursor-pointer";
              }

              const handleCellClick = () => {
                if (isPast || booking) return;
                onSelectDate(formattedKey);
              };

              return (
                <button
                  key={key}
                  type="button"
                  onClick={handleCellClick}
                  disabled={isPast || !!booking}
                  className={cn(
                    "h-10 border text-xs font-sans rounded-none transition-all flex flex-col items-center justify-center relative",
                    cellStyle
                  )}
                  title={booking ? `${booking.eventName} (${booking.clientName}) - ${statusText}` : undefined}
                >
                  <span>{date.getDate()}</span>
                  {dotColor && (
                    <span className={cn("absolute bottom-1 w-1 h-1 rounded-full", dotColor)} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Status Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center text-[10px] font-sans text-secondary border-t border-border/20 pt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-card border border-border/40 block" />
              <span>Tersedia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-yellow-100 border border-yellow-200 block rounded-none" />
              <span>Menunggu Persetujuan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-red-100 border border-red-200 block rounded-none" />
              <span>Sudah Dipesan</span>
            </div>
          </div>
        </div>

        {/* Date Details & Time Selector */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Date Summary & Visual Cues */}
          {selectedDate ? (
            <div className="border border-border/40 bg-card p-5 space-y-4">
              <h4 className="font-serif text-sm text-primary font-medium flex items-center gap-2 border-b border-border/20 pb-3">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span>Tanggal Terpilih</span>
              </h4>
              <div className="font-sans text-xs text-secondary space-y-1.5">
                <div className="text-primary font-medium text-sm">
                  {new Date(selectedDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    weekday: "long",
                  })}
                </div>
                <div className="text-[11px] text-green-600 font-medium">
                  Status: Tanggal Tersedia untuk Dipesan
                </div>
              </div>

              {/* Input Waktu */}
              <div className="space-y-1.5 pt-2 border-t border-border/20">
                <label htmlFor="eventTime" className="text-[10px] uppercase tracking-wider text-secondary font-bold block">
                  Waktu Acara (Jam) <span className="text-red-700">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
                  <input
                    type="time"
                    id="eventTime"
                    value={selectedTime}
                    onChange={(e) => onSelectTime(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none transition-colors rounded-none text-primary cursor-pointer text-xs"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-border/60 p-6 text-center text-secondary font-sans text-xs leading-relaxed">
              <Info className="w-5 h-5 mx-auto mb-2 text-secondary/70 stroke-1" />
              Silakan klik salah satu tanggal yang tersedia pada kalender untuk memproses jadwal.
            </div>
          )}

          {/* Info Acara Terisi dalam Bulan Ini */}
          <div className="border border-border/40 bg-card p-5 space-y-3">
            <h4 className="font-serif text-xs text-primary font-semibold uppercase tracking-wider">
              Tanggal Dipesan Bulan Ini
            </h4>
            <div className="max-h-[160px] overflow-y-auto font-sans text-[11px] space-y-2 pr-1.5">
              {bookedDates.filter((b) => {
                const bDate = new Date(b.date);
                return (
                  bDate.getMonth() === currentDate.getMonth() &&
                  bDate.getFullYear() === currentDate.getFullYear()
                );
              }).length === 0 ? (
                <p className="text-secondary/60 italic">Tidak ada tanggal terisi di bulan ini.</p>
              ) : (
                bookedDates
                  .filter((b) => {
                    const bDate = new Date(b.date);
                    return (
                      bDate.getMonth() === currentDate.getMonth() &&
                      bDate.getFullYear() === currentDate.getFullYear()
                    );
                  })
                  .map((booking, idx) => {
                    const bDate = new Date(booking.date);
                    const formatted = bDate.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    });
                    const isPending = booking.status === "PendingApproval";

                    return (
                      <div
                        key={idx}
                        className="p-2 border border-border/20 bg-muted/10 flex flex-col gap-0.5"
                      >
                        <div className="flex justify-between font-semibold">
                          <span className="text-primary">{formatted}</span>
                          <span className={isPending ? "text-yellow-600" : "text-red-600"}>
                            {isPending ? "Menunggu Persetujuan" : "Sudah Dipesan"}
                          </span>
                        </div>
                        <div className="text-secondary font-light">
                          Acara: {booking.eventName || "Dokumentasi"}
                        </div>
                        <div className="text-secondary font-light">
                          Pemesan: {booking.clientName}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation actions */}
      <div className="flex justify-between pt-4 border-t border-border/20">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="font-sans text-xs uppercase tracking-widest py-5 px-8 rounded-none border-border"
        >
          ← Kembali
        </Button>
        {selectedDate && selectedTime && (
          <Button
            type="button"
            onClick={onNext}
            className="font-sans text-xs uppercase tracking-widest py-5 px-10 rounded-none font-bold text-white transition-all hover:opacity-90 cursor-pointer"
          >
            Lanjut ke Data Pemesan →
          </Button>
        )}
      </div>
    </div>
  );
}
