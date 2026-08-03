import Link from "next/link";

export default function EventsCTA() {
  return (
    <section className="bg-[#273142] px-6 py-20 text-white sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        {/* Red decorative line */}
        <span className="mx-auto block h-[3px] w-16 bg-[#ed0000]" />

        {/* Heading */}
        <h2 className="mt-7 text-3xl font-bold uppercase leading-tight sm:text-4xl">
          Want to Perform with Pentatone?
        </h2>

        {/* Description */}
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          We are always looking for new talent. Whether you are a guitarist,
          vocalist, keyboardist, drummer, or music enthusiast, there is a
          place for you in our musical community.
        </p>

        {/* Buttons */}
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex min-h-12 items-center justify-center bg-[#ed0000] px-9 text-xs font-bold uppercase tracking-wider text-white shadow-[0_12px_25px_rgba(237,0,0,0.22)] transition hover:bg-[#c90000]"
          >
            Join the Club
          </Link>

          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center border border-white px-9 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white hover:text-[#273142]"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}