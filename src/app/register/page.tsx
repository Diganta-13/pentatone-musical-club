import type { Metadata } from "next";
import { redirect } from "next/navigation";

import RegisterForm from "@/components/auth/register-form";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";

import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = {
  title: "Create Account | Pentatone Musical Club",

  description:
    "Create your Pentatone account and begin your journey with Sylhet Engineering College's musical community.",
};

/*
 * =====================================
 * DISPLAY STATISTICS
 * =====================================
 */

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

/*
 * =====================================
 * REGISTER PAGE
 * =====================================
 */

export default async function RegisterPage() {
  /*
   * =====================================
   * AUTH GUARD
   * =====================================
   */

  const currentUser =
    await getCurrentUser();

  if (currentUser) {
    if (
      currentUser.role ===
      "ADMIN"
    ) {
      redirect("/admin");
    }

    redirect("/dashboard");
  }

  /*
   * =====================================
   * PAGE
   * =====================================
   */

  return (
    <>
      {/* ================================= */}
      {/* UNIVERSAL NAVBAR */}
      {/* ================================= */}

      <Navbar />

      {/* ================================= */}
      {/* MAIN */}
      {/* ================================= */}

      <main className="grid lg:grid-cols-2">

        {/* ================================= */}
        {/* LEFT BRANDING SECTION */}
        {/* ================================= */}

        <section className="relative min-h-[720px] overflow-hidden bg-[#32151c] lg:min-h-[900px]">

          {/* BACKGROUND IMAGE */}

          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('/assets/images/register-hero.jpeg')",
            }}
          />

          {/* OVERLAYS */}

          <div className="absolute inset-0 bg-[#26070d]/30" />

          <div className="absolute inset-0 bg-gradient-to-b from-[#401923]/20 via-[#270b12]/35 to-[#130307]/60" />

          {/* CONTENT */}

          <div className="relative z-10 flex min-h-[720px] flex-col justify-between px-8 py-14 md:px-14 lg:min-h-[900px] lg:px-16 lg:py-20 xl:px-20">

            <div className="max-w-[650px]">

              {/* COLLEGE */}

              <div className="flex items-center gap-5">

                <span className="h-1 w-16 bg-red-600" />

                <p className="text-sm font-bold uppercase tracking-[0.18em] text-white">
                  Sylhet Engineering
                  College
                </p>

              </div>

              {/* TITLE */}

              <h1 className="mt-10 text-5xl font-extrabold tracking-tight text-white md:text-6xl xl:text-7xl">
                Born To Rock
              </h1>

              {/* INTRO */}

              <p className="mt-7 max-w-[590px] text-lg leading-8 text-white md:text-xl md:leading-9">
                Create your Pentatone
                account and take the
                first step toward
                joining our musical
                community.
              </p>

              <div className="mt-12 h-px w-32 bg-red-600" />

              <p className="mt-8 max-w-[580px] text-base leading-8 text-slate-100">
                Connect with musicians,
                participate in live
                programs, improve your
                skills, and become part
                of a creative musical
                community.
              </p>

              {/* ================================= */}
              {/* MEMBERSHIP FLOW */}
              {/* ================================= */}

              <div className="mt-10 rounded-2xl border border-white/20 bg-black/20 p-6 backdrop-blur-sm">

                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-400">
                  How Membership Works
                </p>

                <div className="mt-4 space-y-3 text-sm text-white/90">

                  <p>
                    01 — Create your
                    Pentatone account
                  </p>

                  <p>
                    02 — Login to your
                    dashboard
                  </p>

                  <p>
                    03 — Apply for
                    official membership
                  </p>

                  <p>
                    04 — Get approved by
                    club administration
                  </p>

                </div>

              </div>

            </div>

            {/* ================================= */}
            {/* STATISTICS */}
            {/* ================================= */}

            <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">

              {statistics.map(
                (statistic) => (
                  <div
                    key={
                      statistic.label
                    }
                    className="rounded-2xl border border-white/30 bg-white/10 px-7 py-7 shadow-lg backdrop-blur-sm"
                  >

                    <p className="text-4xl font-extrabold text-red-500 xl:text-5xl">
                      {
                        statistic.value
                      }
                    </p>

                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.1em] text-white">
                      {
                        statistic.label
                      }
                    </p>

                  </div>
                ),
              )}

            </div>

          </div>

        </section>

        {/* ================================= */}
        {/* RIGHT REGISTRATION FORM */}
        {/* ================================= */}

        <section className="bg-[#f7f8ff] px-6 py-14 md:px-14 lg:px-14 lg:py-20 xl:px-20">

          <RegisterForm />

        </section>

      </main>

      {/* ================================= */}
      {/* FOOTER */}
      {/* ================================= */}

      <Footer />

    </>
  );
}