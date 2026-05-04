"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* mobile Sheet drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="flex-1 flex flex-col min-w-0">
          {/* mobile topbar */}
          <header className="lg:hidden sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                />
              }
            >
              <MenuIcon className="h-5 w-5" />
            </SheetTrigger>
            <span className="font-semibold text-sm">rb-admin</span>
            <span className="w-9" />
          </header>

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-full overflow-x-auto">
            {children}
          </main>
        </div>

        <SheetContent
          side="left"
          className="p-0 data-[side=left]:w-64 sm:data-[side=left]:max-w-64"
          showCloseButton={false}
        >
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
