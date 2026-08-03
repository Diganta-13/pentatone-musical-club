import Link from "next/link";

export default function AuditionsCTA() {
  return (
    <section className="relative overflow-hidden bg-[#d40000] px-6 py-20 text-white sm:py-24">
      {/* Decorative diagonal lines */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-40 h-[600px] w-[2px] rotate-[-45deg] bg-white/10" />
        <div className="absolute right-24 -top-40 h-[600px] w-[2px] rotate-[-45deg] bg-white/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Ready to Join Pentatone?
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/85">
          Take the first step toward the stage. Apply for the Fall 2026
          auditions and become part of the Pentatone Musical Club.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/auditions/apply"
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-black px-10 text-sm font-bold tracking-wide text-white transition hover:bg-[#202020]"
          >
            Apply Now
          </Link>

          <Link
            href="/contact"
            className="inline-flex min-h-14 items-center justify-center rounded-full border-2 border-white px-10 text-sm font-bold tracking-wide text-white transition hover:bg-white hover:text-[#d40000]"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}