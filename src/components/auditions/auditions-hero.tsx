import Link from "next/link";

export default function AuditionsHero() {
  return (
    <section className="relative min-h-[620px] overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/assets/images/auditions/auditions-hero.jpg')",
        }}
      />

      {/* Overall dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Strong left-side gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-[620px] max-w-7xl items-center px-6 py-20 lg:px-8">
        <div className="max-w-2xl text-white">
          {/* Intake label */}
          <p className="mb-7 w-fit bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#d40000]">
            Fall 2026 Intake
          </p>

          {/* Heading */}
          <h1 className="text-5xl font-bold leading-[1.1] sm:text-6xl lg:text-7xl">
            Your Voice.
            <br />
            Your Stage.
          </h1>

          {/* Intro text */}
          <p className="mt-7 max-w-xl text-xl font-semibold leading-8 text-white">
            Join Pentatone Musical Club and become part of our musical
            journey.
          </p>

          {/* Description */}
          <p className="mt-4 max-w-xl text-base leading-7 text-gray-200">
            We are looking for the next generation of performers to carry
            the legacy of music at Sylhet Engineering College. Whether you
            are a seasoned vocalist or a self-taught instrumentalist, your
            stage awaits.
          </p>

          {/* Button */}
          <div className="mt-9">
            <Link
              href="#talent-categories"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d40000] px-8 text-sm font-bold tracking-wide text-white shadow-[0_12px_28px_rgba(212,0,0,0.28)] transition hover:bg-[#b80000]"
            >
              Apply For Audition
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}