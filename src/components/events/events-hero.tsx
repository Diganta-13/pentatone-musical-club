import Link from "next/link";

const statistics = [
  { value: "120+", label: "Members" },
  { value: "20+", label: "Programs" },
  { value: "8+", label: "Instruments" },
];

export default function EventsHero() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="relative min-h-[460px] overflow-hidden rounded-xl">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('/assets/images/events/events-hero.jpg')",
            }}
          />

          {/* Light dark overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Dark gradient behind text */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/10" />

          {/* Hero content */}
          <div className="relative z-10 flex min-h-[460px] max-w-3xl flex-col justify-center px-7 py-12 text-white sm:px-10 lg:px-14">
            {/* Small label */}
            <p className="mb-5 w-fit bg-[#d40000] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider">
              Sylhet Engineering College Musical Club
            </p>

            {/* Main heading */}
            <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Where Music Meets Memories
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-200 sm:text-base">
              Experience the rhythm of Sylhet Engineering College through
              our live performances, competitions, and workshops. Join the
              elite rebellion of sound.
            </p>

            {/* Statistics */}
            <div className="mt-8 grid max-w-xl grid-cols-3 border-t border-white/30 pt-6">
              {statistics.map((item) => (
                <div
                  key={item.label}
                  className="border-r border-white/20 pr-4 last:border-r-0"
                >
                  <p className="text-lg font-bold">{item.value}</p>

                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-300">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="#featured-event"
                className="inline-flex min-h-12 items-center justify-center bg-[#d40000] px-7 text-xs font-bold uppercase tracking-wider transition hover:bg-[#b80000]"
              >
                View Featured Event
                <span className="ml-3 text-base">↓</span>
              </Link>

              <Link
                href="#event-calendar"
                className="inline-flex min-h-12 items-center justify-center bg-white px-7 text-xs font-bold uppercase tracking-wider text-gray-900 transition hover:bg-gray-100"
              >
                Full Schedule
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}