"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function RegisterForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const formData = new FormData(form);

    const fullName = String(
      formData.get("fullName") || "",
    ).trim();

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    const password = String(
      formData.get("password") || "",
    );

    const confirmPassword = String(
      formData.get("confirmPassword") || "",
    );

    if (fullName.length < 2) {
      setError(
        "Full name must contain at least 2 characters.",
      );
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Password and confirm password do not match.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create your account.",
        );
        return;
      }

      setSuccessMessage(
        "Account created successfully. Redirecting to login...",
      );

      form.reset();

      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1200);
    } catch {
      setError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleSignup() {
    setError("");
    setSuccessMessage("");

    setError(
      "Google sign-in is not connected yet. Please use email and password for now.",
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px]">
      {/* Heading */}
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">
          Welcome to Pentatone
        </p>

        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#111827] xl:text-5xl">
          Create Your Account
        </h1>

        <p className="mt-4 text-base leading-7 text-slate-600">
          Create your Pentatone account to access club
          activities and membership opportunities.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          After creating your account, you can apply for
          official club membership.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10">
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
            <label htmlFor="email" className={labelClass}>
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
          </div>

          {/* Password row */}
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
                      (current) => !current,
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
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
                      (current) => !current,
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
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
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700"
          >
            {successMessage}
          </div>
        )}

        {/* Create account */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-8 flex h-15 w-full items-center justify-center rounded-xl bg-[#ed0000] px-8 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-lg shadow-red-200 transition duration-300 hover:-translate-y-1 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting
            ? "Creating Account..."
            : "Create Account"}
        </button>

        {/* Divider */}
        <div className="my-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-red-100" />

          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Or continue with
          </span>

          <span className="h-px flex-1 bg-red-100" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isSubmitting}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-900 bg-white px-6 text-sm font-bold uppercase tracking-[0.1em] text-slate-900 transition hover:border-red-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Login */}
        <p className="mt-7 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-red-600 transition hover:text-red-700"
          >
            Login here
          </Link>
        </p>

        <p className="mt-4 text-center text-xs leading-6 text-slate-500">
          By creating an account, you agree to follow the
          rules and guidelines of Pentatone Musical Club.
        </p>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.24c1.9-1.75 2.98-4.33 2.98-7.42Z"
      />

      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.35l-3.24-2.55c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.63A10 10 0 0 0 12 22Z"
      />

      <path
        fill="#FBBC05"
        d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.44H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.56l3.35-2.63Z"
      />

      <path
        fill="#EA4335"
        d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.44l3.35 2.63C7.18 7.7 9.39 5.94 12 5.94Z"
      />
    </svg>
  );
}