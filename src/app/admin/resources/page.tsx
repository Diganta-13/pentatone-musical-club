import type {
  ReactNode,
} from "react";

import type {
  RowDataPacket,
} from "mysql2";

import {
  BookOpen,
  FileText,
  FolderOpen,
  Link2,
  SlidersHorizontal,
  Star,
  Video,
} from "lucide-react";

import ResourceCreateForm from "@/components/admin/resource-create-form";
import ResourceActions from "@/components/admin/resource-actions";

import db from "@/lib/db";

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

  is_published:
    | number
    | boolean;

  created_at: string;
}

type AdminResourcesPageProps = {
  searchParams: Promise<{
    category?: string;
    type?: string;
    status?: string;
  }>;
};

/*
 * =====================================
 * PAGE
 * =====================================
 */

export default async function AdminResourcesPage({
  searchParams,
}: AdminResourcesPageProps) {
  /*
   * =====================================
   * FILTER PARAMS
   * =====================================
   */

  const params =
    await searchParams;

  const selectedCategory =
    params.category?.trim() ||
    "all";

  const selectedType =
    params.type?.trim() ||
    "all";

  const selectedStatus =
    params.status?.trim() ||
    "all";

  /*
   * =====================================
   * LOAD RESOURCES
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
          is_published,

          DATE_FORMAT(
            created_at,
            '%Y-%m-%d %H:%i:%s'
          ) AS created_at

        FROM resources

        ORDER BY
          is_featured DESC,
          created_at DESC,
          id DESC
      `,
    );

  /*
   * =====================================
   * STATISTICS
   * =====================================
   */

  const totalResources =
    resources.length;

  const publishedResources =
    resources.filter(
      (resource) =>
        Boolean(
          resource.is_published,
        ),
    ).length;

  const featuredResources =
    resources.filter(
      (resource) =>
        Boolean(
          resource.is_featured,
        ),
    ).length;

  const pdfResources =
    resources.filter(
      (resource) =>
        resource.resource_type ===
        "PDF",
    ).length;

  /*
   * =====================================
   * FILTER RESOURCES
   * =====================================
   */

  const filteredResources =
    resources.filter(
      (resource) => {
        const categoryMatches =
          selectedCategory ===
            "all" ||
          resource.category ===
            selectedCategory;

        const typeMatches =
          selectedType ===
            "all" ||
          resource.resource_type ===
            selectedType;

        let statusMatches =
          true;

        if (
          selectedStatus ===
          "published"
        ) {
          statusMatches =
            Boolean(
              resource.is_published,
            );
        }

        if (
          selectedStatus ===
          "draft"
        ) {
          statusMatches =
            !Boolean(
              resource.is_published,
            );
        }

        if (
          selectedStatus ===
          "featured"
        ) {
          statusMatches =
            Boolean(
              resource.is_featured,
            );
        }

        return (
          categoryMatches &&
          typeMatches &&
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
            Resources
          </span>

        </div>

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>

            <div className="flex items-center gap-3">

              <FolderOpen className="h-5 w-5 text-[#d40000]" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#d40000]">
                Learning Portal
              </p>

            </div>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#101828] sm:text-[34px]">
              Resource Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Upload and manage music
              learning materials,
              practice notes, tutorials,
              theory resources and
              instrument guides.
            </p>

          </div>

          <ResourceCreateForm />

        </div>

        {/* ================================= */}
        {/* STATISTICS */}
        {/* ================================= */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Total Resources"
            value={
              totalResources
            }
            description="All learning materials"
            icon={
              <FolderOpen />
            }
          />

          <StatCard
            label="Published"
            value={
              publishedResources
            }
            description="Visible publicly"
            icon={
              <BookOpen />
            }
            accent="green"
          />

          <StatCard
            label="Featured"
            value={
              featuredResources
            }
            description="Highlighted resources"
            icon={
              <Star />
            }
            accent="red"
          />

          <StatCard
            label="PDF Materials"
            value={
              pdfResources
            }
            description="Downloadable files"
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
            className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]"
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

                <option value="PRACTICE_NOTES">
                  Practice Notes
                </option>

                <option value="MUSIC_THEORY">
                  Music Theory
                </option>

                <option value="VOCAL_TRAINING">
                  Vocal Training
                </option>

                <option value="INSTRUMENT_GUIDES">
                  Instrument Guides
                </option>

              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                ▼
              </span>

            </div>

            {/* TYPE */}

            <div className="relative">

              <select
                name="type"
                defaultValue={
                  selectedType
                }
                className="h-11 w-full appearance-none rounded-lg border border-transparent bg-[#f1f4fc] px-4 pr-10 text-xs font-medium text-[#344054] outline-none transition focus:border-red-200 focus:bg-white focus:ring-2 focus:ring-red-50"
              >

                <option value="all">
                  Type (All)
                </option>

                <option value="PDF">
                  PDF
                </option>

                <option value="VIDEO">
                  Video
                </option>

                <option value="LINK">
                  External Link
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

                <option value="featured">
                  Featured
                </option>

              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                ▼
              </span>

            </div>

            {/* FILTER BUTTON */}

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
        {/* RESOURCE LIST */}
        {/* ================================= */}

        <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">

          {/* HEADER */}

          <div className="border-b border-gray-100 px-5 py-5 sm:px-6">

            <h2 className="text-base font-black text-[#101828]">
              All Resources
            </h2>

            <p className="mt-1 text-xs text-gray-500">

              {
                filteredResources.length
              }{" "}

              resource

              {filteredResources.length ===
              1
                ? ""
                : "s"}{" "}

              found.

            </p>

          </div>

          {/* ================================= */}
          {/* RESOURCE TABLE */}
          {/* ================================= */}

          {filteredResources.length >
          0 ? (
            <>

              {/* ================================= */}
              {/* DESKTOP */}
              {/* ================================= */}

              <div className="hidden overflow-x-auto lg:block">

                <table className="w-full min-w-[1250px] border-collapse">

                  <thead>

                    <tr className="border-b border-red-100">

                      <TableHeading>
                        Resource
                      </TableHeading>

                      <TableHeading>
                        Category
                      </TableHeading>

                      <TableHeading>
                        Type
                      </TableHeading>

                      <TableHeading>
                        Level
                      </TableHeading>

                      <TableHeading>
                        Status
                      </TableHeading>

                      <TableHeading>
                        Added
                      </TableHeading>

                      <TableHeading>
                        Actions
                      </TableHeading>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredResources.map(
                      (
                        resource,
                        index,
                      ) => {
                        const published =
                          Boolean(
                            resource.is_published,
                          );

                        const featured =
                          Boolean(
                            resource.is_featured,
                          );

                        return (
                          <tr
                            key={
                              resource.id
                            }
                            className={`border-b border-gray-100 last:border-b-0 ${
                              index %
                                2 ===
                              0
                                ? "bg-[#fafbff]"
                                : "bg-white"
                            }`}
                          >

                            {/* RESOURCE */}

                            <td className="px-6 py-5">

                              <div className="flex min-w-[320px] items-center gap-4">

                                <ResourceThumbnail
                                  src={
                                    resource.cover_image
                                  }
                                  type={
                                    resource.resource_type
                                  }
                                />

                                <div>

                                  <div className="flex flex-wrap items-center gap-2">

                                    <p className="max-w-[310px] text-sm font-black leading-5 text-[#101828]">
                                      {
                                        resource.title
                                      }
                                    </p>

                                    {featured && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.06em] text-red-600">

                                        <Star className="h-2.5 w-2.5" />

                                        Featured

                                      </span>
                                    )}

                                  </div>

                                  {resource.description && (
                                    <p className="mt-1.5 max-w-[360px] line-clamp-2 text-[11px] leading-5 text-gray-500">
                                      {
                                        resource.description
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
                                  resource.category
                                }
                              />

                            </td>

                            {/* TYPE */}

                            <td className="px-6 py-5">

                              <TypeBadge
                                type={
                                  resource.resource_type
                                }
                              />

                            </td>

                            {/* LEVEL */}

                            <td className="px-6 py-5">

                              <LevelBadge
                                level={
                                  resource.level
                                }
                              />

                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-5">

                              <div className="flex flex-col items-start gap-1.5">

                                <PublishBadge
                                  published={
                                    published
                                  }
                                />

                                {featured && (
                                  <span className="text-[8px] font-bold uppercase tracking-[0.06em] text-red-500">
                                    Featured
                                  </span>
                                )}

                              </div>

                            </td>

                            {/* DATE */}

                            <td className="px-6 py-5 text-xs font-semibold text-[#344054]">

                              {formatDate(
                                resource.created_at,
                              )}

                            </td>

                            {/* ACTIONS */}

                            <td className="px-6 py-5">

                              <ResourceActions
                                resource={{
                                  id:
                                    resource.id,

                                  title:
                                    resource.title,

                                  category:
                                    resource.category,

                                  resourceType:
                                    resource.resource_type,

                                  level:
                                    resource.level,

                                  description:
                                    resource.description,

                                  resourceUrl:
                                    resource.resource_url,

                                  filePath:
                                    resource.file_path,

                                  coverImage:
                                    resource.cover_image,

                                  isFeatured:
                                    featured,

                                  isPublished:
                                    published,
                                }}
                              />

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

                {filteredResources.map(
                  (resource) => (
                    <article
                      key={
                        resource.id
                      }
                      className="p-5"
                    >

                      <div className="flex gap-4">

                        <ResourceThumbnail
                          src={
                            resource.cover_image
                          }
                          type={
                            resource.resource_type
                          }
                        />

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap gap-2">

                            <CategoryBadge
                              category={
                                resource.category
                              }
                            />

                            <TypeBadge
                              type={
                                resource.resource_type
                              }
                            />

                          </div>

                          <h3 className="mt-3 text-base font-black text-[#101828]">
                            {
                              resource.title
                            }
                          </h3>

                          {resource.description && (
                            <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-500">
                              {
                                resource.description
                              }
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap gap-2">

                            <LevelBadge
                              level={
                                resource.level
                              }
                            />

                            <PublishBadge
                              published={
                                Boolean(
                                  resource.is_published,
                                )
                              }
                            />

                            {Boolean(
                              resource.is_featured,
                            ) && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.05em] text-red-600">

                                <Star className="h-3 w-3" />

                                Featured

                              </span>
                            )}

                          </div>

                          {/* MOBILE ACTIONS */}

                          <div className="mt-5 border-t border-slate-100 pt-4">

                            <ResourceActions
                              resource={{
                                id:
                                  resource.id,

                                title:
                                  resource.title,

                                category:
                                  resource.category,

                                resourceType:
                                  resource.resource_type,

                                level:
                                  resource.level,

                                description:
                                  resource.description,

                                resourceUrl:
                                  resource.resource_url,

                                filePath:
                                  resource.file_path,

                                coverImage:
                                  resource.cover_image,

                                isFeatured:
                                  Boolean(
                                    resource.is_featured,
                                  ),

                                isPublished:
                                  Boolean(
                                    resource.is_published,
                                  ),
                              }}
                            />

                          </div>

                        </div>

                      </div>

                    </article>
                  ),
                )}

              </div>

            </>
          ) : (

            /* ================================= */
            /* EMPTY STATE */
            /* ================================= */

            <div className="px-6 py-20 text-center">

              <FolderOpen className="mx-auto h-11 w-11 text-gray-300" />

              <h3 className="mt-4 text-base font-black text-[#101828]">
                No resources found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Create your first
                learning resource using
                the Create Resource
                button above.
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

                <BookOpen className="h-5 w-5" />

              </div>

              <div>

                <h3 className="text-sm font-black text-[#101828]">
                  Public Resource Library
                </h3>

                <p className="mt-1 max-w-3xl text-xs leading-5 text-gray-600">
                  Published resources
                  will appear on the
                  public Music Resources
                  page. Featured
                  resources receive
                  priority placement.
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
  children: ReactNode;
}) {
  return (
    <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-[0.1em] text-gray-500">
      {children}
    </th>
  );
}

/*
 * =====================================
 * RESOURCE THUMBNAIL
 * =====================================
 */

function ResourceThumbnail({
  src,
  type,
}: {
  src:
    | string
    | null;

  type:
    ResourceType;
}) {
  if (src) {
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

  const icon =
    type === "PDF"
      ? <FileText />
      : type === "VIDEO"
        ? <Video />
        : <Link2 />;

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#101828] text-red-500 [&>svg]:h-5 [&>svg]:w-5">
      {icon}
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
    ResourceCategory;
}) {
  const label = {
    PRACTICE_NOTES:
      "Practice Notes",

    MUSIC_THEORY:
      "Music Theory",

    VOCAL_TRAINING:
      "Vocal Training",

    INSTRUMENT_GUIDES:
      "Instrument Guides",
  }[category];

  const style = {
    PRACTICE_NOTES:
      "bg-blue-50 text-blue-700",

    MUSIC_THEORY:
      "bg-purple-50 text-purple-700",

    VOCAL_TRAINING:
      "bg-red-50 text-red-600",

    INSTRUMENT_GUIDES:
      "bg-amber-50 text-amber-700",
  }[category];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.06em] ${style}`}
    >
      {label}
    </span>
  );
}

/*
 * =====================================
 * TYPE BADGE
 * =====================================
 */

function TypeBadge({
  type,
}: {
  type:
    ResourceType;
}) {
  const styles = {
    PDF:
      "bg-red-50 text-red-600",

    VIDEO:
      "bg-blue-50 text-blue-700",

    LINK:
      "bg-green-50 text-green-700",
  }[type];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.06em] ${styles}`}
    >
      {type}
    </span>
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
  const label = {
    BEGINNER:
      "Beginner",

    INTERMEDIATE:
      "Intermediate",

    ADVANCED:
      "Advanced",

    ALL_LEVELS:
      "All Levels",
  }[level];

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.06em] text-slate-600">
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
      month: "short",
      day: "2-digit",
      year: "numeric",
    },
  ).format(date);
}