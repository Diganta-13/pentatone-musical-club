import Image from "next/image";
import Link from "next/link";

export default function AboutHero() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Left content */}
        <div>
          <p className="inline-flex rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#ed0000]">
            Established 2018
          </p>

          <h1 className="mt-7 text-5xl font-bold leading-[1.05] text-[#101828] sm:text-6xl">
            About
            <br />
            <span className="text-[#ed0000]">Pentatone</span>
          </h1>

          <h2 className="mt-7 text-2xl font-bold uppercase tracking-[0.12em] text-[#101828] sm:text-3xl">
            Born to Rock
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-gray-600">
            Pentatone Musical Club is a student-driven musical community of
            Sylhet Engineering College where students explore their passion
            for music, develop their skills, and perform on different campus
            platforms.
          </p>

          <div className="mt-9">
            <Link
              href="#our-journey"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#ed0000] px-8 text-xs font-bold uppercase tracking-wider text-white shadow-[0_12px_28px_rgba(237,0,0,0.20)] transition hover:bg-[#c90000]"
            >
              Explore Our Journey
            </Link>
          </div>
        </div>

        {/* Right image */}
        <div className="relative min-h-[420px] overflow-hidden rounded-xl bg-gray-100 shadow-[0_20px_50px_rgba(15,23,42,0.10)] sm:min-h-[500px]">
          <Image
            src="/assets/images/about/about-hero.jpg"
            alt="Pentatone Musical Club performance"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}