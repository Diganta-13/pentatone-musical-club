"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Menu,
  X,
} from "lucide-react";

import BrandLogo from "@/components/layout/brand-logo";
import LogoutButton from "@/components/auth/logout-button";

/*
 * =====================================
 * TYPES
 * =====================================
 */

type NavbarClientProps = {
  user: {
    role: string;
  } | null;
};

/*
 * =====================================
 * PUBLIC NAVIGATION
 * =====================================
 */

const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Events",
    href: "/events",
  },
  {
    label: "Announcements",
    href: "/announcements",
  },
  {
    label: "Resources",
    href: "/resources",
  },
  {
    label: "Auditions",
    href: "/auditions",
  },
  {
    label: "Gallery",
    href: "/gallery",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

/*
 * =====================================
 * NAVBAR
 * =====================================
 */

export default function NavbarClient({
  user,
}: NavbarClientProps) {
  const pathname =
    usePathname();

  const [
    isMenuOpen,
    setIsMenuOpen,
  ] = useState(false);

  /*
   * =====================================
   * ROLE ACCESS
   * =====================================
   *
   * Resources are only available
   * for MEMBER and ADMIN users.
   */

  const canAccessResources =
    user?.role === "MEMBER" ||
    user?.role === "ADMIN";

  /*
   * =====================================
   * FILTER NAVIGATION
   * =====================================
   */

  const visibleNavLinks =
    navLinks.filter(
      (link) =>
        link.href !== "/resources" ||
        canAccessResources,
    );

  /*
   * =====================================
   * DASHBOARD
   * =====================================
   */

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : "/dashboard";

  const dashboardLabel =
    user?.role === "ADMIN"
      ? "Admin Portal"
      : "Dashboard";

  /*
   * =====================================
   * ACTIVE LINK
   * =====================================
   */

  function isActive(
    href: string,
  ) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(
      href,
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">

      {/* ================================= */}
      {/* DESKTOP NAVBAR */}
      {/* ================================= */}

      <nav className="mx-auto flex h-[76px] max-w-[1200px] items-center justify-between gap-5 px-5 lg:px-8">

        {/* ================================= */}
        {/* LOGO */}
        {/* ================================= */}

        <BrandLogo
          priority
          className="h-12 shrink-0"
        />

        {/* ================================= */}
        {/* DESKTOP LINKS */}
        {/* ================================= */}

        <div className="hidden flex-1 items-center justify-center gap-5 lg:flex xl:gap-7">

          {visibleNavLinks.map(
            (link) => {
              const active =
                isActive(
                  link.href,
                );

              return (
                <Link
                  key={
                    link.href
                  }
                  href={
                    link.href
                  }
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`relative whitespace-nowrap py-2 text-[12px] font-semibold transition-colors xl:text-[13px] ${
                    active
                      ? "text-red-600"
                      : "text-slate-600 hover:text-red-600"
                  }`}
                >
                  {
                    link.label
                  }

                  {active && (
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-red-600" />
                  )}

                </Link>
              );
            },
          )}

        </div>

        {/* ================================= */}
        {/* DESKTOP ACCOUNT ACTIONS */}
        {/* ================================= */}

        <div className="hidden shrink-0 items-center gap-3 lg:flex">

          {!user ? (
            <>

              {/* ============================= */}
              {/* LOGIN */}
              {/* Hide on /login */}
              {/* ============================= */}

              {pathname !==
                "/login" && (
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 bg-white px-6 text-[12px] font-bold uppercase tracking-[0.06em] text-slate-800 transition hover:border-red-600 hover:bg-red-50 hover:text-red-600"
                >
                  Login
                </Link>
              )}

              {/* ============================= */}
              {/* JOIN CLUB */}
              {/* Hide on /register */}
              {/* ============================= */}

              {pathname !==
                "/register" && (
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full bg-red-600 px-7 text-[12px] font-bold uppercase tracking-[0.06em] text-white shadow-lg shadow-red-100 transition hover:bg-red-700"
                >
                  Join Club
                </Link>
              )}

            </>
          ) : (
            <>

              {/* ============================= */}
              {/* DASHBOARD / ADMIN PORTAL */}
              {/* ============================= */}

              <Link
                href={
                  dashboardHref
                }
                className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full bg-red-600 px-6 text-[12px] font-bold uppercase tracking-[0.05em] text-white shadow-lg shadow-red-100 transition hover:bg-red-700"
              >
                {
                  dashboardLabel
                }
              </Link>

              {/* ============================= */}
              {/* LOGOUT */}
              {/* ============================= */}

              <LogoutButton
                variant="nav"
                redirectTo="/"
              />

            </>
          )}

        </div>

        {/* ================================= */}
        {/* MOBILE MENU BUTTON */}
        {/* ================================= */}

        <button
          type="button"
          aria-label={
            isMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={
            isMenuOpen
          }
          onClick={() =>
            setIsMenuOpen(
              (previous) =>
                !previous,
            )
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 transition hover:border-red-200 hover:text-red-600 lg:hidden"
        >
          {isMenuOpen ? (
            <X
              size={21}
            />
          ) : (
            <Menu
              size={21}
            />
          )}
        </button>

      </nav>

      {/* ================================= */}
      {/* MOBILE MENU */}
      {/* ================================= */}

      {isMenuOpen && (
        <div className="border-t border-slate-100 bg-white lg:hidden">

          <div className="mx-auto max-w-[1200px] px-5 py-5">

            {/* ================================= */}
            {/* MOBILE LINKS */}
            {/* ================================= */}

            <div className="space-y-1">

              {visibleNavLinks.map(
                (link) => {
                  const active =
                    isActive(
                      link.href,
                    );

                  return (
                    <Link
                      key={
                        link.href
                      }
                      href={
                        link.href
                      }
                      onClick={() =>
                        setIsMenuOpen(
                          false,
                        )
                      }
                      className={`block rounded-lg px-4 py-3 text-sm font-semibold transition ${
                        active
                          ? "bg-red-50 text-red-600"
                          : "text-slate-700 hover:bg-slate-50 hover:text-red-600"
                      }`}
                    >
                      {
                        link.label
                      }
                    </Link>
                  );
                },
              )}

            </div>

            {/* ================================= */}
            {/* MOBILE ACCOUNT ACTIONS */}
            {/* ================================= */}

            <div className="mt-5 border-t border-slate-100 pt-5">

              {!user ? (
                <div className="flex flex-col gap-3">

                  {/* LOGIN */}

                  {pathname !==
                    "/login" && (
                    <Link
                      href="/login"
                      onClick={() =>
                        setIsMenuOpen(
                          false,
                        )
                      }
                      className="inline-flex h-11 items-center justify-center rounded-full border border-red-600 bg-white px-5 text-[12px] font-bold uppercase tracking-[0.06em] text-red-600 transition hover:bg-red-50"
                    >
                      Login
                    </Link>
                  )}

                  {/* JOIN CLUB */}

                  {pathname !==
                    "/register" && (
                    <Link
                      href="/register"
                      onClick={() =>
                        setIsMenuOpen(
                          false,
                        )
                      }
                      className="inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-5 text-[12px] font-bold uppercase tracking-[0.06em] text-white transition hover:bg-red-700"
                    >
                      Join Club
                    </Link>
                  )}

                </div>
              ) : (
                <div className="flex flex-col gap-3">

                  {/* DASHBOARD */}

                  <Link
                    href={
                      dashboardHref
                    }
                    onClick={() =>
                      setIsMenuOpen(
                        false,
                      )
                    }
                    className="inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-5 text-[12px] font-bold uppercase tracking-[0.06em] text-white transition hover:bg-red-700"
                  >
                    {
                      dashboardLabel
                    }
                  </Link>

                  {/* LOGOUT */}

                  <div className="flex justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                    <LogoutButton
                      variant="nav"
                      redirectTo="/"
                    />

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </header>
  );
}