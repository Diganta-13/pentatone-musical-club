"use client";

import Link from "next/link";
import { Mail, RotateCcwKey } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setMessage(
      "Reset link request submitted. Email service will be connected later.",
    );
  }

  return (
    <div className="w-full max-w-[500px] rounded-xl bg-white px-10 py-11 shadow-[0_20px_60px_rgba(15,23,42,0.12)] sm:px-12">
      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#eef1ff]">
        <RotateCcwKey
          className="h-7 w-7 text-[#d00000]"
          strokeWidth={2.4}
        />
      </div>

      {/* Heading */}
      <div className="mt-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#101827]">
          Forgot Password?
        </h1>

        <p className="mt-3 max-w-[400px] text-base leading-7 text-slate-600">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8">
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-bold tracking-[0.08em] text-slate-700"
        >
          Email Address
        </label>

        <div className="relative">
          <Mail
            className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
            strokeWidth={1.8}
          />

          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@sec.ac.bd"
            autoComplete="email"
            required
            className="h-14 w-full rounded-lg border border-transparent bg-[#eef1ff] pr-4 pl-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
          />
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div
            role="status"
            className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          className="mt-6 flex h-14 w-full items-center justify-center rounded-lg bg-[#d00000] px-6 text-sm font-bold tracking-[0.12em] text-white shadow-lg shadow-red-200 transition hover:bg-red-700"
        >
          Send Reset Link
        </button>
      </form>

      {/* Bottom section */}
      <div className="mt-8 border-t border-slate-200 pt-7 text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-slate-700 transition hover:text-red-600"
        >
          Try another way
        </Link>

        <p className="mt-4 text-sm text-slate-400">
          Having trouble?{" "}
          <Link
            href="/#contact"
            className="font-bold text-red-600 transition hover:text-red-700"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}