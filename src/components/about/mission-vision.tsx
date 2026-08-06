function MissionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-10 w-10 fill-none stroke-[#ed0000]"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 21V4" />
      <path d="M5 5h11l-2 4 2 4H5" />
    </svg>
  );
}

function VisionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-10 w-10 fill-none stroke-[#ed0000]"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const cards = [
  {
    title: "Our Mission",
    description:
      "To create a supportive musical environment where students can learn, practise, and showcase their talent. We aim to break the monotony of technical studies through rhythmic expression.",
    icon: <MissionIcon />,
  },
  {
    title: "Our Vision",
    description:
      "To become a leading university music community that inspires creativity and musical excellence, fostering a generation of engineers who are as proficient with instruments as they are with equations.",
    icon: <VisionIcon />,
  },
];

export default function MissionVision() {
  return (
    <section className="bg-white px-6 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:px-8">
        {cards.map((card) => (
          <article
            key={card.title}
            className="relative overflow-hidden rounded-xl border-l-[6px] border-[#ed0000] bg-white px-8 py-10 shadow-[0_16px_40px_rgba(15,23,42,0.09)] sm:px-10"
          >
            <div>{card.icon}</div>

            <h2 className="mt-7 text-2xl font-bold text-[#101828]">
              {card.title}
            </h2>

            <p className="mt-5 max-w-xl text-base leading-8 text-gray-600">
              {card.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}