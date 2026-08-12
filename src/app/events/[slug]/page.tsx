import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import type {
  RowDataPacket,
} from "mysql2";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  Tag,
} from "lucide-react";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

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
 * PAGE PROPS
 * =====================================
 */

type EventDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/*
 * =====================================
 * PAGE
 * =====================================
 */

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  /*
   * =====================================
   * SLUG
   * =====================================
   */

  const { slug } =
    await params;

  /*
   * =====================================
   * LOAD EVENT
   *
   * Only published events are public.
   * =====================================
   */

  const [rows] =
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
          slug = ?
          AND is_published = TRUE

        LIMIT 1
      `,
      [slug],
    );

  /*
   * =====================================
   * NOT FOUND
   * =====================================
   */

  if (
    rows.length === 0
  ) {
    notFound();
  }

  const event =
    rows[0];

  const coverImage =
    event.cover_image ||
    "/assets/images/events/featured-event.jpg";

  const fullDescription =
    event.description ||
    event.short_description ||
    "Join Pentatone Musical Club for another memorable musical experience.";

  /*
   * =====================================
   * UPCOMING / PAST
   * =====================================
   */

  const today =
    getTodayDateString();

  const isUpcoming =
    event.event_date >=
    today;

  /*
   * =====================================
   * RENDER
   * =====================================
   */

  return (
    <>
      <Navbar />

      <main className="bg-[#f7f8fc]">
        {/* ================================= */}
        {/* HERO */}
        {/* ================================= */}

        <section className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-6 pb-10 pt-10 lg:px-8 lg:pb-14">
            {/* BACK */}

            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500 transition hover:text-[#d40000]"
            >
              <ArrowLeft className="h-4 w-4" />

              Back to Events
            </Link>

            {/* ================================= */}
            {/* MAIN GRID */}
            {/* ================================= */}

            <div className="mt-8 grid overflow-hidden rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.10)] lg:grid-cols-[1.08fr_0.92fr]">
              {/* ================================= */}
              {/* COVER */}
              {/* ================================= */}

              <div className="relative min-h-[420px] overflow-hidden bg-[#101828] sm:min-h-[520px] lg:min-h-[650px]">
                <Image
                  src={
                    coverImage
                  }
                  alt={
                    event.title
                  }
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

                {/* STATUS */}

                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-white ${
                      isUpcoming
                        ? "bg-[#d40000]"
                        : "bg-black/70"
                    }`}
                  >
                    {isUpcoming
                      ? "Upcoming"
                      : "Past Event"}
                  </span>

                  {Boolean(
                    event.is_featured,
                  ) && (
                    <span className="rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#d40000]">
                      Featured
                    </span>
                  )}
                </div>

                {/* DATE */}

                <div className="absolute bottom-5 left-5">
                  <span className="inline-flex bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#101828] shadow-lg">
                    {formatBadgeDate(
                      event.event_date,
                    )}
                  </span>
                </div>
              </div>

              {/* ================================= */}
              {/* EVENT INFO */}
              {/* ================================= */}

              <div className="flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-12 lg:py-14">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d40000]">
                  Pentatone Musical Club
                </p>

                {/* TYPE */}

                {event.event_type && (
                  <div className="mt-5">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#344054]">
                      <Tag className="h-3 w-3 text-[#d40000]" />

                      {
                        event.event_type
                      }
                    </span>
                  </div>
                )}

                {/* TITLE */}

                <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-[#101828] sm:text-4xl lg:text-5xl">
                  {
                    event.title
                  }
                </h1>

                {/* SHORT DESCRIPTION */}

                {event.short_description && (
                  <p className="mt-5 text-base leading-7 text-gray-600">
                    {
                      event.short_description
                    }
                  </p>
                )}

                {/* ================================= */}
                {/* META */}
                {/* ================================= */}

                <div className="mt-8 space-y-4 border-y border-gray-100 py-6">
                  {/* DATE */}

                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#d40000]">
                      <CalendarDays className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#101828]">
                        {formatFullDate(
                          event.event_date,
                        )}
                      </p>
                    </div>
                  </div>

                  {/* TIME */}

                  {event.start_time && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#d40000]">
                        <Clock3 className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                          Time
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#101828]">
                          {formatEventTime(
                            event.start_time,
                          )}

                          {event.end_time
                            ? ` – ${formatEventTime(
                                event.end_time,
                              )}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* VENUE */}

                  {event.venue && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#d40000]">
                        <MapPin className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                          Venue
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#101828]">
                          {
                            event.venue
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ================================= */}
                {/* BUTTONS */}
                {/* ================================= */}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {event.registration_url && (
                    <a
                      href={
                        event.registration_url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#d40000] px-8 text-xs font-bold uppercase tracking-[0.07em] text-white shadow-[0_12px_25px_rgba(212,0,0,0.20)] transition hover:bg-[#b80000]"
                    >
                      Register Now

                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <Link
                    href="/events#event-calendar"
                    className="inline-flex min-h-12 items-center justify-center border border-[#101828] px-8 text-xs font-bold uppercase tracking-[0.07em] text-[#101828] transition hover:bg-[#101828] hover:text-white"
                  >
                    More Events
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================= */}
        {/* DESCRIPTION */}
        {/* ================================= */}

        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <span className="h-[3px] w-10 bg-[#d40000]" />

              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#d40000]">
                Event Details
              </p>
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-[#101828]">
              About This Event
            </h2>

            <div className="mt-6 whitespace-pre-line text-[15px] leading-8 text-gray-600">
              {
                fullDescription
              }
            </div>

            {/* ================================= */}
            {/* BOTTOM ACTION */}
            {/* ================================= */}

            <div className="mt-10 border-t border-gray-200 pt-8">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#101828] transition hover:text-[#d40000]"
              >
                <ArrowLeft className="h-4 w-4" />

                Return to Event Calendar
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
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