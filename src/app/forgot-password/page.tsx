import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#f8f8ff]">
      {/* Navbar */}
      <header className="border-t-4 border-[#263142] bg-white shadow-sm">
        <div className="mx-auto flex h-[76px] max-w-[1200px] items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-[#c90000]"
          >
            Pentatone
          </Link>

          <nav className="hidden items-center gap-9 text-sm text-slate-600 md:flex">
            <Link href="/" className="transition hover:text-red-600">
              Home
            </Link>

            <Link href="/#about" className="transition hover:text-red-600">
              About
            </Link>

            <Link href="/#events" className="transition hover:text-red-600">
              Events
            </Link>

            <Link href="/#auditions" className="transition hover:text-red-600">
              Auditions
            </Link>
          </nav>

          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="hidden items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-red-600 sm:flex"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>

            <Link
              href="/register"
              className="rounded-full bg-[#c90000] px-6 py-3 text-sm font-bold uppercase text-white transition hover:bg-red-700"
            >
              Join Club
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-5 py-14">
        <ForgotPasswordForm />

        <p className="mt-8 max-w-[430px] text-center text-base leading-6 italic text-slate-400">
          &quot;Music is the engineering of the soul.&quot; — Pentatone
          Musical Club
        </p>
      </main>
    </div>
  );
}