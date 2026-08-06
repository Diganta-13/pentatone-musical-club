const journeyItems = [
  {
    label: "The Beginning",
    title: "2018",
    description:
      "Founded by a group of passionate engineering students who believed music was the perfect antidote to the rigors of technical studies. Acoustic jams in common rooms laid our foundation.",
    side: "left",
  },
  {
    label: "Growth",
    title: "Building Community",
    description:
      "As the community grew, we started organizing workshops and smaller concerts. We acquired our first professional gear and transformed from a casual group into a structured club.",
    side: "right",
  },
  {
    label: "Present Day",
    title: "The Beating Heart",
    description:
      "Today, Pentatone is the cultural pulse of campus. Hosting major concerts and nurturing hundreds of members, we ensure every student with a melody in their soul has a home.",
    side: "left",
  },
];

export default function OurJourney() {
  return (
    <section
      id="our-journey"
      className="scroll-mt-24 bg-white px-6 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#101828] sm:text-4xl">
            Our Journey
          </h2>

          <span className="mx-auto mt-4 block h-[4px] w-16 bg-[#ed0000]" />

          <p className="mt-6 text-sm text-gray-600 sm:text-base">
            The evolution of music at Sylhet Engineering College
          </p>
        </div>

        {/* Desktop timeline */}
        <div className="relative mt-16 hidden lg:block">
          {/* Centre line */}
          <div className="absolute bottom-0 left-1/2 top-0 w-[3px] -translate-x-1/2 bg-red-100" />

          <div className="space-y-24">
            {journeyItems.map((item) => (
              <article
                key={item.title}
                className="relative grid min-h-[180px] grid-cols-2"
              >
                {/* Timeline point */}
                <span className="absolute left-1/2 top-7 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-[4px] border-white bg-[#ed0000] shadow" />

                {item.side === "left" ? (
                  <>
                    <div className="pr-14 text-right">
                      <JourneyContent item={item} />
                    </div>

                    <div />
                  </>
                ) : (
                  <>
                    <div />

                    <div className="pl-14 text-left">
                      <JourneyContent item={item} />
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Mobile and tablet timeline */}
        <div className="relative mt-14 space-y-10 border-l-[3px] border-red-100 pl-8 lg:hidden">
          {journeyItems.map((item) => (
            <article key={item.title} className="relative">
              <span className="absolute -left-[41px] top-2 h-4 w-4 rounded-full border-[4px] border-white bg-[#ed0000] shadow" />

              <JourneyContent item={item} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

type JourneyItem = {
  label: string;
  title: string;
  description: string;
  side: string;
};

function JourneyContent({ item }: { item: JourneyItem }) {
  return (
    <>
      <p className="text-sm font-bold text-[#101828]">
        {item.label}
      </p>

      <h3 className="mt-2 text-xl font-bold text-[#ed0000]">
        {item.title}
      </h3>

      <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
        {item.description}
      </p>
    </>
  );
}