import QueryClientProvider from "@/core/providers/query-provider";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import DynamicBreadcrumb from "@/shared/dynamic-breadcrumb";

const DashboardLayout = () => {
  return (
    <QueryClientProvider>
      <Toaster richColors closeButton />

      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Sticky glass header */}
          <header
            className="
              sticky top-0 z-30 h-16 shrink-0 flex items-center transition-[width,height,backdrop-filter]
              ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12
              /* Glass effect */
              bg-white/40 dark:bg-slate-900/40 backdrop-blur-md
               border-white/10 dark:border-slate-800/50
              shadow-lg
              border-b border-neutral-border
            "
            aria-label="Application header"
          >
            <div className="flex items-center gap-2 px-4 w-full">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />

              <DynamicBreadcrumb
                showHome
                homeLabel="Beranda"
                labelMap={{ products: "Produk", users: "Pengguna" }}
                activeClassName="breadcrumb-active"
              />

              {/* kanan: contoh slot untuk search / actions (glassy button) */}
              <div className="ml-auto flex items-center gap-2 pr-2">
                {/* contoh button glass kecil */}
                <button
                  className="
                    hidden sm:inline-flex items-center px-3 py-1.5 rounded-md text-sm
                    bg-white/20 dark:bg-slate-700/30 backdrop-blur-sm
                    border border-white/5 dark:border-slate-700/30
                    hover:bg-white/30 dark:hover:bg-slate-700/40
                    transition
                  "
                  aria-label="Quick action"
                >
                  Quick action
                </button>
              </div>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  );
};

export default DashboardLayout;
