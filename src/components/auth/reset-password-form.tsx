"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({
  token,
}: ResetPasswordFormProps) {
  const router =
    useRouter();

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    /*
     * =================================
     * CLIENT VALIDATION
     * =================================
     */

    if (
      password.length < 8
    ) {
      setError(
        "Password must contain at least 8 characters.",
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match.",
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          "/api/auth/reset-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                token,
                password,
                confirmPassword,
              }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to reset password.",
        );

        return;
      }

      setSuccess(true);

      /*
       * Redirect to login
       */

      setTimeout(() => {
        router.push(
          "/login",
        );

        router.refresh();
      }, 2000);
    } catch {
      setError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =====================================
   * INVALID / MISSING TOKEN
   * =====================================
   */

  if (!token) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#d40000]">

          <KeyRound className="h-6 w-6" />

        </div>

        <h1 className="mt-6 text-2xl font-black text-[#111827]">
          Invalid Reset Link
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          This password reset link
          is invalid or incomplete.
        </p>

        <Link
          href="/forgot-password"
          className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-[#d40000] px-6 text-xs font-black uppercase tracking-[0.07em] text-white"
        >
          Request New Link
        </Link>

      </div>
    );
  }

  /*
   * =====================================
   * SUCCESS
   * =====================================
   */

  if (success) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-9 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">

          <CheckCircle2 className="h-8 w-8" />

        </div>

        <h1 className="mt-6 text-2xl font-black text-[#111827]">
          Password Reset!
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your password has been
          changed successfully.
          Redirecting you to login...
        </p>

        <Loader2 className="mx-auto mt-6 h-5 w-5 animate-spin text-[#d40000]" />

      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-9">

      {/* ICON */}

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#d40000]">

        <LockKeyhole className="h-6 w-6" />

      </div>

      {/* TITLE */}

      <h1 className="mt-6 text-3xl font-black tracking-tight text-[#111827]">
        Reset Password
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        Create a new secure password
        for your Pentatone account.
      </p>

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

        {/* NEW PASSWORD */}

        <div>

          <label
            htmlFor="password"
            className="text-xs font-black uppercase tracking-[0.06em] text-slate-700"
          >
            New Password
          </label>

          <div className="relative mt-2">

            <input
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={
                password
              }
              onChange={(
                event,
              ) =>
                setPassword(
                  event.target
                    .value,
                )
              }
              placeholder="Enter new password"
              required
              minLength={8}
              disabled={
                loading
              }
              className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 pr-12 text-sm outline-none transition focus:border-[#d40000] focus:ring-2 focus:ring-red-100"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (value) =>
                    !value,
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#d40000]"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>

          </div>

        </div>

        {/* CONFIRM PASSWORD */}

        <div className="mt-5">

          <label
            htmlFor="confirmPassword"
            className="text-xs font-black uppercase tracking-[0.06em] text-slate-700"
          >
            Confirm Password
          </label>

          <div className="relative mt-2">

            <input
              id="confirmPassword"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={
                confirmPassword
              }
              onChange={(
                event,
              ) =>
                setConfirmPassword(
                  event.target
                    .value,
                )
              }
              placeholder="Confirm new password"
              required
              minLength={8}
              disabled={
                loading
              }
              className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 pr-12 text-sm outline-none transition focus:border-[#d40000] focus:ring-2 focus:ring-red-100"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  (value) =>
                    !value,
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#d40000]"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>

          </div>

        </div>

        {/* PASSWORD RULE */}

        <p className="mt-3 text-[11px] leading-5 text-slate-400">
          Password must contain at
          least 8 characters.
        </p>

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={
            loading
          }
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#d40000] text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />

              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>

      </form>

      {/* LOGIN */}

      <div className="mt-7 border-t border-slate-100 pt-6 text-center">

        <Link
          href="/login"
          className="text-xs font-bold text-slate-500 transition hover:text-[#d40000]"
        >
          Back to Login
        </Link>

      </div>

    </div>
  );
}