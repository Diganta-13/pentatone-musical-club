import { Mail } from "lucide-react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export default function NewsletterSection() {
  return (
    <section className="bg-[#f7f8ff] px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-[1350px]">
        <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-[#273142] to-[#3b2934] px-6 py-16 text-center shadow-xl sm:px-10 lg:py-20">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full border-[25px] border-white/5" />

          <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full border-[28px] border-white/5" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <Mail className="h-7 w-7 text-white" strokeWidth={1.8} />
            </div>

            <h2
              className={`${playfair.className} mt-6 text-3xl font-bold text-white sm:text-4xl`}
            >
              Ready to Amplify Your Talent?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Join the most energetic musical community at Sylhet Engineering
              College. Whether you are a vocalist, guitarist, drummer, or music
              lover, there is a place for you.
            </p>

            <form className="mx-auto mt-9 flex max-w-2xl flex-col gap-4 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                College email address
              </label>

              <input
                id="newsletter-email"
                type="email"
                name="email"
                placeholder="Enter your college email"
                required
                className="min-h-14 flex-1 rounded-xl border border-white/10 bg-white/10 px-5 text-white outline-none transition placeholder:text-slate-300 focus:border-red-500 focus:bg-white/15"
              />

              <button
                type="submit"
                className="min-h-14 rounded-xl bg-[#ed0000] px-8 font-bold text-white shadow-lg shadow-red-950/30 transition duration-300 hover:-translate-y-1 hover:bg-red-700"
              >
                Get Updates
              </button>
            </form>

            <p className="mt-4 text-sm text-slate-400">
              Club news, upcoming events, and audition announcements.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}