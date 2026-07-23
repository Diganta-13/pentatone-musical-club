import Link from "next/link";
import { Guitar, MapPin, Music2, Trophy, type LucideIcon } from "lucide-react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type EventItem = {
  date: string;
  title: string;
  venue: string;
  buttonText: string;
  href: string;
  icon: LucideIcon;
};

const events: EventItem[] = [
  {
    date: "OCT 25",
    title: "Freshers Musical Night",
    venue: "SEC Auditorium, Main Campus",
    buttonText: "Register Now",
    href: "/register",
    icon: Music2,
  },
  {
    date: "NOV 12",
    title: "Acoustic Evening",
    venue: "Campus Open Stage",
    buttonText: "Learn More",
    href: "/events",
    icon: Guitar,
  },
  {
    date: "DEC 05",
    title: "Inter Dept Music Competition",
    venue: "Main Hall, Admin Building",
    buttonText: "Register Now",
    href: "/register",
    icon: Trophy,
  },
];

export default function UpcomingEvents() {
  return (
    <section id="events" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12 xl:px-20">
        {/* Section heading */}
        <div className="text-center">
          <h2
            className={`${playfair.className} text-3xl font-bold text-[#111827] sm:text-4xl`}
          >
            Upcoming Events
          </h2>

          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[#ed0000]" />
        </div>

        {/* Event cards */}
        <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const Icon = event.icon;

            return (
              <article
                key={event.title}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                {/* Card top */}
                <div className="relative flex min-h-[190px] items-center justify-center bg-[#e9eefc] px-6">
                  <span className="absolute left-5 top-5 rounded-lg bg-[#ed0000] px-4 py-2 text-xs font-bold text-white shadow-md">
                    {event.date}
                  </span>

                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm transition duration-300 group-hover:scale-110">
                    <Icon
                      className="h-10 w-10 text-[#ed0000]"
                      strokeWidth={1.7}
                    />
                  </div>
                </div>

                {/* Card body */}
                <div className="flex min-h-[250px] flex-col p-7">
                  <h3
                    className={`${playfair.className} text-2xl font-bold leading-snug text-[#111827]`}
                  >
                    {event.title}
                  </h3>

                  <div className="mt-5 flex items-start gap-3 text-slate-600">
                    <MapPin
                      className="mt-1 h-5 w-5 shrink-0 text-[#ed0000]"
                      strokeWidth={1.8}
                    />

                    <p className="text-sm leading-6">{event.venue}</p>
                  </div>

                  <Link
                    href={event.href}
                    className="mt-auto inline-flex min-h-12 items-center justify-center rounded-lg bg-[#ed0000] px-6 text-sm font-bold text-white shadow-md shadow-red-100 transition duration-300 hover:bg-red-700"
                  >
                    {event.buttonText}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* View all button */}
        <div className="mt-12 text-center">
          <Link
            href="/events"
            className="inline-flex min-h-12 items-center justify-center rounded-lg border-2 border-[#ed0000] px-8 text-sm font-bold text-[#ed0000] transition duration-300 hover:bg-[#ed0000] hover:text-white"
          >
            View All Events
          </Link>
        </div>
      </div>
    </section>
  );
}