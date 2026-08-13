import type {
  ReactNode,
} from "react";

import {
  CalendarDays,
  Clock3,
  MapPin,
  Mic2,
  UsersRound,
} from "lucide-react";

import AuditionApplicationForm from "@/components/auditions/audition-application-form";

/*
 * =====================================
 * TYPES
 * =====================================
 */

export type PublicAuditionSession = {
  id: number;

  title: string;

  slug: string;

  shortDescription: string;

  auditionDate: string;

  startTime: string;

  endTime: string;

  applicationDeadline: string;

  venue: string;

  coverImage:
    | string
    | null;

  applicantCount: number;
};

type Props = {
  session:
    PublicAuditionSession;
};

/*
 * =====================================
 * COMPONENT
 * =====================================
 */

export default function AuditionSessionCard({
  session,
}: Props) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
      {/* ================================= */}
      {/* COVER */}
      {/* ================================= */}

      <div className="relative h-[250px] overflow-hidden bg-[#101828] sm:h-[280px]">
        {session.coverImage ? (
          <img
            src={
              session.coverImage
            }
            alt={
              session.title
            }
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <Mic2 className="h-11 w-11 text-white/25" />

            <span className="mt-3 text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">
              Audition Session
            </span>
          </div>
        )}

        {/* ================================= */}
        {/* DARK GRADIENT */}
        {/* ================================= */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

        {/* ================================= */}
        {/* OPEN BADGE */}
        {/* ================================= */}

        <div className="absolute left-5 top-5">
          <span className="inline-flex rounded-full bg-[#d40000] px-4 py-2 text-[9px] font-black uppercase tracking-[0.08em] text-white shadow-lg">
            Applications Open
          </span>
        </div>

        {/* ================================= */}
        {/* DATE BADGE */}
        {/* ================================= */}

        <div className="absolute bottom-5 left-5 rounded-lg bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.06em] text-[#101828]">
          {formatShortDate(
            session.auditionDate,
          )}
        </div>
      </div>

      {/* ================================= */}
      {/* CONTENT */}
      {/* ================================= */}

      <div className="p-6 sm:p-7">
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#d40000]">
          Pentatone Audition
        </p>

        <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight text-[#101828]">
          {
            session.title
          }
        </h2>

        {/* ================================= */}
        {/* DESCRIPTION */}
        {/* ================================= */}

        {session.shortDescription && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
            {
              session.shortDescription
            }
          </p>
        )}

        {/* ================================= */}
        {/* DETAILS */}
        {/* ================================= */}

        <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
          {/* DATE */}

          <DetailRow
            icon={
              <CalendarDays />
            }
          >
            {formatFullDate(
              session.auditionDate,
            )}
          </DetailRow>

          {/* TIME */}

          {session.startTime && (
            <DetailRow
              icon={
                <Clock3 />
              }
            >
              {formatTime(
                session.startTime,
              )}

              {session.endTime
                ? ` – ${formatTime(
                    session.endTime,
                  )}`
                : ""}
            </DetailRow>
          )}

          {/* VENUE */}

          {session.venue && (
            <DetailRow
              icon={
                <MapPin />
              }
            >
              {
                session.venue
              }
            </DetailRow>
          )}

          {/* APPLICANTS */}

          <DetailRow
            icon={
              <UsersRound />
            }
          >
            {
              session.applicantCount
            }{" "}
            applicant
            {session.applicantCount ===
            1
              ? ""
              : "s"}{" "}
            registered
          </DetailRow>
        </div>

        {/* ================================= */}
        {/* DEADLINE */}
        {/* ================================= */}

        {session.applicationDeadline && (
          <div className="mt-6 rounded-xl bg-[#f7f8fc] px-4 py-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Application Deadline
            </p>

            <p className="mt-1 text-xs font-bold text-[#101828]">
              {formatDeadline(
                session.applicationDeadline,
              )}
            </p>
          </div>
        )}

        {/* ================================= */}
        {/* APPLY */}
        {/* ================================= */}

        <div className="mt-6">
          <AuditionApplicationForm
            sessionId={
              session.id
            }
            sessionTitle={
              session.title
            }
          />
        </div>
      </div>
    </article>
  );
}

/*
 * =====================================
 * DETAIL ROW
 * =====================================
 */

function DetailRow({
  icon,
  children,
}: {
  icon: ReactNode;

  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 text-sm text-slate-600">
      <span className="mt-0.5 shrink-0 text-[#d40000] [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>

      <span>
        {children}
      </span>
    </div>
  );
}

/*
 * =====================================
 * FULL DATE
 * =====================================
 */

function formatFullDate(
  value: string,
) {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday:
        "long",

      month:
        "long",

      day:
        "numeric",

      year:
        "numeric",

      timeZone:
        "UTC",
    },
  ).format(date);
}

/*
 * =====================================
 * SHORT DATE
 * =====================================
 */

function formatShortDate(
  value: string,
) {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",

      day:
        "2-digit",

      timeZone:
        "UTC",
    },
  )
    .format(date)
    .toUpperCase();
}

/*
 * =====================================
 * TIME
 * =====================================
 */

function formatTime(
  value: string,
) {
  const [
    hour,
    minute,
  ] = value
    .split(":")
    .map(Number);

  if (
    Number.isNaN(
      hour,
    ) ||
    Number.isNaN(
      minute,
    )
  ) {
    return value;
  }

  const date =
    new Date(
      2000,
      0,
      1,
      hour,
      minute,
    );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour:
        "numeric",

      minute:
        "2-digit",

      hour12:
        true,
    },
  ).format(date);
}

/*
 * =====================================
 * DEADLINE
 * =====================================
 */

function formatDeadline(
  value: string,
) {
  const match =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
    );

  if (!match) {
    return value;
  }

  const [
    ,
    year,
    month,
    day,
    hour,
    minute,
  ] = match;

  const date =
    new Date(
      Number(
        year,
      ),
      Number(
        month,
      ) - 1,
      Number(
        day,
      ),
      Number(
        hour,
      ),
      Number(
        minute,
      ),
    );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "long",

      day:
        "numeric",

      year:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",

      hour12:
        true,
    },
  ).format(date);
}