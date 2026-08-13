import Link from "next/link";

import type { ReactNode } from "react";
import type { RowDataPacket } from "mysql2";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Filter,
  MapPin,
  Mic2,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";

import AuditionEvaluationForm from "@/components/admin/audition-evaluation-form";
import AuditionSessionActions from "@/components/admin/audition-session-actions";
import AuditionSessionForm from "@/components/admin/audition-session-form";

import db from "@/lib/db";

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

type ApplicationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

type SessionStatus =
  | "DRAFT"
  | "OPEN"
  | "CLOSED"
  | "COMPLETED";

type EvaluationDecision =
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

/*
 * =========================================================
 * SESSION ROW
 * =========================================================
 */

interface SessionRow extends RowDataPacket {
  id: number;

  title: string;

  slug: string;

  short_description: string | null;

  description: string | null;

  requirements: string | null;

  audition_date: string;

  start_time: string | null;

  end_time: string | null;

  application_deadline: string | null;

  venue: string | null;

  cover_image: string | null;

  status: SessionStatus;

  is_published: number | boolean;

  applicant_count: number | string;
}

/*
 * =========================================================
 * APPLICATION ROW
 * =========================================================
 */

interface ApplicationRow extends RowDataPacket {
  id: number;

  session_id: number;

  session_title: string;

  user_id: number;

  full_name: string;

  avatar_url: string | null;

  student_id: string;

  department_short_name: string | null;

  instrument: string;

  experience_years: number | string | null;

  experience_details: string | null;

  video_url: string;

  applicant_note: string | null;

  status: ApplicationStatus;

  created_at: Date;

  evaluation_count: number | string;

  average_score: number | string | null;
}

/*
 * =========================================================
 * EVALUATION ROW
 * =========================================================
 */

interface EvaluationRow extends RowDataPacket {
  technical_skill: number | string;

  rhythm_timing: number | string;

  creativity: number | string;

  stage_presence: number | string;

  overall_performance: number | string;

  notes: string | null;

  decision: EvaluationDecision;
}

/*
 * =========================================================
 * PAGE PROPS
 * =========================================================
 */

type AdminAuditionsPageProps = {
  searchParams: Promise<{
    session?: string;

    instrument?: string;

    department?: string;

    status?: string;

    applicant?: string;

    limit?: string;
  }>;
};

/*
 * =========================================================
 * PAGE
 * =========================================================
 */

export default async function AdminAuditionsPage({
  searchParams,
}: AdminAuditionsPageProps) {
  const params = await searchParams;

  /*
   * =======================================================
   * LOAD SESSIONS
   * =======================================================
   */

  const [sessions] = await db.execute<SessionRow[]>(
    `
      SELECT
        aus.id,
        aus.title,
        aus.slug,
        aus.short_description,
        aus.description,
        aus.requirements,

        DATE_FORMAT(
          aus.audition_date,
          '%Y-%m-%d'
        ) AS audition_date,

        TIME_FORMAT(
          aus.start_time,
          '%H:%i'
        ) AS start_time,

        TIME_FORMAT(
          aus.end_time,
          '%H:%i'
        ) AS end_time,

        DATE_FORMAT(
          aus.application_deadline,
          '%Y-%m-%dT%H:%i'
        ) AS application_deadline,

        aus.venue,
        aus.cover_image,
        aus.status,
        aus.is_published,

        COUNT(
          aa.id
        ) AS applicant_count

      FROM audition_sessions aus

      LEFT JOIN audition_applications aa
        ON aa.session_id = aus.id

      GROUP BY
        aus.id,
        aus.title,
        aus.slug,
        aus.short_description,
        aus.description,
        aus.requirements,
        aus.audition_date,
        aus.start_time,
        aus.end_time,
        aus.application_deadline,
        aus.venue,
        aus.cover_image,
        aus.status,
        aus.is_published,
        aus.created_at

      ORDER BY
        aus.audition_date DESC,
        aus.created_at DESC
    `,
  );

  /*
   * =======================================================
   * SELECTED SESSION
   * =======================================================
   */

  const requestedSessionId = Number(params.session);

  const selectedSession =
    sessions.find(
      (session) =>
        session.id === requestedSessionId,
    ) ||
    sessions[0] ||
    null;

  /*
   * =======================================================
   * FILTER PARAMS
   * =======================================================
   */

  const selectedInstrument =
    params.instrument?.trim() || "all";

  const selectedDepartment =
    params.department?.trim() || "all";

  const selectedStatus =
    params.status?.trim().toLowerCase() || "all";

  const requestedApplicantId = Number(
    params.applicant,
  );

  const requestedLimit = Number(params.limit);

  const limit =
    Number.isInteger(requestedLimit) &&
    requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 8;

  /*
   * =======================================================
   * LOAD APPLICATIONS
   * =======================================================
   */

  const [applications] =
    await db.execute<ApplicationRow[]>(
      `
        SELECT
          aa.id,
          aa.session_id,

          aus.title
            AS session_title,

          aa.user_id,

          u.full_name,
          u.avatar_url,

          aa.student_id,

          d.short_name
            AS department_short_name,

          aa.instrument,
          aa.experience_years,
          aa.experience_details,
          aa.video_url,
          aa.applicant_note,
          aa.status,
          aa.created_at,

          COALESCE(
            evaluation_summary.evaluation_count,
            0
          ) AS evaluation_count,

          evaluation_summary.average_score

        FROM audition_applications aa

        INNER JOIN users u
          ON u.id = aa.user_id

        INNER JOIN audition_sessions aus
          ON aus.id = aa.session_id

        LEFT JOIN departments d
          ON d.id = aa.department_id

        LEFT JOIN (
          SELECT
            application_id,

            COUNT(*)
              AS evaluation_count,

            ROUND(
              AVG(
                technical_skill +
                rhythm_timing +
                creativity +
                stage_presence +
                overall_performance
              ),
              1
            ) AS average_score

          FROM audition_evaluations

          GROUP BY application_id
        ) evaluation_summary
          ON evaluation_summary.application_id =
             aa.id

        ORDER BY
          aa.created_at DESC,
          aa.id DESC
      `,
    );

  /*
   * =======================================================
   * APPLICATIONS FOR SELECTED SESSION
   * =======================================================
   */

  const sessionApplications = selectedSession
    ? applications.filter(
        (application) =>
          application.session_id ===
          selectedSession.id,
      )
    : [];

  /*
   * =======================================================
   * STATISTICS
   * =======================================================
   */

  const totalApplicants =
    sessionApplications.length;

  const pendingApplicants =
    sessionApplications.filter(
      (application) =>
        application.status === "PENDING" ||
        application.status === "UNDER_REVIEW",
    ).length;

  const approvedApplicants =
    sessionApplications.filter(
      (application) =>
        application.status === "APPROVED",
    ).length;

  const rejectedApplicants =
    sessionApplications.filter(
      (application) =>
        application.status === "REJECTED",
    ).length;

  /*
   * =======================================================
   * FILTER OPTIONS
   * =======================================================
   */

  const instruments = Array.from(
    new Set(
      sessionApplications
        .map(
          (application) =>
            application.instrument,
        )
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const departments = Array.from(
    new Set(
      sessionApplications
        .map(
          (application) =>
            application.department_short_name,
        )
        .filter(
          (
            department,
          ): department is string =>
            Boolean(department),
        ),
    ),
  ).sort((a, b) => a.localeCompare(b));

  /*
   * =======================================================
   * FILTER APPLICATIONS
   * =======================================================
   */

  const filteredApplications =
    sessionApplications.filter(
      (application) => {
        /*
         * INSTRUMENT
         */

        const instrumentMatches =
          selectedInstrument === "all" ||
          application.instrument ===
            selectedInstrument;

        /*
         * DEPARTMENT
         */

        const departmentMatches =
          selectedDepartment === "all" ||
          application.department_short_name ===
            selectedDepartment;

        /*
         * STATUS
         */

        let statusMatches = true;

        if (selectedStatus === "pending") {
          statusMatches =
            application.status === "PENDING";
        }

        if (
          selectedStatus === "under_review"
        ) {
          statusMatches =
            application.status ===
            "UNDER_REVIEW";
        }

        if (selectedStatus === "approved") {
          statusMatches =
            application.status ===
            "APPROVED";
        }

        if (selectedStatus === "rejected") {
          statusMatches =
            application.status ===
            "REJECTED";
        }

        return (
          instrumentMatches &&
          departmentMatches &&
          statusMatches
        );
      },
    );

  /*
   * =======================================================
   * SELECTED APPLICANT
   * =======================================================
   */

  const selectedApplicant =
    filteredApplications.find(
      (application) =>
        application.id ===
        requestedApplicantId,
    ) ||
    filteredApplications[0] ||
    null;

  /*
   * =======================================================
   * LOAD EVALUATION
   * =======================================================
   */

  let evaluation: EvaluationRow | null =
    null;

  if (selectedApplicant) {
    const [evaluationRows] =
      await db.execute<EvaluationRow[]>(
        `
          SELECT
            technical_skill,
            rhythm_timing,
            creativity,
            stage_presence,
            overall_performance,
            notes,
            decision

          FROM audition_evaluations

          WHERE application_id = ?

          ORDER BY
            updated_at DESC,
            evaluated_at DESC,
            id DESC

          LIMIT 1
        `,
        [selectedApplicant.id],
      );

    evaluation =
      evaluationRows[0] || null;
  }

  /*
   * =======================================================
   * PAGINATION
   * =======================================================
   */

  const visibleApplications =
    filteredApplications.slice(0, limit);

  const hasMore =
    filteredApplications.length >
    visibleApplications.length;

  /*
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-6 lg:px-8">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d40000]">
              Evaluation Portal
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#101828] sm:text-[34px]">
              Audition Evaluation
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Manage audition sessions,
              review applicants and
              evaluate musical talent.
            </p>
          </div>

          <AuditionSessionForm />
        </div>

        {/* ================================================= */}
        {/* AUDITION SESSIONS */}
        {/* ================================================= */}

        <section className="mt-9">
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#101828]">
              Audition Sessions
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {sessions.length} session
              {sessions.length === 1
                ? ""
                : "s"}{" "}
              created.
            </p>
          </div>

          {sessions.length > 0 ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sessions.map((session) => {
                const active =
                  selectedSession?.id ===
                  session.id;

                return (
                  <article
                    key={session.id}
                    className={`overflow-hidden rounded-2xl border bg-white ${
                      active
                        ? "border-red-300 shadow-[0_12px_30px_rgba(212,0,0,0.10)]"
                        : "border-gray-200 shadow-[0_8px_25px_rgba(15,23,42,0.04)]"
                    }`}
                  >
                    {/* COVER */}

                    <div className="relative h-40 overflow-hidden bg-[#101828]">
                      {session.cover_image ? (
                        <img
                          src={
                            session.cover_image
                          }
                          alt={session.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Mic2 className="h-9 w-9 text-white/25" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <SessionStatusBadge
                          status={
                            session.status
                          }
                        />

                        <PublishBadge
                          published={Boolean(
                            session.is_published,
                          )}
                        />
                      </div>
                    </div>

                    {/* CONTENT */}

                    <div className="p-5">
                      <h3 className="text-base font-black leading-snug text-[#101828]">
                        {session.title}
                      </h3>

                      {session.short_description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                          {
                            session.short_description
                          }
                        </p>
                      )}

                      {/* DETAILS */}

                      <div className="mt-4 space-y-2.5 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#d40000]" />

                          <span>
                            {formatDate(
                              session.audition_date,
                            )}
                          </span>
                        </div>

                        {session.start_time && (
                          <div className="flex items-center gap-2">
                            <Clock3 className="h-3.5 w-3.5 shrink-0 text-[#d40000]" />

                            <span>
                              {formatTime(
                                session.start_time,
                              )}

                              {session.end_time
                                ? ` – ${formatTime(
                                    session.end_time,
                                  )}`
                                : ""}
                            </span>
                          </div>
                        )}

                        {session.venue && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#d40000]" />

                            <span>
                              {session.venue}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* APPLICANTS */}

                      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                        <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-400">
                          Applicants
                        </span>

                        <span className="text-xl font-black text-[#101828]">
                          {Number(
                            session.applicant_count,
                          )}
                        </span>
                      </div>

                      {/* ACTIONS */}

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <Link
                          href={buildSessionHref(
                            session.id,
                          )}
                          className={`flex h-9 items-center justify-center rounded-lg text-[9px] font-black uppercase tracking-[0.05em] transition ${
                            active
                              ? "bg-[#101828] text-white"
                              : "border border-gray-200 bg-white text-[#101828] hover:border-red-200 hover:text-[#d40000]"
                          }`}
                        >
                          {active
                            ? "Selected"
                            : "Select Session"}
                        </Link>

                        <AuditionSessionActions
                          session={{
                            id: session.id,

                            title:
                              session.title,

                            shortDescription:
                              session.short_description ||
                              "",

                            description:
                              session.description ||
                              "",

                            requirements:
                              session.requirements ||
                              "",

                            auditionDate:
                              session.audition_date,

                            startTime:
                              session.start_time ||
                              "",

                            endTime:
                              session.end_time ||
                              "",

                            applicationDeadline:
                              session.application_deadline ||
                              "",

                            venue:
                              session.venue ||
                              "",

                            coverImage:
                              session.cover_image,

                            status:
                              session.status,

                            isPublished:
                              Boolean(
                                session.is_published,
                              ),
                          }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
              <Mic2 className="mx-auto h-9 w-9 text-gray-300" />

              <h3 className="mt-4 text-base font-black text-[#101828]">
                No Audition Sessions Yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Create your first
                audition session using
                the button above.
              </p>
            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* STATISTICS */}
        {/* ================================================= */}

        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Applicants"
            value={totalApplicants}
            icon={<UsersRound />}
            accent="navy"
            description={
              selectedSession
                ? selectedSession.title
                : "No session selected"
            }
          />

          <StatCard
            label="Pending"
            value={pendingApplicants}
            icon={<Clock3 />}
            accent="red"
            description="Pending + under review"
          />

          <StatCard
            label="Approved"
            value={approvedApplicants}
            icon={<CheckCircle2 />}
            accent="green"
            description="Passed auditions"
          />

          <StatCard
            label="Rejected"
            value={rejectedApplicants}
            icon={<XCircle />}
            accent="soft-red"
            description="Not selected"
          />
        </div>

        {/* ================================================= */}
        {/* APPLICANTS + EVALUATION */}
        {/* ================================================= */}

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          {/* ================================================= */}
          {/* LEFT SIDE */}
          {/* ================================================= */}

          <div className="min-w-0 space-y-4">
            {/* FILTERS */}

            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_25px_rgba(15,23,42,0.035)]">
              <form
                method="GET"
                className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]"
              >
                {selectedSession && (
                  <input
                    type="hidden"
                    name="session"
                    value={
                      selectedSession.id
                    }
                  />
                )}

                {/* INSTRUMENT */}

                <select
                  name="instrument"
                  defaultValue={
                    selectedInstrument
                  }
                  className="h-11 rounded-lg border border-transparent bg-[#eef2ff] px-4 text-xs font-medium text-[#344054] outline-none focus:border-red-200 focus:bg-white"
                >
                  <option value="all">
                    Instrument: All
                  </option>

                  {instruments.map(
                    (instrument) => (
                      <option
                        key={instrument}
                        value={instrument}
                      >
                        {instrument}
                      </option>
                    ),
                  )}
                </select>

                {/* DEPARTMENT */}

                <select
                  name="department"
                  defaultValue={
                    selectedDepartment
                  }
                  className="h-11 rounded-lg border border-transparent bg-[#eef2ff] px-4 text-xs font-medium text-[#344054] outline-none focus:border-red-200 focus:bg-white"
                >
                  <option value="all">
                    Department: All
                  </option>

                  {departments.map(
                    (department) => (
                      <option
                        key={department}
                        value={department}
                      >
                        {department}
                      </option>
                    ),
                  )}
                </select>

                {/* STATUS */}

                <select
                  name="status"
                  defaultValue={
                    selectedStatus
                  }
                  className="h-11 rounded-lg border border-transparent bg-[#eef2ff] px-4 text-xs font-medium text-[#344054] outline-none focus:border-red-200 focus:bg-white"
                >
                  <option value="all">
                    Status: All
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="under_review">
                    Under Review
                  </option>

                  <option value="approved">
                    Approved
                  </option>

                  <option value="rejected">
                    Rejected
                  </option>
                </select>

                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#e9efff] px-5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#101828] transition hover:bg-[#101828] hover:text-white"
                >
                  <Filter className="h-3.5 w-3.5" />

                  Apply
                </button>
              </form>
            </section>

            {/* ================================================= */}
            {/* APPLICANTS TABLE */}
            {/* ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                <h2 className="text-base font-black text-[#101828]">
                  Applicants
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {selectedSession
                    ? `${filteredApplications.length} applicant${
                        filteredApplications.length ===
                        1
                          ? ""
                          : "s"
                      } found in ${selectedSession.title}.`
                    : "Select an audition session first."}
                </p>
              </div>

              {visibleApplications.length >
              0 ? (
                <>
                  {/* DESKTOP */}

                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[830px] border-collapse">
                      <thead>
                        <tr className="bg-[#eef2ff]">
                          <TableHeading>
                            Profile
                          </TableHeading>

                          <TableHeading>
                            Name & ID
                          </TableHeading>

                          <TableHeading>
                            Dept & Instrument
                          </TableHeading>

                          <TableHeading>
                            Status
                          </TableHeading>

                          <TableHeading>
                            Score
                          </TableHeading>

                          <TableHeading align="right">
                            Action
                          </TableHeading>
                        </tr>
                      </thead>

                      <tbody>
                        {visibleApplications.map(
                          (application) => {
                            const active =
                              selectedApplicant?.id ===
                              application.id;

                            return (
                              <tr
                                key={
                                  application.id
                                }
                                className={`border-b border-gray-100 last:border-b-0 ${
                                  active
                                    ? "bg-red-50/40"
                                    : "bg-white hover:bg-[#fafbff]"
                                }`}
                              >
                                {/* PROFILE */}

                                <td className="px-5 py-5">
                                  <ApplicantAvatar
                                    name={
                                      application.full_name
                                    }
                                    src={
                                      application.avatar_url
                                    }
                                  />
                                </td>

                                {/* NAME */}

                                <td className="px-5 py-5">
                                  <p className="text-sm font-black text-[#101828]">
                                    {
                                      application.full_name
                                    }
                                  </p>

                                  <p className="mt-1 text-[10px] text-gray-500">
                                    {
                                      application.student_id
                                    }
                                  </p>
                                </td>

                                {/* DEPARTMENT */}

                                <td className="px-5 py-5">
                                  <p className="text-xs font-medium text-[#344054]">
                                    {application.department_short_name ||
                                      "—"}
                                  </p>

                                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.05em] text-[#d40000]">
                                    {
                                      application.instrument
                                    }
                                  </p>
                                </td>

                                {/* STATUS */}

                                <td className="px-5 py-5">
                                  <ApplicationStatusBadge
                                    status={
                                      application.status
                                    }
                                  />
                                </td>

                                {/* SCORE */}

                                <td className="px-5 py-5">
                                  {application.average_score !==
                                  null ? (
                                    <span className="text-sm font-black text-[#101828]">
                                      {Number(
                                        application.average_score,
                                      ).toFixed(
                                        1,
                                      )}
                                      /50
                                    </span>
                                  ) : (
                                    <span className="text-sm text-gray-400">
                                      —
                                    </span>
                                  )}
                                </td>

                                {/* ACTION */}

                                <td className="px-5 py-5 text-right">
                                  <Link
                                    href={buildApplicantHref(
                                      application.id,
                                      {
                                        sessionId:
                                          selectedSession?.id,

                                        instrument:
                                          selectedInstrument,

                                        department:
                                          selectedDepartment,

                                        status:
                                          selectedStatus,

                                        limit,
                                      },
                                    )}
                                    className={`text-[10px] font-black uppercase tracking-[0.06em] transition ${
                                      active
                                        ? "text-[#101828]"
                                        : "text-[#d40000] hover:text-[#a60000]"
                                    }`}
                                  >
                                    {active
                                      ? "Selected"
                                      : "Evaluate"}
                                  </Link>
                                </td>
                              </tr>
                            );
                          },
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE */}

                  <div className="divide-y divide-gray-100 lg:hidden">
                    {visibleApplications.map(
                      (application) => {
                        const active =
                          selectedApplicant?.id ===
                          application.id;

                        return (
                          <article
                            key={
                              application.id
                            }
                            className={`p-5 ${
                              active
                                ? "bg-red-50/40"
                                : "bg-white"
                            }`}
                          >
                            <div className="flex gap-4">
                              <ApplicantAvatar
                                name={
                                  application.full_name
                                }
                                src={
                                  application.avatar_url
                                }
                              />

                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-black text-[#101828]">
                                  {
                                    application.full_name
                                  }
                                </h3>

                                <p className="mt-1 text-[10px] text-gray-500">
                                  {
                                    application.student_id
                                  }
                                </p>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  <ApplicationStatusBadge
                                    status={
                                      application.status
                                    }
                                  />

                                  <span className="text-[9px] font-black uppercase text-red-600">
                                    {
                                      application.instrument
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>

                            <Link
                              href={buildApplicantHref(
                                application.id,
                                {
                                  sessionId:
                                    selectedSession?.id,

                                  instrument:
                                    selectedInstrument,

                                  department:
                                    selectedDepartment,

                                  status:
                                    selectedStatus,

                                  limit,
                                },
                              )}
                              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg border border-red-100 text-[10px] font-bold uppercase tracking-[0.05em] text-red-600"
                            >
                              {active
                                ? "Selected"
                                : "Evaluate"}
                            </Link>
                          </article>
                        );
                      },
                    )}
                  </div>

                  {/* LOAD MORE */}

                  {hasMore && (
                    <div className="border-t border-gray-100 bg-[#f4f6fd] px-5 py-4 text-center">
                      <Link
                        href={buildLoadMoreHref(
                          limit + 8,
                          {
                            sessionId:
                              selectedSession?.id,

                            instrument:
                              selectedInstrument,

                            department:
                              selectedDepartment,

                            status:
                              selectedStatus,

                            applicant:
                              selectedApplicant?.id,
                          },
                        )}
                        className="text-[9px] font-black uppercase tracking-[0.14em] text-[#101828] transition hover:text-[#d40000]"
                      >
                        Load More Applicants
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                /* EMPTY */

                <div className="px-6 py-20 text-center">
                  <UserRound className="mx-auto h-9 w-9 text-gray-300" />

                  <h3 className="mt-4 text-base font-black text-[#101828]">
                    No Applicants Found
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {selectedSession
                      ? "Applications for this audition session will appear here."
                      : "Create or select an audition session first."}
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* ================================================= */}
          {/* RIGHT EVALUATION PANEL */}
          {/* ================================================= */}

          <aside className="xl:sticky xl:top-6">
            {selectedApplicant ? (
              <div className="overflow-hidden rounded-2xl border border-gray-200 border-t-[3px] border-t-[#d40000] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
                {/* APPLICANT HEADER */}

                <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-5">
                  <ApplicantAvatar
                    name={
                      selectedApplicant.full_name
                    }
                    src={
                      selectedApplicant.avatar_url
                    }
                    large
                  />

                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-black leading-tight text-[#101828]">
                      {
                        selectedApplicant.full_name
                      }
                    </h2>

                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.05em] text-[#d40000]">
                      {
                        selectedApplicant.instrument
                      }
                    </p>

                    {selectedApplicant.experience_years !==
                      null && (
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.04em] text-gray-500">
                        {Number(
                          selectedApplicant.experience_years,
                        ).toFixed(
                          1,
                        )}{" "}
                        years experience
                      </p>
                    )}
                  </div>

                  <ApplicationStatusBadge
                    status={
                      selectedApplicant.status
                    }
                  />
                </div>

                <div className="space-y-6 px-5 py-5">
                  {/* VIDEO */}

                  <section>
                    <div className="overflow-hidden rounded-xl bg-black">
                      <video
                        src={
                          selectedApplicant.video_url
                        }
                        controls
                        preload="metadata"
                        className="aspect-video w-full bg-black object-contain"
                      />
                    </div>

                    <a
                      href={
                        selectedApplicant.video_url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.06em] text-gray-500 transition hover:text-[#d40000]"
                    >
                      Open Video

                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </section>

                  {/* STUDENT INFO */}

                  <section className="rounded-xl bg-[#f7f8fc] p-4">
                    <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-gray-400">
                      Audition Session
                    </p>

                    <p className="mt-1 text-xs font-black text-[#101828]">
                      {
                        selectedApplicant.session_title
                      }
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
                      <div>
                        <p className="text-[8px] font-bold uppercase text-gray-400">
                          Student ID
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-[#101828]">
                          {
                            selectedApplicant.student_id
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-[8px] font-bold uppercase text-gray-400">
                          Department
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-[#101828]">
                          {selectedApplicant.department_short_name ||
                            "—"}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* EXPERIENCE */}

                  {selectedApplicant.experience_details && (
                    <section className="rounded-xl border border-gray-100 p-4">
                      <p className="text-[8px] font-black uppercase tracking-[0.1em] text-gray-400">
                        Experience
                      </p>

                      <p className="mt-2 text-xs leading-5 text-gray-600">
                        {
                          selectedApplicant.experience_details
                        }
                      </p>
                    </section>
                  )}

                  {/* APPLICANT NOTE */}

                  {selectedApplicant.applicant_note && (
                    <section className="rounded-xl border border-gray-100 p-4">
                      <p className="text-[8px] font-black uppercase tracking-[0.1em] text-gray-400">
                        Applicant Note
                      </p>

                      <p className="mt-2 text-xs leading-5 text-gray-600">
                        {
                          selectedApplicant.applicant_note
                        }
                      </p>
                    </section>
                  )}

                  {/* ================================================= */}
                  {/* FUNCTIONAL EVALUATION FORM */}
                  {/* ================================================= */}

                  <AuditionEvaluationForm
                    key={
                      selectedApplicant.id
                    }
                    applicationId={
                      selectedApplicant.id
                    }
                    initialTechnicalSkill={Number(
                      evaluation?.technical_skill ??
                        0,
                    )}
                    initialRhythmTiming={Number(
                      evaluation?.rhythm_timing ??
                        0,
                    )}
                    initialCreativity={Number(
                      evaluation?.creativity ??
                        0,
                    )}
                    initialStagePresence={Number(
                      evaluation?.stage_presence ??
                        0,
                    )}
                    initialOverallPerformance={Number(
                      evaluation?.overall_performance ??
                        0,
                    )}
                    initialNotes={
                      evaluation?.notes ||
                      ""
                    }
                    initialDecision={
                      evaluation?.decision ||
                      null
                    }
                  />
                </div>
              </div>
            ) : (
              /* ================================================= */
              /* NO SELECTED APPLICANT */
              /* ================================================= */

              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                <Mic2 className="mx-auto h-9 w-9 text-gray-300" />

                <h3 className="mt-4 text-base font-black text-[#101828]">
                  No Applicant Selected
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {selectedSession
                    ? "Select an applicant from the list to review the audition."
                    : "Select an audition session first."}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * SESSION STATUS BADGE
 * =========================================================
 */

function SessionStatusBadge({
  status,
}: {
  status: SessionStatus;
}) {
  const style = {
    DRAFT:
      "bg-slate-600 text-white",

    OPEN:
      "bg-green-600 text-white",

    CLOSED:
      "bg-amber-500 text-white",

    COMPLETED:
      "bg-[#101828] text-white",
  }[status];

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.06em] ${style}`}
    >
      {status}
    </span>
  );
}

/*
 * =========================================================
 * PUBLISH BADGE
 * =========================================================
 */

function PublishBadge({
  published,
}: {
  published: boolean;
}) {
  return (
    <span
      className={`rounded-full bg-white px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.06em] ${
        published
          ? "text-green-700"
          : "text-gray-500"
      }`}
    >
      {published
        ? "Published"
        : "Not Published"}
    </span>
  );
}

/*
 * =========================================================
 * STAT CARD
 * =========================================================
 */

function StatCard({
  label,
  value,
  icon,
  description,
  accent,
}: {
  label: string;

  value: number;

  icon: ReactNode;

  description: string;

  accent:
    | "navy"
    | "red"
    | "green"
    | "soft-red";
}) {
  const accentClass = {
    navy:
      "border-t-[#101828]",

    red:
      "border-t-[#d40000]",

    green:
      "border-t-green-600",

    "soft-red":
      "border-t-red-200",
  }[accent];

  return (
    <div
      className={`rounded-2xl border border-gray-200 border-t-[3px] bg-white p-5 shadow-[0_8px_25px_rgba(15,23,42,0.035)] ${accentClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-500">
            {label}
          </p>

          <p
            className={`mt-2 text-3xl font-black tracking-tight ${
              accent === "red"
                ? "text-[#d40000]"
                : "text-[#101828]"
            }`}
          >
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#d40000] [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </div>
      </div>

      <p className="mt-4 truncate text-[9px] text-gray-400">
        {description}
      </p>
    </div>
  );
}

/*
 * =========================================================
 * TABLE HEADING
 * =========================================================
 */

function TableHeading({
  children,
  align = "left",
}: {
  children: ReactNode;

  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-5 py-4 text-[8px] font-black uppercase tracking-[0.13em] text-gray-600 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

/*
 * =========================================================
 * APPLICANT AVATAR
 * =========================================================
 */

function ApplicantAvatar({
  name,
  src,
  large = false,
}: {
  name: string;

  src: string | null;

  large?: boolean;
}) {
  const sizeClass = large
    ? "h-12 w-12"
    : "h-10 w-10";

  if (src) {
    return (
      <div
        className={`${sizeClass} shrink-0 overflow-hidden rounded-lg bg-slate-100`}
      >
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-lg bg-[#101828] text-[10px] font-black uppercase text-white`}
    >
      {getInitials(name)}
    </div>
  );
}

/*
 * =========================================================
 * APPLICATION STATUS
 * =========================================================
 */

function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  const style = {
    PENDING:
      "bg-blue-50 text-blue-700",

    UNDER_REVIEW:
      "bg-amber-50 text-amber-700",

    APPROVED:
      "bg-green-50 text-green-700",

    REJECTED:
      "bg-red-50 text-red-600",
  }[status];

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.05em] ${style}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

/*
 * =========================================================
 * INITIALS
 * =========================================================
 */

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase();
}

/*
 * =========================================================
 * DATE FORMAT
 * =========================================================
 */

function formatDate(value: string) {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return value;
  }

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
    ),
  );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(date);
}

/*
 * =========================================================
 * TIME FORMAT
 * =========================================================
 */

function formatTime(value: string) {
  const [hour, minute] = value
    .split(":")
    .map(Number);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return value;
  }

  const date = new Date(
    2000,
    0,
    1,
    hour,
    minute,
  );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    },
  ).format(date);
}

/*
 * =========================================================
 * SESSION LINK
 * =========================================================
 */

function buildSessionHref(
  sessionId: number,
) {
  return `/admin/auditions?session=${sessionId}`;
}

/*
 * =========================================================
 * APPLICANT LINK
 * =========================================================
 */

function buildApplicantHref(
  applicantId: number,
  options: {
    sessionId?: number;

    instrument: string;

    department: string;

    status: string;

    limit: number;
  },
) {
  const search =
    new URLSearchParams();

  if (options.sessionId) {
    search.set(
      "session",
      String(options.sessionId),
    );
  }

  if (
    options.instrument !== "all"
  ) {
    search.set(
      "instrument",
      options.instrument,
    );
  }

  if (
    options.department !== "all"
  ) {
    search.set(
      "department",
      options.department,
    );
  }

  if (options.status !== "all") {
    search.set(
      "status",
      options.status,
    );
  }

  search.set(
    "applicant",
    String(applicantId),
  );

  search.set(
    "limit",
    String(options.limit),
  );

  return `/admin/auditions?${search.toString()}`;
}

/*
 * =========================================================
 * LOAD MORE LINK
 * =========================================================
 */

function buildLoadMoreHref(
  nextLimit: number,
  options: {
    sessionId?: number;

    instrument: string;

    department: string;

    status: string;

    applicant?: number;
  },
) {
  const search =
    new URLSearchParams();

  if (options.sessionId) {
    search.set(
      "session",
      String(options.sessionId),
    );
  }

  if (
    options.instrument !== "all"
  ) {
    search.set(
      "instrument",
      options.instrument,
    );
  }

  if (
    options.department !== "all"
  ) {
    search.set(
      "department",
      options.department,
    );
  }

  if (options.status !== "all") {
    search.set(
      "status",
      options.status,
    );
  }

  if (options.applicant) {
    search.set(
      "applicant",
      String(options.applicant),
    );
  }

  search.set(
    "limit",
    String(nextLimit),
  );

  return `/admin/auditions?${search.toString()}`;
}