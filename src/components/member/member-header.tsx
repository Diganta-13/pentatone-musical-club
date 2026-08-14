import Link from "next/link";

import {
  ExternalLink,
  Music2,
} from "lucide-react";

/*
 * =====================================
 * PROPS
 * =====================================
 */

type MemberHeaderProps = {
  fullName: string;
};

/*
 * =====================================
 * MEMBER HEADER
 * =====================================
 */

export default function MemberHeader({
  fullName,
}: MemberHeaderProps) {
  const formattedDate =
    new Intl.DateTimeFormat(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone:
          "Asia/Dhaka",
      },
    ).format(new Date());

  return (
    <header className="border-b border-red-100 bg-white">

      <div className="flex min-h-[86px] items-center justify-between gap-5 px-6 py-4 lg:px-8">

        {/* ================================= */}
        {/* WELCOME */}
        {/* ================================= */}

        <div className="min-w-0">

          <p className="text-xs font-medium text-slate-400">
            {formattedDate}
          </p>

          <h1 className="mt-1 truncate text-xl font-black tracking-tight text-slate-900">
            Welcome back,{" "}
            <span className="text-red-600">
              {fullName}
            </span>
            !
          </h1>

        </div>

        {/* ================================= */}
        {/* RIGHT SIDE */}
        {/* ================================= */}

        <div className="hidden items-center gap-4 sm:flex">

          {/* PUBLIC SITE */}

          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-[0.06em] text-slate-600 transition hover:border-red-200 hover:text-red-600"
          >
            <ExternalLink className="h-3.5 w-3.5" />

            Public Site
          </Link>

          {/* MEMBER BADGE */}

          <div className="flex items-center gap-3">

            <div className="hidden text-right md:block">

              <p className="max-w-[170px] truncate text-xs font-black text-slate-800">
                {fullName}
              </p>

              <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-red-600">
                Pentatone Member
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-red-500 bg-red-50 text-red-600">

              <Music2 className="h-5 w-5" />

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}