import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  DollarSign, 
  Camera, 
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Calendar,
  ArrowRight,
  MoreHorizontal,
  ChevronRight,
  RefreshCw,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { BookingRepository } from "@/src/modules/booking/repositories/booking.repository";
import { GetRecentBookingsUseCase } from "@/src/modules/booking/use-cases/get-recent-bookings.use-case";

export const revalidate = 0; // Ensure admin dashboard gets fresh database queries

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("auth_session");

  // Server-side auth check
  if (!session || session.value !== "true") {
    redirect("/login");
  }

  const repository = new BookingRepository();
  const getRecentBookingsUseCase = new GetRecentBookingsUseCase(repository);
  const dbBookings = await getRecentBookingsUseCase.execute(10);

  const bookingRequests = dbBookings.map((req) => {
    const clientName = req.client.fullName;
    const initialLetter = clientName.charAt(0).toUpperCase() || "?";
    const dateFormatted = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(req.bookingDate);

    return {
      id: req.id,
      client: clientName,
      initialLetter,
      date: dateFormatted,
      type: req.packageType,
      status: req.status,
    };
  });

  return (
    <SidebarProvider>
      <AdminSidebar variant="sidebar" />
      <SidebarInset className="flex flex-col min-h-screen bg-background text-foreground">
        
        {/* Header App Bar */}
        <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-border/40 bg-background sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-secondary hover:text-primary transition-colors" />
            <div className="w-8 h-8 overflow-hidden rounded-full border border-border bg-neutral-100 flex items-center justify-center md:hidden">
              <img src="/logo.jpg" alt="SENIMAN_KAMERA" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif tracking-tighter font-semibold md:hidden">Admin</span>
            <div className="hidden md:block">
              <span className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold">
                Seniman Kamera Studio Management
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-sans text-xs uppercase tracking-widest text-secondary bg-muted px-4 py-2 font-bold border border-border/30">
              Last 30 Days
            </span>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 px-6 md:px-12 py-10 max-w-[1200px] mx-auto w-full space-y-16">
          
          {/* Welcome Header */}
          <div className="space-y-2">
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">Dashboard</h2>
            <p className="font-sans text-sm text-secondary font-light">Welcome back. Here is your studio's pulse.</p>
          </div>

          {/* Bento Grid: Key Metrics */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Metric 1 */}
            <Card className="rounded-none border-border/40 relative overflow-hidden group shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-sans text-xs uppercase tracking-widest text-secondary font-bold">
                  Revenue
                </CardTitle>
                <DollarSign className="w-4 h-4 text-secondary" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="font-serif text-4xl font-medium text-primary">$24,500</div>
                <div className="flex items-center gap-1 font-sans text-xs text-green-700 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12% vs last month</span>
                </div>
              </CardContent>
            </Card>

            {/* Metric 2 */}
            <Card className="rounded-none border-border/40 relative overflow-hidden group shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-sans text-xs uppercase tracking-widest text-secondary font-bold">
                  Total Shoots
                </CardTitle>
                <Camera className="w-4 h-4 text-secondary" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="font-serif text-4xl font-medium text-primary">18</div>
                <div className="flex items-center gap-1 font-sans text-xs text-secondary font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>14 delivered, 4 pending</span>
                </div>
              </CardContent>
            </Card>

            {/* Metric 3: Colored Primary Accent */}
            <Card className="rounded-none border-border/40 relative overflow-hidden group shadow-none bg-primary text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-sans text-xs uppercase tracking-widest text-primary-foreground/75 font-bold">
                  New Leads
                </CardTitle>
                <MessageSquare className="w-4 h-4 text-primary-foreground/75" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="font-serif text-4xl font-medium">7</div>
                <div className="flex items-center gap-1 font-sans text-xs text-primary-foreground/80">
                  <span>Requires actions</span>
                </div>
              </CardContent>
            </Card>

          </section>

          {/* Main Content Layout (Asymmetric) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column (Wider): Recent Bookings */}
            <div className="lg:col-span-8 space-y-8">
              <Card className="rounded-none border-border/40 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between py-6">
                  <div>
                    <CardTitle className="font-serif text-xl font-medium">Recent Booking Requests</CardTitle>
                    <CardDescription className="font-sans text-xs text-secondary font-light">Recent shoot inquiries from prospects</CardDescription>
                  </div>
                  <Link href="#" className="font-sans text-xs uppercase tracking-widest font-bold text-secondary hover:text-primary transition-colors">
                    View All
                  </Link>
                </CardHeader>
                <CardContent className="p-0 border-t border-border/30">
                  <div className="divide-y divide-border/20">
                    {bookingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-6 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-neutral-200 flex items-center justify-center font-serif text-sm font-semibold rounded-full border border-border/30">
                            {req.initialLetter}
                          </div>
                          <div>
                            <h4 className="font-sans text-sm font-bold text-primary">{req.client}</h4>
                            <p className="font-sans text-xs text-secondary flex items-center gap-1.5 mt-0.5">
                              <Calendar className="w-3 h-3" /> {req.date} • {req.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="rounded-none bg-muted text-secondary border-none px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest">
                            {req.status}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column (Narrower): Upload Queue Status */}
            <div className="lg:col-span-4">
              <Card className="rounded-none border-border/40 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-serif text-lg font-medium">Upload Queue</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Status Item 1 */}
                  <div>
                    <div className="flex justify-between items-center mb-2 font-sans text-xs">
                      <span className="font-bold text-primary">Miller Wedding.zip</span>
                      <span className="text-secondary font-bold">78%</span>
                    </div>
                    <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: "78%" }} />
                    </div>
                    <div className="mt-2 font-sans text-[10px] uppercase tracking-widest text-secondary flex items-center gap-1.5 font-semibold">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Syncing to cloud...
                    </div>
                  </div>

                  {/* Status Item 2 */}
                  <div>
                    <div className="flex justify-between items-center mb-2 font-sans text-xs">
                      <span className="font-bold text-primary">Vogue Editorial.raw</span>
                      <span className="text-green-700 font-bold uppercase tracking-wide">Done</span>
                    </div>
                    <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden">
                      <div className="bg-green-700 h-full" style={{ width: "100%" }} />
                    </div>
                    <div className="mt-2 font-sans text-[10px] uppercase tracking-widest text-secondary flex items-center gap-1.5 font-semibold">
                      <CheckCircle className="w-3 h-3 text-green-700" /> Uploaded 2 hrs ago
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/30">
                    <Button variant="outline" className="w-full font-sans text-xs uppercase tracking-widest py-5 rounded-none flex items-center justify-center gap-2 border-border text-primary hover:bg-neutral-100">
                      Manage Galleries <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </div>

          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
