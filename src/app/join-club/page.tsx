import Link from "next/link";
import { redirect } from "next/navigation";

import type { RowDataPacket } from "mysql2";

import BrandLogo from "@/components/layout/brand-logo";
import Footer from "@/components/layout/footer";
import MembershipForm from "@/components/membership/membership-form";

import { getCurrentUser } from "@/lib/current-user";
import db from "@/lib/db";

interface DepartmentRow extends RowDataPacket {
  id: number;
  name: string;
  short_name: string;
}

interface MembershipRow extends RowDataPacket {
  id: number;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";
  admin_note: string | null;
}

export default async function JoinClubPage() {
  /*
   * ==============================
   * CURRENT USER
   * ==============================
   */

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * Admin users use the admin portal.
   */

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  /*
   * Existing official members do not
   * need to submit another application.
   */

  if (user.role === "MEMBER") {
    redirect("/dashboard");
  }

  /*
   * ==============================
   * LATEST MEMBERSHIP APPLICATION
   * ==============================
   */

  const [applications] =
    await db.execute<MembershipRow[]>(
      `
        SELECT
          id,
          status,
          admin_note

        FROM membership_requests

        WHERE user_id = ?

        ORDER BY created_at DESC

        LIMIT 1
      `,
      [user.id],
    );

  const latestApplication =
    applications.length > 0
      ? applications[0]
      : null;

  /*
   * Approved application safeguard.
   *
   * Normally approval also changes the
   * user role to MEMBER. If for any
   * reason an approved request exists
   * before the role is reflected,
   * return the user to the dashboard.
   */

  if (
    latestApplication?.status ===
    "APPROVED"
  ) {
    redirect("/dashboard");
  }

  /*
   * ==============================
   * DEPARTMENTS
   * ==============================
   */

  const [departmentRows] =
    await db.execute<DepartmentRow[]>(
      `
        SELECT
          id,
          name,
          short_name

        FROM departments

        ORDER BY name ASC
      `,
    );

  const departments =
    departmentRows.map(
      (department) => ({
        id: department.id,
        name: department.name,
        shortName:
          department.short_name,
      }),
    );

  return (
    <>
      <main className="min-h-screen bg-[#f7f8ff]">
        {/* ============================== */}
        {/* HEADER */}
        {/* ============================== */}

        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
            {/* Same official landing-page logo */}

            <BrandLogo
              priority
              className="h-12"
            />

            <Link
              href="/dashboard"
              className="text-sm font-bold text-slate-600 transition hover:text-red-600"
            >
              Back to Dashboard
            </Link>
          </div>
        </header>

        {/* ============================== */}
        {/* PAGE CONTENT */}
        {/* ============================== */}

        <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
          {/* ============================== */}
          {/* LEFT BRANDING SECTION */}
          {/* ============================== */}

          <section className="relative hidden min-h-[1100px] overflow-hidden bg-[#32151c] lg:block">
            {/* Background */}

            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage:
                  "url('/assets/images/register-hero.jpeg')",
              }}
            />

            {/* Dark overlays */}

            <div className="absolute inset-0 bg-[#25070d]/55" />

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#21070d]/35 to-[#100205]/80" />

            {/* Content */}

            <div className="relative z-10 flex min-h-[1100px] flex-col justify-between px-14 py-20 xl:px-20">
              <div>
                {/* College */}

                <div className="flex items-center gap-5">
                  <span className="h-1 w-16 bg-red-600" />

                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-white">
                    Sylhet Engineering College
                  </p>
                </div>

                {/* Heading */}

                <h1 className="mt-10 text-6xl font-extrabold tracking-tight text-white">
                  Join The Club
                </h1>

                <p className="mt-7 max-w-xl text-xl leading-9 text-white">
                  Take the next step toward
                  becoming an official member
                  of Pentatone Musical Club.
                </p>

                <div className="mt-12 h-px w-32 bg-red-600" />

                {/* Membership Process */}

                <div className="mt-10 space-y-5">
                  <Step
                    number="01"
                    title="Submit Application"
                    description="Provide your academic and musical information."
                  />

                  <Step
                    number="02"
                    title="Student Verification"
                    description="Upload a valid SEC student document as verification proof."
                  />

                  <Step
                    number="03"
                    title="Admin Review"
                    description="Pentatone administration reviews your submitted information and proof."
                  />

                  <Step
                    number="04"
                    title="Become A Member"
                    description="Approved applicants receive official MEMBER status."
                  />
                </div>
              </div>

              {/* Current Account */}

              <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-400">
                  Applying As
                </p>

                <p className="mt-3 text-xl font-bold text-white">
                  {user.fullName}
                </p>

                <p className="mt-1 break-all text-sm text-white/70">
                  {user.email}
                </p>

                <div className="mt-5 border-t border-white/10 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">
                    Current Account
                  </p>

                  <p className="mt-2 text-sm font-bold text-white">
                    General User
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ============================== */}
          {/* RIGHT FORM / STATUS */}
          {/* ============================== */}

          <section className="min-h-[850px] px-6 py-14 sm:px-10 lg:px-14 xl:px-20">
            {/* ============================== */}
            {/* PENDING APPLICATION */}
            {/* ============================== */}

            {latestApplication?.status ===
            "PENDING" ? (
              <div className="mx-auto max-w-2xl">
                <div className="flex items-center gap-4">
                  <span className="h-[3px] w-10 bg-amber-500" />

                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
                    Application Submitted
                  </p>
                </div>

                <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                  Application Under Review
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">
                  Your application has already
                  been submitted. Pentatone
                  administration will review
                  your information and student
                  verification document.
                </p>

                {/* Status Card */}

                <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-7">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-600">
                        Membership Status
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-amber-950">
                        Waiting For Admin Review
                      </h3>
                    </div>

                    <div className="w-fit rounded-full border border-amber-300 bg-amber-100 px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-amber-800">
                      Pending
                    </div>
                  </div>

                  <p className="mt-5 border-t border-amber-200 pt-5 text-sm leading-7 text-amber-800">
                    You do not need to submit
                    another membership
                    application while this
                    request is being reviewed.
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-900 px-7 text-sm font-bold text-white transition hover:bg-red-600"
                >
                  Return to Dashboard
                </Link>
              </div>
            ) : (
              /*
               * ==============================
               * NEW / REAPPLICATION FORM
               * ==============================
               */

              <MembershipForm
                fullName={user.fullName}
                email={user.email}
                departments={departments}
                previousRejectionNote={
                  latestApplication?.status ===
                  "REJECTED"
                    ? latestApplication.admin_note
                    : null
                }
              />
            )}
          </section>
        </div>
      </main>

      {/* ============================== */}
      {/* SAME GLOBAL FOOTER */}
      {/* ============================== */}

      <Footer />
    </>
  );
}

/*
 * ==============================
 * MEMBERSHIP PROCESS STEP
 * ==============================
 */

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-400 bg-red-600/20 text-xs font-bold text-red-300">
        {number}
      </div>

      <div>
        <p className="font-bold text-white">
          {title}
        </p>

        <p className="mt-1 max-w-md text-sm leading-6 text-white/70">
          {description}
        </p>
      </div>
    </div>
  );
}