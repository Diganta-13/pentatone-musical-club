"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CalendarDays,
  FolderOpen,
  Image as ImageIcon,
  LayoutDashboard,
  Megaphone,
  Mic,
  UserRound,
} from "lucide-react";

import BrandLogo from "@/components/layout/brand-logo";
import LogoutButton from "@/components/auth/logout-button";

/*
 * =====================================
 * MEMBER MENU
 * =====================================
 */

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: UserRound,
  },
  {
    label: "Events",
    href: "/events",
    icon: CalendarDays,
  },
  {
    label: "Auditions",
    href: "/auditions",
    icon: Mic,
  },
  {
    label: "Resources",
    href: "/resources",
    icon: FolderOpen,
  },
  {
    label: "Announcements",
    href: "/announcements",
    icon: Megaphone,
  },
  {
    label: "Gallery",
    href: "/gallery",
    icon: ImageIcon,
  },
];

/*
 * =====================================
 * MEMBER SIDEBAR
 * =====================================
 */

export default function MemberSidebar() {
  const pathname =
    usePathname();

  /*
   * =====================================
   * ACTIVE LINK CHECK
   * =====================================
   */

  function isActive(
    href: string,
  ) {
    if (
      href === "/dashboard"
    ) {
      return (
        pathname ===
        "/dashboard"
      );
    }

    return pathname.startsWith(
      href,
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[230px] flex-col overflow-hidden bg-[#273142] text-white lg:flex">

      {/* ================================= */}
      {/* BRAND */}
      {/* ================================= */}

      <div className="shrink-0 border-b border-white/10 px-6 py-6">

        <BrandLogo
          priority
          className="h-14"
        />

        <p className="mt-3 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
          Member Portal
        </p>

      </div>

      {/* ================================= */}
      {/* NAVIGATION */}
      {/* ================================= */}

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">

        <div className="space-y-1">

          {menuItems.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                isActive(
                  item.href,
                );

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className={`group flex items-center gap-4 rounded-xl px-4 py-3.5 text-[11px] font-black uppercase tracking-[0.05em] transition ${
                    active
                      ? "bg-red-600 text-white shadow-lg shadow-red-950/20"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >

                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      active
                        ? "text-white"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                    strokeWidth={
                      1.8
                    }
                  />

                  <span>
                    {
                      item.label
                    }
                  </span>

                </Link>
              );
            },
          )}

        </div>

      </nav>

      {/* ================================= */}
      {/* BOTTOM / LOGOUT */}
      {/* ================================= */}

<div className="shrink-0 border-t border-white/10 bg-[#273142] pb-8 pl-12 pr-3 pt-4">
        <LogoutButton
          variant="sidebar"
          redirectTo="/"
        />

      </div>

    </aside>
  );
}