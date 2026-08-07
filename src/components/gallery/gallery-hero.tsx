import Image from "next/image";

export default function GalleryHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Decorative diagonal background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[54%] top-0 h-full w-24 -skew-x-[14deg] bg-red-50 sm:w-32" />
      </div>

      <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
        {/* Left content */}
        <div>
          <span className="block h-[5px] w-16 rounded-full bg-[#d40000]" />

          <h1 className="mt-7 text-5xl font-bold leading-[1.05] text-[#101828] sm:text-6xl">
            Memories
            <br />
            <span className="text-[#d40000]">Through</span> Music
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-gray-600">
            Explore our performances, events, auditions, and the electrifying
            musical journey of Pentatone.
          </p>
        </div>

        {/* Right image */}
        <div className="relative">
          {/* Back card */}
          <div className="absolute -bottom-4 -right-4 h-full w-full rounded-xl bg-red-50" />

          <div className="relative h-[380px] overflow-hidden rounded-xl bg-gray-100 shadow-[0_20px_45px_rgba(15,23,42,0.12)] sm:h-[460px]">
            <Image
              src="/assets/images/events/events-hero.jpg"
              alt="Pentatone musical performance"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}