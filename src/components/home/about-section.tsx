import {
  Users,
  Music,
  Mic,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const features: Feature[] = [
  {
    title: "Community",
    description:
      "Connecting music lovers across departments to form lifelong bonds through sound.",
    icon: Users,
  },
  {
    title: "Practice",
    description:
      "Regular jam sessions and skill-building workshops for musicians of every level.",
    icon: Music,
  },
  {
    title: "Performance",
    description:
      "Live shows and musical programs representing our college at university events.",
    icon: Mic,
  },
  {
    title: "Creativity",
    description:
      "Explore your musical potential through composition, collaboration, and recording.",
    icon: Sparkles,
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="bg-[#f0f3ff] py-20 sm:py-24">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12 xl:px-20">
        {/* Section heading */}
        <div className="text-center">
          <h2
            className={`${playfair.className} text-3xl font-bold text-[#111827] sm:text-4xl`}
          >
            About Pentatone
          </h2>

          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[#ed0000]" />
        </div>

        {/* Feature cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group rounded-2xl border border-white bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f0f3ff] transition duration-300 group-hover:bg-[#ed0000]">
                  <Icon
                    className="h-7 w-7 text-[#ed0000] transition duration-300 group-hover:text-white"
                    strokeWidth={1.8}
                  />
                </div>

                <h3
                  className={`${playfair.className} mt-7 text-2xl font-bold text-[#111827]`}
                >
                  {feature.title}
                </h3>

                <p className="mt-4 text-base leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}