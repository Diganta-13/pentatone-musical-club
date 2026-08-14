import Link from "next/link";

import { redirect } from "next/navigation";

import type {
  RowDataPacket,
} from "mysql2";

import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Mail,
  Music2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import MemberHeader from "@/components/member/member-header";
import MemberSidebar from "@/components/member/member-sidebar";

import db from "@/lib/db";

import {
  getCurrentUser,
} from "@/lib/current-user";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/*
 * =====================================
 * MEMBER PROFILE TYPE
 * =====================================
 */

interface MemberProfileRow
  extends RowDataPacket {
  primary_skill: string | null;

  membership_status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

  approved_at:
    | Date
    | string
    | null;
}

/*
 * =====================================
 * MEMBER PROFILE PAGE
 * =====================================
 */

export default async function MemberProfilePage() {
  /*
   * =====================================
   * CURRENT USER
   * =====================================
   */

  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * ADMIN
   */

  if (
    user.role === "ADMIN"
  ) {
    redirect("/admin");
  }

  /*
   * ONLY MEMBER CAN ACCESS
   */

  if (
    user.role !== "MEMBER"
  ) {
    redirect("/dashboard");
  }

  /*
   * =====================================
   * MEMBERSHIP INFORMATION
   * =====================================
   */

  const [membershipRows] =
    await db.execute<
      MemberProfileRow[]
    >(
      `
        SELECT
          primary_skill,

          status
            AS membership_status,

          COALESCE(
            reviewed_at,
            created_at
          ) AS approved_at

        FROM membership_requests

        WHERE
          user_id = ?
          AND status = 'APPROVED'

        ORDER BY
          COALESCE(
            reviewed_at,
            updated_at,
            created_at
          ) DESC,
          id DESC

        LIMIT 1
      `,
      [
        user.id,
      ],
    );

  const membership =
    membershipRows.length > 0
      ? membershipRows[0]
      : null;

  /*
   * =====================================
   * MEMBER SINCE
   * =====================================
   */

  const memberSince =
    membership?.approved_at
      ? formatDate(
          membership.approved_at,
        )
      : "Not available";

  /*
   * =====================================
   * INITIALS
   * =====================================
   */

  const initials =
    user.fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase(),
      )
      .join("");

  /*
   * =====================================
   * PAGE
   * =====================================
   */

  return (
    <main className="min-h-screen bg-[#f6f7fc]">

      {/* MEMBER SIDEBAR */}

      <MemberSidebar />

      {/* ================================= */}
      {/* MAIN CONTENT */}
      {/* ================================= */}

      <div className="min-h-screen lg:pl-[230px]">

        {/* HEADER */}

        <MemberHeader
          fullName={
            user.fullName
          }
        />

        {/* CONTENT */}

        <div className="px-5 py-7 sm:px-6 lg:px-8 lg:py-8">

          <div className="mx-auto max-w-[1200px]">

            {/* ================================= */}
            {/* PAGE HEADER */}
            {/* ================================= */}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-red-600">
                  Member Account
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                  My Profile
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  View your Pentatone account
                  and official membership
                  information.
                </p>

              </div>

              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-[0.06em] text-slate-600 transition hover:border-red-200 hover:text-red-600"
              >
                <ArrowLeft className="h-4 w-4" />

                Back to Dashboard
              </Link>

            </div>

            {/* ================================= */}
            {/* PROFILE HERO */}
            {/* ================================= */}

            <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">

              <div className="h-1 bg-red-600" />

              <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">

                {/* AVATAR */}

                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#273142] text-3xl font-black text-white shadow-lg">

                  {initials || (
                    <UserRound className="h-9 w-9" />
                  )}

                </div>

                {/* MEMBER IDENTITY */}

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-3">

                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                      {
                        user.fullName
                      }
                    </h2>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.06em] text-green-700">

                      <BadgeCheck className="h-3.5 w-3.5" />

                      Active Member

                    </span>

                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {
                      user.email
                    }
                  </p>

                  <p className="mt-3 text-[9px] font-black uppercase tracking-[0.1em] text-red-600">
                    Pentatone Musical Club
                    Member
                  </p>

                </div>

              </div>

            </section>

            {/* ================================= */}
            {/* DETAILS GRID */}
            {/* ================================= */}

            <div className="mt-6 grid gap-6 xl:grid-cols-2">

              {/* ================================= */}
              {/* PERSONAL INFORMATION */}
              {/* ================================= */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">

                    <UserRound className="h-5 w-5" />

                  </div>

                  <div>

                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-red-600">
                      Account
                    </p>

                    <h2 className="mt-1 text-lg font-black text-slate-900">
                      Personal Information
                    </h2>

                  </div>

                </div>

                <div className="mt-6 divide-y divide-slate-100">

                  <InfoRow
                    icon={
                      <UserRound />
                    }
                    label="Full Name"
                    value={
                      user.fullName
                    }
                  />

                  <InfoRow
                    icon={
                      <Mail />
                    }
                    label="Email Address"
                    value={
                      user.email
                    }
                  />

                  <InfoRow
                    icon={
                      <ShieldCheck />
                    }
                    label="Account Role"
                    value="MEMBER"
                  />

                </div>

              </section>

              {/* ================================= */}
              {/* MEMBERSHIP INFORMATION */}
              {/* ================================= */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">

                    <Music2 className="h-5 w-5" />

                  </div>

                  <div>

                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-red-600">
                      Membership
                    </p>

                    <h2 className="mt-1 text-lg font-black text-slate-900">
                      Club Information
                    </h2>

                  </div>

                </div>

                <div className="mt-6 divide-y divide-slate-100">

                  <InfoRow
                    icon={
                      <BadgeCheck />
                    }
                    label="Membership Status"
                    value="Active Member"
                    green
                  />

                  <InfoRow
                    icon={
                      <Music2 />
                    }
                    label="Musical Skill"
                    value={
                      membership
                        ?.primary_skill ||
                      "Not specified"
                    }
                  />

                  <InfoRow
                    icon={
                      <CalendarDays />
                    }
                    label="Member Since"
                    value={
                      memberSince
                    }
                  />

                </div>

              </section>

            </div>

            {/* ================================= */}
            {/* MEMBER STATUS */}
            {/* ================================= */}

            <section className="mt-6 rounded-2xl bg-[#273142] p-6 text-white shadow-[0_10px_35px_rgba(15,23,42,0.08)]">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/15 text-green-400">

                    <BadgeCheck className="h-5 w-5" />

                  </div>

                  <div>

                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-green-400">
                      Membership Verified
                    </p>

                    <h2 className="mt-1 text-lg font-black">
                      Official Pentatone Member
                    </h2>

                    <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-300">
                      Your membership has been
                      approved by the Pentatone
                      administration and your
                      account currently has
                      member access.
                    </p>

                  </div>

                </div>

                <Link
                  href="/resources"
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-red-600 px-5 text-[9px] font-black uppercase tracking-[0.06em] text-white transition hover:bg-red-700"
                >
                  Explore Resources
                </Link>

              </div>

            </section>

          </div>

        </div>

      </div>

    </main>
  );
}

/*
 * =====================================
 * INFO ROW
 * =====================================
 */

function InfoRow({
  icon,
  label,
  value,
  green = false,
}: {
  icon: React.ReactNode;

  label: string;

  value: string;

  green?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">

      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg [&>svg]:h-4 [&>svg]:w-4 ${
          green
            ? "bg-green-50 text-green-600"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-black uppercase tracking-[0.07em] text-slate-400">
          {label}
        </p>

        <p
          className={`mt-1 break-words text-sm font-bold ${
            green
              ? "text-green-700"
              : "text-slate-800"
          }`}
        >
          {value}
        </p>

      </div>

    </div>
  );
}

/*
 * =====================================
 * DATE FORMAT
 * =====================================
 */

function formatDate(
  value:
    | string
    | Date,
) {
  try {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        month: "long",
        year: "numeric",

        timeZone:
          "Asia/Dhaka",
      },
    ).format(
      new Date(value),
    );
  } catch {
    return "Not available";
  }
}