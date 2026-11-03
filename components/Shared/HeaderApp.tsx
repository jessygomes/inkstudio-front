"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState, useSyncExternalStore } from "react";
import NavbarApp from "./Navbar/NavbarApp";
import NavbarMobile from "./Navbar/NavbarMobile";
import { getNavigationLayout, getServerNavigationLayout, subscribeNavigationLayout } from "./appNavigationLayout";
import styles from "./HeaderApp.module.css";

export default function HeaderApp({ children, backOfficeHref }: { children: ReactNode; backOfficeHref?: string | null }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTabletSidebarCollapsed, setIsTabletSidebarCollapsed] = useState(true);
  const navigationLayout = useSyncExternalStore(subscribeNavigationLayout, getNavigationLayout, getServerNavigationLayout);
  const isCompact = navigationLayout === "compact";
  const collapsed = isCompact ? isTabletSidebarCollapsed : isSidebarCollapsed;

  return (
    <div className="flex min-h-screen w-full bg-noir-700">
      <aside
        data-app-sidebar
        className={styles.sidebar}
        style={{ "--sidebar-width": collapsed ? "76px" : "208px" } as CSSProperties}
      >
        <div
          className={styles.sidebarInner}
        >
          <NavbarApp
            backOfficeHref={backOfficeHref}
            collapsed={collapsed}
            onToggle={() => isCompact
              ? setIsTabletSidebarCollapsed(value => !value)
              : setIsSidebarCollapsed(value => !value)}
          />
        </div>
      </aside>
      <main className={styles.content}>
        <div data-app-mobile-header className={styles.mobile}>
          {navigationLayout === "mobile" && <NavbarMobile backOfficeHref={backOfficeHref} />}
        </div>
        {children}
      </main>
    </div>
  );
}
