import Link from "next/link";

type TalentIconProps = {
  type: "vocal" | "guitar" | "keyboard" | "drums" | "others";
};

function TalentIcon({ type }: TalentIconProps) {
  const commonClasses =
    "h-9 w-9 fill-none stroke-[#d40000] stroke-[1.8]";

  if (type === "vocal") {
    return (
      <svg viewBox="0 0 24 24" className={commonClasses}>
        <rect x="8" y="3" width="8" height="12" rx="4" />
        <path d="M5 11v1a7 7 0 0 0 14 0v-1" />
        <path d="M12 19v3" />
        <path d="M8 22h8" />
      </svg>
    );
  }

  if (type === "guitar") {
    return (
      <svg viewBox="0 0 24 24" className={commonClasses}>
        <path d="M14 4l6-2 2 2-2 6" />
        <path d="M13 7l4 4" />
        <path d="M14.5 9.5l-4 4" />
        <path d="M11 12c-2-2-5-2-7 0s-2 5 0 7 5 2 7 0 2-5 0-7Z" />
        <circle cx="7.5" cy="15.5" r="1.5" />
      </svg>
    );
  }

  if (type === "keyboard") {
    return (
      <svg viewBox="0 0 24 24" className={commonClasses}>
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <path d="M7 5v14M11 5v14M15 5v14M19 5v14" />
        <path d="M5.5 5v7h3V5M13.5 5v7h3V5" />
      </svg>
    );
  }

  if (type === "drums") {
    return (
      <svg viewBox="0 0 24 24" className={commonClasses}>
        <ellipse cx="12" cy="7" rx="8" ry="3" />
        <path d="M4 7v9c0 1.7 3.6 3 8 3s8-1.3 8-3V7" />
        <path d="M8 10v7M16 10v7" />
        <path d="M6 3l4 5M18 3l-4 5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={commonClasses}>
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  );
}

const talents = [
  {
    title: "Vocal",
    type: "vocal" as const,
    description:
      "Show your singing ability and become the voice of Pentatone.",
  },
  {
    title: "Guitar",
    type: "guitar" as const,
    description:
      "Electric, acoustic, or bass. Show your musical skills and join the club.",
  },
  {
    title: "Keyboard",
    type: "keyboard" as const,
    description:
      "Synthesizer, classical piano, or pads. Bring the melody.",
  },
  {
    title: "Drums",
    type: "drums" as const,
    description:
      "Keep the rhythm alive with percussion or a complete drum set.",
  },
  {
    title: "Others",
    type: "others" as const,
    description:
      "Tabla, flute, ukulele, harmonium, or any unique musical talent.",
  },
];

export default function TalentCategories() {
  return (
    <section
      id="talent-categories"
      className="scroll-mt-24 bg-[#f8f8fc] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#101828] sm:text-4xl">
            Choose Your Talent
          </h2>

          <span className="mx-auto mt-4 block h-[3px] w-20 bg-[#d40000]" />
        </div>

        {/* Talent cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {talents.map((talent) => (
            <article
              key={talent.title}
              className="flex min-h-[285px] flex-col rounded-xl border-t-[4px] border-[#d40000] bg-white px-7 py-8 shadow-[0_14px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
            >
              <TalentIcon type={talent.type} />

              <h3 className="mt-6 text-2xl font-bold text-[#101828]">
                {talent.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {talent.description}
              </p>

              <Link
                href="#audition-details"
                className="mt-auto pt-6 text-sm font-bold tracking-wide text-[#d40000] transition hover:text-[#a90000]"
              >
                Apply <span className="ml-2">→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}