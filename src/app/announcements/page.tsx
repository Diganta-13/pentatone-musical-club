import Link from "next/link";

import type { RowDataPacket } from "mysql2";

import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Megaphone,
  Pin,
  SlidersHorizontal,
} from "lucide-react";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

import db from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

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

  category: AnnouncementCategory;

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

  display_date: string;
}

type PageProps = {
  searchParams: Promise<{
    category?: string;
    sort?: string;
  }>;
};

/*
 * =====================================
 * PAGE
 * =====================================
 */

export default async function AnnouncementsPage({
  searchParams,
}: PageProps) {
  /*
   * =====================================
   * CURRENT USER
   * =====================================
   */

  const currentUser =
    await getCurrentUser();

  /*
   * =====================================
   * SEARCH PARAMS
   * =====================================
   */

  const params =
    await searchParams;

  const selectedCategory =
    params.category?.trim() ||
    "ALL";

  const sort =
    params.sort === "oldest"
      ? "oldest"
      : "newest";

  /*
   * =====================================
   * LOAD PUBLISHED ANNOUNCEMENTS
   * =====================================
   */

  const [rows] =
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

          DATE_FORMAT(
            COALESCE(
              published_at,
              created_at
            ),
            '%Y-%m-%d %H:%i:%s'
          ) AS display_date

        FROM announcements

        WHERE is_published = TRUE

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
   * PINNED ANNOUNCEMENT
   * =====================================
   */

  const pinnedAnnouncement =
    rows.find(
      (announcement) =>
        Boolean(
          announcement.is_pinned,
        ),
    ) ?? null;

  /*
   * =====================================
   * FILTER ANNOUNCEMENTS
   * =====================================
   */

  let announcements =
    rows.filter(
      (announcement) =>
        !pinnedAnnouncement ||
        announcement.id !==
          pinnedAnnouncement.id,
    );

  if (
    selectedCategory !== "ALL"
  ) {
    announcements =
      announcements.filter(
        (announcement) =>
          announcement.category ===
          selectedCategory,
      );
  }

  /*
   * =====================================
   * SORT
   * =====================================
   */

  if (sort === "oldest") {
    announcements =
      [...announcements].reverse();
  }

  /*
   * =====================================
   * PAGE
   * =====================================
   */

  return (
    <>
      {/* ================================= */}
      {/* UNIVERSAL HEADER */}
      {/* ================================= */}

      <Navbar />


      <main className="min-h-screen bg-[#f8f9ff]">

        {/* ================================= */}
        {/* HERO */}
        {/* ================================= */}

        <section className="mx-auto max-w-[1180px] px-5 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">

          <div className="max-w-2xl">

            <span className="inline-flex rounded-sm bg-[#d40000] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white">
              Born To Rock
            </span>

            <h1 className="mt-7 text-5xl font-black leading-[0.98] tracking-[-0.04em] text-[#101828] md:text-6xl">
              Latest
              <br />
              Announcements
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">
              Stay updated with
              Pentatone Musical Club
              news, events, auditions,
              practice schedules and
              important updates from
              Sylhet Engineering
              College.
            </p>

          </div>

        </section>


        {/* ================================= */}
        {/* PINNED ANNOUNCEMENT */}
        {/* ================================= */}

        {pinnedAnnouncement && (
          <section className="mx-auto max-w-[1180px] px-5 lg:px-8">

            <article className="overflow-hidden rounded-2xl border-t-4 border-[#d40000] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">

              <div className="grid lg:grid-cols-2">

                {/* ================================= */}
                {/* IMAGE */}
                {/* ================================= */}

                <div className="relative min-h-[320px] bg-[#101828] lg:min-h-[430px]">

                  {pinnedAnnouncement.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        pinnedAnnouncement.cover_image
                      }
                      alt={
                        pinnedAnnouncement.title
                      }
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">

                      <Megaphone className="h-20 w-20 text-white/20" />

                    </div>
                  )}

                  <span className="absolute left-5 top-5 bg-[#d40000] px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white">
                    Pinned Notice
                  </span>

                </div>


                {/* ================================= */}
                {/* DETAILS */}
                {/* ================================= */}

                <div className="flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-14">

                  <div className="flex items-center gap-2 text-[#d40000]">

                    <Pin className="h-4 w-4" />

                    <span className="text-[10px] font-black uppercase tracking-[0.14em]">
                      Priority Update
                    </span>

                  </div>


                  <h2 className="mt-5 text-3xl font-black tracking-tight text-[#101828]">

                    {
                      pinnedAnnouncement.title
                    }

                  </h2>


                  <div className="mt-5 flex flex-wrap gap-5 text-xs font-semibold text-slate-500">

                    <span className="inline-flex items-center gap-2">

                      <CalendarDays className="h-4 w-4 text-[#d40000]" />

                      {formatDate(
                        pinnedAnnouncement.display_date,
                      )}

                    </span>


                    {pinnedAnnouncement.venue && (
                      <span className="inline-flex items-center gap-2">

                        <MapPin className="h-4 w-4 text-[#d40000]" />

                        {
                          pinnedAnnouncement.venue
                        }

                      </span>
                    )}

                  </div>


                  <p className="mt-6 line-clamp-5 text-sm leading-7 text-slate-600">

                    {
                      pinnedAnnouncement.short_description ||
                      pinnedAnnouncement.content
                    }

                  </p>


                  <Link
                    href={`/announcements/${pinnedAnnouncement.slug}`}
                    className="mt-7 inline-flex h-12 w-fit items-center justify-center gap-3 rounded-lg bg-[#d40000] px-7 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-red-700"
                  >

                    View Details

                    <ArrowRight className="h-4 w-4" />

                  </Link>

                </div>

              </div>

            </article>

          </section>
        )}


        {/* ================================= */}
        {/* FILTER */}
        {/* ================================= */}

        <section className="mx-auto mt-16 max-w-[1180px] px-5 lg:px-8">

          <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-5 lg:flex-row lg:items-center">

            {/* ================================= */}
            {/* CATEGORY FILTER */}
            {/* ================================= */}

            <div className="flex flex-wrap gap-2">

              <FilterButton
                label="All"
                href="/announcements"
                active={
                  selectedCategory ===
                  "ALL"
                }
              />

              <FilterButton
                label="Events"
                href="/announcements?category=EVENTS"
                active={
                  selectedCategory ===
                  "EVENTS"
                }
              />

              <FilterButton
                label="Auditions"
                href="/announcements?category=AUDITIONS"
                active={
                  selectedCategory ===
                  "AUDITIONS"
                }
              />

              <FilterButton
                label="Practice"
                href="/announcements?category=PRACTICE"
                active={
                  selectedCategory ===
                  "PRACTICE"
                }
              />

              <FilterButton
                label="General Notices"
                href="/announcements?category=GENERAL_NOTICE"
                active={
                  selectedCategory ===
                  "GENERAL_NOTICE"
                }
              />

            </div>


            {/* ================================= */}
            {/* SORT */}
            {/* ================================= */}

            <Link
              href={
                sort === "newest"
                  ? `/announcements?category=${selectedCategory}&sort=oldest`
                  : `/announcements?category=${selectedCategory}&sort=newest`
              }
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 transition hover:text-red-600"
            >

              <SlidersHorizontal className="h-4 w-4" />

              Sort By:{" "}

              {sort === "newest"
                ? "Newest"
                : "Oldest"}

            </Link>

          </div>

        </section>


        {/* ================================= */}
        {/* ANNOUNCEMENT CARDS */}
        {/* ================================= */}

        <section className="mx-auto max-w-[1180px] px-5 pb-20 pt-8 lg:px-8 lg:pb-28">

          {announcements.length >
          0 ? (

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {announcements.map(
                (announcement) => (

                  <article
                    key={
                      announcement.id
                    }
                    className="flex min-h-[360px] flex-col rounded-2xl bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]"
                  >

                    {/* ================================= */}
                    {/* IMAGE */}
                    {/* ================================= */}

                    <div className="relative h-36 overflow-hidden rounded-xl bg-[#f2f4fa]">

                      {announcement.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            announcement.cover_image
                          }
                          alt={
                            announcement.title
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">

                          <Megaphone className="h-12 w-12 text-red-200" />

                        </div>
                      )}


                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-slate-700">

                        {categoryLabel(
                          announcement.category,
                        )}

                      </span>

                    </div>


                    {/* ================================= */}
                    {/* TITLE */}
                    {/* ================================= */}

                    <h3 className="mt-5 text-xl font-black leading-7 text-[#101828]">

                      {
                        announcement.title
                      }

                    </h3>


                    {/* ================================= */}
                    {/* DATE */}
                    {/* ================================= */}

                    <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">

                      <CalendarDays className="h-3.5 w-3.5 text-[#d40000]" />

                      {formatDate(
                        announcement.display_date,
                      )}

                    </div>


                    {/* ================================= */}
                    {/* DESCRIPTION */}
                    {/* ================================= */}

                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">

                      {
                        announcement.short_description ||
                        announcement.content
                      }

                    </p>


                    {/* ================================= */}
                    {/* READ MORE */}
                    {/* ================================= */}

                    <Link
                      href={`/announcements/${announcement.slug}`}
                      className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#101828] px-5 text-[10px] font-black uppercase tracking-[0.1em] text-[#101828] transition hover:border-[#d40000] hover:bg-[#d40000] hover:text-white"
                    >

                      Read More

                      <ArrowRight className="h-3.5 w-3.5" />

                    </Link>

                  </article>

                ),
              )}

            </div>

          ) : (

            /* ================================= */
            /* EMPTY STATE */
            /* ================================= */

            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">

              <Megaphone className="mx-auto h-12 w-12 text-slate-300" />

              <h2 className="mt-5 text-xl font-black text-[#101828]">
                No announcements found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Published announcements
                will appear here.
              </p>

            </div>

          )}

        </section>


        {/* ================================= */}
        {/* CTA */}
        {/* ================================= */}

        <section className="mx-auto max-w-[1180px] px-5 pb-24 lg:px-8">

          <div className="rounded-2xl bg-[#273142] px-7 py-10 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14">

            <div>

              <h2 className="text-2xl font-black">
                Never Miss An Update
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                Follow upcoming
                auditions, events and
                club activities through
                Pentatone Musical Club.
              </p>

            </div>


            {/* ================================= */}
            {/* CTA BUTTONS */}
            {/* ================================= */}

            <div className="mt-7 flex flex-wrap gap-3 lg:mt-0">

              {/* AUDITIONS — EVERYONE */}

              <Link
                href="/auditions"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-6 text-xs font-black uppercase tracking-[0.08em] text-[#101828] transition hover:bg-slate-100"
              >
                View Auditions
              </Link>


              {/* ================================= */}
              {/* JOIN CLUB — GUEST ONLY */}
              {/* ================================= */}

              {!currentUser && (
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-[#d40000] px-7 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-red-700"
                >
                  Join Club
                </Link>
              )}

            </div>

          </div>

        </section>

      </main>


      {/* ================================= */}
      {/* UNIVERSAL FOOTER */}
      {/* ================================= */}

      <Footer />
    </>
  );
}


/*
 * =====================================
 * FILTER BUTTON
 * =====================================
 */

function FilterButton({
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
      className={`rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.09em] transition ${
        active
          ? "bg-[#d40000] text-white"
          : "bg-[#edf1fb] text-[#101828] hover:bg-slate-200"
      }`}
    >
      {label}
    </Link>
  );
}


/*
 * =====================================
 * CATEGORY LABEL
 * =====================================
 */

function categoryLabel(
  category:
    AnnouncementCategory,
) {
  return {
    EVENTS:
      "Events",

    AUDITIONS:
      "Auditions",

    PRACTICE:
      "Practice",

    GENERAL_NOTICE:
      "General Notice",
  }[category];
}


/*
 * =====================================
 * DATE
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
    new Date(normalized);

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
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}