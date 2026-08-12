import Image from "next/image";
import Link from "next/link";

import type { RowDataPacket } from "mysql2";

import {
  CalendarDays,
  Images,
  Mic2,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

import MembershipActions from "@/components/admin/membership-actions";

import db from "@/lib/db";

interface CountRow extends RowDataPacket {
  total: number;
}

interface RequestRow extends RowDataPacket {
  id: number;
  full_name: string;
  department: string;
  primary_skill: string;

  status: "PENDING" | "APPROVED" | "REJECTED";

  created_at: Date;
}

const publicEvents = [
  {
    title: "Inter Department Music Competition",

    image: "/assets/images/events/event-competition.jpg",

    date: "NOV 15",

    type: "LIVE SHOW",

    status: "CONFIRMED",
  },

  {
    title: "Acoustic Evening",

    image: "/assets/images/events/event-acoustic.jpg",

    date: "DEC 05",

    type: "SESSION",

    status: "PLANNING",
  },

  {
    title: "Cultural Fest Performance",

    image: "/assets/images/events/event-cultural-fest.jpg",

    date: "JAN 20",

    type: "EVENT",

    status: "SCHEDULED",
  },
];

export default async function AdminDashboardPage() {
  const [userRows] = await db.execute<CountRow[]>(
    `
        SELECT COUNT(*) AS total
        FROM users
        WHERE is_active = TRUE
      `,
  );

  const [memberRows] = await db.execute<CountRow[]>(
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

  const [pendingRows] = await db.execute<CountRow[]>(
    `
        SELECT COUNT(*) AS total
        FROM membership_requests
        WHERE status = 'PENDING'
      `,
  );

  const [requests] = await db.execute<RequestRow[]>(
    `
        SELECT
          mr.id,
          u.full_name,
          d.short_name AS department,
          mr.primary_skill,
          mr.status,
          mr.created_at

        FROM membership_requests mr

        INNER JOIN users u
          ON u.id = mr.user_id

        INNER JOIN departments d
          ON d.id = mr.department_id

        ORDER BY mr.created_at DESC

        LIMIT 4
      `,
  );

  const totalUsers = userRows[0]?.total ?? 0;

  const members = memberRows[0]?.total ?? 0;

  const pending = pendingRows[0]?.total ?? 0;

  return (
    <>
      <main className="px-7 py-6 xl:px-10">
        <div className="mx-auto max-w-[1450px]">
          {/* Statistics */}

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Users"
              value={totalUsers}
              icon={<UsersRound />}
              accent="red"
              note="Registered"
            />

            <StatCard
              label="Club Members"
              value={members}
              icon={<Mic2 />}
              accent="dark"
              note="Active"
            />

            <StatCard
              label="Pending Requests"
              value={pending}
              icon={<UserRoundPlus />}
              accent="red"
              note={pending > 0 ? "Action" : "Clear"}
            />

            <StatCard
              label="Upcoming Events"
              value={publicEvents.length}
              icon={<CalendarDays />}
              accent="dark"
              note="2026"
            />
          </section>

          {/* Main dashboard grid */}

          <section className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
            {/* Requests */}

            <div className="overflow-hidden rounded-xl border border-red-200 bg-white">
              <div className="flex items-center justify-between border-b border-red-200 px-6 py-5">
                <h2 className="text-lg font-bold text-slate-950">
                  Recent Member Requests
                </h2>

                <Link
                  href="/admin/requests"
                  className="text-[10px] font-bold uppercase text-red-600"
                >
                  View All
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-[#f7f8fc]">
                    <tr>
                      <Head>Student Name</Head>

                      <Head>Department</Head>

                      <Head>Instrument</Head>

                      <Head>Date</Head>

                      <Head>Status</Head>

                      <Head>Actions</Head>
                    </tr>
                  </thead>

                  <tbody>
                    {requests.map((item) => (
                      <tr key={item.id} className="border-t border-red-100">
                        <Cell strong>{item.full_name}</Cell>

                        <Cell>{item.department}</Cell>

                        <Cell>
                          <span className="rounded bg-[#eef1fb] px-2 py-1 text-[10px] font-semibold text-slate-800">
                            {item.primary_skill}
                          </span>
                        </Cell>

                        <Cell>{formatDate(item.created_at)}</Cell>

                        <Cell>
                          <span
                            className={`text-[9px] font-bold uppercase ${
                              item.status === "PENDING"
                                ? "text-red-600"
                                : item.status === "APPROVED"
                                  ? "text-green-600"
                                  : "text-slate-500"
                            }`}
                          >
                            {item.status}
                          </span>
                        </Cell>

                        <Cell>
                          {item.status === "PENDING" ? (
                            <MembershipActions requestId={item.id} compact />
                          ) : (
                            <Link
                              href="/admin/requests"
                              className="text-[10px] font-bold uppercase text-red-600"
                            >
                              View
                            </Link>
                          )}
                        </Cell>
                      </tr>
                    ))}

                    {requests.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-16 text-center text-sm text-slate-500"
                        >
                          No membership requests yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right */}

            <div className="space-y-6">
              {/* Quick actions */}

              <section className="rounded-xl bg-black p-6 text-white">
                <h2 className="border-b border-white/20 pb-4 text-xs font-bold uppercase tracking-[0.12em]">
                  Quick Actions
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <QuickAction
                    label="Requests"
                    icon={<UserRoundPlus />}
                    href="/admin/requests"
                    enabled
                    red
                  />

<QuickAction
  label="Members"
  icon={<UsersRound />}
  href="/admin/members"
  enabled
/>
                  <QuickAction label="Gallery" icon={<Images />} />

                  <QuickAction label="Auditions" icon={<Mic2 />} />
                </div>
              </section>

              {/* Activity */}

              <section className="rounded-xl border border-red-200 bg-white p-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-slate-600">
                  Activity Overview
                </h2>

                <div className="mt-6 space-y-6">
                  {requests.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="relative pl-6">
                      {index < Math.min(requests.length, 3) - 1 && (
                        <span className="absolute left-[5px] top-4 h-[52px] w-px bg-red-200" />
                      )}

                      <span className="absolute left-0 top-1.5 h-[10px] w-[10px] rounded-full bg-red-600" />

                      <p className="text-sm font-bold text-slate-900">
                        {item.full_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Membership application {item.status.toLowerCase()}.
                      </p>

                      <p className="mt-2 text-[9px] font-bold uppercase text-red-600">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  ))}

                  {requests.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No recent activity.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </section>

          {/* Events */}

          <section className="mt-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Upcoming Events Management
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Oversee scheduling and participation logistics.
                </p>
              </div>

              <Link
                href="/events"
                className="rounded-full border-2 border-slate-900 px-6 py-2 text-[10px] font-bold uppercase text-slate-900 transition hover:bg-slate-900 hover:text-white"
              >
                View Schedule
              </Link>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {publicEvents.map((event) => (
                <article
                  key={event.title}
                  className="overflow-hidden rounded-xl border border-red-200 bg-white"
                >
                  <div className="relative h-[170px]">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />

                    <span className="absolute left-4 top-4 rounded bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-red-600">
                      {event.type}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="min-h-[58px] text-xl font-bold leading-tight text-slate-950">
                      {event.title}
                    </h3>

                    <div className="mt-4 flex items-center gap-2 border-b border-red-200 pb-4 text-xs text-slate-500">
                      <CalendarDays className="h-4 w-4" />

                      {event.date}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="flex items-center gap-2 text-[10px] font-bold uppercase text-green-600">
                        <span className="h-2 w-2 rounded-full bg-current" />

                        {event.status}
                      </p>

                      <button
                        type="button"
                        disabled
                        title="Event management will be connected in the Events module"
                        className="cursor-default rounded-md bg-black px-5 py-2.5 text-[9px] font-bold uppercase text-white opacity-60"
                      >
                        Manage Event
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}

      <footer className="mt-10 border-t border-red-200 px-7 py-5 xl:px-10">
        <div className="mx-auto flex max-w-[1450px] flex-col justify-between gap-4 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 Pentatone Musical Club. Sylhet Engineering College.</p>

          <div className="flex gap-6">
            <Link href="/" className="underline">
              Home
            </Link>

            <Link href="/gallery" className="underline">
              Gallery
            </Link>

            <Link href="/contact" className="underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
  note,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: "red" | "dark";
  note: string;
}) {
  return (
    <article
      className={`min-h-[155px] rounded-xl border border-slate-100 bg-white p-6 shadow-[0_15px_35px_rgba(15,23,42,0.06)] ${
        accent === "red"
          ? "border-t-[3px] border-t-red-600"
          : "border-t-[3px] border-t-black"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={accent === "red" ? "text-red-600" : "text-black"}>
          <div className="[&>svg]:h-7 [&>svg]:w-7">{icon}</div>
        </div>

        <span
          className={`text-[10px] font-bold ${
            note === "Active"
              ? "text-green-600"
              : accent === "red"
                ? "text-red-600"
                : "text-slate-600"
          }`}
        >
          {note}
        </span>
      </div>

      <p className="mt-6 text-[10px] font-medium uppercase text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-4xl font-black leading-none text-slate-950">
        {value}
      </p>
    </article>
  );
}

function Head({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-[0.13em] text-slate-500">
      {children}
    </th>
  );
}

function Cell({
  children,
  strong = false,
}: {
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <td
      className={`px-5 py-5 text-sm ${
        strong ? "font-bold text-slate-950" : "text-slate-600"
      }`}
    >
      {children}
    </td>
  );
}

function QuickAction({
  label,
  icon,
  href,
  enabled = false,
  red = false,
}: {
  label: string;
  icon: React.ReactNode;
  href?: string;
  enabled?: boolean;
  red?: boolean;
}) {
  const className = `flex min-h-[84px] flex-col items-center justify-center gap-3 rounded-lg text-[9px] font-bold uppercase transition ${
    red
      ? "bg-[#d90000] text-white hover:bg-[#ba0000]"
      : "bg-[#202020] text-white"
  }`;

  if (enabled && href) {
    return (
      <Link href={href} className={className}>
        <div className="[&>svg]:h-5 [&>svg]:w-5">{icon}</div>

        {label}
      </Link>
    );
  }

  return (
    <div
      title="This module will be connected next"
      className={`${className} cursor-default opacity-65`}
    >
      <div className="[&>svg]:h-5 [&>svg]:w-5">{icon}</div>

      {label}
    </div>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
