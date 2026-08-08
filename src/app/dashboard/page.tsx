import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";

import LogoutButton from "@/components/auth/logout-button";

import db from "@/lib/db";

import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth";

interface UserRow extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: number | boolean;
}

interface MembershipRow extends RowDataPacket {
  id: number;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";
  admin_note: string | null;
  created_at: Date;
}

export default async function DashboardPage() {
  /*
   * ============================
   * AUTHENTICATION
   * ============================
   */

  const cookieStore = await cookies();

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
   * ============================
   * GET CURRENT USER FROM DB
   * ============================
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

  /*
   * Admin uses separate dashboard
   */

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  /*
   * ============================
   * GET LATEST MEMBERSHIP REQUEST
   * ============================
   */

  const [membershipRequests] =
    await db.execute<
      MembershipRow[]
    >(
      `
        SELECT
          id,
          status,
          admin_note,
          created_at
        FROM membership_requests
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [user.id],
    );

  const membership =
    membershipRequests.length > 0
      ? membershipRequests[0]
      : null;

  return (
    <main className="min-h-screen bg-[#f7f8ff]">
      {/* ========================= */}
      {/* DASHBOARD HEADER */}
      {/* ========================= */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-red-600"
          >
            Pentatone
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-600 transition hover:text-red-600"
            >
              Back to Website
            </Link>

            <LogoutButton />
          </div>
        </div>
      </header>

      {/* ========================= */}
      {/* DASHBOARD CONTENT */}
      {/* ========================= */}

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600">
              Pentatone Dashboard
            </p>

            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
              Welcome, {user.full_name}
            </h1>

            <p className="mt-3 text-slate-600">
              Manage your Pentatone account
              and club membership.
            </p>
          </div>

          {/* Role Badge */}
          <div className="w-fit rounded-full bg-slate-900 px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
            {user.role === "MEMBER"
              ? "Member"
              : "General User"}
          </div>
        </div>

        {/* ========================= */}
        {/* ACCOUNT CARD */}
        {/* ========================= */}

        <div className="mt-10 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="grid gap-8 sm:grid-cols-2">
            {/* Name */}

            <div>
              <p className="text-sm text-slate-500">
                Full Name
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {user.full_name}
              </p>
            </div>

            {/* Email */}

            <div>
              <p className="text-sm text-slate-500">
                Email Address
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {user.email}
              </p>
            </div>

            {/* Role */}

            <div>
              <p className="text-sm text-slate-500">
                Account Role
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {user.role}
              </p>
            </div>
          </div>

          {/* ========================= */}
          {/* MEMBER */}
          {/* ========================= */}

          {user.role === "MEMBER" && (
            <div className="mt-10 rounded-2xl border border-green-200 bg-green-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 font-bold text-white">
                  ✓
                </div>

                <div>
                  <p className="text-lg font-bold text-green-900">
                    Official Pentatone Member
                  </p>

                  <p className="mt-2 text-sm leading-6 text-green-700">
                    Your membership application
                    has been approved. You are
                    now an official member of
                    Pentatone Musical Club.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================= */}
          {/* GENERAL USER - NO APP */}
          {/* ========================= */}

          {user.role === "GENERAL_USER" &&
            !membership && (
              <div className="mt-10 rounded-2xl border border-red-100 bg-red-50 p-6">
                <p className="text-lg font-bold text-slate-900">
                  Club Membership
                </p>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Your Pentatone account is
                  active, but you are not an
                  official club member yet.
                  Submit a membership
                  application to begin the
                  verification process.
                </p>

                <Link
                  href="/join-club"
                  className="mt-5 inline-flex rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Apply for Membership
                </Link>
              </div>
            )}

          {/* ========================= */}
          {/* PENDING */}
          {/* ========================= */}

          {user.role === "GENERAL_USER" &&
            membership?.status ===
              "PENDING" && (
              <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">
                      Membership Application
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-amber-950">
                      Application Under Review
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-800">
                      Your membership application
                      has been submitted
                      successfully and is currently
                      waiting for review by the
                      Pentatone administration.
                    </p>
                  </div>

                  <div className="w-fit rounded-full border border-amber-300 bg-amber-100 px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-amber-800">
                    Pending
                  </div>
                </div>

                <div className="mt-5 border-t border-amber-200 pt-5">
                  <p className="text-xs text-amber-700">
                    You do not need to submit
                    another application.
                  </p>
                </div>
              </div>
            )}

          {/* ========================= */}
          {/* REJECTED */}
          {/* ========================= */}

          {user.role === "GENERAL_USER" &&
            membership?.status ===
              "REJECTED" && (
              <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">
                  Membership Application
                </p>

                <h2 className="mt-2 text-xl font-bold text-red-900">
                  Application Rejected
                </h2>

                <p className="mt-2 text-sm leading-6 text-red-700">
                  Your previous membership
                  application was not approved.
                  You can correct the information
                  and submit a new application.
                </p>

                {membership.admin_note && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                      Admin Note
                    </p>

                    <p className="mt-2 text-sm text-slate-700">
                      {
                        membership.admin_note
                      }
                    </p>
                  </div>
                )}

                <Link
                  href="/join-club"
                  className="mt-5 inline-flex rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Reapply for Membership
                </Link>
              </div>
            )}

          {/* APPROVED but role not updated safeguard */}

          {user.role === "GENERAL_USER" &&
            membership?.status ===
              "APPROVED" && (
              <div className="mt-10 rounded-2xl border border-green-200 bg-green-50 p-6">
                <p className="text-lg font-bold text-green-900">
                  Membership Approved
                </p>

                <p className="mt-2 text-sm text-green-700">
                  Your application has been
                  approved. Your membership role
                  is being updated.
                </p>
              </div>
            )}
        </div>
      </div>
    </main>
  );
}