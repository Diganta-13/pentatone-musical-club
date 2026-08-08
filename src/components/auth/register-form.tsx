"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";

export default function RegisterForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const inputClass =
    "h-14 w-full rounded-xl border border-transparent bg-[#eef1ff] px-5 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100";

  const labelClass =
    "mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-800";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");
    setSuccessMessage("");

    const form = event.currentTarget;

    const formData =
      new FormData(form);

    const fullName = String(
      formData.get("fullName") || "",
    ).trim();

    const email = String(
      formData.get("email") || "",
    )
      .trim()
      .toLowerCase();

    const password = String(
      formData.get("password") || "",
    );

    const confirmPassword = String(
      formData.get(
        "confirmPassword",
      ) || "",
    );

    /*
     * Client-side validation
     */

    if (fullName.length < 2) {
      setError(
        "Full name must contain at least 2 characters.",
      );

      return;
    }

    if (!email) {
      setError(
        "Please enter your email address.",
      );

      return;
    }

    if (
      !email.includes("@") ||
      !email.includes(".")
    ) {
      setError(
        "Please enter a valid email address.",
      );

      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );

      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Password and confirm password do not match.",
      );

      return;
    }

    /*
     * Send registration request
     */

    try {
      setIsSubmitting(true);

      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            fullName,
            email,
            password,
          }),
        },
      );

      const data =
        await response.json();

      /*
       * API Error
       */

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create your account.",
        );

        return;
      }

      /*
       * Registration Success
       */

      setSuccessMessage(
        "Account created successfully. Redirecting to login...",
      );

      form.reset();

      setTimeout(() => {
        router.push(
          "/login?registered=true",
        );
      }, 1000);
    } catch {
      setError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[720px]">
      {/* ====================== */}
      {/* HEADING */}
      {/* ====================== */}

      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
          Welcome To Pentatone
        </p>

        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#111827] xl:text-5xl">
          Create Your Account
        </h1>

        <p className="mt-4 text-base leading-7 text-slate-600">
          Create a Pentatone account to
          access your personal dashboard and
          club membership opportunities.
        </p>
      </div>

      {/* ====================== */}
      {/* ACCOUNT INFO */}
      {/* ====================== */}

      <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <p className="text-sm font-bold text-slate-900">
              General User Account
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Creating an account does not
              automatically make you a club
              member. After login, you can
              submit an official membership
              application.
            </p>
          </div>
        </div>
      </div>

      {/* ====================== */}
      {/* FORM */}
      {/* ====================== */}

      <form
        onSubmit={handleSubmit}
        className="mt-9"
      >
        <div className="space-y-6">
          {/* Full Name */}

          <div>
            <label
              htmlFor="fullName"
              className={labelClass}
            >
              Full Name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>

          {/* Email */}

          <div>
            <label
              htmlFor="email"
              className={labelClass}
            >
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              required
              maxLength={255}
              autoComplete="email"
              disabled={isSubmitting}
              className={inputClass}
            />

            <p className="mt-2 text-xs leading-5 text-slate-500">
              You can use your Gmail or any
              valid email address.
            </p>
          </div>

          {/* Password Row */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Password */}

            <div>
              <label
                htmlFor="password"
                className={labelClass}
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className={`${inputClass} pr-14`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current,
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={isSubmitting}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500 transition hover:text-red-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}

            <div>
              <label
                htmlFor="confirmPassword"
                className={labelClass}
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Repeat your password"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className={`${inputClass} pr-14`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current,
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  disabled={isSubmitting}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-500 transition hover:text-red-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Password Requirements */}

          <div className="rounded-xl bg-white px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-700">
              Password Requirement
            </p>

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-green-600" />

              Minimum 8 characters
            </div>
          </div>
        </div>

        {/* ====================== */}
        {/* ERROR */}
        {/* ====================== */}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {/* ====================== */}
        {/* SUCCESS */}
        {/* ====================== */}

        {successMessage && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700"
          >
            {successMessage}
          </div>
        )}

        {/* ====================== */}
        {/* CREATE ACCOUNT */}
        {/* ====================== */}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-8 flex h-[60px] w-full items-center justify-center rounded-xl bg-[#ed0000] px-8 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-lg shadow-red-200 transition duration-300 hover:-translate-y-1 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting
            ? "Creating Account..."
            : "Create Account"}
        </button>

        {/* ====================== */}
        {/* LOGIN */}
        {/* ====================== */}

        <div className="mt-8 border-t border-slate-200 pt-7">
          <p className="text-center text-sm text-slate-600">
            Already have a Pentatone
            account?{" "}
            <Link
              href="/login"
              className="font-bold text-red-600 transition hover:text-red-700"
            >
              Login here
            </Link>
          </p>
        </div>

        {/* ====================== */}
        {/* NEXT STEP */}
        {/* ====================== */}

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-bold text-slate-900">
            What happens next?
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            After creating your account,
            login to your dashboard. If you
            want to become an official
            Pentatone member, submit a
            membership application from
            there.
          </p>
        </div>

        <p className="mt-6 text-center text-xs leading-6 text-slate-500">
          By creating an account, you agree
          to follow the rules and guidelines
          of Pentatone Musical Club.
        </p>
      </form>
    </div>
  );
}