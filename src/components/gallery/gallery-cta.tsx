import Link from "next/link";

export default function GalleryCTA() {
  return (
    <section className="bg-[#f8f8fc] px-6 pb-20 pt-8 sm:pb-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl bg-[#151d2a] px-6 py-16 text-center text-white sm:px-10 sm:py-20">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#d40000]/10 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <h2 className="text-4xl font-bold leading-tight sm:text-5xl">
              Be Part of Our{" "}
              <span className="text-[#d40000]">Next</span>
              <br />
              Performance
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">
              Join Pentatone Musical Club and create unforgettable memories
              with like-minded artists at SEC.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#d40000] px-9 text-sm font-bold text-white transition hover:bg-[#b80000]"
              >
                Join Club
              </Link>

              <Link
                href="/events"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/40 px-9 text-sm font-bold text-white transition hover:bg-white hover:text-[#151d2a]"
              >
                Upcoming Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}