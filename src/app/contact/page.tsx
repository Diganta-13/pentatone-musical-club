import Link from "next/link";

import type { ReactNode } from "react";

import {
  ArrowRight,
  ExternalLink,
  Globe2,
  Mail,
  MapPin,
  Music2,
  Phone,
  Video,
} from "lucide-react";

import ContactForm from "@/components/contact/contact-form";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";

import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/*
 * =====================================
 * CLUB CONTACT INFORMATION
 * =====================================
 */

const CLUB_EMAIL =
  "pentatonemusicalclub18@gmail.com";

const FACEBOOK_URL =
  "https://www.facebook.com/PentatoneMusicalClub";

const YOUTUBE_URL =
  "https://www.youtube.com/@pentatonemusicalclub409";

/*
 * =====================================
 * CONTACT PAGE
 * =====================================
 */

export default async function ContactPage() {
  const currentUser =
    await getCurrentUser();

  return (
    <>
      <Navbar />

      <main className="overflow-hidden bg-[#fbfbfe]">

        {/* ================================= */}
        {/* HERO */}
        {/* ================================= */}

        <section className="relative overflow-hidden border-b border-slate-100 bg-white">

          <div className="absolute -right-28 top-12 h-72 w-72 rounded-full border-[22px] border-red-50" />

          <div className="absolute -left-24 bottom-[-150px] h-80 w-80 rounded-full bg-red-50/60" />

          <div className="relative z-10 mx-auto max-w-[1180px] px-5 py-20 text-center lg:px-8">

            <span className="inline-flex rounded-full bg-[#d40000] px-4 py-2 text-[9px] font-black uppercase tracking-[0.08em] text-white">
              We&apos;d Love To Hear From You
            </span>

            <h1 className="mt-6 text-5xl font-black tracking-[-0.04em] text-[#111827] sm:text-6xl">

              Contact{" "}

              <span className="italic text-[#d40000]">
                Pentatone
              </span>

            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
              Have questions, want to collaborate,
              or need information about the club?
              We are here to bring the rhythm to
              your inquiries.
            </p>

          </div>

        </section>

        {/* ================================= */}
        {/* CONTACT INFO CARDS */}
        {/* ================================= */}

        <section className="bg-[#f7f8fc] py-14">

          <div className="mx-auto grid max-w-[1180px] gap-5 px-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">

            {/* LOCATION */}

            <ContactInfoCard
              icon={<MapPin />}
              title="Location"
              primary="Sylhet Engineering College"
              secondary="Sylhet, Bangladesh"
              href="#campus-map"
            />

            {/* EMAIL */}

            <ContactInfoCard
              icon={<Mail />}
              title="Email"
              primary={CLUB_EMAIL}
              secondary="Send us an email"
              href={`mailto:${CLUB_EMAIL}`}
            />

            {/* FACEBOOK */}

            <ContactInfoCard
              icon={<Globe2 />}
              title="Facebook"
              primary="Pentatone Musical Club"
              secondary="Official Facebook Page"
              href={FACEBOOK_URL}
              external
            />

            {/* PHONE */}

            <ContactInfoCard
              icon={<Phone />}
              title="Phone"
              primary="Club Representatives"
              secondary="Contact through club administration"
              href="#contact-form"
            />

          </div>

        </section>

        {/* ================================= */}
        {/* FORM + MAP */}
        {/* ================================= */}

        <section className="bg-white py-20">

          <div className="mx-auto grid max-w-[1180px] gap-10 px-5 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">

            {/* CONTACT FORM */}

            <div
              id="contact-form"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)] sm:p-8"
            >

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#d40000]">
                  Contact Form
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight text-[#111827]">
                  Send Us a Message
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                  Fill in the form below and your
                  message will be delivered directly
                  to the Pentatone administration
                  panel.
                </p>

              </div>

              <div className="mt-8">
                <ContactForm />
              </div>

            </div>

            {/* RIGHT COLUMN */}

            <div className="space-y-6">

              {/* MAP */}

              <div
                id="campus-map"
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)]"
              >

                <div className="border-b border-slate-100 px-6 py-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">

                      <MapPin className="h-5 w-5" />

                    </div>

                    <div>

                      <h2 className="text-base font-black text-[#111827]">
                        Find Us On Campus
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        Sylhet Engineering College
                      </p>

                    </div>

                  </div>

                </div>

                <div className="h-[300px] bg-slate-100">

                  <iframe
                    title="Sylhet Engineering College Map"
                    src="https://www.google.com/maps?q=Sylhet%20Engineering%20College%2C%20Sylhet%2C%20Bangladesh&output=embed"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full border-0"
                  />

                </div>

                <div className="border-t border-slate-100 px-6 py-5">

                  <div className="flex items-start gap-3">

                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                    <div>

                      <p className="text-xs font-black text-[#111827]">
                        Sylhet Engineering College
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Sylhet, Bangladesh
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* SOCIAL */}

              <div className="rounded-2xl bg-[#151d2b] p-7 text-white shadow-[0_16px_50px_rgba(15,23,42,0.12)]">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white">

                    <Music2 className="h-5 w-5" />

                  </div>

                  <div>

                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-red-400">
                      Stay Connected
                    </p>

                    <h2 className="mt-1 text-xl font-black">
                      Follow Our Journey
                    </h2>

                  </div>

                </div>

                <p className="mt-5 text-xs leading-6 text-slate-300">
                  Follow Pentatone for event
                  highlights, audition updates,
                  performances and club activities.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">

                  <SocialLink
                    icon={<Globe2 />}
                    title="Facebook"
                    text="Pentatone Musical Club"
                    href={FACEBOOK_URL}
                  />

                  <SocialLink
                    icon={<Video />}
                    title="YouTube"
                    text="Pentatone Musical Club"
                    href={YOUTUBE_URL}
                  />

                </div>

                {/* EMAIL */}

                <a
                  href={`mailto:${CLUB_EMAIL}`}
                  className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600/20 text-red-400">

                    <Mail className="h-4 w-4" />

                  </div>

                  <div className="min-w-0">

                    <p className="text-[8px] font-black uppercase tracking-[0.08em] text-slate-400">
                      Email Us
                    </p>

                    <p className="mt-1 break-all text-xs font-bold text-white">
                      {CLUB_EMAIL}
                    </p>

                  </div>

                </a>

              </div>

            </div>

          </div>

        </section>

        {/* ================================= */}
        {/* MESSAGE FLOW */}
        {/* ================================= */}

        <section className="bg-[#f4f6fc] py-16">

          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">

            <div className="grid gap-5 md:grid-cols-3">

              <SmallInfo
                number="01"
                title="Send Your Message"
                text="Use the contact form to submit your question or feedback."
              />

              <SmallInfo
                number="02"
                title="Admin Receives It"
                text="Your message is securely saved in the club administration portal."
              />

              <SmallInfo
                number="03"
                title="Stay Connected"
                text="The Pentatone team can review your message and respond through your provided contact details."
              />

            </div>

          </div>

        </section>

        {/* ================================= */}
        {/* CTA */}
        {/* ================================= */}

        <section className="bg-[#fbfbfe] py-20">

          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">

            <div className="relative overflow-hidden rounded-3xl bg-[#d40000] px-6 py-16 text-center text-white sm:px-12">

              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border-[22px] border-white/10" />

              <div className="absolute -bottom-32 -left-28 h-72 w-72 rounded-full bg-black/5" />

              <div className="relative z-10">

                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/75">
                  Be Part Of The Music
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  Ready To Join Pentatone?
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/80">
                  Become part of the musical
                  community of Sylhet Engineering
                  College. Your stage is waiting.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">

                  <Link
                    href="/events"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-6 text-[9px] font-black uppercase tracking-[0.08em] text-[#c40000] transition hover:bg-slate-100"
                  >
                    Explore Events

                    <ArrowRight className="h-3.5 w-3.5" />

                  </Link>

                  {!currentUser && (
                    <Link
                      href="/register"
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-white px-6 text-[9px] font-black uppercase tracking-[0.08em] text-white transition hover:bg-white hover:text-[#d40000]"
                    >
                      Join Club
                    </Link>
                  )}

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

/*
 * =====================================
 * CONTACT INFO CARD
 * =====================================
 */

function ContactInfoCard({
  icon,
  title,
  primary,
  secondary,
  href,
  external = false,
}: {
  icon: ReactNode;
  title: string;
  primary: string;
  secondary: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={
        external
          ? "noopener noreferrer"
          : undefined
      }
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
    >

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 transition group-hover:bg-red-600 group-hover:text-white [&>svg]:h-5 [&>svg]:w-5">

        {icon}

      </div>

      <div className="mt-5 flex items-center gap-2">

        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-red-600">
          {title}
        </p>

        {external && (
          <ExternalLink className="h-3 w-3 text-slate-400" />
        )}

      </div>

      <h3 className="mt-2 break-words text-sm font-black text-[#111827]">
        {primary}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {secondary}
      </p>

    </a>
  );
}

/*
 * =====================================
 * SOCIAL LINK
 * =====================================
 */

function SocialLink({
  icon,
  title,
  text,
  href,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-red-500/40 hover:bg-white/10"
    >

      <div className="flex items-start justify-between gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600/20 text-red-400 [&>svg]:h-4 [&>svg]:w-4">

          {icon}

        </div>

        <ExternalLink className="h-3.5 w-3.5 text-slate-500 transition group-hover:text-red-400" />

      </div>

      <p className="mt-4 text-[9px] font-black uppercase tracking-[0.08em] text-white">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        {text}
      </p>

    </a>
  );
}

/*
 * =====================================
 * SMALL INFO
 * =====================================
 */

function SmallInfo({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">

      <span className="text-2xl font-black text-red-600">
        {number}
      </span>

      <h3 className="mt-4 text-sm font-black text-[#111827]">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}