type ActivityIconProps = {
  type: "practice" | "performance" | "workshop" | "community";
};

function ActivityIcon({ type }: ActivityIconProps) {
  const iconClass =
    "h-8 w-8 fill-none stroke-[#ed0000] stroke-[1.9]";

  if (type === "practice") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={iconClass}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18V5l10-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="16" cy="16" r="3" />
        <path d="M9 8l10-2" />
      </svg>
    );
  }

  if (type === "performance") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={iconClass}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <ellipse cx="12" cy="7" rx="7" ry="3" />
        <path d="M5 7v9c0 1.7 3.1 3 7 3s7-1.3 7-3V7" />
        <path d="M8 10v7M16 10v7" />
        <path d="M7 3l4 5M17 3l-4 5" />
      </svg>
    );
  }

  if (type === "workshop") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={iconClass}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3 8 9-5 9 5-9 5-9-5Z" />
        <path d="M7 10.5V16c3 2 7 2 10 0v-5.5" />
        <path d="M21 8v6" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={iconClass}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <circle cx="4" cy="10" r="2" />
      <path d="M3 20v-1c0-3 2.7-5 6-5s6 2 6 5v1" />
      <path d="M15 15c3.2 0 6 1.7 6 4v1" />
      <path d="M3 15c-1.8.7-3 2.1-3 4v1" />
    </svg>
  );
}

const activities = [
  {
    title: "Music Practice",
    type: "practice" as const,
    description:
      "Dedicated weekly jamming sessions and expert instrument training for all club members.",
  },
  {
    title: "Live Performances",
    type: "performance" as const,
    description:
      "Organizing high-energy concerts, intimate unplugged sessions, and open-mic campus events.",
  },
  {
    title: "Workshops",
    type: "workshop" as const,
    description:
      "Masterclasses from industry professionals and mentorship from senior club leaders.",
  },
  {
    title: "Community",
    type: "community" as const,
    description:
      "Fostering a vibrant network of music lovers across the engineering community.",
  },
];

export default function WhatWeDo() {
  return (
    <section className="bg-white px-6 pb-20 pt-10 sm:pb-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#101828] sm:text-4xl">
            What We Do
          </h2>

          <span className="mx-auto mt-4 block h-[4px] w-16 bg-[#ed0000]" />
        </div>

        {/* Activity cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((activity) => (
            <article
              key={activity.title}
              className="flex min-h-[310px] flex-col rounded-xl border border-gray-100 bg-white px-7 py-8 shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.11)]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-50">
                <ActivityIcon type={activity.type} />
              </div>

              <h3 className="mt-7 text-xl font-bold text-[#101828]">
                {activity.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-gray-600">
                {activity.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}