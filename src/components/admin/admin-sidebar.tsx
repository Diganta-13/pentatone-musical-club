"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Bell,
  Calendar,
  Folder,
  Home,
  Image as ImageIcon,
  MessageSquare,
  Mic,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";

import AdminLogoutButton from "@/components/admin/admin-logout-button";
import BrandLogo from "@/components/layout/brand-logo";

/*
 * =====================================
 * MENU ITEMS
 * =====================================
 */

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    label: "Members",
    href: "/admin/members",
    icon: Users,
  },
  {
    label: "Requests",
    href: "/admin/requests",
    icon: UserPlus,
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: Calendar,
  },
  {
    label: "Auditions",
    href: "/admin/auditions",
    icon: Mic,
  },
  {
    label: "Announcements",
    href: "/admin/announcements",
    icon: Bell,
  },
  {
    label: "Resources",
    href: "/admin/resources",
    icon: Folder,
  },

  /*
   * NEW
   */
  {
    label: "Messages",
    href: "/admin/messages",
    icon: MessageSquare,
  },

  {
    label: "Gallery",
    href: "/admin/gallery",
    icon: ImageIcon,
  },
];

/*
 * =====================================
 * ADMIN SIDEBAR
 * =====================================
 */

export default function AdminSidebar() {
  const pathname = usePathname();

  /*
   * =====================================
   * ACTIVE CHECK
   * =====================================
   */

  function isActive(
    href: string,
  ) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(
      href,
    );
  }

  const settingsActive =
    pathname.startsWith(
      "/admin/settings",
    );

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[250px] flex-col bg-[#27364a] text-white lg:flex">

      {/* ================================= */}
      {/* LOGO */}
      {/* ================================= */}

      <div className="border-b border-white/10 px-6 py-6">

        <BrandLogo
          priority
          className="h-14"
        />

        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Admin Portal
        </p>

      </div>

      {/* ================================= */}
      {/* MAIN NAVIGATION */}
      {/* ================================= */}

      <nav className="flex-1 overflow-y-auto px-4 py-5">

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
                  className={`group flex items-center gap-4 rounded-xl px-4 py-3.5 text-[12px] font-black uppercase tracking-[0.04em] transition ${
                    active
                      ? "bg-red-600 text-white shadow-lg shadow-red-950/20"
                      : "text-slate-100 hover:bg-white/10 hover:text-white"
                  }`}
                >

                  <Icon
                    className={`h-[19px] w-[19px] shrink-0 ${
                      active
                        ? "text-white"
                        : "text-slate-300 group-hover:text-white"
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
      {/* BOTTOM SECTION */}
      {/* ================================= */}

      <div className="border-t border-white/10 px-4 py-5">

        {/* SETTINGS */}

        <Link
          href="/admin/settings"
          className={`group flex items-center gap-4 rounded-xl px-4 py-3.5 text-[12px] font-black uppercase tracking-[0.04em] transition ${
            settingsActive
              ? "bg-red-600 text-white shadow-lg shadow-red-950/20"
              : "text-slate-100 hover:bg-white/10 hover:text-white"
          }`}
        >

          <Settings
            className={`h-[19px] w-[19px] shrink-0 ${
              settingsActive
                ? "text-white"
                : "text-slate-300 group-hover:text-white"
            }`}
            strokeWidth={1.8}
          />

          <span>
            Settings
          </span>

        </Link>

        {/* LOGOUT */}

        <div className="mt-2">

          <AdminLogoutButton />

        </div>

      </div>

    </aside>
  );
}