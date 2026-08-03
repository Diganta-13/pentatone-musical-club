const auditionSteps = [
  {
    number: "1",
    title: "Registration",
    description:
      "Fill out the online application form with your personal and musical details.",
  },
  {
    number: "2",
    title: "Initial Screening",
    description:
      "Our executive team reviews applications and checks applicant eligibility.",
  },
  {
    number: "3",
    title: "Live Audition",
    description:
      "Perform live in front of our selection panel at the SEC Auditorium.",
  },
  {
    number: "4",
    title: "Final Selection",
    description:
      "Selected performers join the Pentatone family and begin their musical journey.",
  },
];

export default function AuditionProcess() {
  return (
    <section className="bg-[#eef2ff] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#101828] sm:text-4xl">
            How Audition Works
          </h2>

          <p className="mt-3 text-sm text-gray-600 sm:text-base">
            A transparent journey to the main stage
          </p>
        </div>

        {/* Process steps */}
        <div className="relative mt-16">
          {/* Horizontal connecting line */}
          <div className="absolute left-[12%] right-[12%] top-6 hidden h-px bg-gray-300 lg:block" />

          <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {auditionSteps.map((step) => (
              <article
                key={step.number}
                className="relative text-center"
              >
                {/* Step number */}
                <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#d40000] text-base font-bold text-white shadow-[0_8px_18px_rgba(212,0,0,0.22)]">
                  {step.number}
                </div>

                {/* Step title */}
                <h3 className="mt-6 text-xl font-bold text-[#101828] sm:text-2xl">
                  {step.title}
                </h3>

                {/* Step description */}
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-gray-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}