"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  FolderOpen,
  Images,
  LayoutDashboard,
  Megaphone,
  Mic2,
  Settings,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

import AdminLogoutButton from "@/components/admin/admin-logout-button";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    label: "Members",
    href: "/admin/members",
    icon: UsersRound,
    enabled: false,
  },
  {
    label: "Requests",
    href: "/admin/requests",
    icon: UserRoundPlus,
    enabled: true,
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: CalendarDays,
    enabled: false,
  },
  {
    label: "Auditions",
    href: "/admin/auditions",
    icon: Mic2,
    enabled: false,
  },
  {
    label: "Attendance",
    href: "/admin/attendance",
    icon: ClipboardCheck,
    enabled: false,
  },
  {
    label: "Announcements",
    href: "/admin/announcements",
    icon: Megaphone,
    enabled: false,
  },
  {
    label: "Resources",
    href: "/admin/resources",
    icon: FolderOpen,
    enabled: false,
  },
  {
    label: "Gallery",
    href: "/admin/gallery",
    icon: Images,
    enabled: false,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    enabled: false,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] flex-col bg-[#273244] text-white lg:flex">
      {/* Logo */}

      <div className="px-6 pb-7 pt-8">
        <Link
          href="/"
          title="Back to Pentatone website"
          className="inline-block"
        >
          <h1 className="text-[25px] font-black uppercase leading-none tracking-[-0.04em] text-[#e00000] transition hover:opacity-80">
            Pentatone
          </h1>

          <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">
            Admin Portal
          </p>
        </Link>
      </div>

      {/* Navigation */}

      <nav className="flex-1 border-t border-white/10 px-3 py-6">
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            if (!item.enabled) {
              return (
                <div
                  key={item.label}
                  title="This module will be connected shortly"
                  className="flex cursor-default items-center gap-4 rounded-lg px-4 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-slate-300/55"
                >
                  <Icon className="h-[19px] w-[19px]" />

                  {item.label}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 text-[12px] font-bold uppercase tracking-[0.08em] transition ${
                  active
                    ? "bg-[#d90000] text-white"
                    : "text-slate-200 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-[19px] w-[19px]" />

                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}

      <div className="border-t border-white/10 pb-5 pt-4">
        <button
          type="button"
          className="flex w-full cursor-default items-center gap-4 px-6 py-3 text-left text-[12px] font-bold uppercase tracking-[0.12em] text-slate-300/55"
        >
          <Settings className="h-[19px] w-[19px]" />

          Settings
        </button>

        <AdminLogoutButton />
      </div>
    </aside>
  );
}