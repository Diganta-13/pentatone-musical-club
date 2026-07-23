import type { Metadata } from "next";
import Link from "next/link";

import RegisterForm from "@/components/auth/register-form";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Join Pentatone | Musical Club",
  description:
    "Create an account and join Pentatone Musical Club at Sylhet Engineering College.",
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
      {/* Registration page header */}
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-24 max-w-[1760px] items-center justify-between px-12 xl:px-20">
          <Link
            href="/"
            className="text-3xl font-extrabold tracking-tight text-[#d90000]"
          >
            Pentatone
          </Link>

          <nav className="flex items-center gap-12">
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
            className="inline-flex h-12 items-center justify-center border-2 border-slate-900 px-8 text-sm font-bold uppercase tracking-[0.16em] text-slate-900 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="grid min-h-[950px] grid-cols-2">
        {/* Left image section */}
        <section className="relative min-h-[950px] overflow-hidden bg-[#32151c]">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('/assets/images/register-hero.jpeg')",
            }}
          />

          {/* Light color overlay */}
          <div className="absolute inset-0 bg-[#26070d]/30" />

          {/* Light gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#401923]/20 via-[#270b12]/35 to-[#130307]/60" />

          {/* Left content */}
          <div className="relative z-10 flex min-h-[950px] flex-col justify-between px-16 py-20 xl:px-20">
            <div className="max-w-[650px]">
              <div className="flex items-center gap-5">
                <span className="h-1 w-16 bg-red-600" />

                <p className="text-sm font-bold uppercase tracking-[0.18em] text-white">
                  Sylhet Engineering College
                </p>
              </div>

              <h2 className="mt-10 text-6xl font-extrabold tracking-tight text-white xl:text-7xl">
                Born To Rock
              </h2>

              <p className="mt-7 max-w-[570px] text-xl leading-9 text-white">
                Join Sylhet Engineering College&apos;s official musical club
                and begin your musical journey.
              </p>

              <div className="mt-12 h-px w-32 bg-red-600" />

              <p className="mt-8 max-w-[580px] text-base leading-8 text-slate-100">
                Connect with musicians, participate in live programs, improve
                your skills, and become part of a creative musical community.
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-6">
              {statistics.map((statistic) => (
                <div
                  key={statistic.label}
                  className="rounded-2xl border border-white/30 bg-white/10 px-7 py-7 shadow-lg backdrop-blur-sm"
                >
                  <p className="text-5xl font-extrabold text-red-500">
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

        {/* Right registration form */}
        <section className="bg-[#f7f8ff] px-14 py-16 xl:px-20 xl:py-20">
          <RegisterForm />
        </section>
      </main>

      <Footer />
    </>
  );
}