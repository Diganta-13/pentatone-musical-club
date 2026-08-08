"use client";

import Link from "next/link";

import {
  Menu,
  X,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import {
  useState,
} from "react";

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
    label: "Auditions",
    href: "/auditions",
  },
  {
    label: "Gallery",
    href: "/gallery",
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
        <BrandLogo
          priority
          className="h-12"
        />

        {/* Desktop navigation */}

        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => {
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
                className={`relative py-2 text-[13px] font-semibold tracking-wide transition-colors ${
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
          })}
        </div>

        {/* Desktop account */}

        <div className="hidden items-center gap-6 lg:flex">
          {!user ? (
            <>
              <Link
                href="/login"
                className="text-[13px] font-semibold text-gray-800 transition-colors hover:text-red-600"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-red-600 px-7 py-3 text-[13px] font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-700"
              >
                Join Club
              </Link>
            </>
          ) : (
            <>
              <Link
                href={dashboardHref}
                className="rounded-full bg-red-600 px-6 py-3 text-[13px] font-bold text-white transition hover:bg-red-700"
              >
                {dashboardLabel}
              </Link>

              <LogoutButton
                variant="nav"
                redirectTo="/"
              />
            </>
          )}
        </div>

        {/* Mobile button */}

        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
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

      {/* Mobile */}

      {isMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-5 py-5 lg:hidden">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className="rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-red-600"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-4 border-t border-gray-100 pt-4">
              {!user ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={() =>
                      setIsMenuOpen(
                        false,
                      )
                    }
                    className="rounded-lg border border-red-600 px-4 py-3 text-center text-sm font-semibold text-red-600"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={() =>
                      setIsMenuOpen(
                        false,
                      )
                    }
                    className="rounded-lg bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Join Club
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link
                    href={
                      dashboardHref
                    }
                    onClick={() =>
                      setIsMenuOpen(
                        false,
                      )
                    }
                    className="rounded-lg bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    {dashboardLabel}
                  </Link>

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