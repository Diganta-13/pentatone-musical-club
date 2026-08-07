"use client";

import Image from "next/image";
import { useState } from "react";

type Category =
  | "All"
  | "Concerts"
  | "Performances"
  | "Auditions"
  | "Practice"
  | "Cultural";

type ArchiveItem = {
  title: string;
  category: Exclude<Category, "All">;
  image: string;
};

const categories: Category[] = [
  "All",
  "Concerts",
  "Performances",
  "Auditions",
  "Practice",
  "Cultural",
];

const archiveItems: ArchiveItem[] = [
  {
    title: "Freshers Musical Night",
    category: "Concerts",
    image: "/assets/images/events/featured-event.jpg",
  },
  {
    title: "Cultural Fest Performance",
    category: "Cultural",
    image: "/assets/images/events/event-cultural-fest.jpg",
  },
  {
    title: "Inter Department Competition",
    category: "Performances",
    image: "/assets/images/events/event-competition.jpg",
  },
  {
    title: "Acoustic Evening",
    category: "Performances",
    image: "/assets/images/events/event-acoustic.jpg",
  },
  {
    title: "Band Rehearsal",
    category: "Practice",
    image:
      "/assets/images/auditions/gallery/audition-rehearsal.jpg",
  },
  {
    title: "Acoustic Practice",
    category: "Practice",
    image:
      "/assets/images/auditions/gallery/audition-acoustic.jpg",
  },
  {
    title: "Drum Audition",
    category: "Auditions",
    image:
      "/assets/images/auditions/gallery/audition-drums.jpg",
  },
  {
    title: "Vocal Audition",
    category: "Auditions",
    image:
      "/assets/images/auditions/gallery/audition-vocal.jpg",
  },
];

export default function ArchiveGallery() {
  const [activeCategory, setActiveCategory] =
    useState<Category>("All");

  const filteredItems =
    activeCategory === "All"
      ? archiveItems
      : archiveItems.filter(
          (item) => item.category === activeCategory
        );

  return (
    <section className="bg-[#eef2ff] px-6 py-16 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#101828] sm:text-4xl">
            Explore Our Archives
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
            Explore moments from concerts, rehearsals, auditions,
            performances, and cultural events.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {categories.map((category) => {
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-6 py-2.5 text-xs font-semibold tracking-wide transition ${
                  isActive
                    ? "bg-[#d40000] text-white shadow-[0_8px_18px_rgba(212,0,0,0.20)]"
                    : "bg-white text-[#101828] hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Gallery */}
        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {filteredItems.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="group relative mb-5 break-inside-avoid overflow-hidden rounded-xl bg-[#101828]"
            >
              <div
                className={`relative overflow-hidden ${
                  index % 3 === 0
                    ? "h-[350px]"
                    : index % 3 === 1
                      ? "h-[270px]"
                      : "h-[310px]"
                }`}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Dark hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent opacity-80 transition duration-300 group-hover:opacity-100" />

                {/* Information */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <span className="inline-flex rounded-full bg-[#d40000] px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>

                  <h3 className="mt-3 text-xl font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs text-gray-300">
                    Pentatone Musical Club • 2026
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="mt-12 rounded-xl bg-white px-6 py-14 text-center">
            <p className="text-gray-600">
              No moments are available in this category yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}