import Image from "next/image";

const memories = [
  {
    title: "Inter Department Competition",
    year: "2026",
    image: "/assets/images/events/event-competition.jpg",
    className: "md:col-span-2",
  },
  {
    title: "Acoustic Evening",
    year: "2026",
    image: "/assets/images/events/event-acoustic.jpg",
    className: "",
  },
  {
    title: "Cultural Fest",
    year: "2026",
    image: "/assets/images/events/event-cultural-fest.jpg",
    className: "",
  },
];

export default function MemoriesSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center">
          <h2 className="text-2xl font-bold uppercase text-[#101828] sm:text-3xl">
            Memories in Music
          </h2>

          <p className="mt-3 text-sm text-gray-600 sm:text-base">
            A look back at the shows that defined our journey.
          </p>
        </div>

        {/* Memory images */}
        <div className="mt-12 grid gap-5 md:grid-cols-4">
          {memories.map((memory) => (
            <article
              key={memory.title}
              className={`group relative min-h-[290px] overflow-hidden rounded-xl ${
                memory.className
              }`}
            >
              <Image
                src={memory.image}
                alt={memory.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

              <div className="absolute bottom-0 left-0 z-10 p-5 text-white">
                <span className="inline-block bg-[#d40000] px-2.5 py-1 text-[10px] font-bold">
                  {memory.year}
                </span>

                <h3 className="mt-2 text-lg font-bold">
                  {memory.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}