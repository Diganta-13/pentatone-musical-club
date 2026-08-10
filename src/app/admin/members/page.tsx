import Link from "next/link";

import type { RowDataPacket } from "mysql2";

import {
  GraduationCap,
  Mail,
  Music2,
  Search,
  UsersRound,
} from "lucide-react";

import db from "@/lib/db";

interface MemberRow extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;

  department: string | null;

  student_id: string | null;
  session: string | null;
  current_semester: string | null;
  phone: string | null;
  primary_skill: string | null;

  reviewed_at: Date | null;

  is_active: number | boolean;
}

interface CountRow extends RowDataPacket {
  total: number;
}

type MembersPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function MembersPage({
  searchParams,
}: MembersPageProps) {
  /*
   * ==============================
   * SEARCH
   * ==============================
   */

  const params = await searchParams;

  const search =
    params.q?.trim() || "";

  /*
   * ==============================
   * MEMBER COUNTS
   * ==============================
   */

  const [totalRows] =
    await db.execute<CountRow[]>(
      `
        SELECT COUNT(*) AS total

        FROM users u

        INNER JOIN roles r
          ON r.id = u.role_id

        WHERE r.name = 'MEMBER'
      `,
    );

  const [activeRows] =
    await db.execute<CountRow[]>(
      `
        SELECT COUNT(*) AS total

        FROM users u

        INNER JOIN roles r
          ON r.id = u.role_id

        WHERE
          r.name = 'MEMBER'
          AND u.is_active = TRUE
      `,
    );

  const totalMembers =
    totalRows[0]?.total ?? 0;

  const activeMembers =
    activeRows[0]?.total ?? 0;

  /*
   * ==============================
   * MEMBERS
   * ==============================
   */

  let members: MemberRow[] = [];

  if (search) {
    const keyword = `%${search}%`;

    const [rows] =
      await db.execute<MemberRow[]>(
        `
          SELECT
            u.id,
            u.full_name,
            u.email,
            u.is_active,

            d.short_name AS department,

            mr.student_id,
            mr.session,
            mr.current_semester,
            mr.phone,
            mr.primary_skill,
            mr.reviewed_at

          FROM users u

          INNER JOIN roles r
            ON r.id = u.role_id

          LEFT JOIN departments d
            ON d.id = u.department_id

          LEFT JOIN membership_requests mr
            ON mr.id = (
              SELECT mr2.id
              FROM membership_requests mr2

              WHERE
                mr2.user_id = u.id
                AND mr2.status = 'APPROVED'

              ORDER BY
                COALESCE(
                  mr2.reviewed_at,
                  mr2.updated_at
                ) DESC

              LIMIT 1
            )

          WHERE
            r.name = 'MEMBER'
            AND (
              u.full_name LIKE ?
              OR u.email LIKE ?
              OR mr.student_id LIKE ?
              OR mr.primary_skill LIKE ?
              OR d.short_name LIKE ?
            )

          ORDER BY
            u.full_name ASC
        `,
        [
          keyword,
          keyword,
          keyword,
          keyword,
          keyword,
        ],
      );

    members = rows;
  } else {
    const [rows] =
      await db.execute<MemberRow[]>(
        `
          SELECT
            u.id,
            u.full_name,
            u.email,
            u.is_active,

            d.short_name AS department,

            mr.student_id,
            mr.session,
            mr.current_semester,
            mr.phone,
            mr.primary_skill,
            mr.reviewed_at

          FROM users u

          INNER JOIN roles r
            ON r.id = u.role_id

          LEFT JOIN departments d
            ON d.id = u.department_id

          LEFT JOIN membership_requests mr
            ON mr.id = (
              SELECT mr2.id
              FROM membership_requests mr2

              WHERE
                mr2.user_id = u.id
                AND mr2.status = 'APPROVED'

              ORDER BY
                COALESCE(
                  mr2.reviewed_at,
                  mr2.updated_at
                ) DESC

              LIMIT 1
            )

          WHERE r.name = 'MEMBER'

          ORDER BY
            u.full_name ASC
        `,
      );

    members = rows;
  }

  return (
    <main className="px-7 py-7 xl:px-10">
      <div className="mx-auto max-w-[1450px]">
        {/* ============================== */}
        {/* PAGE HEADER */}
        {/* ============================== */}

        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-[3px] w-10 bg-red-600" />

              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">
                Member Management
              </p>
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Club Members
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              View approved Pentatone members
              and their verified academic and
              musical information.
            </p>
          </div>

          <Link
            href="/admin/requests"
            className="inline-flex h-11 w-fit items-center justify-center rounded-lg border border-red-200 bg-white px-5 text-xs font-bold uppercase tracking-[0.08em] text-red-600 transition hover:bg-red-50"
          >
            Membership Requests
          </Link>
        </section>

        {/* ============================== */}
        {/* STATS */}
        {/* ============================== */}

        <section className="mt-7 grid gap-5 sm:grid-cols-2">
          <StatCard
            label="Total Members"
            value={totalMembers}
            icon={<UsersRound />}
          />

          <StatCard
            label="Active Members"
            value={activeMembers}
            icon={<Music2 />}
            active
          />
        </section>

        {/* ============================== */}
        {/* SEARCH */}
        {/* ============================== */}

        <section className="mt-7 rounded-xl border border-red-100 bg-white p-5 shadow-sm">
          <form
            method="GET"
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Search by name, email, student ID, department or skill..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-[#f8f9fd] pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <button
              type="submit"
              className="h-11 rounded-lg bg-red-600 px-7 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-red-700"
            >
              Search
            </button>

            {search && (
              <Link
                href="/admin/members"
                className="flex h-11 items-center justify-center rounded-lg border border-slate-200 px-6 text-xs font-bold uppercase text-slate-600 transition hover:bg-slate-50"
              >
                Clear
              </Link>
            )}
          </form>
        </section>

        {/* ============================== */}
        {/* MEMBERS TABLE */}
        {/* ============================== */}

        <section className="mt-6 overflow-hidden rounded-xl border border-red-100 bg-white">
          <div className="flex items-center justify-between border-b border-red-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Members Directory
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {search
                  ? `${members.length} result(s) found`
                  : `${members.length} member(s)`}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px]">
              <thead className="bg-[#f7f8fc]">
                <tr>
                  <Head>Member</Head>
                  <Head>Student ID</Head>
                  <Head>Department</Head>
                  <Head>Session</Head>
                  <Head>Semester</Head>
                  <Head>Musical Skill</Head>
                  <Head>Phone</Head>
                  <Head>Joined</Head>
                  <Head>Status</Head>
                </tr>
              </thead>

              <tbody>
                {members.map(
                  (member) => (
                    <tr
                      key={member.id}
                      className="border-t border-red-50 transition hover:bg-slate-50/60"
                    >
                      {/* Member */}

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-black text-red-600">
                            {getInitials(
                              member.full_name,
                            )}
                          </div>

                          <div>
                            <p className="font-bold text-slate-950">
                              {
                                member.full_name
                              }
                            </p>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <Mail className="h-3 w-3" />

                              <span>
                                {
                                  member.email
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <Cell>
                        {member.student_id ||
                          "—"}
                      </Cell>

                      <Cell>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-red-500" />

                          <span>
                            {member.department ||
                              "—"}
                          </span>
                        </div>
                      </Cell>

                      <Cell>
                        {member.session ||
                          "—"}
                      </Cell>

                      <Cell>
                        {member.current_semester ||
                          "—"}
                      </Cell>

                      <Cell>
                        {member.primary_skill ? (
                          <span className="rounded-md bg-[#eef1fb] px-2.5 py-1.5 text-[10px] font-bold text-slate-700">
                            {
                              member.primary_skill
                            }
                          </span>
                        ) : (
                          "—"
                        )}
                      </Cell>

                      <Cell>
                        {member.phone ||
                          "—"}
                      </Cell>

                      <Cell>
                        {member.reviewed_at
                          ? formatDate(
                              member.reviewed_at,
                            )
                          : "—"}
                      </Cell>

                      <Cell>
                        {member.is_active ? (
                          <span className="rounded-full bg-green-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500">
                            Inactive
                          </span>
                        )}
                      </Cell>
                    </tr>
                  ),
                )}

                {members.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-20 text-center"
                    >
                      <UsersRound className="mx-auto h-10 w-10 text-slate-300" />

                      <p className="mt-4 font-bold text-slate-700">
                        No members found
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        {search
                          ? "Try a different search keyword."
                          : "Approved members will appear here."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

/*
 * ==============================
 * SMALL COMPONENTS
 * ==============================
 */

function StatCard({
  label,
  value,
  icon,
  active = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] ${
        active
          ? "border-t-[3px] border-green-500"
          : "border-t-[3px] border-red-600"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={
            active
              ? "text-green-600"
              : "text-red-600"
          }
        >
          <div className="[&>svg]:h-7 [&>svg]:w-7">
            {icon}
          </div>
        </div>

        {active && (
          <span className="text-[10px] font-bold uppercase text-green-600">
            Active
          </span>
        )}
      </div>

      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-4xl font-black text-slate-950">
        {value}
      </p>
    </article>
  );
}

function Head({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-[0.13em] text-slate-500">
      {children}
    </th>
  );
}

function Cell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="px-5 py-5 text-sm text-slate-600">
      {children}
    </td>
  );
}

function getInitials(
  fullName: string,
) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
    },
  ).format(new Date(date));
}