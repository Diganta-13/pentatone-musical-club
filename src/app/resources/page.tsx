import Link from "next/link";

import type {
  ReactNode,
} from "react";

import type {
  RowDataPacket,
} from "mysql2";

import {
  ArrowRight,
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Headphones,
  Library,
  Mic2,
  Music2,
  Piano,
  Play,
  Video,
} from "lucide-react";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

import { getCurrentUser } from "@/lib/current-user";
import db from "@/lib/db";

/*
 * =====================================
 * ALWAYS LOAD FRESH DATABASE DATA
 * =====================================
 */

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

/*
 * =====================================
 * TYPES
 * =====================================
 */

type ResourceCategory =
  | "PRACTICE_NOTES"
  | "MUSIC_THEORY"
  | "VOCAL_TRAINING"
  | "INSTRUMENT_GUIDES";

type ResourceType =
  | "PDF"
  | "VIDEO"
  | "LINK";

type ResourceLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "ALL_LEVELS";

interface ResourceRow
  extends RowDataPacket {
  id: number;

  title: string;

  slug: string;

  category:
    ResourceCategory;

  resource_type:
    ResourceType;

  level:
    ResourceLevel;

  description:
    | string
    | null;

  resource_url:
    | string
    | null;

  file_path:
    | string
    | null;

  cover_image:
    | string
    | null;

  is_featured:
    | number
    | boolean;

  created_at: string;
}

/*
 * =====================================
 * PAGE
 * =====================================
 */

export default async function ResourcesPage() {
  /*
   * =====================================
   * CURRENT USER
   * =====================================
   */

  const currentUser =
    await getCurrentUser();

  /*
   * =====================================
   * LOAD ALL PUBLISHED RESOURCES
   * =====================================
   */

  const [resources] =
    await db.execute<
      ResourceRow[]
    >(
      `
        SELECT
          id,
          title,
          slug,
          category,
          resource_type,
          level,
          description,
          resource_url,
          file_path,
          cover_image,
          is_featured,

          DATE_FORMAT(
            created_at,
            '%Y-%m-%d %H:%i:%s'
          ) AS created_at

        FROM resources

        WHERE is_published = 1

        ORDER BY
          is_featured DESC,
          created_at DESC,
          id DESC
      `,
    );

  /*
   * =====================================
   * FEATURED RESOURCE
   * =====================================
   */

  const featuredResource =
    resources.find(
      (resource) =>
        Boolean(
          resource.is_featured,
        ),
    ) ??
    resources[0];

  /*
   * =====================================
   * PDF RESOURCES
   * =====================================
   */

  const pdfResources =
    resources.filter(
      (resource) =>
        resource.resource_type ===
        "PDF",
    );

  /*
   * =====================================
   * VIDEO RESOURCES
   * =====================================
   */

  const videoResources =
    resources.filter(
      (resource) =>
        resource.resource_type ===
        "VIDEO",
    );

  /*
   * =====================================
   * EXTERNAL LINK RESOURCES
   * =====================================
   *
   * IMPORTANT:
   * We are NOT filtering by resource_url.
   * So every published LINK resource
   * will appear on the page.
   *
   * =====================================
   */

  const linkResources =
    resources.filter(
      (resource) =>
        resource.resource_type ===
        "LINK",
    );

  /*
   * =====================================
   * RENDER
   * =====================================
   */

  return (
    <>
      <Navbar />

      <main className="overflow-hidden bg-[#f8f8fc] text-[#111827]">

        {/* ================================= */}
        {/* HERO */}
        {/* ================================= */}

        <section className="relative border-b border-slate-100 bg-white">

          <div className="absolute -right-20 top-28 h-56 w-56 rounded-full border-[18px] border-red-100/70" />

          <div className="mx-auto grid min-h-[510px] max-w-[1180px] items-center gap-12 px-5 py-16 lg:grid-cols-[1fr_1.05fr] lg:px-8">

            {/* LEFT */}

            <div className="relative z-10">

              <span className="inline-flex rounded-full bg-[#d40000] px-4 py-2 text-[9px] font-black uppercase tracking-[0.06em] text-white">
                Academic Excellence
              </span>

              <h1 className="mt-7 text-5xl font-black tracking-[-0.04em] text-[#111827] sm:text-6xl">

                Music{" "}

                <span className="italic text-[#d40000]">
                  Resources
                </span>

              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                Learn, practice and improve your
                musical skills with Pentatone
                resources. Our curated library is
                designed for students who want to
                grow as musicians and performers.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                <a
                  href="#resource-library"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#d40000] px-6 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-lg shadow-red-100 transition hover:bg-red-700"
                >
                  Explore Library

                  <ArrowRight className="h-4 w-4" />
                </a>

                {videoResources.length >
                0 ? (
                  <a
                    href="#tutorials"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-900 bg-white px-6 text-[10px] font-black uppercase tracking-[0.08em] text-slate-900 transition hover:bg-slate-900 hover:text-white"
                  >
                    <Play className="h-4 w-4" />

                    Watch Tutorials
                  </a>
                ) : (
                  <a
                    href="#download-materials"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-900 bg-white px-6 text-[10px] font-black uppercase tracking-[0.08em] text-slate-900 transition hover:bg-slate-900 hover:text-white"
                  >
                    <BookOpen className="h-4 w-4" />

                    View Materials
                  </a>
                )}

              </div>

            </div>

            {/* FEATURED RESOURCE */}

            <div className="relative z-10">

              <div className="overflow-hidden rounded-2xl border-t-[3px] border-[#d40000] bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">

                {featuredResource ? (
                  <>

                    <div className="h-[300px] overflow-hidden rounded-xl bg-slate-100">

                      {featuredResource.cover_image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={
                            featuredResource.cover_image
                          }
                          alt={
                            featuredResource.title
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#111827] to-[#2b3443] text-white">

                          <Music2 className="h-20 w-20 text-red-500" />

                        </div>
                      )}

                    </div>

                    <div className="flex items-center gap-4 px-1 pb-2 pt-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d40000] text-white">

                        {featuredResource.resource_type ===
                        "VIDEO" ? (
                          <Play className="h-4 w-4 fill-current" />
                        ) : featuredResource.resource_type ===
                          "PDF" ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <ExternalLink className="h-4 w-4" />
                        )}

                      </div>

                      <div className="min-w-0">

                        <p className="text-[8px] font-black uppercase tracking-[0.07em] text-[#d40000]">
                          Featured Resource
                        </p>

                        <h2 className="mt-1 text-sm font-black text-[#111827]">
                          {
                            featuredResource.title
                          }
                        </h2>

                      </div>

                    </div>

                  </>
                ) : (
                  <div className="flex min-h-[360px] flex-col items-center justify-center px-8 text-center">

                    <Library className="h-14 w-14 text-red-500" />

                    <h2 className="mt-5 text-lg font-black">
                      Resource Library
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Learning resources will appear
                      here when published by the
                      club.
                    </p>

                  </div>
                )}

              </div>

            </div>

          </div>

        </section>

        {/* ================================= */}
        {/* RESOURCE CATEGORIES */}
        {/* ================================= */}

        <section
          id="resource-library"
          className="bg-[#fbfbff] py-20"
        >

          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">

            <SectionHeader
              title="Resource Categories"
              description="Structured learning paths for every discipline."
            />

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <CategoryCard
                icon={
                  <FileText />
                }
                title="Practice Notes"
                description="Curated templates and frameworks to track your daily progress and hit milestones."
                href="#download-materials"
              />

              <CategoryCard
                icon={
                  <BookOpen />
                }
                title="Music Theory"
                description="From basics to advanced orchestration techniques for the technical mind."
                href="#external-resources"
              />

              <CategoryCard
                icon={
                  <Mic2 />
                }
                title="Vocal Training"
                description="Warm-ups, breathing techniques, and vocal health guides for performers."
                href="#tutorials"
              />

              <CategoryCard
                icon={
                  <Piano />
                }
                title="Instrument Guides"
                description="Setup and technique manuals for guitar, keys, drums, and more."
                href="#download-materials"
              />

            </div>

          </div>

        </section>

        {/* ================================= */}
        {/* DOWNLOAD MATERIALS */}
        {/* ================================= */}

        <section
          id="download-materials"
          className="bg-[#f2f5ff] py-20"
        >

          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">

            <SectionHeader
              title="Download Materials"
              description="Essential PDFs and guides for offline study."
            />

            {pdfResources.length >
            0 ? (
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {pdfResources.map(
                  (resource) => (
                    <article
                      key={
                        resource.id
                      }
                      className="rounded-xl border-l-[3px] border-[#d40000] bg-white p-5 shadow-sm"
                    >

                      <div className="flex items-start gap-4">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#e8edf9] text-[#111827]">

                          <FileText className="h-5 w-5" />

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center justify-between gap-2">

                            <h3 className="text-sm font-black text-[#111827]">
                              {
                                resource.title
                              }
                            </h3>

                            <LevelBadge
                              level={
                                resource.level
                              }
                            />

                          </div>

                          {resource.description && (
                            <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-slate-500">
                              {
                                resource.description
                              }
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap gap-3 text-[9px] font-medium text-slate-500">

                            <span>
                              PDF
                            </span>

                            <span>
                              {
                                categoryLabel(
                                  resource.category,
                                )
                              }
                            </span>

                            <span>
                              {
                                formatMonth(
                                  resource.created_at,
                                )
                              }
                            </span>

                          </div>

                        </div>

                      </div>

                      {resource.file_path ? (
                        <a
                          href={
                            resource.file_path
                          }
                          download
                          className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#d40000] text-[9px] font-black uppercase tracking-[0.08em] text-white transition hover:bg-red-700"
                        >
                          <Download className="h-3.5 w-3.5" />

                          Download
                        </a>
                      ) : (
                        <div className="mt-5 flex h-9 w-full items-center justify-center rounded-md bg-slate-100 text-[9px] font-black uppercase tracking-[0.08em] text-slate-400">
                          File Unavailable
                        </div>
                      )}

                    </article>
                  ),
                )}

              </div>
            ) : (
              <EmptyResources
                message="No downloadable materials have been published yet."
              />
            )}

          </div>

        </section>

        {/* ================================= */}
        {/* VIDEO TUTORIALS */}
        {/* ================================= */}

        {videoResources.length >
          0 && (
          <section
            id="tutorials"
            className="bg-white py-20"
          >

            <div className="mx-auto max-w-[1180px] px-5 lg:px-8">

              <SectionHeader
                title="Video Tutorials"
                description="Watch lessons and training materials selected by Pentatone."
              />

              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {videoResources.map(
                  (resource) => (
                    <article
                      key={
                        resource.id
                      }
                      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.1)]"
                    >

                      <div className="relative h-48 overflow-hidden bg-[#111827]">

                        {resource.cover_image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={
                              resource.cover_image
                            }
                            alt={
                              resource.title
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">

                            <Video className="h-12 w-12 text-red-500" />

                          </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center bg-black/15">

                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d40000] text-white shadow-xl">

                            <Play className="ml-0.5 h-4 w-4 fill-current" />

                          </div>

                        </div>

                      </div>

                      <div className="p-5">

                        <div className="flex flex-wrap items-center justify-between gap-2">

                          <LevelBadge
                            level={
                              resource.level
                            }
                          />

                          <span className="text-[8px] font-bold uppercase tracking-[0.05em] text-slate-400">
                            {
                              categoryLabel(
                                resource.category,
                              )
                            }
                          </span>

                        </div>

                        <h3 className="mt-3 text-base font-black text-[#111827]">
                          {
                            resource.title
                          }
                        </h3>

                        {resource.description && (
                          <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                            {
                              resource.description
                            }
                          </p>
                        )}

                        {resource.resource_url ? (
                          <a
                            href={
                              resource.resource_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.07em] text-[#d40000]"
                          >
                            Watch Tutorial

                            <ArrowRight className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <p className="mt-5 text-[9px] font-black uppercase tracking-[0.07em] text-slate-400">
                            Video URL unavailable
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
        {/* EXTERNAL LEARNING RESOURCES */}
        {/* ================================= */}

        {linkResources.length >
          0 && (
          <section
            id="external-resources"
            className="bg-[#f7f9ff] py-20"
          >

            <div className="mx-auto max-w-[1180px] px-5 lg:px-8">

              <SectionHeader
                title="External Learning Resources"
                description="Useful websites, references and online learning materials selected by Pentatone."
              />

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {linkResources.map(
                  (resource) => (
                    <article
                      key={
                        resource.id
                      }
                      className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]"
                    >

                      {/* OPTIONAL COVER */}

                      {resource.cover_image && (
                        <div className="h-44 overflow-hidden bg-slate-100">

                          {/* eslint-disable-next-line @next/next/no-img-element */}

                          <img
                            src={
                              resource.cover_image
                            }
                            alt={
                              resource.title
                            }
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          />

                        </div>
                      )}

                      <div className="p-6">

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#d40000]">

                            <ExternalLink className="h-5 w-5" />

                          </div>

                          <LevelBadge
                            level={
                              resource.level
                            }
                          />

                        </div>

                        <p className="mt-5 text-[8px] font-black uppercase tracking-[0.08em] text-[#d40000]">
                          External Resource
                        </p>

                        <h3 className="mt-2 text-base font-black text-[#111827]">
                          {
                            resource.title
                          }
                        </h3>

                        {resource.description && (
                          <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-500">
                            {
                              resource.description
                            }
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-2 text-[9px] font-medium text-slate-400">

                          <span>
                            {
                              categoryLabel(
                                resource.category,
                              )
                            }
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {
                              formatMonth(
                                resource.created_at,
                              )
                            }
                          </span>

                        </div>

                        {resource.resource_url ? (
                          <a
                            href={
                              resource.resource_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#111827] px-5 text-[9px] font-black uppercase tracking-[0.07em] text-white transition hover:bg-[#d40000]"
                          >
                            Visit Resource

                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <div className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 px-5 text-[9px] font-black uppercase tracking-[0.07em] text-slate-400">
                            Link Unavailable
                          </div>
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
        {/* EMPTY EXTERNAL MESSAGE */}
        {/* ================================= */}

        {linkResources.length ===
          0 && (
          <section
            id="external-resources"
            className="bg-[#f7f9ff] py-20"
          >

            <div className="mx-auto max-w-[1180px] px-5 lg:px-8">

              <SectionHeader
                title="External Learning Resources"
                description="Useful websites, references and online learning materials selected by Pentatone."
              />

              <EmptyResources
                message="No external learning resources have been published yet."
              />

            </div>

          </section>
        )}

        {/* ================================= */}
        {/* IMPROVE YOUR MUSICAL JOURNEY */}
        {/* ================================= */}

        <section className="bg-[#fbfbff] py-20">

          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">

            <div className="grid overflow-hidden rounded-3xl bg-[#151d2b] lg:grid-cols-2">

              {/* IMAGE */}

              <div className="min-h-[370px]">

                {featuredResource?.cover_image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={
                      featuredResource.cover_image
                    }
                    alt=""
                    className="h-full min-h-[370px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[370px] items-center justify-center bg-gradient-to-br from-[#2b3443] to-[#090e16]">

                    <Headphones className="h-24 w-24 text-red-600" />

                  </div>
                )}

              </div>

              {/* CONTENT */}

              <div className="flex flex-col justify-center px-8 py-12 text-white sm:px-12">

                <h2 className="text-3xl font-black tracking-tight">

                  Improve Your{" "}

                  <span className="text-[#e10000]">
                    Musical Journey
                  </span>

                </h2>

                <JourneyItem
                  title="Practice Tips"
                  description="Build consistent habits and improve your musical technique through structured practice."
                />

                <JourneyItem
                  title="Learning Guides"
                  description="Use curated theory, vocal and instrumental materials to improve step by step."
                />

                <JourneyItem
                  title="Performance Prep"
                  description="Prepare with confidence for auditions, rehearsals and live performances."
                />

                <a
                  href="#resource-library"
                  className="mt-8 inline-flex h-11 w-fit items-center justify-center rounded-lg bg-[#d40000] px-6 text-[9px] font-black uppercase tracking-[0.08em] text-white transition hover:bg-red-700"
                >
                  Start Learning
                </a>

              </div>

            </div>

          </div>

        </section>

        {/* ================================= */}
        {/* CTA */}
        {/* ================================= */}

        <section className="bg-[#fbfbff] pb-24 pt-8">

          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">

            <div className="rounded-3xl bg-[#d40000] px-6 py-16 text-center text-white sm:px-12">

              <h2 className="text-3xl font-black tracking-tight">
                Ready to Improve Your Skills?
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/80">
                Explore Pentatone&apos;s learning
                resources and continue building
                your musical skills.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">

                <a
                  href="#resource-library"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-[9px] font-black uppercase tracking-[0.08em] text-[#b80000]"
                >
                  Explore Resources
                </a>

                {!currentUser && (
                  <Link
                    href="/register"
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-white px-6 text-[9px] font-black uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-[#d40000]"
                  >
                    Join Club
                  </Link>
                )}

              </div>

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
 * SECTION HEADER
 * =====================================
 */

function SectionHeader({
  title,
  description,
}: {
  title: string;

  description: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6">

      <div>

        <h2 className="text-3xl font-black tracking-tight text-[#111827]">
          {title}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {description}
        </p>

      </div>

      <span className="hidden h-[3px] w-16 bg-[#d40000] sm:block" />

    </div>
  );
}

/*
 * =====================================
 * CATEGORY CARD
 * =====================================
 */

function CategoryCard({
  icon,
  title,
  description,
  href,
}: {
  icon: ReactNode;

  title: string;

  description: string;

  href: string;
}) {
  return (
    <article className="flex min-h-[235px] flex-col rounded-xl border-t-[3px] border-[#d40000] bg-white p-7 shadow-[0_15px_40px_rgba(15,23,42,0.06)]">

      <div className="text-[#d40000] [&>svg]:h-6 [&>svg]:w-6">
        {icon}
      </div>

      <h3 className="mt-7 text-sm font-black text-[#111827]">
        {title}
      </h3>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {description}
      </p>

      <a
        href={href}
        className="mt-auto flex items-center gap-2 pt-5 text-[9px] font-black uppercase tracking-[0.07em] text-[#c70000]"
      >
        View Resources

        <ArrowRight className="h-3.5 w-3.5" />
      </a>

    </article>
  );
}

/*
 * =====================================
 * JOURNEY ITEM
 * =====================================
 */

function JourneyItem({
  title,
  description,
}: {
  title: string;

  description: string;
}) {
  return (
    <div className="mt-7 flex gap-4">

      <span className="mt-2 h-2 w-2 shrink-0 rounded-sm bg-red-600" />

      <div>

        <h3 className="text-sm font-black">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-300">
          {description}
        </p>

      </div>

    </div>
  );
}

/*
 * =====================================
 * LEVEL BADGE
 * =====================================
 */

function LevelBadge({
  level,
}: {
  level:
    ResourceLevel;
}) {
  const labels = {
    BEGINNER:
      "Beginner",

    INTERMEDIATE:
      "Intermediate",

    ADVANCED:
      "Advanced",

    ALL_LEVELS:
      "All Levels",
  };

  return (
    <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-[7px] font-black uppercase tracking-[0.05em] text-slate-600">
      {labels[level]}
    </span>
  );
}

/*
 * =====================================
 * CATEGORY LABEL
 * =====================================
 */

function categoryLabel(
  category:
    ResourceCategory,
) {
  const labels = {
    PRACTICE_NOTES:
      "Practice Notes",

    MUSIC_THEORY:
      "Music Theory",

    VOCAL_TRAINING:
      "Vocal Training",

    INSTRUMENT_GUIDES:
      "Instrument Guides",
  };

  return labels[category];
}

/*
 * =====================================
 * EMPTY STATE
 * =====================================
 */

function EmptyResources({
  message,
}: {
  message: string;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">

      <Library className="mx-auto h-10 w-10 text-slate-300" />

      <p className="mt-4 text-sm font-semibold text-slate-500">
        {message}
      </p>

    </div>
  );
}

/*
 * =====================================
 * DATE FORMAT
 * =====================================
 */

function formatMonth(
  value: string,
) {
  const date =
    new Date(
      value.replace(
        " ",
        "T",
      ),
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      year: "numeric",
    },
  ).format(date);
}