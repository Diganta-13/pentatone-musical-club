"use client";

import Link from "next/link";

import { Menu, X } from "lucide-react";

import { usePathname } from "next/navigation";

import { useState } from "react";

import BrandLogo from "@/components/layout/brand-logo";
import LogoutButton from "@/components/auth/logout-button";

type NavbarClientProps = {
  user: {
    role: string;
  } | null;
};

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

export default function NavbarClient({
  user,
}: NavbarClientProps) {
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : "/dashboard";

  const dashboardLabel =
    user?.role === "ADMIN"
      ? "Admin Portal"
      : "Dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">

      <nav className="mx-auto flex h-[74px] max-w-[1180px] items-center justify-between px-5 lg:px-8">

        {/* LOGO */}

        <BrandLogo
          priority
          className="h-12"
        />

        {/* ================================= */}
        {/* DESKTOP NAVIGATION */}
        {/* ================================= */}

        <div className="hidden items-center gap-5 lg:flex xl:gap-7">

          {navLinks.map(
            (link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(
                      link.href,
                    );

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
                  }
                  className={`relative whitespace-nowrap py-2 text-[12px] font-semibold tracking-wide transition-colors xl:text-[13px] ${
                    isActive
                      ? "text-red-600"
                      : "text-gray-600 hover:text-red-600"
                  }`}
                >
                  {link.label}

                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-1 mx-auto h-0.5 w-full rounded-full bg-red-600" />
                  )}

                </Link>
              );
            },
          )}

        </div>

        {/* ================================= */}
        {/* DESKTOP ACCOUNT */}
        {/* ================================= */}

        <div className="hidden items-center gap-4 lg:flex xl:gap-6">

         {!user ? (
  <>
    {pathname !== "/login" && (
      <Link
        href="/login"
        className="whitespace-nowrap text-[13px] font-semibold text-gray-800 transition-colors hover:text-red-600"
      >
        Login
      </Link>
    )}

    {pathname !== "/register" && (
      <Link
        href="/register"
        className="whitespace-nowrap rounded-full bg-red-600 px-6 py-3 text-[13px] font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-700 xl:px-7"
      >
        Join Club
      </Link>
    )}
  </>
) : (
            <>
              {/* DASHBOARD / ADMIN PORTAL */}

              <Link
                href={dashboardHref}
                className="whitespace-nowrap rounded-full bg-red-600 px-5 py-3 text-[12px] font-bold text-white transition hover:bg-red-700 xl:px-6 xl:text-[13px]"
              >
                {dashboardLabel}
              </Link>

              {/* LOGOUT */}

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
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-900 lg:hidden"
        >
          {isMenuOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>

      </nav>

      {/* ================================= */}
      {/* MOBILE NAVIGATION */}
      {/* ================================= */}

      {isMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-5 py-5 lg:hidden">

          <div className="mx-auto flex max-w-[1180px] flex-col gap-1">

            {/* MOBILE LINKS */}

            {navLinks.map(
              (link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(
                        link.href,
                      );

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() =>
                      setIsMenuOpen(
                        false,
                      )
                    }
                    className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-red-50 text-red-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              },
            )}

            {/* MOBILE ACCOUNT */}

            <div className="mt-4 border-t border-gray-100 pt-4">

              {!user ? (
  <div className="flex flex-col gap-3">

    {pathname !== "/login" && (
      <Link
        href="/login"
        onClick={() => setIsMenuOpen(false)}
        className="rounded-lg border border-red-600 px-4 py-3 text-center text-sm font-semibold text-red-600 transition hover:bg-red-50"
      >
        Login
      </Link>
    )}

    {pathname !== "/register" && (
      <Link
        href="/register"
        onClick={() => setIsMenuOpen(false)}
        className="rounded-lg bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Join Club
      </Link>
    )}

  </div>
) : (
                <div className="flex flex-col gap-4">

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
                    className="rounded-lg bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    {
                      dashboardLabel
                    }
                  </Link>

                  {/* LOGOUT */}

                  <LogoutButton
                    variant="nav"
                    redirectTo="/"
                  />

                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </header>
  );
}