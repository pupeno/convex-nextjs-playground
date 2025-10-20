import { ReactNode } from "react";
import { Toaster } from "@/lib/ui/admin/sonner";
import { AdminSidebar } from "@/app/admin/_lib/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/lib/ui/admin/sidebar";
import { Header, HeaderProvider } from "@/app/admin/_lib/header";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <HeaderProvider>
          <Header />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2 p-4 md:p-6">
              {children}
            </div>
          </div>
          <Toaster richColors closeButton position="bottom-right" />
        </HeaderProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
