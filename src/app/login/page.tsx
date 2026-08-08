import Link from "next/link";
import { redirect } from "next/navigation";

import LoginForm from "@/components/auth/login-form";
import BrandLogo from "@/components/layout/brand-logo";
import Footer from "@/components/layout/footer";

import { getCurrentUser } from "@/lib/current-user";

type LoginPageProps = {
  searchParams: Promise<{
    registered?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  /*
   * ==============================
   * AUTH GUARD
   * ==============================
   *
   * Already logged-in users should
   * not see the login form again.
   */

  const currentUser =
    await getCurrentUser();

  if (currentUser) {
    if (currentUser.role === "ADMIN") {
      redirect("/admin");
    }

    redirect("/dashboard");
  }

  /*
   * Registration success message
   */

  const params = await searchParams;

  const registered =
    params.registered === "true";

  return (
    <div className="min-h-screen bg-[#f7f8ff]">
      {/* ============================== */}
      {/* HEADER */}
      {/* ============================== */}

      <header className="border-t-4 border-[#263142] bg-white">
        <div className="mx-auto flex h-[74px] max-w-[1200px] items-center justify-between px-6 lg:px-8">
          {/* Official Pentatone Logo */}

          <BrandLogo
            priority
            className="h-12"
          />

          {/* Navigation */}

          <nav className="hidden items-center gap-9 text-sm text-slate-600 md:flex">
            <Link
              href="/"
              className="transition hover:text-[#c90000]"
            >
              Home
            </Link>

            <Link
              href="/about"
              className="transition hover:text-[#c90000]"
            >
              About
            </Link>

            <Link
              href="/events"
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

          {/* Join Club */}

          <Link
            href="/register"
            className="rounded-full bg-[#c90000] px-7 py-3 text-sm font-bold uppercase text-white transition hover:bg-red-700"
          >
            Join Club
          </Link>
        </div>
      </header>

      {/* ============================== */}
      {/* LOGIN SECTION */}
      {/* ============================== */}

      <main className="grid border-b-4 border-[#c90000] lg:min-h-[700px] lg:grid-cols-2">
        {/* ============================== */}
        {/* LEFT BRANDING */}
        {/* ============================== */}

        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#c91d25] via-[#812d36] to-[#252b39] lg:flex">
          {/* Decoration */}

          <div className="absolute left-10 top-10 h-24 w-24 border-l-4 border-t-4 border-[#c90000]" />

          <div className="absolute bottom-10 right-10 h-24 w-24 border-b-4 border-r-4 border-[#c90000]" />

          {/* Content */}

          <div className="flex w-full items-center">
            <div className="mx-auto w-full max-w-[540px] px-12 text-white">
              {/* Music Icon */}

              <div className="text-5xl font-bold leading-none">
                ♪
              </div>

              {/* Heading */}

              <h1 className="mt-8 text-6xl font-extrabold tracking-tight">
                Born To Rock
              </h1>

              {/* Description */}

              <p className="mt-5 max-w-[510px] text-lg leading-8 text-white/95">
                Sylhet Engineering College&apos;s
                musical community. Access your
                Pentatone account and continue
                your musical journey.
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

        {/* ============================== */}
        {/* RIGHT LOGIN FORM */}
        {/* ============================== */}

        <section className="flex min-h-[700px] items-center justify-center bg-[#f7f8ff] px-5 py-14 sm:px-8">
          <LoginForm
            registered={registered}
          />
        </section>
      </main>

      {/* ============================== */}
      {/* SHARED FOOTER */}
      {/* ============================== */}

      <Footer />
    </div>
  );
}