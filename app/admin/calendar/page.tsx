import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { CalendarRepository } from "@/src/modules/calendar/repositories/calendar.repository";
import { PackageRepository } from "@/src/modules/booking/repositories/package.repository";
import { createClient } from "@/src/infrastructure/supabase/server";
import { CalendarClient } from "./calendar-client";
import { prisma } from "@/src/infrastructure/prisma/client";

export const revalidate = 0;

export default async function AdminCalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Auth check
  if (!user) {
    redirect("/login");
  }

  const calendarRepository = new CalendarRepository();
  const packageRepository = new PackageRepository();

  const rawSlots = await prisma.calendarSlot.findMany({
    include: {
      booking: {
        include: {
          client: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  const rawPackages = await packageRepository.findAll();
  const stats = await calendarRepository.getCalendarStats();

  // Serialize objects for client side
  const slots = rawSlots.map((s: any) => ({
    id: s.id,
    date: s.date.toISOString(),
    status: s.status,
    bookingId: s.bookingId,
    booking: s.booking
      ? {
          id: s.booking.id,
          clientId: s.booking.clientId,
          client: {
            fullName: s.booking.client.fullName,
            email: s.booking.client.email,
            phoneNumber: s.booking.client.phoneNumber,
          },
          packageType: s.booking.packageType,
          bookingDate: s.booking.bookingDate.toISOString(),
          eventTime: s.booking.eventTime,
          eventName: s.booking.eventName,
          eventLocation: s.booking.eventLocation,
          notes: s.booking.notes,
          status: s.booking.status,
          source: s.booking.source,
        }
      : null,
    blockedReason: s.blockedReason,
    createdBy: s.createdBy,
  }));

  const packages = rawPackages.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
  }));

  return (
    <SidebarProvider>
      <AdminSidebar variant="sidebar" />
      <SidebarInset className="flex flex-col min-h-screen bg-background text-foreground">
        {/* Header App Bar */}
        <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-border/40 bg-background sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-secondary hover:text-primary transition-colors" />
            <span className="font-serif tracking-tighter font-semibold md:hidden">Admin</span>
            <div className="hidden md:block">
              <span className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold">
                Manajemen Studio Seniman Kamera
              </span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 px-6 md:px-12 py-10 max-w-[1200px] mx-auto w-full">
          <CalendarClient initialSlots={slots} packages={packages} stats={stats} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}