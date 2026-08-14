import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Megaphone,
  Pin,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import type {
  RowDataPacket,
} from "mysql2";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

import db from "@/lib/db";

interface AnnouncementRow
  extends RowDataPacket {
  id: number;
  title: string;
  category: string;

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
  params: Promise<{
    slug: string;
  }>;
};

export default async function AnnouncementDetailsPage({
  params,
}: PageProps) {
  const { slug } =
    await params;

  const [rows] =
    await db.execute<
      AnnouncementRow[]
    >(
      `
        SELECT
          id,
          title,
          category,
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

        WHERE
          slug = ?
          AND is_published = TRUE

        LIMIT 1
      `,
      [slug],
    );

  const announcement =
    rows[0];

  if (!announcement) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f8f9ff]">

        <section className="mx-auto max-w-[1000px] px-5 py-14 lg:px-8 lg:py-20">

          <Link
            href="/announcements"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600 transition hover:text-red-600"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Announcements
          </Link>


          <article className="mt-8 overflow-hidden rounded-2xl bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">

            {announcement.cover_image && (
              <div className="h-[280px] overflow-hidden sm:h-[380px]">

                {/* eslint-disable-next-line @next/next/no-img-element */}

                <img
                  src={
                    announcement.cover_image
                  }
                  alt={
                    announcement.title
                  }
                  className="h-full w-full object-cover"
                />

              </div>
            )}


            <div className="px-7 py-9 sm:px-10 lg:px-14 lg:py-12">

              <div className="flex flex-wrap items-center gap-3">

                <span className="rounded-full bg-red-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-red-600">
                  {
                    announcement.category.replace(
                      "_",
                      " ",
                    )
                  }
                </span>


                {Boolean(
                  announcement.is_pinned,
                ) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#101828] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-white">

                    <Pin className="h-3 w-3" />

                    Priority Notice

                  </span>
                )}

              </div>


              <h1 className="mt-6 text-3xl font-black leading-tight tracking-tight text-[#101828] sm:text-4xl lg:text-5xl">
                {
                  announcement.title
                }
              </h1>


              <div className="mt-6 flex flex-wrap gap-5 border-b border-slate-100 pb-7 text-xs font-semibold text-slate-500">

                <span className="inline-flex items-center gap-2">

                  <CalendarDays className="h-4 w-4 text-red-600" />

                  {formatDate(
                    announcement.display_date,
                  )}

                </span>


                {announcement.venue && (
                  <span className="inline-flex items-center gap-2">

                    <MapPin className="h-4 w-4 text-red-600" />

                    {
                      announcement.venue
                    }

                  </span>
                )}

              </div>


              <div className="mt-8 whitespace-pre-line text-[15px] leading-8 text-slate-700">
                {
                  announcement.content
                }
              </div>

            </div>

          </article>


          <div className="mt-8 flex justify-center">

            <Link
              href="/announcements"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#d40000] px-7 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-red-700"
            >

              <Megaphone className="h-4 w-4" />

              More Announcements

            </Link>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

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
      month: "long",
      year: "numeric",
    },
  ).format(date);
}