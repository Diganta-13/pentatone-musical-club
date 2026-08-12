import Link from "next/link";
import { notFound } from "next/navigation";

import type {
  ReactNode,
} from "react";

import type {
  RowDataPacket,
} from "mysql2";

import {
  ArrowLeft,
  CalendarDays,
  ImageIcon,
  Images,
  Video,
} from "lucide-react";

import GalleryImageLightbox from "@/components/gallery/gallery-image-lightbox";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

import db from "@/lib/db";

/*
 * =====================================
 * TYPES
 * =====================================
 */

interface ProgramRow
  extends RowDataPacket {
  id: number;

  title: string;

  slug: string;

  description:
    | string
    | null;

  event_date:
    | Date
    | string
    | null;

  is_published:
    | number
    | boolean;

  created_at: Date;
}

interface MediaRow
  extends RowDataPacket {
  id: number;

  media_type:
    | "IMAGE"
    | "VIDEO";

  file_url: string;

  thumbnail_url:
    | string
    | null;

  caption:
    | string
    | null;

  sort_order: number;

  created_at: Date;
}

type GalleryProgramPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/*
 * =====================================
 * PAGE
 * =====================================
 */

export default async function GalleryProgramPage({
  params,
}: GalleryProgramPageProps) {
  /*
   * =====================================
   * SLUG
   * =====================================
   */

  const { slug } =
    await params;

  if (!slug) {
    notFound();
  }

  /*
   * =====================================
   * PUBLISHED PROGRAM
   * =====================================
   */

  const [programRows] =
    await db.execute<
      ProgramRow[]
    >(
      `
        SELECT
          id,
          title,
          slug,
          description,
          event_date,
          is_published,
          created_at

        FROM gallery_programs

        WHERE
          slug = ?
          AND is_published = TRUE

        LIMIT 1
      `,
      [slug],
    );

  if (
    programRows.length === 0
  ) {
    notFound();
  }

  const program =
    programRows[0];

  /*
   * =====================================
   * MEDIA
   * =====================================
   */

  const [media] =
    await db.execute<
      MediaRow[]
    >(
      `
        SELECT
          id,
          media_type,
          file_url,
          thumbnail_url,
          caption,
          sort_order,
          created_at

        FROM gallery_media

        WHERE program_id = ?

        ORDER BY
          sort_order ASC,
          created_at ASC
      `,
      [program.id],
    );

  /*
   * =====================================
   * PHOTOS
   * =====================================
   */

  const photos =
    media.filter(
      (item) =>
        item.media_type ===
        "IMAGE",
    );

  /*
   * =====================================
   * VIDEOS
   * =====================================
   */

  const videos =
    media.filter(
      (item) =>
        item.media_type ===
        "VIDEO",
    );

  /*
   * =====================================
   * LIGHTBOX DATA
   * =====================================
   */

  const lightboxImages =
    photos.map(
      (item) => ({
        src:
          item.file_url,

        alt:
          item.caption ||
          program.title,
      }),
    );

  const photoIndexById =
    new Map<
      number,
      number
    >(
      photos.map(
        (
          item,
          index,
        ) => [
          item.id,
          index,
        ],
      ),
    );

  return (
    <>
      <Navbar />

      <main className="bg-white">
        {/* ================================= */}
        {/* PROGRAM HERO */}
        {/* ================================= */}

        <section className="border-b border-gray-100 bg-[#f8f9fc] px-6 py-14 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* BACK */}

            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-gray-500 transition-colors hover:text-[#d40000]"
            >
              <ArrowLeft className="h-4 w-4" />

              Back to Gallery
            </Link>

            {/* ================================= */}
            {/* PROGRAM INFORMATION */}
            {/* ================================= */}

            <div className="mt-8 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-4xl">
                <div className="flex items-center gap-3">
                  <span className="h-[3px] w-10 bg-[#d40000]" />

                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d40000]">
                    Pentatone Gallery
                  </p>
                </div>

                <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#101828] sm:text-5xl">
                  {
                    program.title
                  }
                </h1>

                {/* DATE */}

                {program.event_date && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <CalendarDays className="h-4 w-4 text-[#d40000]" />

                    {formatEventDate(
                      program.event_date,
                    )}
                  </div>
                )}

                {/* DESCRIPTION */}

                {program.description && (
                  <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
                    {
                      program.description
                    }
                  </p>
                )}
              </div>

              {/* ================================= */}
              {/* STATS */}
              {/* ================================= */}

              <div className="flex flex-wrap gap-2">
                <MediaStat
                  icon={
                    <Images />
                  }
                  value={
                    media.length
                  }
                  label="Media"
                />

                <MediaStat
                  icon={
                    <ImageIcon />
                  }
                  value={
                    photos.length
                  }
                  label="Photos"
                />

                <MediaStat
                  icon={
                    <Video />
                  }
                  value={
                    videos.length
                  }
                  label="Videos"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================= */}
        {/* PHOTOS */}
        {/* ================================= */}

        {photos.length > 0 && (
          <section className="px-6 py-14 sm:py-16 lg:px-8">
            <div className="mx-auto max-w-7xl">
              {/* HEADER */}

              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d40000]">
                    Photo Memories
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-[#101828] sm:text-3xl">
                    Photos
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Click any photo
                    to view the full
                    image.
                  </p>
                </div>

                <p className="hidden text-sm text-gray-500 sm:block">
                  {
                    photos.length
                  }{" "}
                  photo
                  {photos.length ===
                  1
                    ? ""
                    : "s"}
                </p>
              </div>

              {/* ================================= */}
              {/* PHOTO MOSAIC */}
              {/* ================================= */}

              <div className="mt-8 grid auto-rows-[210px] grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[220px] lg:grid-cols-4">
                {photos.map(
                  (
                    item,
                    index,
                  ) => {
                    const featured =
                      index === 0;

                    const wide =
                      index > 0 &&
                      index % 5 ===
                        0;

                    const photoIndex =
                      photoIndexById.get(
                        item.id,
                      ) ?? 0;

                    return (
                      <article
                        key={
                          item.id
                        }
                        className={`relative overflow-hidden rounded-2xl bg-[#101828] ${
                          featured
                            ? "sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2"
                            : wide
                              ? "lg:col-span-2"
                              : ""
                        }`}
                      >
                        {/* PHOTO */}

                        <GalleryImageLightbox
                          src={
                            item.file_url
                          }
                          alt={
                            item.caption ||
                            program.title
                          }
                          images={
                            lightboxImages
                          }
                          initialIndex={
                            photoIndex
                          }
                          buttonClassName="h-full w-full"
                          imageClassName="h-full w-full object-cover"
                          showHint={
                            true
                          }
                        />

                        {/* TYPE BADGE */}

                        <div className="pointer-events-none absolute left-4 top-4 z-10">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-sm">
                            <ImageIcon className="h-3 w-3" />

                            Photo
                          </span>
                        </div>

                        {/* FEATURED */}

                        {featured && (
                          <div className="pointer-events-none absolute right-4 top-4 z-10">
                            <span className="rounded-full bg-[#d40000] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                              Featured
                            </span>
                          </div>
                        )}

                        {/* CAPTION */}

                        {item.caption && (
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-5 pb-5 pt-16">
                            <p
                              className={`font-medium leading-6 text-white ${
                                featured
                                  ? "text-base sm:text-lg"
                                  : "text-sm"
                              }`}
                            >
                              {
                                item.caption
                              }
                            </p>
                          </div>
                        )}
                      </article>
                    );
                  },
                )}
              </div>
            </div>
          </section>
        )}

        {/* ================================= */}
        {/* VIDEOS */}
        {/* ================================= */}

        {videos.length > 0 && (
          <section className="border-t border-gray-100 bg-[#f8f9fc] px-6 py-14 sm:py-16 lg:px-8">
            <div className="mx-auto max-w-7xl">
              {/* HEADER */}

              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d40000]">
                    Video Memories
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-[#101828] sm:text-3xl">
                    Videos
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Watch performances
                    and moments from
                    this program.
                  </p>
                </div>

                <p className="hidden text-sm text-gray-500 sm:block">
                  {
                    videos.length
                  }{" "}
                  video
                  {videos.length ===
                  1
                    ? ""
                    : "s"}
                </p>
              </div>

              {/* ================================= */}
              {/* VIDEO GRID */}
              {/* ================================= */}

              <div className="mt-8 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                {videos.map(
                  (item) => (
                    <article
                      key={
                        item.id
                      }
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
                    >
                      {/* VIDEO PLAYER */}

                      <div className="bg-black">
                        <video
                          src={
                            item.file_url
                          }
                          controls
                          preload="metadata"
                          className="aspect-video w-full bg-black object-contain"
                        />
                      </div>

                      {/* VIDEO INFO */}

                      <div className="p-5">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#d40000]">
                          <Video className="h-4 w-4" />

                          Video
                        </div>

                        {item.caption ? (
                          <p className="mt-3 text-sm leading-6 text-gray-600">
                            {
                              item.caption
                            }
                          </p>
                        ) : (
                          <p className="mt-3 text-sm text-gray-400">
                            Pentatone
                            Musical Club
                            video
                          </p>
                        )}
                      </div>
                    </article>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

        {/* ================================= */}
        {/* EMPTY PROGRAM */}
        {/* ================================= */}

        {media.length === 0 && (
          <section className="px-6 py-16 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="rounded-2xl border border-dashed border-gray-200 bg-[#f8f9fc] px-6 py-20 text-center">
                <Images className="mx-auto h-10 w-10 text-gray-300" />

                <h2 className="mt-4 text-lg font-bold text-[#101828]">
                  Media Coming Soon
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Photos and videos
                  from this program
                  will appear here
                  when they become
                  available.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ================================= */}
        {/* BACK CTA */}
        {/* ================================= */}

        <section className="border-t border-gray-100 bg-white px-6 py-12 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
            <div>
              <p className="text-sm font-bold text-[#101828]">
                Explore more
                Pentatone memories
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Browse other
                programs from our
                gallery.
              </p>
            </div>

            <Link
              href="/gallery"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#d40000] px-6 text-xs font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-red-700"
            >
              <ArrowLeft className="h-4 w-4" />

              All Programs
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

/*
 * =====================================
 * MEDIA STAT
 * =====================================
 */

function MediaStat({
  icon,
  value,
  label,
}: {
  icon: ReactNode;

  value: number;

  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs text-gray-600 shadow-sm">
      <span className="text-[#d40000] [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>

      <span className="font-bold text-[#101828]">
        {value}
      </span>

      <span>
        {label}
      </span>
    </div>
  );
}

/*
 * =====================================
 * MYSQL DATE
 * =====================================
 */

function toDateInputValue(
  value: Date | string,
) {
  if (
    typeof value ===
    "string"
  ) {
    return value.slice(
      0,
      10,
    );
  }

  const year =
    value.getFullYear();

  const month =
    String(
      value.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      value.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

/*
 * =====================================
 * EVENT DATE
 * =====================================
 */

function formatEventDate(
  value: Date | string,
) {
  const rawDate =
    toDateInputValue(
      value,
    );

  const [
    year,
    month,
    day,
  ] = rawDate
    .split("-")
    .map(Number);

  const safeDate =
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
      month: "long",
      day: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(
    safeDate,
  );
}