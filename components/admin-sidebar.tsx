"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Calendar, 
  Users, 
  Upload, 
  Settings, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { logoutAction } from "@/src/modules/auth/actions/login.action";

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Galleries", href: "#", icon: ImageIcon },
    { name: "Bookings", href: "#", icon: Calendar },
    { name: "Clients", href: "#", icon: Users },
  ];

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    await logoutAction();
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Brand Header */}
      <SidebarHeader className="border-b border-border/40 py-6 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 overflow-hidden rounded-full border border-border bg-neutral-100 flex items-center justify-center">
            <img src="/logo.jpg" alt="SENIMAN_KAMERA" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-serif text-base font-semibold leading-tight text-primary">Studio Admin</h1>
            <p className="font-sans text-[9px] uppercase tracking-widest text-secondary font-bold">Manage Portfolio</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Content Links */}
      <SidebarContent className="py-6 px-3">
        <SidebarMenu className="gap-1">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={active}
                  className={`py-6 px-3 flex items-center gap-3 font-sans text-xs uppercase tracking-widest font-bold w-full ${
                    active
                      ? "text-primary-foreground bg-primary hover:bg-primary/90"
                      : "text-secondary hover:text-primary transition-colors"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Footer Actions */}
      <SidebarFooter className="border-t border-border/40 py-6 px-4 gap-4 mt-auto">
        <Button className="w-full font-sans text-xs uppercase tracking-widest py-6 rounded-none flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" />
          <span>Upload Photos</span>
        </Button>

        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="#" />}
              className="py-4 px-2 flex items-center gap-3 font-sans text-xs uppercase tracking-widest font-bold text-secondary hover:text-primary transition-colors w-full"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form onSubmit={handleSignOut} className="w-full">
              <SidebarMenuButton type="submit" className="py-4 px-2 w-full text-left">
                <span className="flex items-center gap-3 font-sans text-xs uppercase tracking-widest font-bold text-secondary hover:text-primary transition-colors w-full">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
