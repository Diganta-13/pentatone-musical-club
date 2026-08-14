"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";

export default function ForgotPasswordForm() {
  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response =
        await fetch(
          "/api/auth/forgot-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Something went wrong. Please try again.",
        );

        return;
      }

      setMessage(
        data.message ||
          "If an account exists with this email, a password reset link has been sent.",
      );

      setEmail("");
    } catch {
      setError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-9">

      {/* ICON */}

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#d40000]">
        <Mail className="h-6 w-6" />
      </div>

      {/* HEADING */}

      <h1 className="mt-6 text-3xl font-black tracking-tight text-[#111827]">
        Forgot Password?
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        Enter the email address
        associated with your Pentatone
        account. We&apos;ll send you a
        secure password reset link.
      </p>

      {/* SUCCESS */}

      {message && (
        <div className="mt-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

          <p className="leading-5">
            {message}
          </p>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FORM */}

      <form
        onSubmit={
          handleSubmit
        }
        className="mt-7"
      >
        <label
          htmlFor="email"
          className="text-xs font-black uppercase tracking-[0.06em] text-slate-700"
        >
          Email Address
        </label>

        <div className="relative mt-2">

          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            id="email"
            type="email"
            value={email}
            onChange={(
              event,
            ) =>
              setEmail(
                event.target
                  .value,
              )
            }
            placeholder="Enter your email"
            required
            disabled={loading}
            className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#d40000] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

        </div>

        <button
          type="submit"
          disabled={
            loading ||
            !email.trim()
          }
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#d40000] text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      {/* BACK TO LOGIN */}

      <div className="mt-7 border-t border-slate-100 pt-6 text-center">

        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 transition hover:text-[#d40000]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

      </div>
    </div>
  );
}