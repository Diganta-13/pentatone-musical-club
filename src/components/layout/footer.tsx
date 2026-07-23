import Link from "next/link";
import { Mail, MapPin, Music2 } from "lucide-react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/#about" },
  { label: "Events", href: "/#events" },
  { label: "Auditions", href: "/auditions" },
];

const resourceLinks = [
  { label: "Gallery", href: "/gallery" },
  { label: "Practice Materials", href: "/resources" },
  { label: "Contact", href: "/contact" },
  { label: "Support", href: "/contact" },
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

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#273142] text-white">
      <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20 xl:px-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1.2fr]">
          {/* Club information */}
          <div>
            <Link
              href="/"
              className={`${playfair.className} inline-flex items-center gap-3 text-3xl font-bold text-[#ed0000]`}
            >
              <Music2 className="h-8 w-8" strokeWidth={1.8} />
              Pentatone
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
              Amplifying talent and fostering musical excellence at Sylhet
              Engineering College. A community for musicians, performers, and
              music lovers.
            </p>

            <div className="mt-7 flex items-center gap-3">
              <a
                href="#"
                aria-label="Pentatone Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition duration-300 hover:-translate-y-1 hover:bg-[#ed0000]"
              >
                <FacebookIcon />
              </a>

              <a
                href="#"
                aria-label="Pentatone Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition duration-300 hover:-translate-y-1 hover:bg-[#ed0000]"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h3>

            <ul className="mt-6 space-y-4">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-300 transition hover:text-[#ed0000]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Resources
            </h3>

            <ul className="mt-6 space-y-4">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-300 transition hover:text-[#ed0000]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Campus information */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Campus
            </h3>

            <div className="mt-6 space-y-5">
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

              <div className="flex items-center gap-3">
                <Mail
                  className="h-5 w-5 shrink-0 text-[#ed0000]"
                  strokeWidth={1.8}
                />

                <a
                  href="mailto:pentatone.sec@gmail.com"
                  className="break-all text-sm text-slate-300 transition hover:text-[#ed0000]"
                >
                  pentatone.sec@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-14 border-t border-white/10 pt-7 text-center">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Pentatone Musical Club, Sylhet
            Engineering College. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}