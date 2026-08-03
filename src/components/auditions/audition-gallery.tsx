import Image from "next/image";

const auditionImages = [
  {
    src: "/assets/images/auditions/gallery/audition-rehearsal.jpg",
    alt: "Pentatone members rehearsing for an audition",
  },
  {
    src: "/assets/images/auditions/gallery/audition-acoustic.jpg",
    alt: "Pentatone members performing an acoustic session",
  },
  {
    src: "/assets/images/auditions/gallery/audition-drums.jpg",
    alt: "Drummer performing during a Pentatone audition",
  },
  {
    src: "/assets/images/auditions/gallery/audition-vocal.jpg",
    alt: "Vocalist performing before the Pentatone audition panel",
  },
];

function ArrowLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="2"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="2"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function AuditionGallery() {
  return (
    <section
      id="audition-gallery"
      className="scroll-mt-24 bg-[#f8f8fc] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section heading and navigation */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold text-[#101828] sm:text-4xl">
              Audition Moments
            </h2>

            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              A glimpse into our selection process
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              aria-label="Previous audition images"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#9f7777] text-[#101828] transition hover:border-[#d40000] hover:bg-[#d40000] hover:text-white"
            >
              <ArrowLeft />
            </button>

            <button
              type="button"
              aria-label="Next audition images"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#9f7777] text-[#101828] transition hover:border-[#d40000] hover:bg-[#d40000] hover:text-white"
            >
              <ArrowRight />
            </button>
          </div>
        </div>

        {/* Gallery images */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {auditionImages.map((image, index) => (
            <article
              key={image.src}
              className={`group relative overflow-hidden rounded-xl ${
                index % 2 === 1
                  ? "h-[270px] lg:mt-8"
                  : "h-[270px]"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />

              <div className="absolute inset-0 bg-black/5 transition group-hover:bg-black/20" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}