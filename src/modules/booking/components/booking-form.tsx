"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createBookingAction } from "../actions/create-booking.action";
import { CreateBookingSchema } from "../schemas/create-booking.schema";
import { Calendar, User, Mail, Phone, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [packageType, setPackageType] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [notes, setNotes] = useState("");

  // States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Set initial package from query param
  useEffect(() => {
    const pkg = searchParams.get("package");
    if (pkg) {
      // Normalize package name
      if (pkg.toLowerCase() === "wedding" || pkg.toLowerCase() === "signature wedding") {
        setPackageType("Wedding");
      } else if (pkg.toLowerCase() === "portrait" || pkg.toLowerCase() === "portraits" || pkg.toLowerCase() === "artistic portrait") {
        setPackageType("Portraits");
      } else if (pkg.toLowerCase() === "editorial" || pkg.toLowerCase() === "vogue editorial") {
        setPackageType("Editorial");
      } else if (pkg.toLowerCase() === "events" || pkg.toLowerCase() === "event" || pkg.toLowerCase() === "event documentation") {
        setPackageType("Events");
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const formData = {
      fullName,
      email,
      phoneNumber,
      packageType,
      bookingDate,
      notes,
    };

    // Client-side validation
    const validation = CreateBookingSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Server submission
    startTransition(async () => {
      const response = await createBookingAction(validation.data);
      if (response.success) {
        setIsSuccess(true);
      } else {
        setServerError(response.error || "Gagal membuat pemesanan.");
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-xl mx-auto px-6 py-16 text-center border border-border/40 bg-card flex flex-col items-center">
        <CheckCircle2 className="w-16 h-16 text-green-700 mb-6 stroke-1 animate-pulse" />
        <h2 className="font-serif text-3xl text-primary mb-4 font-medium">Inquiry Submitted</h2>
        <p className="font-sans text-sm text-secondary font-light mb-8 max-w-md leading-relaxed">
          Thank you for commissioning your art with us. We have received your booking inquiry. 
          Our studio manager will review availability and contact you within 24 hours to schedule a consultation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button 
            onClick={() => router.push("/portfolio")}
            variant="outline"
            className="rounded-none font-sans text-xs uppercase tracking-widest py-5 border-primary text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Explore Portfolio
          </Button>
          <Button 
            onClick={() => router.push("/")}
            className="rounded-none font-sans text-xs uppercase tracking-widest py-5 text-white cursor-pointer"
          >
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto border border-border/40 bg-card p-8 md:p-12 relative">
      <div className="mb-10 text-center">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-3 block font-bold">
          Commission Form
        </span>
        <h2 className="font-serif text-3xl text-primary mb-3 font-medium">Book Your Session</h2>
        <p className="font-sans text-xs text-secondary font-light max-w-sm mx-auto leading-relaxed">
          Provide your details below, and let us frame your unique story with timeless elegance.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300 font-sans text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 font-sans text-sm">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="text-[10px] uppercase tracking-wider text-secondary font-bold block">
            Full Name <span className="text-red-700">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
            <input
              type="text"
              id="fullName"
              placeholder="e.g. Eleanor & James"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isPending}
              className="w-full pl-10 pr-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none transition-colors rounded-none placeholder:text-secondary/40 text-primary"
            />
          </div>
          {errors.fullName && <p className="text-xs text-red-700 font-semibold">{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[10px] uppercase tracking-wider text-secondary font-bold block">
            Email Address <span className="text-red-700">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
            <input
              type="email"
              id="email"
              placeholder="e.g. hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              className="w-full pl-10 pr-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none transition-colors rounded-none placeholder:text-secondary/40 text-primary"
            />
          </div>
          {errors.email && <p className="text-xs text-red-700 font-semibold">{errors.email}</p>}
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label htmlFor="phoneNumber" className="text-[10px] uppercase tracking-wider text-secondary font-bold block">
            Phone Number <span className="text-secondary/40 text-[9px] font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
            <input
              type="tel"
              id="phoneNumber"
              placeholder="e.g. +62 812-3456-7890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isPending}
              className="w-full pl-10 pr-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none transition-colors rounded-none placeholder:text-secondary/40 text-primary"
            />
          </div>
          {errors.phoneNumber && <p className="text-xs text-red-700 font-semibold">{errors.phoneNumber}</p>}
        </div>

        {/* Package Type */}
        <div className="space-y-1.5">
          <label htmlFor="packageType" className="text-[10px] uppercase tracking-wider text-secondary font-bold block">
            Package Type <span className="text-red-700">*</span>
          </label>
          <div className="relative">
            <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
            <select
              id="packageType"
              value={packageType}
              onChange={(e) => setPackageType(e.target.value)}
              disabled={isPending}
              className="w-full pl-10 pr-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none transition-colors rounded-none text-primary appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-background">Select Package</option>
              <option value="Wedding" className="bg-background text-primary">Signature Wedding</option>
              <option value="Portraits" className="bg-background text-primary">Artistic Portrait</option>
              <option value="Editorial" className="bg-background text-primary">Vogue Editorial / Custom</option>
              <option value="Events" className="bg-background text-primary">Event Documentation</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary/70 w-0 h-0" />
          </div>
          {errors.packageType && <p className="text-xs text-red-700 font-semibold">{errors.packageType}</p>}
        </div>

        {/* Booking Date */}
        <div className="space-y-1.5">
          <label htmlFor="bookingDate" className="text-[10px] uppercase tracking-wider text-secondary font-bold block">
            Preferred Date <span className="text-red-700">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
            <input
              type="date"
              id="bookingDate"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              disabled={isPending}
              className="w-full pl-10 pr-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none transition-colors rounded-none text-primary cursor-pointer"
            />
          </div>
          {errors.bookingDate && <p className="text-xs text-red-700 font-semibold">{errors.bookingDate}</p>}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label htmlFor="notes" className="text-[10px] uppercase tracking-wider text-secondary font-bold block">
            Vision & Notes <span className="text-secondary/40 text-[9px] font-normal">(Optional)</span>
          </label>
          <textarea
            id="notes"
            rows={4}
            placeholder="Tell us about your event details, location, preferred aesthetic, or custom requests..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isPending}
            className="w-full px-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none transition-colors rounded-none placeholder:text-secondary/40 text-primary resize-none"
          />
          {errors.notes && <p className="text-xs text-red-700 font-semibold">{errors.notes}</p>}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full font-sans text-xs uppercase tracking-widest py-6 rounded-none font-bold text-white transition-all hover:opacity-90 cursor-pointer"
        >
          {isPending ? "Submitting Inquiry..." : "Submit Inquiry"}
        </Button>
      </form>
    </div>
  );
}
