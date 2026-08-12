import Link from "next/link";
import { notFound } from "next/navigation";

import type { ReactNode } from "react";
import type { RowDataPacket } from "mysql2";

import {
  ArrowLeft,
  CalendarDays,
  ImageIcon,
  Images,
  Video,
} from "lucide-react";

import GalleryMediaUpload from "@/components/admin/gallery-media-upload";
import GalleryMediaDeleteButton from "@/components/admin/gallery-media-delete-button";
import GalleryMediaEditButton from "@/components/admin/gallery-media-edit-button";
import GalleryProgramActions from "@/components/admin/gallery-program-actions";

import db from "@/lib/db";

/*
 * =====================================
 * TYPES
 * =====================================
 */

interface ProgramRow extends RowDataPacket {
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

  cover_image:
    | string
    | null;

  is_published:
    | number
    | boolean;

  created_at: Date;
}

interface MediaRow extends RowDataPacket {
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
    id: string;
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
   * PROGRAM ID
   * =====================================
   */

  const { id } =
    await params;

  const programId =
    Number(id);

  if (
    !Number.isInteger(
      programId,
    ) ||
    programId <= 0
  ) {
    notFound();
  }

  /*
   * =====================================
   * PROGRAM
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
          cover_image,
          is_published,
          created_at

        FROM gallery_programs

        WHERE id = ?

        LIMIT 1
      `,
      [programId],
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
          created_at DESC
      `,
      [programId],
    );

  /*
   * =====================================
   * COUNTS
   * =====================================
   */

  const imageCount =
    media.filter(
      (item) =>
        item.media_type ===
        "IMAGE",
    ).length;

  const videoCount =
    media.filter(
      (item) =>
        item.media_type ===
        "VIDEO",
    ).length;

  /*
   * =====================================
   * DATE FOR EDIT FORM
   * =====================================
   */

  const eventDateInput =
    program.event_date
      ? toDateInputValue(
          program.event_date,
        )
      : "";

  return (
    <main className="px-7 py-7 xl:px-10">
      <div className="mx-auto max-w-[1450px]">
        {/* ================================= */}
        {/* BACK */}
        {/* ================================= */}

        <Link
          href="/admin/gallery"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 transition-colors hover:text-red-600"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Gallery
        </Link>

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <section className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          {/* LEFT */}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span className="h-[3px] w-10 bg-red-600" />

              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">
                Gallery Program
              </p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <h1 className="text-3xl font-black tracking-tight text-slate-950">
                {program.title}
              </h1>

              <span
                className={`rounded-full px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] ${
                  program.is_published
                    ? "bg-green-50 text-green-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {program.is_published
                  ? "Published"
                  : "Draft"}
              </span>
            </div>

            {/* EVENT DATE */}

            {program.event_date && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4 text-red-500" />

                {formatEventDate(
                  program.event_date,
                )}
              </div>
            )}

            {/* DESCRIPTION */}

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              {program.description ||
                "No description has been added for this gallery program."}
            </p>
          </div>

          {/* ================================= */}
          {/* PROGRAM ACTIONS */}
          {/* ================================= */}

          <div className="shrink-0 lg:pt-7">
            <GalleryProgramActions
              programId={
                programId
              }
              title={
                program.title
              }
              description={
                program.description
              }
              eventDate={
                eventDateInput
              }
              isPublished={Boolean(
                program.is_published,
              )}
            />
          </div>
        </section>

        {/* ================================= */}
        {/* STATISTICS */}
        {/* ================================= */}

        <section className="mt-8 grid gap-5 sm:grid-cols-3">
          <StatCard
            label="Total Media"
            value={
              media.length
            }
            icon={
              <Images />
            }
          />

          <StatCard
            label="Photos"
            value={
              imageCount
            }
            icon={
              <ImageIcon />
            }
          />

          <StatCard
            label="Videos"
            value={
              videoCount
            }
            icon={
              <Video />
            }
          />
        </section>

        {/* ================================= */}
        {/* UPLOAD MEDIA */}
        {/* ================================= */}

        <section className="mt-7 overflow-hidden rounded-xl border border-red-100 bg-white">
          <div className="border-b border-red-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-950">
              Add Photos & Videos
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload multiple photos
              and videos under this
              gallery program.
            </p>
          </div>

          <div className="p-6">
            <GalleryMediaUpload
              programId={
                programId
              }
            />
          </div>
        </section>

        {/* ================================= */}
        {/* PROGRAM MEDIA */}
        {/* ================================= */}

        <section className="mt-7 overflow-hidden rounded-xl border border-red-100 bg-white">
          <div className="border-b border-red-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-950">
              Program Media
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {media.length} media
              item(s)
            </p>
          </div>

          {media.length > 0 ? (
            <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {media.map(
                (item) => (
                  <article
                    key={
                      item.id
                    }
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow duration-200 hover:shadow-lg"
                  >
                    {/* ================================= */}
                    {/* IMAGE */}
                    {/* ================================= */}

                    {item.media_type ===
                    "IMAGE" ? (
                      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                        <img
                          src={
                            item.file_url
                          }
                          alt={
                            item.caption ||
                            program.title
                          }
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      /* ================================= */
                      /* VIDEO */
                      /* ================================= */

                      <div className="aspect-[4/3] overflow-hidden bg-black">
                        <video
                          src={
                            item.file_url
                          }
                          controls
                          preload="metadata"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}

                    {/* ================================= */}
                    {/* MEDIA DETAILS */}
                    {/* ================================= */}

                    <div className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-[8px] font-bold uppercase tracking-[0.08em] ${
                            item.media_type ===
                            "IMAGE"
                              ? "bg-red-50 text-red-600"
                              : "bg-slate-900 text-white"
                          }`}
                        >
                          {item.media_type ===
                          "IMAGE"
                            ? "Photo"
                            : "Video"}
                        </span>

                        <span className="text-[9px] font-medium text-slate-400">
                          #
                          {
                            item.sort_order
                          }
                        </span>
                      </div>

                      {/* ================================= */}
                      {/* CAPTION */}
                      {/* ================================= */}

                      <p className="mt-3 min-h-[40px] break-words text-sm leading-5 text-slate-600">
                        {item.caption ||
                          "No caption"}
                      </p>

                      {/* ================================= */}
                      {/* DATE */}
                      {/* ================================= */}

                      <p className="mt-3 text-[9px] font-medium uppercase tracking-[0.06em] text-slate-400">
                        {formatTimestamp(
                          item.created_at,
                        )}
                      </p>

                      {/* ================================= */}
                      {/* ACTIONS */}
                      {/* ================================= */}

                      <div className="mt-4 space-y-2">
                        <GalleryMediaEditButton
                          programId={
                            programId
                          }
                          mediaId={
                            item.id
                          }
                          currentCaption={
                            item.caption
                          }
                        />

                        <GalleryMediaDeleteButton
                          programId={
                            programId
                          }
                          mediaId={
                            item.id
                          }
                        />
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>
          ) : (
            /* ================================= */
            /* EMPTY STATE */
            /* ================================= */

            <div className="px-6 py-20 text-center">
              <Images className="mx-auto h-11 w-11 text-slate-300" />

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                No Media Yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Upload photos or videos
                above. They will
                automatically appear
                here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
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
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <article className="rounded-xl border border-slate-100 border-t-[3px] border-t-red-600 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="text-red-600">
        <div className="[&>svg]:h-7 [&>svg]:w-7">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-4xl font-black text-slate-950">
        {value}
      </p>
    </article>
  );
}

/*
 * =====================================
 * MYSQL DATE -> YYYY-MM-DD
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
 * EVENT DATE DISPLAY
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

/*
 * =====================================
 * MEDIA UPLOAD DATE
 * =====================================
 */

function formatTimestamp(
  value: Date | string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );
}