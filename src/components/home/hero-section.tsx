import Image from "next/image";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
});

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-red-50/50">
      {/* Decorative circle */}
      <div className="pointer-events-none absolute -right-12 top-24 hidden h-40 w-40 rounded-full border-[14px] border-red-100 lg:block" />

      <div className="mx-auto grid max-w-[1500px] items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-16 xl:px-20">
        {/* Left content */}
        <div className="relative z-10">
          <h1 className={`${playfair.className} tracking-[-0.04em]`}>
            <span className="block text-6xl font-bold leading-[0.92] text-[#111827] sm:text-7xl lg:text-[76px] xl:text-[88px]">
              Musical
            </span>

            <span className="block text-6xl font-bold leading-[0.92] text-[#111827] sm:text-7xl lg:text-[76px] xl:text-[88px]">
              Club.
            </span>

            <span className="mt-7 block text-6xl font-bold italic leading-[0.95] text-[#ed0000] sm:text-7xl lg:text-[70px] xl:text-[82px]">
              BORN
            </span>

            <span className="block text-6xl font-bold italic leading-[0.95] text-[#ed0000] sm:text-7xl lg:text-[70px] xl:text-[82px]">
              TO ROCK
            </span>
          </h1>

          <p className="mt-7 max-w-[580px] text-base leading-7 text-slate-600 sm:text-lg lg:leading-8">
            The official musical club of Sylhet Engineering College where
            students explore music, practice together, perform, and create
            unforgettable memories.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#ed0000] px-8 text-sm font-bold text-white shadow-lg shadow-red-200 transition duration-300 hover:-translate-y-1 hover:bg-red-700"
            >
              Join the Club
            </Link>

            <Link
              href="/events"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-[#ed0000] bg-white px-8 text-sm font-bold text-[#ed0000] transition duration-300 hover:-translate-y-1 hover:bg-red-50"
            >
              Explore Events
            </Link>
          </div>
        </div>

        {/* Right image area */}
        <div className="relative mx-auto w-full max-w-[680px] pb-12 lg:pb-0">
          <div className="relative aspect-[16/11] overflow-hidden rounded-[32px] shadow-2xl shadow-slate-300/60">
            <Image
              src="/assets/images/hero-image.jpg"
              alt="Pentatone Musical Club live performance"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>

          {/* Upcoming event card */}
          <div className="absolute bottom-[-35px] left-1/2 w-[280px] -translate-x-1/2 rounded-2xl border border-slate-100 bg-white p-5 shadow-xl sm:left-6 sm:translate-x-0 lg:bottom-8 lg:-left-9 xl:w-[300px]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#ed0000]">
              <span className="h-2 w-2 rounded-full bg-[#ed0000]" />
              Upcoming Event
            </div>

            <h2
              className={`${playfair.className} mt-4 text-lg font-bold text-slate-900 xl:text-xl`}
            >
              Freshers Musical Night
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Registration Open Soon
            </p>

            <div className="mt-5 flex items-center">
              <div className="flex -space-x-3">
                <span className="h-10 w-10 rounded-full border-2 border-white bg-slate-200" />

                <span className="h-10 w-10 rounded-full border-2 border-white bg-slate-300" />

                <span className="h-10 w-10 rounded-full border-2 border-white bg-slate-400" />

                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#ed0000] text-xs font-bold text-white">
                  +45
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}