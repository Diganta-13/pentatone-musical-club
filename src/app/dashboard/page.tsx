import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import LogoutButton from "@/components/auth/logout-button";

import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    SESSION_COOKIE_NAME,
  )?.value;

  // No login session
  if (!token) {
    redirect("/login");
  }

  // Verify session
  const session =
    await verifySessionToken(token);

  // Invalid or expired session
  if (!session) {
    redirect("/login");
  }

  // Admin should use admin dashboard later
  if (session.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[#f7f8ff]">
      {/* Dashboard navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-red-600"
          >
            Pentatone
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-600 transition hover:text-red-600"
            >
              Back to Website
            </Link>

            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Dashboard content */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-600">
              Pentatone Dashboard
            </p>

            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
              Welcome, {session.fullName}
            </h1>

            <p className="mt-3 text-slate-600">
              Manage your Pentatone account and club
              membership.
            </p>
          </div>

          {/* Role badge */}
          <div className="w-fit rounded-full bg-slate-900 px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
            {session.role === "MEMBER"
              ? "Member"
              : "General User"}
          </div>
        </div>

        {/* Main account card */}
        <div className="mt-10 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="grid gap-8 sm:grid-cols-2">
            {/* Name */}
            <div>
              <p className="text-sm text-slate-500">
                Full Name
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {session.fullName}
              </p>
            </div>

            {/* Email */}
            <div>
              <p className="text-sm text-slate-500">
                Email Address
              </p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {session.email}
              </p>
            </div>

            {/* Role */}
            <div>
              <p className="text-sm text-slate-500">
                Account Role
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {session.role}
              </p>
            </div>
          </div>

          {/* GENERAL USER */}
          {session.role === "GENERAL_USER" && (
            <div className="mt-10 rounded-2xl border border-red-100 bg-red-50 p-6">
              <p className="text-lg font-bold text-slate-900">
                Club Membership
              </p>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Your Pentatone account is active, but you
                are not an official club member yet.
                Submit a membership application to begin
                the verification process.
              </p>

              <Link
                href="/join-club"
                className="mt-5 inline-flex rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Apply for Membership
              </Link>
            </div>
          )}

          {/* MEMBER */}
          {session.role === "MEMBER" && (
            <div className="mt-10 rounded-2xl border border-green-200 bg-green-50 p-6">
              <p className="text-lg font-bold text-green-800">
                Pentatone Member
              </p>

              <p className="mt-2 text-sm leading-6 text-green-700">
                Your official Pentatone Musical Club
                membership is active.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}