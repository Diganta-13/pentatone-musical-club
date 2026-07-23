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
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-red-50/60">
      {/* Decorative background circle */}
      <div className="absolute right-[-50px] top-16 hidden h-36 w-36 rounded-full border-[14px] border-red-100 lg:block" />

      <div className="mx-auto grid min-h-[720px] max-w-[1500px] items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-20 xl:px-20">
        {/* Left side */}
        <div className="relative z-10">
          <h1
            className={`${playfair.className} leading-[0.95] tracking-[-0.03em]`}
          >
            <span className="block text-6xl font-bold text-[#111827] sm:text-7xl lg:text-[88px] xl:text-[105px]">
              Musical
            </span>

            <span className="block text-6xl font-bold text-[#111827] sm:text-7xl lg:text-[88px] xl:text-[105px]">
              Club.
            </span>

            <span className="mt-7 block text-6xl font-bold italic text-red-600 sm:text-7xl lg:text-[82px] xl:text-[96px]">
              BORN
            </span>

            <span className="block text-6xl font-bold italic text-red-600 sm:text-7xl lg:text-[82px] xl:text-[96px]">
              TO ROCK
            </span>
          </h1>

          <p className="mt-8 max-w-[600px] text-base leading-8 text-gray-600 sm:text-lg">
            The official musical club of Sylhet Engineering College where
            students explore music, practice together, perform, and create
            unforgettable memories.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-red-600 px-8 text-sm font-bold text-white shadow-lg shadow-red-200 transition duration-300 hover:-translate-y-1 hover:bg-red-700"
            >
              Join the Club
            </Link>

            <Link
              href="/events"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-red-600 bg-white px-8 text-sm font-bold text-red-600 transition duration-300 hover:-translate-y-1 hover:bg-red-50"
            >
              Explore Events
            </Link>
          </div>
        </div>

        {/* Right side */}
        <div className="relative mx-auto w-full max-w-[680px] pb-16 sm:pb-10 lg:pb-0">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] shadow-2xl shadow-gray-300/60">
            <Image
              src="/assets/images/hero-image.jpg"
              alt="Pentatone Musical Club live performance"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Upcoming event card */}
          <div className="absolute bottom-0 left-1/2 w-[290px] -translate-x-1/2 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl sm:bottom-[-20px] sm:left-5 sm:translate-x-0 lg:bottom-10 lg:left-[-45px]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-red-600">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              Upcoming Event
            </div>

            <h2
              className={`${playfair.className} mt-4 text-xl font-bold text-gray-900`}
            >
              Freshers Musical Night
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Registration Open Soon
            </p>

            <div className="mt-5 flex items-center">
              <div className="flex -space-x-3">
                <span className="h-10 w-10 rounded-full border-2 border-white bg-slate-200" />
                <span className="h-10 w-10 rounded-full border-2 border-white bg-slate-300" />
                <span className="h-10 w-10 rounded-full border-2 border-white bg-slate-400" />

                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-red-600 text-xs font-bold text-white">
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