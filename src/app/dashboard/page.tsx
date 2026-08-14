import Link from "next/link";

import { redirect } from "next/navigation";

import type {
  RowDataPacket,
} from "mysql2";

import LogoutButton from "@/components/auth/logout-button";

import BrandLogo from "@/components/layout/brand-logo";

import Footer from "@/components/layout/footer";

import MemberSidebar from "@/components/member/member-sidebar";

import MemberHeader from "@/components/member/member-header";

import MemberDashboard from "@/components/member/member-dashboard";

import db from "@/lib/db";

import {
  getCurrentUser,
} from "@/lib/current-user";

/*
 * =================================
 * MEMBERSHIP TYPE
 * =================================
 */

interface MembershipRow
  extends RowDataPacket {
  id: number;

  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

  admin_note: string | null;

  created_at: Date;
}

/*
 * =================================
 * MEMBER PROFILE TYPE
 * =================================
 */

interface MemberProfileRow
  extends RowDataPacket {
  primary_skill: string | null;

  approved_at:
    | Date
    | string
    | null;
}

/*
 * =================================
 * AUDITION APPLICATION TYPE
 * =================================
 */

interface AuditionApplicationRow
  extends RowDataPacket {
  id: number;

  status:
    | "PENDING"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED";

  instrument: string;

  session_title: string;

  audition_date: string;

  created_at: Date;
}

/*
 * =================================
 * EVENT TYPE
 * =================================
 */

interface EventRow
  extends RowDataPacket {
  id: number;

  title: string;

  date: string;

  time: string | null;

  venue: string | null;
}

/*
 * =================================
 * ANNOUNCEMENT TYPE
 * =================================
 */

interface AnnouncementRow
  extends RowDataPacket {
  id: number;

  title: string;

  slug: string;

  shortDescription:
    | string
    | null;

  publishedAt:
    | Date
    | string
    | null;
}

/*
 * =================================
 * COUNT TYPE
 * =================================
 */

interface CountRow
  extends RowDataPacket {
  total: number;
}

/*
 * =================================
 * DASHBOARD
 * =================================
 */

export default async function DashboardPage() {

  /*
   * =================================
   * CURRENT USER
   * =================================
   */

  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * =================================
   * ADMIN REDIRECT
   * =================================
   */

  if (
    user.role === "ADMIN"
  ) {
    redirect("/admin");
  }

  /*
   * =====================================================
   * MEMBER DASHBOARD
   * =====================================================
   */

  if (
    user.role === "MEMBER"
  ) {

    /*
     * =================================
     * MEMBER PROFILE
     * =================================
     */

    const [memberProfiles] =
      await db.execute<
        MemberProfileRow[]
      >(
        `
          SELECT
            primary_skill,

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

    const memberProfile =
      memberProfiles.length > 0
        ? memberProfiles[0]
        : null;

    /*
     * =================================
     * UPCOMING EVENTS COUNT
     * =================================
     */

    const [eventCountRows] =
      await db.execute<
        CountRow[]
      >(
        `
          SELECT
            COUNT(*) AS total

          FROM events

          WHERE
            is_published = 1
            AND event_date >= CURDATE()
        `,
      );

    const upcomingEventsCount =
      Number(
        eventCountRows[0]
          ?.total ?? 0,
      );

    /*
     * =================================
     * UPCOMING EVENTS
     * =================================
     */

    const [upcomingEvents] =
      await db.execute<
        EventRow[]
      >(
        `
          SELECT
            id,

            title,

            DATE_FORMAT(
              event_date,
              '%Y-%m-%d'
            ) AS date,

            CASE
              WHEN start_time IS NULL
              THEN NULL

              ELSE TIME_FORMAT(
                start_time,
                '%h:%i %p'
              )
            END AS time,

            venue

          FROM events

          WHERE
            is_published = 1
            AND event_date >= CURDATE()

          ORDER BY
            event_date ASC,
            start_time ASC

          LIMIT 3
        `,
      );

    /*
     * =================================
     * RESOURCES COUNT
     * =================================
     */

    const [resourceCountRows] =
      await db.execute<
        CountRow[]
      >(
        `
          SELECT
            COUNT(*) AS total

          FROM resources

          WHERE
            is_published = 1
        `,
      );

    const resourcesCount =
      Number(
        resourceCountRows[0]
          ?.total ?? 0,
      );

    /*
     * =================================
     * ANNOUNCEMENTS COUNT
     * =================================
     */

    const [announcementCountRows] =
      await db.execute<
        CountRow[]
      >(
        `
          SELECT
            COUNT(*) AS total

          FROM announcements

          WHERE
            is_published = 1
        `,
      );

    const announcementsCount =
      Number(
        announcementCountRows[0]
          ?.total ?? 0,
      );

    /*
     * =================================
     * LATEST ANNOUNCEMENTS
     * =================================
     */

    const [announcements] =
      await db.execute<
        AnnouncementRow[]
      >(
        `
          SELECT
            id,

            title,

            slug,

            short_description
              AS shortDescription,

            COALESCE(
              published_at,
              created_at
            ) AS publishedAt

          FROM announcements

          WHERE
            is_published = 1

          ORDER BY
            is_pinned DESC,

            COALESCE(
              published_at,
              created_at
            ) DESC,

            id DESC

          LIMIT 3
        `,
      );

    /*
     * =================================
     * MEMBER LATEST AUDITION
     * =================================
     */

    const [memberAuditions] =
      await db.execute<
        AuditionApplicationRow[]
      >(
        `
          SELECT
            aa.id,

            aa.status,

            aa.instrument,

            aus.title
              AS session_title,

            DATE_FORMAT(
              aus.audition_date,
              '%Y-%m-%d'
            ) AS audition_date,

            aa.created_at

          FROM audition_applications aa

          INNER JOIN audition_sessions aus
            ON aus.id = aa.session_id

          WHERE
            aa.user_id = ?

          ORDER BY
            aa.created_at DESC,
            aa.id DESC

          LIMIT 1
        `,
        [
          user.id,
        ],
      );

    const memberAudition =
      memberAuditions.length > 0
        ? memberAuditions[0]
        : null;

    /*
     * =================================
     * MEMBER SINCE
     * =================================
     */

    const memberSince =
      memberProfile
        ?.approved_at
        ? formatMemberSince(
            memberProfile
              .approved_at,
          )
        : null;

    /*
     * =================================
     * MEMBER PAGE
     * =================================
     */

    return (
      <main className="min-h-screen bg-[#f6f7fc]">

        {/* MEMBER SIDEBAR */}

        <MemberSidebar />

        {/* MAIN MEMBER CONTENT */}

        <div className="min-h-screen lg:pl-[230px]">

          {/* HEADER */}

          <MemberHeader
            fullName={
              user.fullName
            }
          />

          {/* DASHBOARD */}

          <div className="px-5 py-7 sm:px-6 lg:px-8 lg:py-8">

            <div className="mx-auto max-w-[1400px]">

              <MemberDashboard
                member={{
                  fullName:
                    user.fullName,

                  email:
                    user.email,

                  skill:
                    memberProfile
                      ?.primary_skill ??
                    null,

                  memberSince,
                }}
                stats={{
                  upcomingEvents:
                    upcomingEventsCount,

                  resources:
                    resourcesCount,

                  announcements:
                    announcementsCount,
                }}
                upcomingEvents={
                  upcomingEvents.map(
                    (
                      event,
                    ) => ({
                      id:
                        event.id,

                      title:
                        event.title,

                      date:
                        event.date,

                      time:
                        event.time,

                      venue:
                        event.venue,
                    }),
                  )
                }
                announcements={
                  announcements.map(
                    (
                      announcement,
                    ) => ({
                      id:
                        announcement.id,

                      title:
                        announcement.title,

                      slug:
                        announcement.slug,

                      shortDescription:
                        announcement.shortDescription,

                      publishedAt:
                        announcement.publishedAt,
                    }),
                  )
                }
                audition={
                  memberAudition
                    ? {
                        status:
                          memberAudition.status,

                        title:
                          memberAudition.session_title,

                        instrument:
                          memberAudition.instrument,
                      }
                    : null
                }
              />

            </div>

          </div>

        </div>

      </main>
    );
  }

  /*
   * =====================================================
   * GENERAL USER DASHBOARD
   * =====================================================
   */

  /*
   * =================================
   * LATEST MEMBERSHIP APPLICATION
   * =================================
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

        ORDER BY
          created_at DESC

        LIMIT 1
      `,
      [
        user.id,
      ],
    );

  const membership =
    membershipRequests.length > 0
      ? membershipRequests[0]
      : null;

  /*
   * =================================
   * LATEST AUDITION APPLICATION
   * =================================
   */

  const [auditionApplications] =
    await db.execute<
      AuditionApplicationRow[]
    >(
      `
        SELECT
          aa.id,

          aa.status,

          aa.instrument,

          aus.title
            AS session_title,

          DATE_FORMAT(
            aus.audition_date,
            '%Y-%m-%d'
          ) AS audition_date,

          aa.created_at

        FROM audition_applications aa

        INNER JOIN audition_sessions aus
          ON aus.id = aa.session_id

        WHERE
          aa.user_id = ?

        ORDER BY
          aa.created_at DESC,
          aa.id DESC

        LIMIT 1
      `,
      [
        user.id,
      ],
    );

  const auditionApplication =
    auditionApplications.length >
    0
      ? auditionApplications[0]
      : null;

  /*
   * =================================
   * GENERAL USER PAGE
   * =================================
   */

  return (
    <>
      <main className="min-h-screen bg-[#f7f8ff]">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <header className="border-b border-slate-200 bg-white">

          <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 lg:px-8">

            <BrandLogo
              priority
              className="h-12"
            />

            <LogoutButton />

          </div>

        </header>

        {/* ================================= */}
        {/* DASHBOARD CONTENT */}
        {/* ================================= */}

        <div className="mx-auto max-w-5xl px-6 py-14 lg:px-8 lg:py-16">

          {/* ================================= */}
          {/* DASHBOARD HEADING */}
          {/* ================================= */}

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

            <div>

              <div className="flex items-center gap-4">

                <span className="h-[3px] w-10 bg-red-600" />

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
                  Pentatone Dashboard
                </p>

              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                Welcome,{" "}
                {
                  user.fullName
                }
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                Manage your Pentatone
                account, membership
                application and audition
                activities.
              </p>

            </div>

            {/* ROLE BADGE */}

            <div className="w-fit rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white">
              General User
            </div>

          </div>

          {/* ================================= */}
          {/* ACCOUNT INFORMATION */}
          {/* ================================= */}

          <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">

            {/* CARD HEADER */}

            <div className="border-b border-slate-100 px-7 py-5">

              <h2 className="text-lg font-bold text-slate-900">
                Account Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your registered
                Pentatone account
                details.
              </p>

            </div>

            {/* INFORMATION */}

            <div className="grid gap-8 px-7 py-8 sm:grid-cols-2 lg:grid-cols-3">

              <AccountDetail
                label="Full Name"
                value={
                  user.fullName
                }
              />

              <AccountDetail
                label="Email Address"
                value={
                  user.email
                }
              />

              <AccountDetail
                label="Account Role"
                value={
                  user.role
                }
              />

            </div>

            {/* ================================= */}
            {/* NO MEMBERSHIP APPLICATION */}
            {/* ================================= */}

            {!membership && (
              <div className="mx-7 mb-8 rounded-2xl border border-red-200 bg-red-50 p-6">

                <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-600">
                  Club Membership
                </p>

                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  Become an Official
                  Member
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Your Pentatone
                  account is active,
                  but you are not an
                  official club member
                  yet. Submit a
                  membership
                  application to begin
                  the student
                  verification process.
                </p>

                <Link
                  href="/join-club"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-red-600 px-6 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Apply for Membership
                </Link>

              </div>
            )}

            {/* ================================= */}
            {/* MEMBERSHIP PENDING */}
            {/* ================================= */}

            {membership?.status ===
              "PENDING" && (
              <div className="mx-7 mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">

                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-600">
                      Membership
                      Application
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-amber-950">
                      Application Under
                      Review
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-800">
                      Your membership
                      application was
                      submitted
                      successfully and
                      is currently
                      waiting for review
                      by the Pentatone
                      administration.
                    </p>

                  </div>

                  <div className="w-fit rounded-full border border-amber-300 bg-amber-100 px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-amber-800">
                    Pending
                  </div>

                </div>

                <div className="mt-5 border-t border-amber-200 pt-5">

                  <p className="text-xs font-medium text-amber-700">
                    You do not need to
                    submit another
                    application while
                    this request is
                    being reviewed.
                  </p>

                </div>

              </div>
            )}

            {/* ================================= */}
            {/* MEMBERSHIP REJECTED */}
            {/* ================================= */}

            {membership?.status ===
              "REJECTED" && (
              <div className="mx-7 mb-8 rounded-2xl border border-red-200 bg-red-50 p-6">

                <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-600">
                  Membership
                  Application
                </p>

                <h3 className="mt-2 text-xl font-bold text-red-950">
                  Application Rejected
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-red-700">
                  Your previous
                  application was not
                  approved. Review the
                  administrator&apos;s
                  note, correct the
                  information and
                  submit a new
                  application.
                </p>

                {membership.admin_note && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-white p-5">

                    <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">
                      Admin Note
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {
                        membership.admin_note
                      }
                    </p>

                  </div>
                )}

                <Link
                  href="/join-club"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-red-600 px-6 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Reapply for
                  Membership
                </Link>

              </div>
            )}

            {/* ================================= */}
            {/* APPROVED SAFEGUARD */}
            {/* ================================= */}

            {membership?.status ===
              "APPROVED" && (
              <div className="mx-7 mb-8 rounded-2xl border border-green-200 bg-green-50 p-6">

                <p className="text-xs font-bold uppercase tracking-[0.14em] text-green-600">
                  Membership
                  Application
                </p>

                <h3 className="mt-2 text-xl font-bold text-green-950">
                  Membership Approved
                </h3>

                <p className="mt-2 text-sm leading-6 text-green-700">
                  Your application has
                  been approved. Your
                  membership account is
                  being updated.
                </p>

              </div>
            )}

          </section>

          {/* ================================= */}
          {/* GENERAL USER AUDITION */}
          {/* ================================= */}

          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">

            {/* HEADER */}

            <div className="border-b border-slate-100 px-7 py-5">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-600">
                    Audition
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    My Audition Status
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Track your latest
                    Pentatone audition
                    application and
                    result.
                  </p>

                </div>

                {auditionApplication && (
                  <AuditionStatusBadge
                    status={
                      auditionApplication.status
                    }
                  />
                )}

              </div>

            </div>

            {/* ================================= */}
            {/* APPLICATION EXISTS */}
            {/* ================================= */}

            {auditionApplication ? (
              <div className="px-7 py-7">

                <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Audition Session
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                      {
                        auditionApplication.session_title
                      }
                    </p>

                  </div>

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Instrument /
                      Skill
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                      {
                        auditionApplication.instrument
                      }
                    </p>

                  </div>

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Audition Date
                    </p>

                    <p className="mt-2 font-semibold text-slate-900">
                      {
                        auditionApplication.audition_date
                      }
                    </p>

                  </div>

                </div>

                {/* PENDING */}

                {auditionApplication.status ===
                  "PENDING" && (
                  <div className="mt-7 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">

                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-blue-600">
                      Application
                      Submitted
                    </p>

                    <p className="mt-2 text-sm leading-6 text-blue-800">
                      Your audition
                      application has
                      been submitted
                      successfully and
                      is waiting for
                      administrative
                      review.
                    </p>

                  </div>
                )}

                {/* UNDER REVIEW */}

                {auditionApplication.status ===
                  "UNDER_REVIEW" && (
                  <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">

                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-amber-600">
                      Evaluation In
                      Progress
                    </p>

                    <p className="mt-2 text-sm leading-6 text-amber-800">
                      Your audition is
                      currently being
                      evaluated by the
                      Pentatone
                      administration.
                      Please check your
                      dashboard again
                      for the final
                      result.
                    </p>

                  </div>
                )}

                {/* APPROVED */}

                {auditionApplication.status ===
                  "APPROVED" && (
                  <div className="mt-7 rounded-xl border border-green-200 bg-green-50 px-5 py-5">

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 font-black text-white">
                        ✓
                      </div>

                      <div>

                        <p className="text-xs font-bold uppercase tracking-[0.1em] text-green-600">
                          Audition Result
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-green-950">
                          Congratulations!
                          You Have Been
                          Selected
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-green-700">
                          Your audition
                          has been
                          evaluated
                          successfully
                          and you have
                          been selected
                          for this
                          audition
                          session.
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                {/* REJECTED */}

                {auditionApplication.status ===
                  "REJECTED" && (
                  <div className="mt-7 rounded-xl border border-red-200 bg-red-50 px-5 py-4">

                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-red-600">
                      Audition Result
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-red-950">
                      Not Selected This
                      Time
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-red-700">
                      Your audition has
                      been reviewed, but
                      you were not
                      selected for this
                      session. You can
                      apply again when
                      a new audition
                      session opens.
                    </p>

                  </div>
                )}

                {/* VIEW AUDITIONS */}

                <div className="mt-6 border-t border-slate-100 pt-6">

                  <Link
                    href="/auditions"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 transition hover:border-red-600 hover:text-red-600"
                  >
                    View Auditions
                  </Link>

                </div>

              </div>
            ) : (

              /* ================================= */
              /* NO AUDITION APPLICATION */
              /* ================================= */

              <div className="px-7 py-8">

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">

                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                    No Audition
                    Application
                  </p>

                  <h3 className="mt-2 text-lg font-bold text-slate-900">
                    Ready to showcase
                    your talent?
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    You have not
                    submitted an
                    audition
                    application yet.
                    Browse the
                    available audition
                    sessions and apply
                    when one is open.
                  </p>

                  <Link
                    href="/auditions"
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-red-600 px-6 text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    View Open Auditions
                  </Link>

                </div>

              </div>
            )}

          </section>

        </div>

      </main>

      {/* ================================= */}
      {/* GENERAL USER FOOTER */}
      {/* ================================= */}

      <Footer />
    </>
  );
}

/*
 * =================================
 * ACCOUNT DETAIL
 * =================================
 */

function AccountDetail({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div>

      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-base font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/*
 * =================================
 * AUDITION STATUS BADGE
 * =================================
 */

function AuditionStatusBadge({
  status,
}: {
  status:
    | "PENDING"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED";
}) {
  const styles = {
    PENDING:
      "border-blue-200 bg-blue-50 text-blue-700",

    UNDER_REVIEW:
      "border-amber-200 bg-amber-50 text-amber-700",

    APPROVED:
      "border-green-200 bg-green-50 text-green-700",

    REJECTED:
      "border-red-200 bg-red-50 text-red-700",
  }[status];

  const labels = {
    PENDING:
      "Pending",

    UNDER_REVIEW:
      "Under Review",

    APPROVED:
      "Selected",

    REJECTED:
      "Not Selected",
  }[status];

  return (
    <span
      className={`w-fit rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.09em] ${styles}`}
    >
      {labels}
    </span>
  );
}

/*
 * =================================
 * MEMBER SINCE FORMAT
 * =================================
 */

function formatMemberSince(
  value:
    | string
    | Date,
) {
  try {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        month: "short",
        year: "numeric",

        timeZone:
          "Asia/Dhaka",
      },
    ).format(
      new Date(value),
    );
  } catch {
    return null;
  }
}