"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import NavbarApp from "./Navbar/NavbarApp";
import NavbarMobile from "./Navbar/NavbarMobile";

export default function HeaderApp({ children, backOfficeHref }: { children: ReactNode; backOfficeHref?: string | null }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-noir-700">
      <aside
        data-app-sidebar
        className={`relative hidden shrink-0 transition-[width] duration-300 ease-in-out xl:block ${
          isSidebarCollapsed ? "w-[76px]" : "w-52"
        }`}
      >
        <div
          className={`fixed top-0 left-0 z-40 h-screen transition-[width] duration-300 ease-in-out ${
            isSidebarCollapsed ? "w-[76px]" : "w-52"
          }`}
        >
          <NavbarApp
            backOfficeHref={backOfficeHref}
            collapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
          />
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <div data-app-mobile-header className="sticky top-0 z-50 bg-noir-700 xl:hidden">
          <NavbarMobile backOfficeHref={backOfficeHref} />
        </div>
        {children}
      </main>
    </div>
  );
}
