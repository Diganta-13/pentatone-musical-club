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
 * TYPES
 * =====================================
 */

interface EventRow
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

  event_type:
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

export default async function EventCalendar() {
  /*
   * =====================================
   * TODAY
   * =====================================
   */

  const today =
    getTodayDateString();

  /*
   * =====================================
   * LOAD PUBLISHED UPCOMING EVENTS
   * =====================================
   */

  const [events] =
    await db.execute<
      EventRow[]
    >(
      `
        SELECT
          id,
          title,
          slug,
          short_description,
          description,
          event_type,

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
          event_date ASC,
          start_time ASC,
          created_at DESC
      `,
      [today],
    );

  return (
    <section
      id="event-calendar"
      className="scroll-mt-24 bg-[#eef2ff] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div>
          <div className="flex items-center gap-4">
            <span className="h-[3px] w-12 bg-[#d40000]" />

            <h2 className="text-2xl font-bold uppercase text-[#101828] sm:text-3xl">
              Full Event Calendar
            </h2>
          </div>

          <p className="mt-4 max-w-xl text-sm leading-6 text-gray-600">
            Do not miss a single beat.
            Explore upcoming Pentatone
            events, performances and
            musical sessions.
          </p>
        </div>

        {/* ================================= */}
        {/* EVENT CARDS */}
        {/* ================================= */}

        {events.length > 0 ? (
          <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {events.map(
              (event) => {
                const description =
                  event.short_description ||
                  event.description ||
                  "Join Pentatone Musical Club for another memorable musical event.";

                const coverImage =
                  event.cover_image ||
                  "/assets/images/events/featured-event.jpg";

                return (
                  <article
                    key={
                      event.id
                    }
                    className="flex overflow-hidden rounded-xl border-t-[3px] border-[#d40000] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex w-full flex-col">
                      {/* ================================= */}
                      {/* IMAGE */}
                      {/* ================================= */}

                      <div className="relative h-56 overflow-hidden bg-[#101828]">
                        <Image
                          src={
                            coverImage
                          }
                          alt={
                            event.title
                          }
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-black/5" />

                        {/* FEATURED */}

                        {Boolean(
                          event.is_featured,
                        ) && (
                          <span className="absolute left-4 top-4 rounded-full bg-[#d40000] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white shadow">
                            Featured
                          </span>
                        )}

                        {/* TYPE */}

                        {event.event_type && (
                          <span className="absolute right-4 top-4 rounded-full bg-black/65 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm">
                            {
                              event.event_type
                            }
                          </span>
                        )}

                        {/* DATE */}

                        <span className="absolute bottom-4 left-4 bg-white px-3 py-1.5 text-[10px] font-bold uppercase text-[#101828] shadow">
                          {formatBadgeDate(
                            event.event_date,
                          )}
                        </span>
                      </div>

                      {/* ================================= */}
                      {/* CONTENT */}
                      {/* ================================= */}

                      <div className="flex flex-1 flex-col px-6 py-7">
                        <h3 className="text-2xl font-bold leading-tight text-[#101828]">
                          {
                            event.title
                          }
                        </h3>

                        {/* META */}

                        <div className="mt-5 space-y-3 text-sm text-gray-600">
                          {/* DATE */}

                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 shrink-0 text-[#d40000]" />

                            <span>
                              {formatFullDate(
                                event.event_date,
                              )}
                            </span>
                          </div>

                          {/* TIME */}

                          {event.start_time && (
                            <div className="flex items-center gap-2">
                              <Clock3 className="h-4 w-4 shrink-0 text-[#d40000]" />

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
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 shrink-0 text-[#d40000]" />

                              <span>
                                {
                                  event.venue
                                }
                              </span>
                            </div>
                          )}
                        </div>

                        {/* DESCRIPTION */}

                        <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                          {
                            description
                          }
                        </p>

                        {/* ================================= */}
                        {/* ACTIONS */}
                        {/* ================================= */}

                        <div className="mt-auto space-y-3 pt-7">
                          {/* REGISTER */}

                          {event.registration_url && (
                            <a
                              href={
                                event.registration_url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex min-h-11 items-center justify-center bg-[#d40000] px-5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#b80000]"
                            >
                              Register Now
                            </a>
                          )}

                          {/* VIEW DETAILS */}

                          <Link
                            href={`/events/${event.slug}`}
                            className="flex min-h-11 w-full items-center justify-center border border-[#101828] bg-white px-5 text-xs font-bold uppercase tracking-wider text-[#101828] transition hover:bg-[#101828] hover:text-white"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        ) : (
          /* ================================= */
          /* EMPTY STATE */
          /* ================================= */

          <div className="mt-10 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <CalendarDays className="mx-auto h-9 w-9 text-gray-300" />

            <h3 className="mt-4 text-lg font-bold text-[#101828]">
              No Upcoming Events
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              New Pentatone events
              will appear here once
              they are published.
            </p>
          </div>
        )}
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
 * =====================================
 */

function formatBadgeDate(
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
 * EVENT TIME
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