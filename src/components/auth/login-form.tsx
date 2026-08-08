"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";

type LoginFormProps = {
  registered?: boolean;
};

export default function LoginForm({
  registered = false,
}: LoginFormProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] =
    useState(
      registered
        ? "Account created successfully. You can now log in."
        : "",
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const inputClass =
    "h-14 w-full border border-transparent bg-[#eef1ff] px-5 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100";

  const labelClass =
    "mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-slate-800";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");
    setSuccessMessage("");

    const formData = new FormData(
      event.currentTarget,
    );

    const email = String(
      formData.get("email") || "",
    )
      .trim()
      .toLowerCase();

    const password = String(
      formData.get("password") || "",
    );

    const rememberMe =
      formData.get("rememberMe") === "on";

    if (!email || !email.includes("@")) {
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

    try {
      setIsSubmitting(true);

      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
            rememberMe,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to sign in.",
        );
        return;
      }

      setSuccessMessage(
        "Login successful. Redirecting...",
      );

      setTimeout(() => {
        if (data.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }

        router.refresh();
      }, 700);
    } catch {
      setError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleLogin() {
    setSuccessMessage("");
    setError(
      "Google sign-in will be connected next.",
    );
  }

  return (
    <div className="w-full max-w-[470px] border-t-4 border-[#d40000] bg-white px-8 py-10 shadow-[0_20px_50px_rgba(15,23,42,0.12)] sm:px-12 sm:py-12">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#111827]">
          Welcome Back
        </h1>

        <p className="mt-2 text-base text-slate-600">
          Please enter your details to sign in.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-10"
      >
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
            autoComplete="email"
            required
            disabled={isSubmitting}
            className={inputClass}
          />
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-[0.08em] text-slate-800"
            >
              Password
            </label>

            <Link
              href="/forgot-password"
              className="text-[11px] font-bold uppercase text-red-600 transition hover:text-red-700"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              minLength={8}
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

        <label className="mt-6 flex w-fit cursor-pointer items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            name="rememberMe"
            disabled={isSubmitting}
            className="h-5 w-5 cursor-pointer accent-red-600"
          />

          <span>Remember me for 30 days</span>
        </label>

        {error && (
          <div
            role="alert"
            className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mt-6 border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
          >
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-7 flex h-14 w-full items-center justify-center bg-[#d40000] px-6 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Signing In..."
            : "Login to Account"}
        </button>

        <div className="my-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-red-100" />

          <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
            Or continue with
          </span>

          <span className="h-px flex-1 bg-red-100" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="flex h-14 w-full items-center justify-center gap-3 border-2 border-slate-900 bg-white px-6 text-sm font-bold uppercase tracking-[0.12em] text-slate-900 transition hover:border-red-600 hover:text-red-600 disabled:opacity-60"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-red-600 transition hover:text-red-700"
          >
            Create Account
          </Link>
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