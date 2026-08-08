import Link from "next/link";

import LoginForm from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{
    registered?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  const registered = params.registered === "true";

  return (
    <div className="min-h-screen bg-[#f7f8ff]">
      {/* Navbar */}
      <header className="border-t-4 border-[#263142] bg-white">
        <div className="mx-auto flex h-[74px] max-w-[1200px] items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-[#c90000]"
          >
            Pentatone
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-9 text-sm text-slate-600 md:flex">
            <Link
              href="/"
              className="transition hover:text-[#c90000]"
            >
              Home
            </Link>

            <Link
              href="/#about"
              className="transition hover:text-[#c90000]"
            >
              About
            </Link>

            <Link
              href="/#events"
              className="transition hover:text-[#c90000]"
            >
              Events
            </Link>

            <Link
              href="/auditions"
              className="transition hover:text-[#c90000]"
            >
              Auditions
            </Link>
          </nav>

          {/* Register button */}
          <Link
            href="/register"
            className="rounded-full bg-[#c90000] px-7 py-3 text-sm font-bold uppercase text-white transition hover:bg-red-700"
          >
            Join Club
          </Link>
        </div>
      </header>

      {/* Main login section */}
      <main className="grid border-b-4 border-[#c90000] lg:min-h-[700px] lg:grid-cols-2">
        {/* Left branding section */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#c91d25] via-[#812d36] to-[#252b39] lg:flex">
          {/* Top left decoration */}
          <div className="absolute top-10 left-10 h-24 w-24 border-t-4 border-l-4 border-[#c90000]" />

          {/* Bottom right decoration */}
          <div className="absolute right-10 bottom-10 h-24 w-24 border-r-4 border-b-4 border-[#c90000]" />

          <div className="flex w-full items-center">
            <div className="mx-auto w-full max-w-[540px] px-12 text-white">
              {/* Music icon */}
              <div className="text-5xl leading-none font-bold">
                ♪
              </div>

              {/* Heading */}
              <h1 className="mt-8 text-6xl font-extrabold tracking-tight">
                Born To Rock
              </h1>

              {/* Description */}
              <p className="mt-5 max-w-[510px] text-lg leading-8 text-white/95">
                Sylhet Engineering College&apos;s musical
                community. Access your Pentatone account and
                continue your musical journey.
              </p>

              {/* Established */}
              <div className="mt-12 flex items-center gap-5">
                <span className="h-px w-12 bg-white" />

                <span className="text-xs font-bold tracking-[0.22em] text-white/80">
                  EST. 2017
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Right login section */}
        <section className="flex min-h-[700px] items-center justify-center bg-[#f7f8ff] px-5 py-14 sm:px-8">
          <LoginForm registered={registered} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#293241] text-white">
        <div className="mx-auto flex min-h-[92px] max-w-[1200px] flex-col items-center justify-between gap-5 px-6 py-6 md:flex-row lg:px-8">
          {/* Footer logo */}
          <Link
            href="/"
            className="text-xl font-extrabold text-[#e00000]"
          >
            Pentatone
          </Link>

          {/* Footer links */}
          <div className="flex flex-wrap items-center justify-center gap-7 text-sm">
            <a
              href="#"
              className="text-white/90 transition hover:text-red-400"
            >
              Facebook
            </a>

            <a
              href="#"
              className="text-white/90 transition hover:text-red-400"
            >
              Instagram
            </a>

            <a
              href="#"
              className="text-white/90 transition hover:text-red-400"
            >
              YouTube
            </a>

            <a
              href="#"
              className="text-white/90 transition hover:text-red-400"
            >
              Contact
            </a>
          </div>

          {/* Copyright */}
          <p className="text-center text-sm text-white/60">
            © 2026 Pentatone Musical Club. Sylhet Engineering
            College.
          </p>
        </div>
      </footer>
    </div>
  );
}