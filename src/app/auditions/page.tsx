import type {
  ReactNode,
} from "react";

import type {
  RowDataPacket,
} from "mysql2";

import {
  Mic2,
  Music2,
  Sparkles,
} from "lucide-react";

import AuditionSessionCard, {
  type PublicAuditionSession,
} from "@/components/auditions/audition-session-card";

import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";

import db from "@/lib/db";

/*
 * =====================================
 * TYPES
 * =====================================
 */

interface AuditionSessionRow
  extends RowDataPacket {
  id: number;

  title: string;

  slug: string;

  short_description:
    | string
    | null;

  audition_date: string;

  start_time:
    | string
    | null;

  end_time:
    | string
    | null;

  application_deadline:
    | string
    | null;

  venue:
    | string
    | null;

  cover_image:
    | string
    | null;

  applicant_count:
    | number
    | string;
}

/*
 * =====================================
 * PAGE
 * =====================================
 */

export default async function AuditionsPage() {
  /*
   * =====================================
   * PUBLIC SESSIONS
   * =====================================
   */

  let sessions:
    PublicAuditionSession[] =
    [];

  let databaseAvailable =
    true;

  /*
   * =====================================
   * LOAD DATABASE
   * =====================================
   */

  try {
    const [rows] =
      await db.execute<
        AuditionSessionRow[]
      >(
        `
          SELECT
            aus.id,
            aus.title,
            aus.slug,
            aus.short_description,

            DATE_FORMAT(
              aus.audition_date,
              '%Y-%m-%d'
            ) AS audition_date,

            TIME_FORMAT(
              aus.start_time,
              '%H:%i'
            ) AS start_time,

            TIME_FORMAT(
              aus.end_time,
              '%H:%i'
            ) AS end_time,

            DATE_FORMAT(
              aus.application_deadline,
              '%Y-%m-%dT%H:%i'
            ) AS application_deadline,

            aus.venue,
            aus.cover_image,

            COUNT(
              aa.id
            ) AS applicant_count

          FROM audition_sessions aus

          LEFT JOIN audition_applications aa
            ON aa.session_id =
               aus.id

          WHERE
            aus.is_published = TRUE
            AND aus.status = 'OPEN'

          GROUP BY
            aus.id,
            aus.title,
            aus.slug,
            aus.short_description,
            aus.audition_date,
            aus.start_time,
            aus.end_time,
            aus.application_deadline,
            aus.venue,
            aus.cover_image,
            aus.created_at

          ORDER BY
            aus.audition_date ASC,
            aus.start_time ASC,
            aus.created_at DESC
        `,
      );

    /*
     * =====================================
     * NORMALIZE RESULT
     * =====================================
     */

    sessions =
      rows.map(
        (session) => ({
          id:
            session.id,

          title:
            session.title,

          slug:
            session.slug,

          shortDescription:
            session.short_description ||
            "",

          auditionDate:
            session.audition_date,

          startTime:
            session.start_time ||
            "",

          endTime:
            session.end_time ||
            "",

          applicationDeadline:
            session.application_deadline ||
            "",

          venue:
            session.venue ||
            "",

          coverImage:
            session.cover_image,

          applicantCount:
            Number(
              session.applicant_count,
            ),
        }),
      );
  } catch (error) {
    databaseAvailable =
      false;

    console.error(
      "Public auditions page database error:",
      error,
    );
  }

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

        <section className="relative overflow-hidden bg-[#101828] text-white">
          {/* BACKGROUND DECORATION */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.07]">
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full border-[45px] border-white" />

            <div className="absolute -bottom-48 -right-28 h-[440px] w-[440px] rounded-full border-[55px] border-[#d40000]" />
          </div>

          {/* CONTENT */}

          <div className="relative mx-auto max-w-[1300px] px-6 py-20 sm:py-24 lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              {/* EYEBROW */}

              <div className="flex items-center gap-3">
                <span className="h-[2px] w-10 bg-[#d40000]" />

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
                  Pentatone Musical Club
                </p>
              </div>

              {/* TITLE */}

              <h1 className="mt-5 text-4xl font-black uppercase leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Find Your

                <span className="block text-[#ef1b1b]">
                  Stage.
                </span>
              </h1>

              {/* DESCRIPTION */}

              <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Audition for Pentatone
                Musical Club, showcase
                your musical ability and
                become part of the next
                generation of performers.
              </p>
            </div>

            {/* ================================= */}
            {/* HERO FEATURES */}
            {/* ================================= */}

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              <HeroPill
                icon={
                  <Mic2 />
                }
                label="Perform"
              />

              <HeroPill
                icon={
                  <Music2 />
                }
                label="Create"
              />

              <HeroPill
                icon={
                  <Sparkles />
                }
                label="Stand Out"
              />
            </div>
          </div>
        </section>

        {/* ================================= */}
        {/* OPEN AUDITIONS */}
        {/* ================================= */}

        <section className="mx-auto max-w-[1300px] px-6 py-16 lg:px-8 lg:py-20">
          {/* HEADER */}

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-10 bg-[#d40000]" />

                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#d40000]">
                  Applications
                </p>
              </div>

              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#101828] sm:text-4xl">
                Open Auditions
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Explore active
                Pentatone audition
                sessions and submit
                your application.
              </p>
            </div>

            {/* SESSION COUNT */}

            {databaseAvailable &&
              sessions.length >
                0 && (
                <div className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  {
                    sessions.length
                  }{" "}
                  Open Session
                  {sessions.length ===
                  1
                    ? ""
                    : "s"}
                </div>
              )}
          </div>

          {/* ================================= */}
          {/* DATABASE ERROR */}
          {/* ================================= */}

          {!databaseAvailable ? (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#d40000]">
                <Mic2 className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-lg font-black text-[#101828]">
                Auditions Temporarily
                Unavailable
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Audition information
                could not be loaded at
                this moment. Please try
                again shortly.
              </p>
            </div>
          ) : sessions.length >
            0 ? (
            /* ================================= */
            /* SESSION GRID */
            /* ================================= */

            <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {sessions.map(
                (session) => (
                  <AuditionSessionCard
                    key={
                      session.id
                    }
                    session={
                      session
                    }
                  />
                ),
              )}
            </div>
          ) : (
            /* ================================= */
            /* EMPTY STATE */
            /* ================================= */

            <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#d40000]">
                <Mic2 className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-lg font-black text-[#101828]">
                No Open Auditions
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                There are currently no
                published audition
                sessions accepting
                applications. Check back
                for the next Pentatone
                audition.
              </p>
            </div>
          )}
        </section>

        {/* ================================= */}
        {/* HOW IT WORKS */}
        {/* ================================= */}

        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-[1300px] px-6 py-16 lg:px-8 lg:py-20">
            {/* HEADER */}

            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#d40000]">
                How It Works
              </p>

              <h2 className="mt-3 text-2xl font-black uppercase tracking-tight text-[#101828] sm:text-3xl">
                Your Audition Journey
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                A simple process from
                application to final
                evaluation.
              </p>
            </div>

            {/* ================================= */}
            {/* STEPS */}
            {/* ================================= */}

            <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
              <ProcessCard
                number="01"
                title="Apply"
                description="Choose an open audition session and submit your musical profile and audition information."
              />

              <ProcessCard
                number="02"
                title="Perform"
                description="Submit your audition performance and demonstrate your musical ability to the Pentatone evaluators."
              />

              <ProcessCard
                number="03"
                title="Evaluation"
                description="Your performance is reviewed using defined scoring criteria before the final decision is made."
              />
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
 * HERO PILL
 * =====================================
 */

function HeroPill({
  icon,
  label,
}: {
  icon: ReactNode;

  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm">
      <span className="text-red-400 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>

      <span className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-200">
        {label}
      </span>
    </div>
  );
}

/*
 * =====================================
 * PROCESS CARD
 * =====================================
 */

function ProcessCard({
  number,
  title,
  description,
}: {
  number: string;

  title: string;

  description: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-[#f9fafc] p-6">
      <span className="text-3xl font-black text-red-100">
        {number}
      </span>

      <h3 className="mt-3 text-lg font-black uppercase tracking-tight text-[#101828]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </article>
  );
}