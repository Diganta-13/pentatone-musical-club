import type { Metadata } from "next";
import Link from "next/link";

import RegisterForm from "@/components/auth/register-form";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Create Account | Pentatone Musical Club",
  description:
    "Create your Pentatone account and begin your journey with Sylhet Engineering College's musical community.",
};

const navigationLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Events",
    href: "/#events",
  },
  {
    label: "Auditions",
    href: "/auditions",
  },
];

const statistics = [
  {
    value: "120+",
    label: "Members",
  },
  {
    value: "20+",
    label: "Events",
  },
  {
    value: "8+",
    label: "Instruments",
  },
];

export default function RegisterPage() {
  return (
    <>
      {/* Header */}
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-24 max-w-[1760px] items-center justify-between px-6 md:px-12 xl:px-20">
          <Link
            href="/"
            className="text-3xl font-extrabold tracking-tight text-[#d90000]"
          >
            Pentatone
          </Link>

          <nav className="hidden items-center gap-12 md:flex">
            {navigationLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-bold uppercase tracking-[0.16em] text-slate-600 transition hover:text-red-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center border-2 border-slate-900 px-6 text-sm font-bold uppercase tracking-[0.16em] text-slate-900 transition hover:border-red-600 hover:bg-red-600 hover:text-white md:px-8"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="grid lg:grid-cols-2">
        {/* Left section */}
        <section className="relative min-h-[720px] overflow-hidden bg-[#32151c] lg:min-h-[900px]">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('/assets/images/register-hero.jpeg')",
            }}
          />

          <div className="absolute inset-0 bg-[#26070d]/30" />

          <div className="absolute inset-0 bg-gradient-to-b from-[#401923]/20 via-[#270b12]/35 to-[#130307]/60" />

          <div className="relative z-10 flex min-h-[720px] flex-col justify-between px-8 py-14 md:px-14 lg:min-h-[900px] lg:px-16 lg:py-20 xl:px-20">
            <div className="max-w-[650px]">
              <div className="flex items-center gap-5">
                <span className="h-1 w-16 bg-red-600" />

                <p className="text-sm font-bold uppercase tracking-[0.18em] text-white">
                  Sylhet Engineering College
                </p>
              </div>

              <h2 className="mt-10 text-5xl font-extrabold tracking-tight text-white md:text-6xl xl:text-7xl">
                Born To Rock
              </h2>

              <p className="mt-7 max-w-[590px] text-lg leading-8 text-white md:text-xl md:leading-9">
                Create your Pentatone account and take the
                first step toward joining our musical
                community.
              </p>

              <div className="mt-12 h-px w-32 bg-red-600" />

              <p className="mt-8 max-w-[580px] text-base leading-8 text-slate-100">
                Connect with musicians, participate in live
                programs, improve your skills, and become
                part of a creative musical community.
              </p>
            </div>

            {/* Statistics */}
            <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
              {statistics.map((statistic) => (
                <div
                  key={statistic.label}
                  className="rounded-2xl border border-white/30 bg-white/10 px-7 py-7 shadow-lg backdrop-blur-sm"
                >
                  <p className="text-4xl font-extrabold text-red-500 xl:text-5xl">
                    {statistic.value}
                  </p>

                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.1em] text-white">
                    {statistic.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right section */}
        <section className="bg-[#f7f8ff] px-6 py-14 md:px-14 lg:px-14 lg:py-20 xl:px-20">
          <RegisterForm />
        </section>
      </main>

      <Footer />
    </>
  );
}