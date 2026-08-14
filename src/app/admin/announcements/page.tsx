import type {
  ReactNode,
} from "react";

import type {
  RowDataPacket,
} from "mysql2";

import {
  FileText,
  Megaphone,
  Pin,
  Send,
  SlidersHorizontal,
} from "lucide-react";

import AnnouncementCreateForm from "@/components/admin/announcement-create-form";

import db from "@/lib/db";

/*
 * =====================================
 * TYPES
 * =====================================
 */

type AnnouncementCategory =
  | "EVENTS"
  | "AUDITIONS"
  | "PRACTICE"
  | "GENERAL_NOTICE";

interface AnnouncementRow
  extends RowDataPacket {
  id: number;

  title: string;

  slug: string;

  category:
    AnnouncementCategory;

  short_description:
    | string
    | null;

  content: string;

  venue:
    | string
    | null;

  cover_image:
    | string
    | null;

  is_pinned:
    | number
    | boolean;

  is_published:
    | number
    | boolean;

  published_at:
    | string
    | null;

  created_at: Date;
}

type AdminAnnouncementsPageProps = {
  searchParams: Promise<{
    category?: string;
    status?: string;
  }>;
};

/*
 * =====================================
 * PAGE
 * =====================================
 */

export default async function AdminAnnouncementsPage({
  searchParams,
}: AdminAnnouncementsPageProps) {
  /*
   * =====================================
   * SEARCH PARAMS
   * =====================================
   */

  const params =
    await searchParams;

  const selectedCategory =
    params.category?.trim() ||
    "all";

  const selectedStatus =
    params.status?.trim() ||
    "all";

  /*
   * =====================================
   * LOAD ANNOUNCEMENTS
   * =====================================
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
          category,
          short_description,
          content,
          venue,
          cover_image,
          is_pinned,
          is_published,

          DATE_FORMAT(
            published_at,
            '%Y-%m-%d %H:%i:%s'
          ) AS published_at,

          created_at

        FROM announcements

        ORDER BY
          is_pinned DESC,
          COALESCE(
            published_at,
            created_at
          ) DESC,
          id DESC
      `,
    );

  /*
   * =====================================
   * STATISTICS
   * =====================================
   */

  const totalAnnouncements =
    announcements.length;

  const publishedAnnouncements =
    announcements.filter(
      (announcement) =>
        Boolean(
          announcement.is_published,
        ),
    ).length;

  const pinnedAnnouncements =
    announcements.filter(
      (announcement) =>
        Boolean(
          announcement.is_pinned,
        ),
    ).length;

  const draftAnnouncements =
    announcements.filter(
      (announcement) =>
        !Boolean(
          announcement.is_published,
        ),
    ).length;

  /*
   * =====================================
   * FILTER
   * =====================================
   */

  const filteredAnnouncements =
    announcements.filter(
      (announcement) => {
        const categoryMatches =
          selectedCategory ===
            "all" ||
          announcement.category ===
            selectedCategory;

        let statusMatches =
          true;

        if (
          selectedStatus ===
          "published"
        ) {
          statusMatches =
            Boolean(
              announcement.is_published,
            );
        }

        if (
          selectedStatus ===
          "draft"
        ) {
          statusMatches =
            !Boolean(
              announcement.is_published,
            );
        }

        if (
          selectedStatus ===
          "pinned"
        ) {
          statusMatches =
            Boolean(
              announcement.is_pinned,
            );
        }

        return (
          categoryMatches &&
          statusMatches
        );
      },
    );

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

          <span>
            /
          </span>

          <span className="text-[#d40000]">
            Announcements
          </span>

        </div>


        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>

            <div className="flex items-center gap-3">

              <Megaphone className="h-5 w-5 text-[#d40000]" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#d40000]">
                Communication Portal
              </p>

            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#101828] sm:text-[34px]">
              Announcement Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Create, publish and manage
              Pentatone Musical Club
              announcements, notices and
              important updates.
            </p>

          </div>


          {/* CREATE */}

          <AnnouncementCreateForm />

        </div>


        {/* ================================= */}
        {/* STATS */}
        {/* ================================= */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Total Announcements"
            value={
              totalAnnouncements
            }
            description="All stored notices"
            icon={
              <Megaphone />
            }
          />

          <StatCard
            label="Published"
            value={
              publishedAnnouncements
            }
            description="Visible publicly"
            icon={
              <Send />
            }
            accent="green"
          />

          <StatCard
            label="Pinned"
            value={
              pinnedAnnouncements
            }
            description="Priority notices"
            icon={
              <Pin />
            }
            accent="red"
          />

          <StatCard
            label="Drafts"
            value={
              draftAnnouncements
            }
            description="Not published yet"
            icon={
              <FileText />
            }
            accent="dark"
          />

        </div>


        {/* ================================= */}
        {/* FILTERS */}
        {/* ================================= */}

        <section className="mt-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.035)]">

          <form
            method="GET"
            className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]"
          >

            {/* CATEGORY */}

            <div className="relative">

              <select
                name="category"
                defaultValue={
                  selectedCategory
                }
                className="h-11 w-full appearance-none rounded-lg border border-transparent bg-[#f1f4fc] px-4 pr-10 text-xs font-medium text-[#344054] outline-none transition focus:border-red-200 focus:bg-white focus:ring-2 focus:ring-red-50"
              >

                <option value="all">
                  Category (All)
                </option>

                <option value="EVENTS">
                  Events
                </option>

                <option value="AUDITIONS">
                  Auditions
                </option>

                <option value="PRACTICE">
                  Practice
                </option>

                <option value="GENERAL_NOTICE">
                  General Notice
                </option>

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

                <option value="published">
                  Published
                </option>

                <option value="draft">
                  Draft
                </option>

                <option value="pinned">
                  Pinned
                </option>

              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                ▼
              </span>

            </div>


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
        {/* ANNOUNCEMENTS */}
        {/* ================================= */}

        <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">

          {/* TABLE HEADER */}

          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-6">

            <div>

              <h2 className="text-base font-black text-[#101828]">
                All Announcements
              </h2>

              <p className="mt-1 text-xs text-gray-500">

                {
                  filteredAnnouncements.length
                }{" "}

                announcement

                {filteredAnnouncements.length ===
                1
                  ? ""
                  : "s"}{" "}

                found.

              </p>

            </div>

          </div>


          {/* ================================= */}
          {/* CONTENT */}
          {/* ================================= */}

          {filteredAnnouncements.length >
          0 ? (
            <>

              {/* ================================= */}
              {/* DESKTOP TABLE */}
              {/* ================================= */}

              <div className="hidden overflow-x-auto lg:block">

                <table className="w-full min-w-[1000px] border-collapse">

                  <thead>

                    <tr className="border-b border-red-100">

                      <TableHeading>
                        Announcement
                      </TableHeading>

                      <TableHeading>
                        Category
                      </TableHeading>

                      <TableHeading>
                        Venue
                      </TableHeading>

                      <TableHeading>
                        Published
                      </TableHeading>

                      <TableHeading>
                        Status
                      </TableHeading>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredAnnouncements.map(
                      (
                        announcement,
                        index,
                      ) => {
                        const published =
                          Boolean(
                            announcement.is_published,
                          );

                        const pinned =
                          Boolean(
                            announcement.is_pinned,
                          );

                        return (
                          <tr
                            key={
                              announcement.id
                            }
                            className={`border-b border-gray-100 last:border-b-0 ${
                              index %
                                2 ===
                              0
                                ? "bg-[#fafbff]"
                                : "bg-white"
                            }`}
                          >

                            {/* ANNOUNCEMENT */}

                            <td className="px-6 py-5">

                              <div className="flex min-w-[300px] items-center gap-4">

                                <AnnouncementThumbnail
                                  src={
                                    announcement.cover_image
                                  }
                                />

                                <div>

                                  <div className="flex flex-wrap items-center gap-2">

                                    <p className="max-w-[300px] text-sm font-black leading-5 text-[#101828]">
                                      {
                                        announcement.title
                                      }
                                    </p>


                                    {pinned && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.06em] text-red-600">

                                        <Pin className="h-2.5 w-2.5" />

                                        Pinned

                                      </span>
                                    )}

                                  </div>


                                  {announcement.short_description && (
                                    <p className="mt-1.5 max-w-[340px] line-clamp-2 text-[11px] leading-5 text-gray-500">
                                      {
                                        announcement.short_description
                                      }
                                    </p>
                                  )}

                                </div>

                              </div>

                            </td>


                            {/* CATEGORY */}

                            <td className="px-6 py-5">

                              <CategoryBadge
                                category={
                                  announcement.category
                                }
                              />

                            </td>


                            {/* VENUE */}

                            <td className="px-6 py-5 text-sm text-[#344054]">

                              {announcement.venue ||
                                "—"}

                            </td>


                            {/* PUBLISHED DATE */}

                            <td className="px-6 py-5">

                              <p className="text-xs font-semibold text-[#344054]">
                                {announcement.published_at
                                  ? formatDate(
                                      announcement.published_at,
                                    )
                                  : "Not published"}
                              </p>

                            </td>


                            {/* STATUS */}

                            <td className="px-6 py-5">

                              <div className="flex flex-col items-start gap-1.5">

                                <PublishBadge
                                  published={
                                    published
                                  }
                                />

                                {pinned && (
                                  <span className="text-[8px] font-bold uppercase tracking-[0.06em] text-red-500">
                                    Priority
                                  </span>
                                )}

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

                {filteredAnnouncements.map(
                  (
                    announcement,
                  ) => {
                    const published =
                      Boolean(
                        announcement.is_published,
                      );

                    const pinned =
                      Boolean(
                        announcement.is_pinned,
                      );

                    return (
                      <article
                        key={
                          announcement.id
                        }
                        className="p-5"
                      >

                        <div className="flex gap-4">

                          <AnnouncementThumbnail
                            src={
                              announcement.cover_image
                            }
                          />

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap gap-2">

                              <CategoryBadge
                                category={
                                  announcement.category
                                }
                              />

                              <PublishBadge
                                published={
                                  published
                                }
                              />

                            </div>

                            <h3 className="mt-3 text-base font-black text-[#101828]">

                              {
                                announcement.title
                              }

                            </h3>

                            {announcement.short_description && (
                              <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-500">

                                {
                                  announcement.short_description
                                }

                              </p>
                            )}

                          </div>

                        </div>


                        <div className="mt-4 flex flex-wrap items-center gap-3">

                          {pinned && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.05em] text-red-600">

                              <Pin className="h-3 w-3" />

                              Pinned

                            </span>
                          )}

                          {announcement.published_at && (
                            <span className="text-[10px] text-gray-400">

                              {formatDate(
                                announcement.published_at,
                              )}

                            </span>
                          )}

                        </div>

                      </article>
                    );
                  },
                )}

              </div>

            </>
          ) : (

            /* ================================= */
            /* EMPTY */
            /* ================================= */

            <div className="px-6 py-20 text-center">

              <Megaphone className="mx-auto h-10 w-10 text-gray-300" />

              <h3 className="mt-4 text-base font-black text-[#101828]">
                No announcements found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Create your first
                announcement or change
                the filters above.
              </p>

            </div>
          )}

        </section>


        {/* ================================= */}
        {/* INFO */}
        {/* ================================= */}

        <section className="pb-10 pt-8">

          <div className="rounded-2xl border border-red-100 bg-red-50/40 px-6 py-5">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">

                <Megaphone className="h-5 w-5" />

              </div>

              <div>

                <h3 className="text-sm font-black text-[#101828]">
                  Announcement Publishing
                </h3>

                <p className="mt-1 max-w-3xl text-xs leading-5 text-gray-600">
                  Published announcements
                  will later appear on the
                  public Latest Announcements
                  page. Pinned announcements
                  will receive priority
                  placement.
                </p>

              </div>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}


/*
 * =====================================
 * STAT CARD
 * =====================================
 */

function StatCard({
  label,
  value,
  description,
  icon,
  accent = "red",
}: {
  label: string;

  value: number;

  description: string;

  icon: ReactNode;

  accent?:
    | "red"
    | "green"
    | "dark";
}) {
  const styles = {
    red: {
      border:
        "border-red-200",

      icon:
        "bg-red-50 text-red-600",
    },

    green: {
      border:
        "border-green-300",

      icon:
        "bg-green-50 text-green-600",
    },

    dark: {
      border:
        "border-slate-300",

      icon:
        "bg-slate-100 text-slate-700",
    },
  }[accent];

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] ${styles.border}`}
    >

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-gray-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-[#101828]">
            {value}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl [&>svg]:h-5 [&>svg]:w-5 ${styles.icon}`}
        >
          {icon}
        </div>

      </div>

      <p className="mt-4 text-[10px] text-gray-400">
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
}: {
  children:
    ReactNode;
}) {
  return (
    <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-[0.1em] text-gray-500">
      {children}
    </th>
  );
}


/*
 * =====================================
 * THUMBNAIL
 * =====================================
 */

function AnnouncementThumbnail({
  src,
}: {
  src:
    | string
    | null;
}) {
  if (!src) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#101828] text-red-500">

        <Megaphone className="h-5 w-5" />

      </div>
    );
  }

  return (
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">

      {/* eslint-disable-next-line @next/next/no-img-element */}

      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
      />

    </div>
  );
}


/*
 * =====================================
 * CATEGORY BADGE
 * =====================================
 */

function CategoryBadge({
  category,
}: {
  category:
    AnnouncementCategory;
}) {
  const label = {
    EVENTS:
      "Events",

    AUDITIONS:
      "Auditions",

    PRACTICE:
      "Practice",

    GENERAL_NOTICE:
      "General Notice",
  }[category];

  const styles = {
    EVENTS:
      "bg-purple-50 text-purple-700",

    AUDITIONS:
      "bg-red-50 text-red-600",

    PRACTICE:
      "bg-blue-50 text-blue-700",

    GENERAL_NOTICE:
      "bg-slate-100 text-slate-600",
  }[category];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.06em] ${styles}`}
    >
      {label}
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
      className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.06em] ${
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
 * DATE FORMAT
 * =====================================
 */

function formatDate(
  value: string,
) {
  const normalized =
    value.replace(
      " ",
      "T",
    );

  const date =
    new Date(
      normalized,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
    },
  ).format(date);
}