import Link from "next/link";

import type { ReactNode } from "react";
import type { RowDataPacket } from "mysql2";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  MapPin,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import EventCreateForm from "@/components/admin/event-create-form";
import EventEditForm from "@/components/admin/event-edit-form";

import db from "@/lib/db";

/*
 * =====================================
 * TYPES
 * =====================================
 */

type EventStatusOverride =
  | "AUTO"
  | "COMPLETED";

type EventLifecycle =
  | "upcoming"
  | "ongoing"
  | "completed";

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

  is_published:
    | number
    | boolean;

  is_featured:
    | number
    | boolean;

  status_override:
    EventStatusOverride;

  created_at: Date;
}

type AdminEventsPageProps = {
  searchParams: Promise<{
    type?: string;
    status?: string;
    date?: string;
  }>;
};

/*
 * =====================================
 * PAGE
 * =====================================
 */

export default async function AdminEventsPage({
  searchParams,
}: AdminEventsPageProps) {
  /*
   * =====================================
   * SEARCH PARAMS
   * =====================================
   */

  const params =
    await searchParams;

  const selectedType =
    params.type?.trim() ||
    "all";

  const selectedStatus =
    params.status?.trim() ||
    "all";

  const selectedDate =
    params.date?.trim() ||
    "";

  /*
   * =====================================
   * LOAD EVENTS
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
          is_published,
          is_featured,
          status_override,
          created_at

        FROM events

        ORDER BY
          event_date ASC,
          start_time ASC,
          created_at DESC
      `,
    );

  /*
   * =====================================
   * CURRENT DHAKA TIME
   * =====================================
   */

  const now =
    getDhakaNow();

  /*
   * =====================================
   * STATS
   * =====================================
   */

  const totalEvents =
    events.length;

  const upcomingEvents =
    events.filter(
      (event) =>
        getEventLifecycle(
          event,
          now,
        ) === "upcoming",
    ).length;

  const ongoingEvents =
    events.filter(
      (event) =>
        getEventLifecycle(
          event,
          now,
        ) === "ongoing",
    ).length;

  const completedEvents =
    events.filter(
      (event) =>
        getEventLifecycle(
          event,
          now,
        ) === "completed",
    ).length;

  const publishedEvents =
    events.filter(
      (event) =>
        Boolean(
          event.is_published,
        ),
    ).length;

  /*
   * =====================================
   * EVENT TYPES
   * =====================================
   */

  const eventTypes =
    Array.from(
      new Set(
        events
          .map(
            (event) =>
              event.event_type,
          )
          .filter(
            (
              type,
            ): type is string =>
              Boolean(type),
          ),
      ),
    ).sort(
      (a, b) =>
        a.localeCompare(b),
    );

  /*
   * =====================================
   * FILTER EVENTS
   * =====================================
   */

  const filteredEvents =
    events.filter(
      (event) => {
        const lifecycle =
          getEventLifecycle(
            event,
            now,
          );

        const typeMatches =
          selectedType ===
            "all" ||
          event.event_type ===
            selectedType;

        const dateMatches =
          !selectedDate ||
          event.event_date ===
            selectedDate;

        let statusMatches =
          true;

        if (
          selectedStatus ===
          "upcoming"
        ) {
          statusMatches =
            lifecycle ===
            "upcoming";
        }

        if (
          selectedStatus ===
          "ongoing"
        ) {
          statusMatches =
            lifecycle ===
            "ongoing";
        }

        if (
          selectedStatus ===
          "completed"
        ) {
          statusMatches =
            lifecycle ===
            "completed";
        }

        if (
          selectedStatus ===
          "published"
        ) {
          statusMatches =
            Boolean(
              event.is_published,
            );
        }

        if (
          selectedStatus ===
          "draft"
        ) {
          statusMatches =
            !Boolean(
              event.is_published,
            );
        }

        if (
          selectedStatus ===
          "featured"
        ) {
          statusMatches =
            Boolean(
              event.is_featured,
            );
        }

        return (
          typeMatches &&
          dateMatches &&
          statusMatches
        );
      },
    );

  /*
   * =====================================
   * UPCOMING HIGHLIGHTS
   * =====================================
   */

  const upcomingHighlights =
    events
      .filter(
        (event) =>
          Boolean(
            event.is_published,
          ) &&
          getEventLifecycle(
            event,
            now,
          ) !== "completed",
      )
      .sort(
        (a, b) => {
          const featuredDifference =
            Number(
              Boolean(
                b.is_featured,
              ),
            ) -
            Number(
              Boolean(
                a.is_featured,
              ),
            );

          if (
            featuredDifference !==
            0
          ) {
            return featuredDifference;
          }

          const dateDifference =
            a.event_date.localeCompare(
              b.event_date,
            );

          if (
            dateDifference !==
            0
          ) {
            return dateDifference;
          }

          return (
            a.start_time || ""
          ).localeCompare(
            b.start_time || "",
          );
        },
      )
      .slice(0, 3);

  /*
   * =====================================
   * RENDER
   * =====================================
   */

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <div className="mx-auto max-w-[1380px] px-5 py-8 sm:px-6 lg:px-8">
        {/* ================================= */}
        {/* BREADCRUMB */}
        {/* ================================= */}

        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em] text-gray-400">
          <span>
            Admin Portal
          </span>

          <span>/</span>

          <span className="text-[#d40000]">
            Events
          </span>
        </div>

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#101828] sm:text-[34px]">
              Event Management
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Create, organize and
              manage all Pentatone
              Musical Club events.
            </p>
          </div>

          <EventCreateForm />
        </div>

        {/* ================================= */}
        {/* STATS */}
        {/* ================================= */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Events"
            value={totalEvents}
            icon={
              <CalendarDays />
            }
            description="All stored events"
          />

          <StatCard
            label="Upcoming"
            value={upcomingEvents}
            icon={
              <Clock3 />
            }
            description={
              ongoingEvents > 0
                ? `${ongoingEvents} currently ongoing`
                : "Scheduled events"
            }
          />

          <StatCard
            label="Published"
            value={
              publishedEvents
            }
            icon={
              <Sparkles />
            }
            description="Visible publicly"
          />

          <StatCard
            label="Completed"
            value={
              completedEvents
            }
            icon={
              <CheckCircle2 />
            }
            description="Finished events"
          />
        </div>

        {/* ================================= */}
        {/* FILTERS */}
        {/* ================================= */}

        <section className="mt-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
          <form
            method="GET"
            className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]"
          >
            {/* EVENT TYPE */}

            <div className="relative">
              <select
                name="type"
                defaultValue={
                  selectedType
                }
                className="h-11 w-full appearance-none rounded-lg border border-transparent bg-[#f1f4fc] px-4 pr-10 text-xs font-medium text-[#344054] outline-none transition focus:border-red-200 focus:bg-white focus:ring-2 focus:ring-red-50"
              >
                <option value="all">
                  Event Type (All)
                </option>

                {eventTypes.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ),
                )}
              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                ▼
              </span>
            </div>

            {/* STATUS */}

            <div className="relative">
              <select
                name="status"
                defaultValue={
                  selectedStatus
                }
                className="h-11 w-full appearance-none rounded-lg border border-transparent bg-[#f1f4fc] px-4 pr-10 text-xs font-medium text-[#344054] outline-none transition focus:border-red-200 focus:bg-white focus:ring-2 focus:ring-red-50"
              >
                <option value="all">
                  Status (All)
                </option>

                <option value="upcoming">
                  Upcoming
                </option>

                <option value="ongoing">
                  Ongoing
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="published">
                  Published
                </option>

                <option value="draft">
                  Draft
                </option>

                <option value="featured">
                  Featured
                </option>
              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                ▼
              </span>
            </div>

            {/* DATE */}

            <input
              type="date"
              name="date"
              defaultValue={
                selectedDate
              }
              className="h-11 w-full rounded-lg border border-transparent bg-[#f1f4fc] px-4 text-xs font-medium text-[#344054] outline-none transition focus:border-red-200 focus:bg-white focus:ring-2 focus:ring-red-50"
            />

            {/* APPLY */}

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#eaf0ff] px-6 text-[10px] font-bold uppercase tracking-[0.06em] text-[#101828] transition hover:bg-[#101828] hover:text-white"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />

              Apply Filters
            </button>
          </form>
        </section>

        {/* ================================= */}
        {/* EVENTS TABLE */}
        {/* ================================= */}

        <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-base font-black text-[#101828]">
                All Events
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {
                  filteredEvents.length
                }{" "}
                event
                {filteredEvents.length ===
                1
                  ? ""
                  : "s"}{" "}
                found.
              </p>
            </div>
          </div>

          {filteredEvents.length > 0 ? (
            <>
              {/* ================================= */}
              {/* DESKTOP */}
              {/* ================================= */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1000px] border-collapse">
                  <thead>
                    <tr className="border-b border-red-100">
                      <TableHeading>
                        Event
                      </TableHeading>

                      <TableHeading>
                        Category
                      </TableHeading>

                      <TableHeading>
                        Date & Time
                      </TableHeading>

                      <TableHeading>
                        Venue
                      </TableHeading>

                      <TableHeading>
                        Status
                      </TableHeading>

                      <TableHeading align="right">
                        Actions
                      </TableHeading>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEvents.map(
                      (
                        event,
                        index,
                      ) => {
                        const lifecycle =
                          getEventLifecycle(
                            event,
                            now,
                          );

                        const isPublished =
                          Boolean(
                            event.is_published,
                          );

                        const isFeatured =
                          Boolean(
                            event.is_featured,
                          );

                        return (
                          <tr
                            key={
                              event.id
                            }
                            className={`border-b border-gray-100 last:border-b-0 ${
                              index % 2 ===
                              0
                                ? "bg-[#fafbff]"
                                : "bg-white"
                            }`}
                          >
                            {/* EVENT */}

                            <td className="px-6 py-5">
                              <div className="flex min-w-[230px] items-center gap-4">
                                <EventThumbnail
                                  src={
                                    event.cover_image
                                  }
                                  title={
                                    event.title
                                  }
                                />

                                <div>
                                  <p className="max-w-[230px] text-sm font-black leading-5 text-[#101828]">
                                    {
                                      event.title
                                    }
                                  </p>

                                  {isFeatured && (
                                    <span className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.06em] text-[#d40000]">
                                      <Sparkles className="h-3 w-3" />

                                      Featured
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* CATEGORY */}

                            <td className="px-6 py-5 text-sm text-[#344054]">
                              {event.event_type ||
                                "—"}
                            </td>

                            {/* DATE + TIME */}

                            <td className="px-6 py-5">
                              <p className="text-sm font-bold text-[#101828]">
                                {formatEventDateShort(
                                  event.event_date,
                                )}
                              </p>

                              {event.start_time && (
                                <p className="mt-1 text-[10px] text-gray-400">
                                  {formatEventTime(
                                    event.start_time,
                                  )}

                                  {event.end_time
                                    ? ` – ${formatEventTime(
                                        event.end_time,
                                      )}`
                                    : ""}
                                </p>
                              )}
                            </td>

                            {/* VENUE */}

                            <td className="px-6 py-5">
                              <div className="flex max-w-[180px] items-start gap-2 text-sm text-[#344054]">
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#d40000]" />

                                <span>
                                  {event.venue ||
                                    "—"}
                                </span>
                              </div>
                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-5">
                              <div className="flex flex-col items-start gap-1.5">
                                <LifecycleBadge
                                  lifecycle={
                                    lifecycle
                                  }
                                />

                                <PublishBadge
                                  published={
                                    isPublished
                                  }
                                />

                                {event.status_override ===
                                  "COMPLETED" && (
                                  <span className="text-[8px] font-bold uppercase tracking-[0.06em] text-gray-400">
                                    Manual
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* ACTIONS */}

                            <td className="px-6 py-5">
                              <div className="flex items-center justify-end gap-2">
                                {isPublished ? (
                                  <Link
                                    href={`/events/${event.slug}`}
                                    target="_blank"
                                    title="View public event"
                                    aria-label={`View ${event.title}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-[#d40000]"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    title="Draft events are not publicly visible"
                                    className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-300"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                )}

                                <EventEditForm
                                  eventId={
                                    event.id
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>

              {/* ================================= */}
              {/* MOBILE */}
              {/* ================================= */}

              <div className="divide-y divide-gray-100 lg:hidden">
                {filteredEvents.map(
                  (event) => {
                    const lifecycle =
                      getEventLifecycle(
                        event,
                        now,
                      );

                    const isPublished =
                      Boolean(
                        event.is_published,
                      );

                    return (
                      <article
                        key={event.id}
                        className="p-5"
                      >
                        <div className="flex gap-4">
                          <EventThumbnail
                            src={
                              event.cover_image
                            }
                            title={
                              event.title
                            }
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap gap-2">
                              <LifecycleBadge
                                lifecycle={
                                  lifecycle
                                }
                              />

                              <PublishBadge
                                published={
                                  isPublished
                                }
                              />
                            </div>

                            <h3 className="mt-3 text-base font-black text-[#101828]">
                              {
                                event.title
                              }
                            </h3>

                            {event.event_type && (
                              <p className="mt-1 text-xs text-gray-500">
                                {
                                  event.event_type
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2 text-xs text-gray-500 sm:grid-cols-3">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 text-red-600" />

                            {formatEventDateShort(
                              event.event_date,
                            )}
                          </div>

                          {event.start_time && (
                            <div className="flex items-center gap-2">
                              <Clock3 className="h-3.5 w-3.5 text-red-600" />

                              {formatEventTime(
                                event.start_time,
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-red-600" />

                            {event.venue ||
                              "No venue"}
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap justify-end gap-2">
                          {isPublished && (
                            <Link
                              href={`/events/${event.slug}`}
                              target="_blank"
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-[10px] font-bold uppercase text-slate-700 transition hover:border-red-200 hover:text-red-600"
                            >
                              <Eye className="h-4 w-4" />

                              View
                            </Link>
                          )}

                          <EventEditForm
                            eventId={
                              event.id
                            }
                            variant="button"
                          />
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            </>
          ) : (
            <div className="px-6 py-20 text-center">
              <CalendarDays className="mx-auto h-9 w-9 text-gray-300" />

              <h3 className="mt-4 text-base font-black text-[#101828]">
                No matching events
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try changing the
                filters above.
              </p>
            </div>
          )}
        </section>

        {/* ================================= */}
        {/* UPCOMING HIGHLIGHTS */}
        {/* ================================= */}

        <section className="pb-10 pt-12">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-[#101828]">
              Upcoming Highlights
            </h2>

            <span className="mt-1 h-[3px] w-10 rounded-full bg-[#d40000]" />
          </div>

          {upcomingHighlights.length >
          0 ? (
            <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {upcomingHighlights.map(
                (event) => {
                  const cover =
                    event.cover_image ||
                    "/assets/images/events/featured-event.jpg";

                  const lifecycle =
                    getEventLifecycle(
                      event,
                      now,
                    );

                  return (
                    <article
                      key={event.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.07)]"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-[#101828]">
                        <img
                          src={cover}
                          alt={
                            event.title
                          }
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute left-4 top-4">
                          <span className="rounded-md bg-[#d40000] px-3 py-2 text-[9px] font-black uppercase tracking-[0.06em] text-white shadow-md">
                            {formatHighlightDate(
                              event.event_date,
                            )}
                          </span>
                        </div>

                        {Boolean(
                          event.is_featured,
                        ) && (
                          <div className="absolute right-4 top-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.06em] text-white backdrop-blur-sm">
                              <Sparkles className="h-3 w-3" />

                              Featured
                            </span>
                          </div>
                        )}

                        {lifecycle ===
                          "ongoing" && (
                          <div className="absolute bottom-4 left-4">
                            <span className="rounded-full bg-green-600 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white">
                              Live Now
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-black leading-snug text-[#101828]">
                          {
                            event.title
                          }
                        </h3>

                        <div className="mt-4 space-y-2.5 text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#d40000]" />

                            <span>
                              {event.venue ||
                                "Venue to be announced"}
                            </span>
                          </div>

                          {event.start_time && (
                            <div className="flex items-center gap-2">
                              <Clock3 className="h-4 w-4 text-[#d40000]" />

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
                        </div>

                        <div className="mt-6 grid grid-cols-[1fr_auto] gap-3">
                          <Link
                            href={`/events/${event.slug}`}
                            target="_blank"
                            className="flex h-11 items-center justify-center rounded-lg bg-[#d40000] px-5 text-[10px] font-bold uppercase tracking-[0.06em] text-white transition hover:bg-[#b80000]"
                          >
                            View Details
                          </Link>

                          <EventEditForm
                            eventId={
                              event.id
                            }
                            variant="button"
                          />
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          ) : (
            <div className="mt-7 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-gray-300" />

              <p className="mt-3 text-sm font-bold text-gray-500">
                No upcoming published
                events.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/*
 * =====================================
 * EVENT LIFECYCLE
 * =====================================
 */

function getEventLifecycle(
  event: Pick<
    EventRow,
    | "event_date"
    | "start_time"
    | "end_time"
    | "status_override"
  >,
  now: {
    date: string;
    time: string;
  },
): EventLifecycle {
  /*
   * ADMIN MANUAL OVERRIDE
   */

  if (
    event.status_override ===
    "COMPLETED"
  ) {
    return "completed";
  }

  /*
   * PREVIOUS DATE
   */

  if (
    event.event_date <
    now.date
  ) {
    return "completed";
  }

  /*
   * FUTURE DATE
   */

  if (
    event.event_date >
    now.date
  ) {
    return "upcoming";
  }

  /*
   * TODAY
   */

  const startTime =
    event.start_time;

  const endTime =
    event.end_time;

  /*
   * NO TIMES = ALL DAY
   */

  if (
    !startTime &&
    !endTime
  ) {
    return "ongoing";
  }

  /*
   * BEFORE START
   */

  if (
    startTime &&
    now.time <
      startTime
  ) {
    return "upcoming";
  }

  /*
   * AFTER END
   */

  if (
    endTime &&
    now.time >=
      endTime
  ) {
    return "completed";
  }

  return "ongoing";
}

/*
 * =====================================
 * DHAKA CURRENT TIME
 * =====================================
 */

function getDhakaNow() {
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

        hour:
          "2-digit",

        minute:
          "2-digit",

        hourCycle:
          "h23",
      },
    ).formatToParts(
      new Date(),
    );

  const getPart = (
    type: string,
  ) =>
    parts.find(
      (part) =>
        part.type ===
        type,
    )?.value || "";

  return {
    date:
      `${getPart(
        "year",
      )}-${getPart(
        "month",
      )}-${getPart(
        "day",
      )}`,

    time:
      `${getPart(
        "hour",
      )}:${getPart(
        "minute",
      )}`,
  };
}

/*
 * =====================================
 * STAT CARD
 * =====================================
 */

function StatCard({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_25px_rgba(15,23,42,0.035)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.09em] text-gray-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-[#101828]">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#d40000] [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-[10px] font-medium text-gray-400">
        {description}
      </p>
    </div>
  );
}

/*
 * =====================================
 * TABLE HEADING
 * =====================================
 */

function TableHeading({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?:
    | "left"
    | "right";
}) {
  return (
    <th
      className={`px-6 py-4 text-[9px] font-bold uppercase tracking-[0.12em] text-gray-500 ${
        align ===
        "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

/*
 * =====================================
 * THUMBNAIL
 * =====================================
 */

function EventThumbnail({
  src,
  title,
}: {
  src:
    | string
    | null;
  title: string;
}) {
  const image =
    src ||
    "/assets/images/events/featured-event.jpg";

  return (
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#101828]">
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/*
 * =====================================
 * LIFECYCLE BADGE
 * =====================================
 */

function LifecycleBadge({
  lifecycle,
}: {
  lifecycle: EventLifecycle;
}) {
  if (
    lifecycle === "ongoing"
  ) {
    return (
      <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-green-700">
        Ongoing
      </span>
    );
  }

  if (
    lifecycle ===
    "completed"
  ) {
    return (
      <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-gray-500">
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-red-300 bg-red-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-[#d40000]">
      Upcoming
    </span>
  );
}

/*
 * =====================================
 * PUBLISH BADGE
 * =====================================
 */

function PublishBadge({
  published,
}: {
  published: boolean;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] ${
        published
          ? "bg-green-50 text-green-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {published
        ? "Published"
        : "Draft"}
    </span>
  );
}

/*
 * =====================================
 * EVENT DATE
 * =====================================
 */

function formatEventDateShort(
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
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(date);
}

/*
 * =====================================
 * HIGHLIGHT DATE
 * =====================================
 */

function formatHighlightDate(
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
      timeZone: "UTC",
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
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    },
  ).format(date);
}