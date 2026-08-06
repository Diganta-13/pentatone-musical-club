import Link from "next/link";

export default function AboutCTA() {
  return (
    <section className="bg-white px-6 pb-20 pt-6 sm:pb-24 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-black px-6 py-16 text-center text-white sm:px-10 sm:py-20">
        {/* Subtle decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#ed0000]/10 blur-3xl" />
          <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[#ed0000]/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Become Part of Pentatone
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            Whether you are an experienced musician or just beginning your
            musical journey, there is a place for you on our stage.
          </p>

          <div className="mt-9">
            <Link
              href="/register"
              className="inline-flex min-h-13 items-center justify-center rounded-md bg-[#ed0000] px-10 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-[0_12px_28px_rgba(237,0,0,0.25)] transition hover:bg-[#c90000]"
            >
              Join the Club
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}