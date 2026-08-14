import Link from "next/link";

import {
  Mail,
  MapPin,
} from "lucide-react";

const CLUB_EMAIL =
  "pentatonemusicalclub18@gmail.com";

const FACEBOOK_URL =
  "https://www.facebook.com/PentatoneMusicalClub";

const YOUTUBE_URL =
  "https://www.youtube.com/@pentatonemusicalclub409";

const quickLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Events",
    href: "/events",
  },
  {
    label: "Auditions",
    href: "/auditions",
  },
];

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 fill-current"
    >
      <path d="M13.5 22v-9h3l.45-3.5H13.5V7.25c0-1.01.28-1.7 1.73-1.7H17V2.42A24 24 0 0 0 14.42 2C11.87 2 10 3.56 10 6.42V9.5H7V13h3v9h3.5Z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 fill-current"
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#273142] text-white">

      <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20 xl:px-20">

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1.2fr]">

          {/* ================================= */}
          {/* CLUB DESCRIPTION */}
          {/* ================================= */}

          <div>

            <p className="max-w-sm text-sm leading-7 text-slate-300">
              Amplifying talent and fostering
              musical excellence at Sylhet
              Engineering College. A community
              for musicians, performers, and
              music lovers.
            </p>

            {/* SOCIAL LINKS */}

            <div className="mt-7 flex items-center gap-3">

              {/* FACEBOOK */}

              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pentatone Musical Club Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#ed0000]"
              >
                <FacebookIcon />
              </a>

              {/* YOUTUBE */}

              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pentatone Musical Club YouTube"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#ed0000]"
              >
                <YouTubeIcon />
              </a>

            </div>

          </div>

          {/* ================================= */}
          {/* QUICK LINKS */}
          {/* ================================= */}

          <div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h3>

            <ul className="mt-6 space-y-4">

              {quickLinks.map(
                (link) => (
                  <li
                    key={link.label}
                  >
                    <Link
                      href={link.href}
                      className="text-sm text-slate-300 transition hover:text-[#ed0000]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ),
              )}

            </ul>

          </div>

          {/* ================================= */}
          {/* RESOURCES */}
          {/* ================================= */}

          <div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Resources
            </h3>

            <ul className="mt-6 space-y-4">

              {/* GALLERY */}

              <li>
                <Link
                  href="/gallery"
                  className="text-sm text-slate-300 transition hover:text-[#ed0000]"
                >
                  Gallery
                </Link>
              </li>

              {/* PRACTICE MATERIALS */}

              <li>
                <Link
                  href="/resources"
                  className="text-sm text-slate-300 transition hover:text-[#ed0000]"
                >
                  Practice Materials
                </Link>
              </li>

              {/* CONTACT */}

              <li>
                <Link
                  href="/contact"
                  className="text-sm text-slate-300 transition hover:text-[#ed0000]"
                >
                  Contact
                </Link>
              </li>

              {/* SUPPORT */}

              <li>
                <Link
                  href="/contact"
                  className="text-sm text-slate-300 transition hover:text-[#ed0000]"
                >
                  Support
                </Link>
              </li>

            </ul>

          </div>

          {/* ================================= */}
          {/* CAMPUS */}
          {/* ================================= */}

          <div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Campus
            </h3>

            <div className="mt-6 space-y-5">

              {/* LOCATION */}

              <div className="flex items-start gap-3">

                <MapPin
                  className="mt-1 h-5 w-5 shrink-0 text-[#ed0000]"
                  strokeWidth={1.8}
                />

                <p className="text-sm leading-7 text-slate-300">
                  Sylhet Engineering College
                  <br />
                  Tilagor, Sylhet-3100
                  <br />
                  Bangladesh
                </p>

              </div>

              {/* EMAIL */}

              <div className="flex items-start gap-3">

                <Mail
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#ed0000]"
                  strokeWidth={1.8}
                />

                <a
                  href={`mailto:${CLUB_EMAIL}`}
                  className="break-all text-sm leading-6 text-slate-300 transition hover:text-[#ed0000]"
                >
                  {CLUB_EMAIL}
                </a>

              </div>

            </div>

          </div>

        </div>

        {/* ================================= */}
        {/* BOTTOM COPYRIGHT */}
        {/* ================================= */}

        <div className="mt-14 border-t border-white/10 pt-7 text-center">

          <p className="text-sm text-slate-400">
            © 2026 Pentatone Musical Club,
            Sylhet Engineering College.
            All rights reserved.
          </p>

        </div>

      </div>

    </footer>
  );
}