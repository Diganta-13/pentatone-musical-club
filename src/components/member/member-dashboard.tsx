import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Megaphone,
  Mic,
  Music2,
  UserRound,
} from "lucide-react";

/*
 * =====================================
 * TYPES
 * =====================================
 */

type MemberInfo = {
  fullName: string;
  email: string;
  skill?: string | null;
  memberSince?: string | null;
};

type DashboardStats = {
  upcomingEvents: number;
  resources: number;
  announcements: number;
};

type UpcomingEvent = {
  id: number;
  title: string;
  date: string;
  time?: string | null;
  venue?: string | null;
};

type Announcement = {
  id: number;
  title: string;
  slug: string;
  shortDescription?: string | null;
  publishedAt?: string | Date | null;
};

type AuditionInfo = {
  status:
    | "PENDING"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | null;

  title?: string | null;
  instrument?: string | null;
};

type MemberDashboardProps = {
  member: MemberInfo;

  stats: DashboardStats;

  upcomingEvents: UpcomingEvent[];

  announcements: Announcement[];

  audition: AuditionInfo | null;
};

/*
 * =====================================
 * MEMBER DASHBOARD
 * =====================================
 */

export default function MemberDashboard({
  member,
  stats,
  upcomingEvents,
  announcements,
  audition,
}: MemberDashboardProps) {
  const initials =
    member.fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase(),
      )
      .join("");

  return (
    <div className="space-y-7">

      {/* ================================= */}
      {/* TOP SECTION */}
      {/* ================================= */}

      <div className="grid gap-5 xl:grid-cols-[280px_1fr]">

        {/* ================================= */}
        {/* MEMBER PROFILE CARD */}
        {/* ================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">

          <div className="h-1 bg-red-600" />

          <div className="p-6">

            {/* AVATAR */}

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#273142] text-2xl font-black text-white shadow-lg">
              {initials || (
                <UserRound className="h-8 w-8" />
              )}
            </div>

            {/* NAME */}

            <div className="mt-5 text-center">

              <h2 className="text-xl font-black tracking-tight text-slate-900">
                {member.fullName}
              </h2>

              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.1em] text-red-600">
                Pentatone Member
              </p>

            </div>

            {/* DETAILS */}

            <div className="mt-6 divide-y divide-slate-100 border-t border-slate-100">

              <ProfileRow
                label="Email"
                value={member.email}
              />

              <ProfileRow
                label="Musical Skill"
                value={
                  member.skill ||
                  "Not specified"
                }
              />

              {member.memberSince && (
                <ProfileRow
                  label="Member Since"
                  value={
                    member.memberSince
                  }
                />
              )}

              <div className="flex items-center justify-between gap-4 py-3">

                <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-slate-400">
                  Status
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.06em] text-green-700">

                  <CheckCircle2 className="h-3 w-3" />

                  Active Member

                </span>

              </div>

            </div>

          </div>

        </div>

        {/* ================================= */}
        {/* RIGHT SIDE */}
        {/* ================================= */}

        <div className="space-y-5">

          {/* STATS */}

          <div className="grid gap-4 sm:grid-cols-3">

            <StatCard
              title="Upcoming Events"
              value={
                stats.upcomingEvents
              }
              icon={
                <CalendarDays />
              }
            />

            <StatCard
              title="Resources"
              value={
                stats.resources
              }
              icon={
                <BookOpen />
              }
            />

            <StatCard
              title="Announcements"
              value={
                stats.announcements
              }
              icon={
                <Megaphone />
              }
            />

          </div>

          {/* ================================= */}
          {/* QUICK ACTIONS */}
          {/* ================================= */}

          <div className="rounded-2xl border border-blue-100 bg-[#edf2ff] p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">
                  Quick Actions
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  Explore your Pentatone
                  member services.
                </p>

              </div>

              <div className="flex flex-wrap gap-2">

                <QuickAction
                  href="/events"
                  label="Explore Events"
                  icon={
                    <CalendarDays />
                  }
                />

                <QuickAction
                  href="/resources"
                  label="Resources"
                  icon={
                    <BookOpen />
                  }
                />

                <QuickAction
                  href="/auditions"
                  label="Auditions"
                  icon={
                    <Mic />
                  }
                />

                <QuickAction
                  href="/announcements"
                  label="Notices"
                  icon={
                    <Megaphone />
                  }
                />

              </div>

            </div>

          </div>

          {/* ================================= */}
          {/* MEMBER MESSAGE */}
          {/* ================================= */}

          <div className="rounded-2xl bg-[#273142] p-5 text-white">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600">

                <Music2 className="h-5 w-5" />

              </div>

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-red-300">
                  Member Access
                </p>

                <h3 className="mt-1 text-base font-black">
                  Welcome to the Pentatone
                  community.
                </h3>

                <p className="mt-2 text-xs leading-6 text-slate-300">
                  Stay updated with upcoming
                  events, club announcements,
                  auditions and learning
                  resources.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================================= */}
      {/* EVENTS + ANNOUNCEMENTS */}
      {/* ================================= */}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

        {/* ================================= */}
        {/* UPCOMING EVENTS */}
        {/* ================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">

          <SectionHeader
            title="Upcoming Events"
            href="/events"
            linkLabel="View All"
          />

          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={
                <CalendarDays />
              }
              title="No Upcoming Events"
              text="New club events will appear here when they are published."
            />
          ) : (
            <div className="mt-5 space-y-3">

              {upcomingEvents
                .slice(0, 3)
                .map(
                  (event) => (
                    <div
                      key={
                        event.id
                      }
                      className="rounded-xl border border-slate-100 bg-[#fafbfe] p-4 transition hover:border-red-100 hover:bg-white"
                    >

                      <div className="flex items-start gap-4">

                        {/* DATE */}

                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50">

                          <span className="text-[8px] font-black uppercase text-red-600">
                            {getMonth(
                              event.date,
                            )}
                          </span>

                          <span className="text-lg font-black text-slate-900">
                            {getDay(
                              event.date,
                            )}
                          </span>

                        </div>

                        {/* DETAILS */}

                        <div className="min-w-0 flex-1">

                          <h3 className="text-sm font-black text-slate-900">
                            {
                              event.title
                            }
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-500">

                            {event.venue && (
                              <span>
                                {
                                  event.venue
                                }
                              </span>
                            )}

                            {event.time && (
                              <span className="inline-flex items-center gap-1">

                                <Clock3 className="h-3 w-3" />

                                {
                                  event.time
                                }

                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                    </div>
                  ),
                )}

            </div>
          )}

        </section>

        {/* ================================= */}
        {/* ANNOUNCEMENTS */}
        {/* ================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">

          <SectionHeader
            title="Latest Announcements"
            href="/announcements"
            linkLabel="View All"
          />

          {announcements.length ===
          0 ? (
            <EmptyState
              icon={
                <Megaphone />
              }
              title="No Announcements"
              text="Latest club notices will appear here."
            />
          ) : (
            <div className="mt-5 divide-y divide-slate-100">

              {announcements
                .slice(0, 3)
                .map(
                  (
                    announcement,
                  ) => (
                    <Link
                      key={
                        announcement.id
                      }
                      href={`/announcements/${announcement.slug}`}
                      className="group block py-4 first:pt-0 last:pb-0"
                    >

                      <div className="border-l-2 border-red-600 pl-4">

                        <h3 className="text-sm font-black text-slate-900 transition group-hover:text-red-600">
                          {
                            announcement.title
                          }
                        </h3>

                        {announcement.shortDescription && (
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                            {
                              announcement.shortDescription
                            }
                          </p>
                        )}

                        {announcement.publishedAt && (
                          <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.05em] text-slate-400">
                            {formatShortDate(
                              announcement.publishedAt,
                            )}
                          </p>
                        )}

                      </div>

                    </Link>
                  ),
                )}

            </div>
          )}

        </section>

      </div>

      {/* ================================= */}
      {/* AUDITION STATUS */}
      {/* ================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">

              <Mic className="h-5 w-5" />

            </div>

            <div>

              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-red-600">
                My Audition
              </p>

              <h2 className="mt-1 text-lg font-black text-slate-900">
                Latest Audition Status
              </h2>

              {!audition ||
              !audition.status ? (
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  You currently have no
                  audition application.
                </p>
              ) : (
                <div className="mt-2">

                  {audition.title && (
                    <p className="text-xs font-bold text-slate-700">
                      {
                        audition.title
                      }
                    </p>
                  )}

                  {audition.instrument && (
                    <p className="mt-1 text-xs text-slate-500">
                      Skill / Instrument:{" "}
                      {
                        audition.instrument
                      }
                    </p>
                  )}

                </div>
              )}

            </div>

          </div>

          <div className="flex items-center gap-3">

            {audition?.status && (
              <AuditionBadge
                status={
                  audition.status
                }
              />
            )}

            <Link
              href="/auditions"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-[9px] font-black uppercase tracking-[0.06em] text-white transition hover:bg-red-700"
            >
              View Auditions

              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}

/*
 * =====================================
 * PROFILE ROW
 * =====================================
 */

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">

      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.04em] text-slate-400">
        {label}
      </span>

      <span className="break-all text-right text-xs font-bold text-slate-700">
        {value}
      </span>

    </div>
  );
}

/*
 * =====================================
 * STAT CARD
 * =====================================
 */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_25px_rgba(15,23,42,0.04)]">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </div>

      <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.06em] text-slate-500">
        {title}
      </p>

    </div>
  );
}

/*
 * =====================================
 * QUICK ACTION
 * =====================================
 */

function QuickAction({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#273142] px-4 text-[9px] font-black uppercase tracking-[0.05em] text-white transition hover:bg-red-600"
    >
      <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>

      {label}
    </Link>
  );
}

/*
 * =====================================
 * SECTION HEADER
 * =====================================
 */

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <h2 className="text-xl font-black tracking-tight text-slate-900">
        {title}
      </h2>

      <Link
        href={href}
        className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.06em] text-red-600 transition hover:text-red-700"
      >
        {linkLabel}

        <ArrowRight className="h-3 w-3" />
      </Link>

    </div>
  );
}

/*
 * =====================================
 * EMPTY STATE
 * =====================================
 */

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">

      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-black text-slate-800">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}

/*
 * =====================================
 * AUDITION BADGE
 * =====================================
 */

function AuditionBadge({
  status,
}: {
  status:
    | "PENDING"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED";
}) {
  const styles = {
    PENDING:
      "bg-yellow-100 text-yellow-700",

    UNDER_REVIEW:
      "bg-blue-100 text-blue-700",

    APPROVED:
      "bg-green-100 text-green-700",

    REJECTED:
      "bg-red-100 text-red-700",
  };

  const labels = {
    PENDING:
      "Pending",

    UNDER_REVIEW:
      "Under Review",

    APPROVED:
      "Approved",

    REJECTED:
      "Rejected",
  };

  return (
    <span
      className={`rounded-full px-3 py-2 text-[8px] font-black uppercase tracking-[0.06em] ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

/*
 * =====================================
 * DATE HELPERS
 * =====================================
 */

function getMonth(
  date: string,
) {
  try {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        month: "short",
        timeZone:
          "Asia/Dhaka",
      },
    )
      .format(new Date(date))
      .toUpperCase();
  } catch {
    return "";
  }
}

function getDay(
  date: string,
) {
  try {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        day: "2-digit",
        timeZone:
          "Asia/Dhaka",
      },
    ).format(new Date(date));
  } catch {
    return "";
  }
}

function formatShortDate(
  value:
    | string
    | Date,
) {
  try {
    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone:
          "Asia/Dhaka",
      },
    ).format(new Date(value));
  } catch {
    return "";
  }
}