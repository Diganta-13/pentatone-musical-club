import Link from "next/link";

const eligibilityItems = [
  "Must be a regular student of Sylhet Engineering College.",
  "Possess a genuine passion for music and performing arts.",
  "Have basic knowledge of your chosen category: vocal or instrument.",
  "Commit to attending weekly club practices and events.",
  "Be willing to collaborate and grow within a team environment.",
];

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 fill-none stroke-[#e00000]"
      strokeWidth="2"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 fill-none stroke-[#e00000]"
      strokeWidth="2"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 fill-none stroke-[#e00000]"
      strokeWidth="2"
    >
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M12 7v4M12 11l-7 5M12 11l7 5" />
    </svg>
  );
}

export default function AuditionDetails() {
  return (
    <section
      id="audition-details"
      className="scroll-mt-24 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        {/* Eligibility section */}
        <div>
          <h2 className="text-3xl font-bold text-[#101828] sm:text-4xl">
            Who Can Apply?
          </h2>

          <ul className="mt-8 space-y-5">
            {eligibilityItems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-4 text-base leading-7 text-gray-700"
              >
                <span className="mt-2.5 h-2 w-2 shrink-0 bg-[#d40000]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upcoming audition card */}
        <article className="relative overflow-hidden rounded-xl bg-[#293344] px-7 py-9 text-white shadow-[0_20px_45px_rgba(15,23,42,0.16)] sm:px-10 sm:py-11">
          {/* Decorative corner */}
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#d40000]/20" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ff2b2b]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e00000]" />
              Registration Open
            </div>

            <h3 className="mt-6 text-3xl font-bold">
              Upcoming Audition
            </h3>

            <div className="mt-8 space-y-7">
              <div className="flex items-start gap-4">
                <CalendarIcon />

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Date
                  </p>

                  <p className="mt-1 text-xl font-bold sm:text-2xl">
                    November 20, 2026
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <LocationIcon />

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Venue
                  </p>

                  <p className="mt-1 text-xl font-bold sm:text-2xl">
                    SEC Auditorium
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CategoryIcon />

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Categories
                  </p>

                  <p className="mt-1 text-xl font-bold sm:text-2xl">
                    All Categories Open
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/auditions/apply"
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#d40000] px-8 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#b80000]"
              >
                Apply Now
              </Link>

              <a
                href="#audition-gallery"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/40 px-8 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-[#293344]"
              >
                View Details
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}