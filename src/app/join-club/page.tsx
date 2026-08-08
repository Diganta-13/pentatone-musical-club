import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { RowDataPacket } from "mysql2";

import MembershipForm from "@/components/membership/membership-form";

import db from "@/lib/db";

import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth";

interface UserRow
  extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: number | boolean;
}

interface DepartmentRow
  extends RowDataPacket {
  id: number;
  name: string;
  short_name: string;
}

interface MembershipRow
  extends RowDataPacket {
  id: number;

  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

  admin_note: string | null;
}

export default async function JoinClubPage() {
  /*
   * Authentication
   */

  const cookieStore =
    await cookies();

  const token = cookieStore.get(
    SESSION_COOKIE_NAME,
  )?.value;

  if (!token) {
    redirect("/login");
  }

  const session =
    await verifySessionToken(token);

  if (!session) {
    redirect("/login");
  }

  /*
   * Always get current role
   * from database.
   */

  const [users] =
    await db.execute<UserRow[]>(
      `
        SELECT
          u.id,
          u.full_name,
          u.email,
          u.is_active,
          r.name AS role
        FROM users u
        INNER JOIN roles r
          ON r.id = u.role_id
        WHERE u.id = ?
        LIMIT 1
      `,
      [session.userId],
    );

  if (users.length === 0) {
    redirect("/login");
  }

  const user = users[0];

  if (!user.is_active) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  if (user.role === "MEMBER") {
    redirect("/dashboard");
  }

  /*
   * Get previous/latest application
   */

  const [applications] =
    await db.execute<
      MembershipRow[]
    >(
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
   * Departments
   */

  const [departmentRows] =
    await db.execute<
      DepartmentRow[]
    >(
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
    <main className="min-h-screen bg-[#f7f8ff]">
      {/* Header */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-red-600"
          >
            Pentatone
          </Link>

          <Link
            href="/dashboard"
            className="text-sm font-bold text-slate-600 transition hover:text-red-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
        {/* LEFT */}

        <section className="relative hidden min-h-[1100px] overflow-hidden bg-[#32151c] lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('/assets/images/register-hero.jpeg')",
            }}
          />

          <div className="absolute inset-0 bg-[#25070d]/55" />

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#21070d]/35 to-[#100205]/80" />

          <div className="relative z-10 flex min-h-[1100px] flex-col justify-between px-14 py-20 xl:px-20">
            <div>
              <div className="flex items-center gap-5">
                <span className="h-1 w-16 bg-red-600" />

                <p className="text-sm font-bold uppercase tracking-[0.18em] text-white">
                  Sylhet Engineering College
                </p>
              </div>

              <h1 className="mt-10 text-6xl font-extrabold tracking-tight text-white">
                Join The Club
              </h1>

              <p className="mt-7 max-w-xl text-xl leading-9 text-white">
                Take the next step toward
                becoming an official member
                of Pentatone Musical Club.
              </p>

              <div className="mt-12 h-px w-32 bg-red-600" />

              <div className="mt-10 space-y-5">
                <Step
                  number="01"
                  title="Submit Application"
                  description="Provide your academic and musical information."
                />

                <Step
                  number="02"
                  title="Student Verification"
                  description="Upload a valid SEC student document."
                />

                <Step
                  number="03"
                  title="Admin Review"
                  description="Pentatone administration reviews the application."
                />

                <Step
                  number="04"
                  title="Become A Member"
                  description="Approved applicants receive official MEMBER status."
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-400">
                Applying As
              </p>

              <p className="mt-3 text-xl font-bold text-white">
                {user.full_name}
              </p>

              <p className="mt-1 text-sm text-white/70">
                {user.email}
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT */}

        <section className="px-6 py-14 sm:px-10 lg:px-14 xl:px-20">
          {latestApplication?.status ===
          "PENDING" ? (
            <div className="mx-auto max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
                Application Submitted
              </p>

              <h2 className="mt-3 text-4xl font-extrabold text-slate-900">
                Application Under Review
              </h2>

              <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-7">
                <p className="text-lg font-bold text-amber-900">
                  Membership Status:
                  PENDING
                </p>

                <p className="mt-3 leading-7 text-amber-800">
                  Your membership application
                  has been submitted
                  successfully and is waiting
                  for review by the Pentatone
                  administration.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="mt-7 inline-flex rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white"
              >
                Return to Dashboard
              </Link>
            </div>
          ) : (
            <MembershipForm
              fullName={user.full_name}
              email={user.email}
              departments={
                departments
              }
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
  );
}

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

        <p className="mt-1 text-sm leading-6 text-white/70">
          {description}
        </p>
      </div>
    </div>
  );
}