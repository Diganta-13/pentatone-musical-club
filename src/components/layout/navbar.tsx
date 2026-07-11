"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Auditions", href: "/auditions" },
  { label: "Gallery", href: "/gallery" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <nav className="mx-auto flex h-[74px] max-w-[1180px] items-center justify-between px-5 lg:px-8">
        {/* Original Pentatone logo */}
        <Link
          href="/"
          aria-label="Pentatone Musical Club home"
          className="flex shrink-0 items-center"
        >
          <Image
            src="/assets/images/logo.png"
            alt="Pentatone Musical Club"
            width={190}
            height={58}
            priority
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop menu */}
        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
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

        {/* Desktop actions */}
        <div className="hidden items-center gap-6 lg:flex">
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
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((previous) => !previous)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-900 lg:hidden"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-5 py-5 lg:hidden">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-red-50 text-red-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg border border-red-600 px-4 py-3 text-center text-sm font-semibold text-red-600"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Join Club
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}