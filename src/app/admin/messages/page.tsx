import Link from "next/link";

import type {
  ReactNode,
} from "react";

import {
  Clock3,
  Mail,
  MailOpen,
  MessageSquareText,
  Phone,
  UserRound,
} from "lucide-react";

import type {
  RowDataPacket,
} from "mysql2";

import MessageActions from "@/components/admin/message-actions";

import db from "@/lib/db";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

/*
 * =====================================
 * TYPES
 * =====================================
 */

type ContactMessage =
  RowDataPacket & {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;

    status:
      | "UNREAD"
      | "READ";

    created_at:
      | string
      | Date;

    updated_at:
      | string
      | Date;
  };

type StatsRow =
  RowDataPacket & {
    total: number;
    unread: number;
    read_count: number;
  };

type MessagesPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

/*
 * =====================================
 * ADMIN MESSAGES PAGE
 * =====================================
 */

export default async function AdminMessagesPage({
  searchParams,
}: MessagesPageProps) {
  const params =
    await searchParams;

  const requestedStatus =
    params.status;

  const activeStatus:
    | "ALL"
    | "UNREAD"
    | "READ" =
    requestedStatus === "UNREAD" ||
    requestedStatus === "READ"
      ? requestedStatus
      : "ALL";

  /*
   * =====================================
   * LOAD MESSAGES
   * =====================================
   */

  let query = `
    SELECT
      id,
      full_name,
      email,
      phone,
      subject,
      message,
      status,
      created_at,
      updated_at

    FROM contact_messages
  `;

  const queryValues: string[] = [];

  if (
    activeStatus !== "ALL"
  ) {
    query += `
      WHERE status = ?
    `;

    queryValues.push(
      activeStatus,
    );
  }

  query += `
    ORDER BY
      CASE
        WHEN status = 'UNREAD'
        THEN 0
        ELSE 1
      END,

      created_at DESC
  `;

  const [messages] =
    await db.execute<
      ContactMessage[]
    >(
      query,
      queryValues,
    );

  /*
   * =====================================
   * LOAD STATS
   * =====================================
   */

  const [statsRows] =
    await db.execute<
      StatsRow[]
    >(
      `
        SELECT
          COUNT(*) AS total,

          SUM(
            CASE
              WHEN status = 'UNREAD'
              THEN 1
              ELSE 0
            END
          ) AS unread,

          SUM(
            CASE
              WHEN status = 'READ'
              THEN 1
              ELSE 0
            END
          ) AS read_count

        FROM contact_messages
      `,
    );

  const rawStats =
    statsRows[0];

  const stats = {
    total: Number(
      rawStats?.total ?? 0,
    ),

    unread: Number(
      rawStats?.unread ?? 0,
    ),

    read: Number(
      rawStats?.read_count ?? 0,
    ),
  };

  /*
   * =====================================
   * PAGE
   * =====================================
   */

  return (
  <div className="space-y-7 px-6 py-6 lg:px-8">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-red-600">
            Contact Management
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Messages
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            View and manage messages
            submitted through the public
            Contact Us page.
          </p>

        </div>

        <Link
          href="/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-[0.06em] text-slate-700 transition hover:border-red-200 hover:text-red-600"
        >
          <MessageSquareText className="h-4 w-4" />

          View Contact Page
        </Link>

      </div>

      {/* ================================= */}
      {/* STATS */}
      {/* ================================= */}

      <div className="grid gap-4 sm:grid-cols-3">

        <StatCard
          title="Total Messages"
          value={
            stats.total
          }
          icon={
            <MessageSquareText />
          }
        />

        <StatCard
          title="Unread"
          value={
            stats.unread
          }
          icon={
            <Mail />
          }
          highlight
        />

        <StatCard
          title="Read"
          value={
            stats.read
          }
          icon={
            <MailOpen />
          }
        />

      </div>

      {/* ================================= */}
      {/* FILTERS */}
      {/* ================================= */}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">

        <FilterLink
          label="All Messages"
          href="/admin/messages"
          active={
            activeStatus ===
            "ALL"
          }
        />

        <FilterLink
          label="Unread"
          href="/admin/messages?status=UNREAD"
          active={
            activeStatus ===
            "UNREAD"
          }
        />

        <FilterLink
          label="Read"
          href="/admin/messages?status=READ"
          active={
            activeStatus ===
            "READ"
          }
        />

      </div>

      {/* ================================= */}
      {/* MESSAGE LIST */}
      {/* ================================= */}

      {messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">

            <Mail className="h-6 w-6" />

          </div>

          <h2 className="mt-5 text-lg font-black text-slate-800">
            No Messages Found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            There are currently no contact
            messages matching this filter.
          </p>

        </div>
      ) : (
        <div className="space-y-4">

          {messages.map(
            (message) => (
              <article
                key={
                  message.id
                }
                className={`overflow-hidden rounded-2xl border bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] ${
                  message.status ===
                  "UNREAD"
                    ? "border-red-200"
                    : "border-slate-200"
                }`}
              >

                {/* ================================= */}
                {/* MESSAGE HEADER */}
                {/* ================================= */}

                <div
                  className={`border-b px-5 py-4 sm:px-6 ${
                    message.status ===
                    "UNREAD"
                      ? "border-red-100 bg-red-50/50"
                      : "border-slate-100 bg-slate-50/50"
                  }`}
                >

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex min-w-0 items-start gap-4">

                      {/* ICON */}

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          message.status ===
                          "UNREAD"
                            ? "bg-red-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {message.status ===
                        "UNREAD" ? (
                          <Mail className="h-5 w-5" />
                        ) : (
                          <MailOpen className="h-5 w-5" />
                        )}
                      </div>

                      {/* SUBJECT */}

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="break-words text-base font-black text-slate-900">
                            {
                              message.subject
                            }
                          </h2>

                          <StatusBadge
                            status={
                              message.status
                            }
                          />

                        </div>

                        {/* META */}

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">

                          <span className="inline-flex items-center gap-1.5">

                            <UserRound className="h-3.5 w-3.5" />

                            {
                              message.full_name
                            }

                          </span>

                          <span className="inline-flex items-center gap-1.5">

                            <Clock3 className="h-3.5 w-3.5" />

                            {formatDate(
                              message.created_at,
                            )}

                          </span>

                        </div>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <MessageActions
                      messageId={
                        message.id
                      }
                      status={
                        message.status
                      }
                    />

                  </div>

                </div>

                {/* ================================= */}
                {/* MESSAGE BODY */}
                {/* ================================= */}

                <div className="grid gap-6 px-5 py-6 sm:px-6 lg:grid-cols-[230px_1fr]">

                  {/* ================================= */}
                  {/* SENDER INFORMATION */}
                  {/* ================================= */}

                  <div className="space-y-5">

                    {/* NAME */}

                    <div>

                      <p className="text-[9px] font-black uppercase tracking-[0.08em] text-slate-400">
                        Sender
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {
                          message.full_name
                        }
                      </p>

                    </div>

                    {/* EMAIL */}

                    <div>

                      <p className="text-[9px] font-black uppercase tracking-[0.08em] text-slate-400">
                        Email
                      </p>

                      <a
                        href={`mailto:${message.email}`}
                        className="mt-1 block break-all text-xs font-semibold text-red-600 transition hover:text-red-700"
                      >
                        {
                          message.email
                        }
                      </a>

                    </div>

                    {/* PHONE */}

                    <div>

                      <p className="text-[9px] font-black uppercase tracking-[0.08em] text-slate-400">
                        Phone
                      </p>

                      {message.phone ? (
                        <a
                          href={`tel:${message.phone}`}
                          className="mt-1 inline-flex items-center gap-1.5 break-all text-xs font-semibold text-slate-700 transition hover:text-red-600"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0" />

                          {
                            message.phone
                          }
                        </a>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400">
                          Not provided
                        </p>
                      )}

                    </div>

                    {/* STATUS */}

                    <div>

                      <p className="text-[9px] font-black uppercase tracking-[0.08em] text-slate-400">
                        Status
                      </p>

                      <div className="mt-2">

                        <StatusBadge
                          status={
                            message.status
                          }
                        />

                      </div>

                    </div>

                  </div>

                  {/* ================================= */}
                  {/* FULL MESSAGE */}
                  {/* ================================= */}

                  <div className="rounded-xl border border-slate-100 bg-[#f8f9fc] p-5">

                    <div className="flex items-center gap-2">

                      <MessageSquareText className="h-4 w-4 text-red-600" />

                      <p className="text-[9px] font-black uppercase tracking-[0.08em] text-slate-400">
                        Message
                      </p>

                    </div>

                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                      {
                        message.message
                      }
                    </p>

                  </div>

                </div>

              </article>
            ),
          )}

        </div>
      )}

    </div>
  );
}

/*
 * =====================================
 * STAT CARD
 * =====================================
 */

function StatCard({
  title,
  value,
  icon,
  highlight = false,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.03)]">

      <div className="flex items-center justify-between gap-4">

        <div>

          <p className="text-[9px] font-black uppercase tracking-[0.08em] text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black text-slate-900">
            {value}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl [&>svg]:h-5 [&>svg]:w-5 ${
            highlight
              ? "bg-red-50 text-red-600"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

/*
 * =====================================
 * FILTER LINK
 * =====================================
 */

function FilterLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.05em] transition ${
        active
          ? "bg-red-600 text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      {label}
    </Link>
  );
}

/*
 * =====================================
 * STATUS BADGE
 * =====================================
 */

function StatusBadge({
  status,
}: {
  status:
    | "UNREAD"
    | "READ";
}) {
  if (
    status === "UNREAD"
  ) {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.06em] text-red-700">
        Unread
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.06em] text-green-700">
      Read
    </span>
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
      "en-GB",
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",

        timeZone:
          "Asia/Dhaka",
      },
    ).format(
      new Date(
        value,
      ),
    );
  } catch {
    return String(
      value,
    );
  }
}