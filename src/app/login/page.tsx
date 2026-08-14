import { redirect } from "next/navigation";

import LoginForm from "@/components/auth/login-form";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";

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
   */

  const currentUser =
    await getCurrentUser();

  if (currentUser) {
    if (
      currentUser.role === "ADMIN"
    ) {
      redirect("/admin");
    }

    redirect("/dashboard");
  }

  /*
   * ==============================
   * REGISTRATION SUCCESS
   * ==============================
   */

  const params =
    await searchParams;

  const registered =
    params.registered === "true";

  return (
    <div className="min-h-screen bg-[#f7f8ff]">

      {/* ============================== */}
      {/* UNIVERSAL NAVBAR */}
      {/* ============================== */}

      <Navbar />

      {/* ============================== */}
      {/* LOGIN SECTION */}
      {/* ============================== */}

      <main className="grid border-b-4 border-[#c90000] lg:min-h-[700px] lg:grid-cols-2">

        {/* ============================== */}
        {/* LEFT BRANDING */}
        {/* ============================== */}

        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#c91d25] via-[#812d36] to-[#252b39] lg:flex">

          {/* DECORATION */}

          <div className="absolute left-10 top-10 h-24 w-24 border-l-4 border-t-4 border-[#c90000]" />

          <div className="absolute bottom-10 right-10 h-24 w-24 border-b-4 border-r-4 border-[#c90000]" />

          {/* CONTENT */}

          <div className="flex w-full items-center">

            <div className="mx-auto w-full max-w-[540px] px-12 text-white">

              {/* MUSIC ICON */}

              <div className="text-5xl font-bold leading-none">
                ♪
              </div>

              {/* HEADING */}

              <h1 className="mt-8 text-6xl font-extrabold tracking-tight">
                Born To Rock
              </h1>

              {/* DESCRIPTION */}

              <p className="mt-5 max-w-[510px] text-lg leading-8 text-white/95">
                Sylhet Engineering College&apos;s
                musical community. Access your
                Pentatone account and continue
                your musical journey.
              </p>

              {/* ESTABLISHED */}

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
            registered={
              registered
            }
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