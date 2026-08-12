import Link from "next/link";
import type { ReactNode } from "react";
import type { RowDataPacket } from "mysql2";

import {
  CalendarDays,
  ImageIcon,
  Images,
  Video,
} from "lucide-react";

import GalleryProgramForm from "@/components/admin/gallery-program-form";
import db from "@/lib/db";

interface ProgramRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  event_date: Date | string | null;
  is_published: number | boolean;
  created_at: Date;

  media_count: number | string;
  image_count: number | string;
  video_count: number | string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

export default async function AdminGalleryPage() {
  /*
   * ==============================
   * GALLERY PROGRAMS
   * ==============================
   */

  const [programRows] =
    await db.execute<ProgramRow[]>(
      `
        SELECT
          gp.id,
          gp.title,
          gp.description,
          gp.event_date,
          gp.is_published,
          gp.created_at,

          COUNT(gm.id) AS media_count,

          SUM(
            CASE
              WHEN gm.media_type = 'IMAGE'
              THEN 1
              ELSE 0
            END
          ) AS image_count,

          SUM(
            CASE
              WHEN gm.media_type = 'VIDEO'
              THEN 1
              ELSE 0
            END
          ) AS video_count

        FROM gallery_programs gp

        LEFT JOIN gallery_media gm
          ON gm.program_id = gp.id

        GROUP BY
          gp.id,
          gp.title,
          gp.description,
          gp.event_date,
          gp.is_published,
          gp.created_at

        ORDER BY
          COALESCE(
            gp.event_date,
            DATE(gp.created_at)
          ) DESC,
          gp.created_at DESC
      `,
    );

  /*
   * ==============================
   * TOTAL MEDIA
   * ==============================
   */

  const [mediaRows] =
    await db.execute<CountRow[]>(
      `
        SELECT
          COUNT(*) AS total

        FROM gallery_media
      `,
    );

  const programs = programRows;

  const totalMedia =
    mediaRows[0]?.total ?? 0;

  const publishedPrograms =
    programs.filter(
      (program) =>
        Boolean(
          program.is_published,
        ),
    ).length;

  return (
    <main className="px-7 py-7 xl:px-10">
      <div className="mx-auto max-w-[1450px]">
        {/* ============================== */}
        {/* PAGE HEADER */}
        {/* ============================== */}

        <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-[3px] w-10 bg-red-600" />

              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">
                Gallery Management
              </p>
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Gallery Programs
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Create event-based gallery
              programs and manage photos
              and videos under each
              program.
            </p>
          </div>

          <GalleryProgramForm />
        </section>

        {/* ============================== */}
        {/* STATISTICS */}
        {/* ============================== */}

        <section className="mt-7 grid gap-5 sm:grid-cols-3">
          <StatCard
            label="Programs"
            value={programs.length}
            icon={<Images />}
          />

          <StatCard
            label="Published"
            value={publishedPrograms}
            icon={<ImageIcon />}
          />

          <StatCard
            label="Total Media"
            value={totalMedia}
            icon={<Video />}
          />
        </section>

        {/* ============================== */}
        {/* PROGRAM LIST */}
        {/* ============================== */}

        <section className="mt-7 overflow-hidden rounded-xl border border-red-100 bg-white">
          <div className="border-b border-red-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-950">
              Programs
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {programs.length} gallery
              program(s)
            </p>
          </div>

          {programs.length > 0 ? (
            <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
              {programs.map(
                (program) => {
                  const mediaCount =
                    Number(
                      program.media_count,
                    ) || 0;

                  const imageCount =
                    Number(
                      program.image_count,
                    ) || 0;

                  const videoCount =
                    Number(
                      program.video_count,
                    ) || 0;

                  return (
                    <article
                      key={program.id}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      {/* ============================== */}
                      {/* PROGRAM COVER */}
                      {/* ============================== */}

                      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-[#242f42] to-[#121824]">
                        <div className="text-center">
                          <Images className="mx-auto h-9 w-9 text-red-500" />

                          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">
                            Pentatone Gallery
                          </p>
                        </div>
                      </div>

                      {/* ============================== */}
                      {/* PROGRAM DETAILS */}
                      {/* ============================== */}

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg font-black leading-snug text-slate-950">
                            {program.title}
                          </h3>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-[8px] font-bold uppercase tracking-[0.08em] ${
                              program.is_published
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {program.is_published
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>

                        {/* Event Date */}

                        {program.event_date && (
                          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                            <CalendarDays className="h-4 w-4 text-red-500" />

                            {formatDate(
                              program.event_date,
                            )}
                          </div>
                        )}

                        {/* Description */}

                        <p className="mt-4 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-500">
                          {program.description ||
                            "No description added yet."}
                        </p>

                        {/* ============================== */}
                        {/* MEDIA COUNTS */}
                        {/* ============================== */}

                        <div className="mt-5 grid grid-cols-3 gap-2 border-y border-slate-100 py-4">
                          <MediaCount
                            label="Total"
                            value={
                              mediaCount
                            }
                          />

                          <MediaCount
                            label="Photos"
                            value={
                              imageCount
                            }
                          />

                          <MediaCount
                            label="Videos"
                            value={
                              videoCount
                            }
                          />
                        </div>

                        {/* ============================== */}
                        {/* MANAGE MEDIA */}
                        {/* ============================== */}

                        <Link
                          href={`/admin/gallery/${program.id}`}
                          className="mt-5 flex h-11 w-full items-center justify-center rounded-lg bg-slate-950 text-xs font-bold uppercase tracking-[0.06em] text-white transition hover:bg-red-600"
                        >
                          Manage Media
                        </Link>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          ) : (
            /* ============================== */
            /* EMPTY STATE */
            /* ============================== */

            <div className="px-6 py-20 text-center">
              <Images className="mx-auto h-11 w-11 text-slate-300" />

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                No Gallery Programs Yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create your first program
                using the Create Program
                button above.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/*
 * ==============================
 * STAT CARD
 * ==============================
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
 * ==============================
 * MEDIA COUNT
 * ==============================
 */

function MediaCount({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="text-center">
      <p className="text-lg font-black text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

/*
 * ==============================
 * DATE FORMAT
 * ==============================
 */

function formatDate(
  value: Date | string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(
    new Date(value),
  );
}