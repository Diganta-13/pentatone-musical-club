import Image from "next/image";
import Link from "next/link";

const events = [
  {
    id: 1,
    title: "Inter Department Music Competition",
    date: "NOV 15",
    time: "4:00 PM",
    venue: "Main Hall",
    description:
      "The ultimate battle of strings and voices where departments compete for musical glory.",
    image: "/assets/images/events/event-competition.jpg",
  },
  {
    id: 2,
    title: "Acoustic Evening",
    date: "DEC 05",
    time: "6:00 PM",
    venue: "Campus Open Stage",
    description:
      "Stripped-down performances under the stars. Join us for a night of soulful acoustic music.",
    image: "/assets/images/events/event-acoustic.jpg",
  },
  {
    id: 3,
    title: "Cultural Fest Performance",
    date: "JAN 20",
    time: "7:00 PM",
    venue: "SEC Auditorium",
    description:
      "Pentatone's main-stage performance at the annual cultural festival. A night to remember.",
    image: "/assets/images/events/event-cultural-fest.jpg",
  },
];

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-[#d40000]"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-[#d40000]"
      strokeWidth="2"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export default function EventCalendar() {
  return (
    <section
      id="event-calendar"
      className="scroll-mt-24 bg-[#eef2ff] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-4">
              <span className="h-[3px] w-12 bg-[#d40000]" />

              <h2 className="text-2xl font-bold uppercase text-[#101828] sm:text-3xl">
                Full Event Calendar
              </h2>
            </div>

            <p className="mt-4 max-w-lg text-sm leading-6 text-gray-600">
              Do not miss a single beat. Mark your calendar for our upcoming
              competitions and musical sessions.
            </p>
          </div>

          {/* Decorative navigation buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous events"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#101828] text-xl transition hover:bg-[#101828] hover:text-white"
            >
              ‹
            </button>

            <button
              type="button"
              aria-label="Next events"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#101828] text-xl transition hover:bg-[#101828] hover:text-white"
            >
              ›
            </button>
          </div>
        </div>

        {/* Event cards */}
        <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <article
              key={event.id}
              className="flex overflow-hidden rounded-xl border-t-[3px] border-[#d40000] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.08)]"
            >
              <div className="flex w-full flex-col">
                {/* Event image */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  <span className="absolute bottom-4 left-4 bg-white px-3 py-1.5 text-[10px] font-bold text-[#101828] shadow">
                    {event.date}
                  </span>
                </div>

                {/* Event details */}
                <div className="flex flex-1 flex-col px-6 py-7">
                  <h3 className="text-2xl font-bold leading-tight text-[#101828]">
                    {event.title}
                  </h3>

                  <div className="mt-5 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <ClockIcon />
                      <span>{event.time}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <LocationIcon />
                      <span>{event.venue}</span>
                    </div>
                  </div>

                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                    {event.description}
                  </p>

                  {/* Buttons */}
                  <div className="mt-auto pt-7">
                    <Link
                      href="/register"
                      className="flex min-h-11 items-center justify-center bg-[#d40000] px-5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#b80000]"
                    >
                      Register Now
                    </Link>

                    <button
                      type="button"
                      className="mt-3 flex min-h-11 w-full items-center justify-center border border-[#101828] px-5 text-xs font-bold uppercase tracking-wider text-[#101828] transition hover:bg-[#101828] hover:text-white"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}