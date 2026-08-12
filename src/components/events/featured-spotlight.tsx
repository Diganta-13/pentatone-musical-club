import Image from "next/image";
import Link from "next/link";

import type {
  RowDataPacket,
} from "mysql2";

import {
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

import db from "@/lib/db";

/*
 * =====================================
 * TYPE
 * =====================================
 */

interface FeaturedEventRow
  extends RowDataPacket {
  id: number;

  title: string;

  slug: string;

  short_description:
    | string
    | null;

  description:
    | string
    | null;

  event_date: string;

  start_time:
    | string
    | null;

  end_time:
    | string
    | null;

  venue:
    | string
    | null;

  cover_image:
    | string
    | null;

  registration_url:
    | string
    | null;

  is_featured:
    | number
    | boolean;
}

/*
 * =====================================
 * COMPONENT
 * =====================================
 */

export default async function FeaturedSpotlight() {
  /*
   * =====================================
   * TODAY
   * =====================================
   */

  const today =
    getTodayDateString();

  /*
   * =====================================
   * GET FEATURED EVENT
   *
   * Priority:
   * 1. Featured upcoming event
   * 2. Nearest upcoming published event
   * =====================================
   */

  const [rows] =
    await db.execute<
      FeaturedEventRow[]
    >(
      `
        SELECT
          id,
          title,
          slug,
          short_description,
          description,

          DATE_FORMAT(
            event_date,
            '%Y-%m-%d'
          ) AS event_date,

          TIME_FORMAT(
            start_time,
            '%H:%i'
          ) AS start_time,

          TIME_FORMAT(
            end_time,
            '%H:%i'
          ) AS end_time,

          venue,
          cover_image,
          registration_url,
          is_featured

        FROM events

        WHERE
          is_published = TRUE
          AND event_date >= ?

        ORDER BY
          is_featured DESC,
          event_date ASC,
          start_time ASC

        LIMIT 1
      `,
      [today],
    );

  /*
   * =====================================
   * NO UPCOMING EVENT
   * =====================================
   */

  if (
    rows.length === 0
  ) {
    return null;
  }

  const event =
    rows[0];

  const description =
    event.description ||
    event.short_description ||
    "Join Pentatone Musical Club for another memorable musical experience.";

  const coverImage =
    event.cover_image ||
    "/assets/images/events/featured-event.jpg";

  return (
    <section
      id="featured-event"
      className="scroll-mt-24 bg-[#f7f8fc] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* ================================= */}
        {/* SECTION HEADING */}
        {/* ================================= */}

        <div className="mb-9 flex items-center gap-4">
          <span className="h-[3px] w-12 bg-[#d40000]" />

          <h2 className="text-2xl font-bold uppercase text-[#101828] sm:text-3xl">
            Featured Spotlight
          </h2>
        </div>

        {/* ================================= */}
        {/* FEATURED EVENT */}
        {/* ================================= */}

        <div className="grid overflow-hidden rounded-xl bg-white shadow-[0_18px_45px_rgba(15,23,42,0.10)] lg:grid-cols-2">
          {/* ================================= */}
          {/* IMAGE */}
          {/* ================================= */}

          <div className="relative min-h-[420px] overflow-hidden lg:min-h-[500px]">
            <Image
              src={
                coverImage
              }
              alt={
                event.title
              }
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

            {/* DATE BADGE */}

            <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-3">
              <span className="bg-white px-4 py-2 text-[11px] font-bold uppercase text-[#d40000] shadow-sm">
                {formatEventBadgeDate(
                  event.event_date,
                )}
              </span>

              {Boolean(
                event.is_featured,
              ) && (
                <span className="bg-[#d40000] px-4 py-2 text-[11px] font-bold uppercase text-white shadow-sm">
                  Featured Event
                </span>
              )}
            </div>
          </div>

          {/* ================================= */}
          {/* INFORMATION */}
          {/* ================================= */}

          <div className="flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d40000]">
              Pentatone Event
            </p>

            <h3 className="mt-3 text-3xl font-bold leading-tight text-[#101828] sm:text-4xl">
              {
                event.title
              }
            </h3>

            <p className="mt-5 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
              {
                description
              }
            </p>

            {/* ================================= */}
            {/* EVENT META */}
            {/* ================================= */}

            <div className="mt-8 space-y-4">
              {/* DATE */}

              <div className="flex items-center gap-3 text-sm font-medium text-[#202939]">
                <CalendarDays className="h-5 w-5 text-[#d40000]" />

                <span>
                  {formatFullDate(
                    event.event_date,
                  )}
                </span>
              </div>

              {/* TIME */}

              {event.start_time && (
                <div className="flex items-center gap-3 text-sm font-medium text-[#202939]">
                  <Clock3 className="h-5 w-5 text-[#d40000]" />

                  <span>
                    {formatEventTime(
                      event.start_time,
                    )}

                    {event.end_time
                      ? ` – ${formatEventTime(
                          event.end_time,
                        )}`
                      : ""}
                  </span>
                </div>
              )}

              {/* VENUE */}

              {event.venue && (
                <div className="flex items-center gap-3 text-sm font-medium text-[#202939]">
                  <MapPin className="h-5 w-5 text-[#d40000]" />

                  <span>
                    {
                      event.venue
                    }
                  </span>
                </div>
              )}
            </div>

            {/* ================================= */}
            {/* ACTIONS */}
            {/* ================================= */}

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/events/${event.slug}`}
                className="inline-flex min-h-12 items-center justify-center bg-[#d40000] px-9 text-xs font-bold uppercase tracking-wider text-white shadow-[0_12px_25px_rgba(212,0,0,0.22)] transition hover:bg-[#b80000]"
              >
                View Details
              </Link>

              {event.registration_url && (
                <a
                  href={
                    event.registration_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center border border-[#101828] px-9 text-xs font-bold uppercase tracking-wider text-[#101828] transition hover:bg-[#101828] hover:text-white"
                >
                  Register Now
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/*
 * =====================================
 * TODAY - BANGLADESH
 * =====================================
 */

function getTodayDateString() {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          "Asia/Dhaka",

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",
      },
    ).formatToParts(
      new Date(),
    );

  const year =
    parts.find(
      (part) =>
        part.type ===
        "year",
    )?.value;

  const month =
    parts.find(
      (part) =>
        part.type ===
        "month",
    )?.value;

  const day =
    parts.find(
      (part) =>
        part.type ===
        "day",
    )?.value;

  return `${year}-${month}-${day}`;
}

/*
 * =====================================
 * BADGE DATE
 * AUG 15
 * =====================================
 */

function formatEventBadgeDate(
  value: string,
) {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

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
      month: "short",

      day: "2-digit",

      timeZone:
        "UTC",
    },
  )
    .format(date)
    .toUpperCase();
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
      weekday: "long",

      month: "long",

      day: "numeric",

      year: "numeric",

      timeZone:
        "UTC",
    },
  ).format(date);
}

/*
 * =====================================
 * TIME
 * =====================================
 */

function formatEventTime(
  value: string,
) {
  const [
    hourString,
    minuteString,
  ] = value.split(":");

  const hour =
    Number(
      hourString,
    );

  const minute =
    Number(
      minuteString,
    );

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