import Link from "next/link";

import type {
  RowDataPacket,
} from "mysql2";

import {
  ArrowUpRight,
  CalendarDays,
  ImageIcon,
  Images,
  Video,
} from "lucide-react";

import GalleryImageLightbox from "@/components/gallery/gallery-image-lightbox";

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

  created_at: Date;

  cover_image:
    | string
    | null;

  media_count:
    | number
    | string;

  photo_count:
    | number
    | string;

  video_count:
    | number
    | string;
}

/*
 * =====================================
 * COMPONENT
 * =====================================
 */

export default async function DynamicGalleryPrograms() {
  /*
   * =====================================
   * PUBLISHED PROGRAMS
   * =====================================
   */

  const [programs] =
    await db.execute<
      ProgramRow[]
    >(
      `
        SELECT
          gp.id,
          gp.title,
          gp.slug,
          gp.description,
          gp.event_date,
          gp.created_at,

          (
            SELECT
              gm.file_url

            FROM gallery_media gm

            WHERE
              gm.program_id = gp.id
              AND gm.media_type = 'IMAGE'

            ORDER BY
              gm.sort_order ASC,
              gm.created_at ASC

            LIMIT 1
          ) AS cover_image,

          (
            SELECT
              COUNT(*)

            FROM gallery_media gm

            WHERE
              gm.program_id = gp.id
          ) AS media_count,

          (
            SELECT
              COUNT(*)

            FROM gallery_media gm

            WHERE
              gm.program_id = gp.id
              AND gm.media_type = 'IMAGE'
          ) AS photo_count,

          (
            SELECT
              COUNT(*)

            FROM gallery_media gm

            WHERE
              gm.program_id = gp.id
              AND gm.media_type = 'VIDEO'
          ) AS video_count

        FROM gallery_programs gp

        WHERE
          gp.is_published = TRUE

        ORDER BY
          COALESCE(
            gp.event_date,
            DATE(gp.created_at)
          ) DESC,
          gp.created_at DESC
      `,
    );

  if (
    programs.length === 0
  ) {
    return null;
  }

  return (
    <section className="bg-white px-6 py-16 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d40000]">
              Latest Memories
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl">
              Gallery Programs
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
              Explore our latest
              programs,
              performances,
              concerts and
              memorable moments.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            {programs.length}{" "}
            program
            {programs.length === 1
              ? ""
              : "s"}
          </p>
        </div>

        {/* ================================= */}
        {/* PROGRAM GRID */}
        {/* ================================= */}

        <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map(
            (program) => {
              const mediaCount =
                Number(
                  program.media_count,
                ) || 0;

              const photoCount =
                Number(
                  program.photo_count,
                ) || 0;

              const videoCount =
                Number(
                  program.video_count,
                ) || 0;

              return (
                <article
                  key={
                    program.id
                  }
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_16px_45px_rgba(15,23,42,0.10)]"
                >
                  {/* ================================= */}
                  {/* COVER IMAGE */}
                  {/* ================================= */}

                  <div className="relative aspect-[16/10] overflow-hidden bg-[#101828]">
                    {program.cover_image ? (
                      <GalleryImageLightbox
                        src={
                          program.cover_image
                        }
                        alt={
                          program.title
                        }
                        buttonClassName="h-full w-full"
                        imageClassName="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#202b3d] to-[#101828]">
                        <div className="text-center">
                          {videoCount >
                          0 ? (
                            <Video className="mx-auto h-9 w-9 text-red-500" />
                          ) : (
                            <Images className="mx-auto h-9 w-9 text-red-500" />
                          )}

                          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                            Pentatone
                            Gallery
                          </p>
                        </div>
                      </div>
                    )}

                    {/* MEDIA COUNT */}

                    <div className="pointer-events-none absolute bottom-4 right-4 z-10">
                      <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
                        <Images className="h-3.5 w-3.5" />

                        {mediaCount}{" "}
                        Media
                      </span>
                    </div>
                  </div>

                  {/* ================================= */}
                  {/* CONTENT */}
                  {/* ================================= */}

                  <div className="p-6">
                    {/* DATE */}

                    {program.event_date && (
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <CalendarDays className="h-4 w-4 text-[#d40000]" />

                        {formatEventDate(
                          program.event_date,
                        )}
                      </div>
                    )}

                    {/* TITLE */}

                    <Link
                      href={`/gallery/${program.slug}`}
                      className="group/title mt-3 block"
                    >
                      <h3 className="text-xl font-bold leading-snug text-[#101828] transition-colors group-hover/title:text-[#d40000]">
                        {
                          program.title
                        }
                      </h3>
                    </Link>

                    {/* DESCRIPTION */}

                    <p className="mt-3 line-clamp-2 min-h-[48px] text-sm leading-6 text-gray-600">
                      {program.description ||
                        "Explore photos and videos from this Pentatone program."}
                    </p>

                    {/* ================================= */}
                    {/* COUNTS */}
                    {/* ================================= */}

                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-y border-gray-100 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <ImageIcon className="h-3.5 w-3.5 text-[#d40000]" />

                        <span className="font-bold text-[#101828]">
                          {
                            photoCount
                          }
                        </span>

                        <span>
                          Photos
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Video className="h-3.5 w-3.5 text-[#d40000]" />

                        <span className="font-bold text-[#101828]">
                          {
                            videoCount
                          }
                        </span>

                        <span>
                          Videos
                        </span>
                      </div>
                    </div>

                    {/* ================================= */}
                    {/* VIEW GALLERY */}
                    {/* ================================= */}

                    <Link
                      href={`/gallery/${program.slug}`}
                      className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#101828] text-xs font-bold uppercase tracking-[0.07em] text-white transition-colors hover:bg-[#d40000]"
                    >
                      View Gallery

                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            },
          )}
        </div>
      </div>
    </section>
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