import Image from "next/image";
import Link from "next/link";

const countdown = [
  { value: "08", label: "Days" },
  { value: "14", label: "Hours" },
  { value: "45", label: "Mins" },
];

export default function FeaturedSpotlight() {
  return (
    <section
      id="featured-event"
      className="scroll-mt-24 bg-[#f7f8fc] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section heading */}
        <div className="mb-9 flex items-center gap-4">
          <span className="h-[3px] w-12 bg-[#d40000]" />

          <h2 className="text-2xl font-bold uppercase text-[#101828] sm:text-3xl">
            Featured Spotlight
          </h2>
        </div>

        {/* Featured event card */}
        <div className="grid overflow-hidden rounded-xl bg-white shadow-[0_18px_45px_rgba(15,23,42,0.10)] lg:grid-cols-2">
          {/* Event image */}
          <div className="relative min-h-[420px] overflow-hidden lg:min-h-[500px]">
            <Image
              src="/assets/images/events/featured-event.jpg"
              alt="Pentatone featured musical event"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            {/* Image overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

            {/* Event badges */}
            <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-3">
              <span className="bg-white px-4 py-2 text-[11px] font-bold uppercase text-[#d40000] shadow-sm">
                Live October 25
              </span>

              <span className="bg-[#d40000] px-4 py-2 text-[11px] font-bold uppercase text-white shadow-sm">
                Registration Open
              </span>
            </div>
          </div>

          {/* Event information */}
          <div className="flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-12">
            <h3 className="text-3xl font-bold leading-tight text-[#101828] sm:text-4xl">
              Freshers Musical Night 2026
            </h3>

            <p className="mt-5 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
              The biggest night of the semester. Welcome the new batch of
              engineers with a high-voltage musical journey through rock,
              jazz, and fusion. Join us for a night of unparalleled energy.
            </p>

            {/* Countdown */}
            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
              {countdown.map((item) => (
                <div
                  key={item.label}
                  className="rounded-md border border-[#dce3f1] bg-[#edf2ff] px-3 py-4 text-center"
                >
                  <p className="text-3xl font-bold text-[#d40000]">
                    {item.value}
                  </p>

                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Event location and time */}
            <div className="mt-8 flex flex-col gap-4 text-sm font-medium text-[#202939] sm:flex-row sm:items-center sm:gap-7">
              <div className="flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-none stroke-[#d40000]"
                  strokeWidth="2"
                >
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>

                <span>SEC Auditorium</span>
              </div>

              <div className="flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-none stroke-[#d40000]"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>

                <span>6:30 PM onwards</span>
              </div>
            </div>

            {/* Registration button */}
            <div className="mt-9">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center bg-[#d40000] px-10 text-xs font-bold uppercase tracking-wider text-white shadow-[0_12px_25px_rgba(212,0,0,0.22)] transition hover:bg-[#b80000]"
              >
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}