import { BookingForm } from "@/src/modules/booking/components/booking-form";
import { Suspense } from "react";

export const revalidate = 0; // Dynamic route

export default function BookPage() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20 py-20">
      <Suspense fallback={
        <div className="w-full max-w-xl mx-auto border border-border/40 p-8 md:p-12 text-center text-secondary font-sans text-xs">
          Loading commission form...
        </div>
      }>
        <BookingForm />
      </Suspense>
    </div>
  );
}
