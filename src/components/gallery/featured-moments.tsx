import Image from "next/image";

const moments = [
  {
    title: "Freshers Night",
    year: "2026",
    description:
      "Welcoming new talents with a high-voltage musical performance.",
    image: "/assets/images/events/featured-event.jpg",
  },
  {
    title: "Cultural Festival",
    year: "2026",
    description:
      "Representing Pentatone at the annual cultural celebration of SEC.",
    image: "/assets/images/events/event-cultural-fest.jpg",
  },
  {
    title: "Battle of Bands",
    year: "2026",
    description:
      "An electrifying competition filled with rhythm, energy, and passion.",
    image: "/assets/images/events/event-competition.jpg",
  },
  {
    title: "Acoustic Session",
    year: "2026",
    description:
      "Raw and unplugged melodies shared in an intimate campus setting.",
    image: "/assets/images/events/event-acoustic.jpg",
  },
];

export default function FeaturedMoments() {
  return (
    <section className="bg-[#f7f8fc] px-6 py-16 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d40000]">
            Highlights
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#101828] sm:text-4xl">
            Featured Moments
          </h2>
        </div>

        {/* Cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {moments.map((moment) => (
            <article
              key={moment.title}
              className="group overflow-hidden rounded-xl border-t-[3px] border-[#d40000] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.11)]"
            >
              <div className="relative h-[210px] overflow-hidden">
                <Image
                  src={moment.image}
                  alt={moment.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              <div className="px-5 py-5">
                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                  {moment.year}
                </span>

                <h3 className="mt-3 text-xl font-bold text-[#101828]">
                  {moment.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {moment.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}