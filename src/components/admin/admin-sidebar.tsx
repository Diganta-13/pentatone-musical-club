"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CalendarDays,
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
import BrandLogo from "@/components/layout/brand-logo";

/*
 * =====================================
 * MENU
 * =====================================
 */

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
    enabled: true,
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
    enabled: true,
  },

  {
    label: "Auditions",
    href: "/admin/auditions",
    icon: Mic2,
    enabled: true,
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
    enabled: true,
  },
];


/*
 * =====================================
 * COMPONENT
 * =====================================
 */

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] flex-col bg-[#273244] text-white lg:flex">

      {/* LOGO */}

      <div className="px-6 pb-6 pt-7">

        <BrandLogo
          priority
          className="h-14"
        />

        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Admin Portal
        </p>

      </div>


      {/* NAVIGATION */}

      <nav className="overflow-y-auto border-t border-white/10 px-3 py-5">

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
                  className="flex cursor-default items-center gap-4 rounded-lg px-4 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-slate-300/50"
                >

                  <Icon className="h-[19px] w-[19px] shrink-0" />

                  <span>
                    {item.label}
                  </span>

                </div>

              );

            }


            return (

              <Link
                key={item.href}
                href={item.href}

                className={`flex items-center gap-4 rounded-lg px-4 py-3 text-[12px] font-bold uppercase tracking-[0.08em] transition ${
                  active
                    ? "bg-[#d90000] text-white shadow-sm"
                    : "text-slate-200 hover:bg-white/5 hover:text-white"
                }`}
              >

                <Icon className="h-[19px] w-[19px] shrink-0" />

                <span>
                  {item.label}
                </span>

              </Link>

            );

          })}

        </div>

      </nav>



      {/* SETTINGS + LOGOUT */}

      <div className="mx-3 border-t border-white/10 pb-5 pt-4">

        <div
          title="Settings will be connected shortly"

          className="flex cursor-default items-center gap-4 px-3 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-slate-300/50"
        >

          <Settings className="h-[19px] w-[19px] shrink-0" />

          <span>
            Settings
          </span>

        </div>


        <AdminLogoutButton />

      </div>


    </aside>
  );
}