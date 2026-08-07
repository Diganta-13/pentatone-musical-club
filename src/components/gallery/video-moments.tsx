const videos = [
  {
    title: "Annual Cultural Fest 2026",
    description: "The biggest stage of the year.",
    video: "/assets/videos/gallery/cultural-fest-2026.mp4",
    poster: "/assets/images/events/event-cultural-fest.jpg",
  },
  {
    title: "Unplugged Session @ SEC",
    description: "Pure music, no distractions.",
    video: "/assets/videos/gallery/unplugged-session-2026.mp4",
    poster: "/assets/images/events/event-acoustic.jpg",
  },
  {
    title: "Pentatone Live: Midnight Riots",
    description: "Unleashing the rock energy at midnight.",
    video: "/assets/videos/gallery/midnight-riots-2026.mp4",
    poster: "/assets/images/events/events-hero.jpg",
  },
];

export default function VideoMoments() {
  return (
    <section className="bg-[#f8f8fc] px-6 py-16 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="flex items-center gap-6">
          <div className="h-px flex-1 bg-red-200" />

          <h2 className="shrink-0 text-3xl font-bold text-[#101828] sm:text-4xl">
            Video Moments
          </h2>

          <div className="h-px flex-1 bg-red-200" />
        </div>

        {/* Videos */}
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {videos.map((item) => (
            <article key={item.title}>
              <div className="overflow-hidden rounded-xl bg-black shadow-[0_14px_35px_rgba(15,23,42,0.10)]">
                <video
                  controls
                  preload="metadata"
                  poster={item.poster}
                  className="aspect-video w-full object-cover"
                >
                  <source src={item.video} type="video/mp4" />

                  Your browser does not support the video tag.
                </video>
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#101828]">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}