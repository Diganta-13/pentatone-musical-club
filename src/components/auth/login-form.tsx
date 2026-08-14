"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";

type LoginFormProps = {
  registered?: boolean;
};

export default function LoginForm({
  registered = false,
}: LoginFormProps) {
  const router = useRouter();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState(
    registered
      ? "Account created successfully. You can now log in."
      : "",
  );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

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

    const formData =
      new FormData(
        event.currentTarget,
      );

    const email =
      String(
        formData.get(
          "email",
        ) || "",
      )
        .trim()
        .toLowerCase();

    const password =
      String(
        formData.get(
          "password",
        ) || "",
      );

    const rememberMe =
      formData.get(
        "rememberMe",
      ) === "on";

    /*
     * ==============================
     * EMAIL VALIDATION
     * ==============================
     */

    if (
      !email ||
      !email.includes("@")
    ) {
      setError(
        "Please enter a valid email address.",
      );

      return;
    }

    /*
     * ==============================
     * PASSWORD VALIDATION
     * ==============================
     */

    if (
      password.length < 8
    ) {
      setError(
        "Password must contain at least 8 characters.",
      );

      return;
    }

    /*
     * ==============================
     * LOGIN REQUEST
     * ==============================
     */

    try {
      setIsSubmitting(true);

      const response =
        await fetch(
          "/api/auth/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                email,
                password,
                rememberMe,
              }),
          },
        );

      const data =
        await response.json();

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
        if (
          data.user?.role ===
          "ADMIN"
        ) {
          router.push(
            "/admin",
          );
        } else {
          router.push(
            "/dashboard",
          );
        }

        router.refresh();
      }, 700);
    } catch {
      setError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }

  return (
    <div className="w-full max-w-[470px] border-t-4 border-[#d40000] bg-white px-8 py-10 shadow-[0_20px_50px_rgba(15,23,42,0.12)] sm:px-12 sm:py-12">

      {/* ============================== */}
      {/* HEADING */}
      {/* ============================== */}

      <div>

        <h1 className="text-4xl font-extrabold tracking-tight text-[#111827]">
          Welcome Back
        </h1>

        <p className="mt-2 text-base text-slate-600">
          Please enter your
          details to sign in.
        </p>

      </div>

      {/* ============================== */}
      {/* LOGIN FORM */}
      {/* ============================== */}

      <form
        onSubmit={
          handleSubmit
        }
        className="mt-10"
      >

        {/* ============================== */}
        {/* EMAIL */}
        {/* ============================== */}

        <div>

          <label
            htmlFor="email"
            className={
              labelClass
            }
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
            disabled={
              isSubmitting
            }
            className={
              inputClass
            }
          />

        </div>

        {/* ============================== */}
        {/* PASSWORD */}
        {/* ============================== */}

        <div className="mt-6">

          <label
            htmlFor="password"
            className={
              labelClass
            }
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
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              minLength={8}
              disabled={
                isSubmitting
              }
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
              disabled={
                isSubmitting
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-red-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>

          </div>

        </div>

        {/* ============================== */}
        {/* REMEMBER + FORGOT PASSWORD */}
        {/* ============================== */}

        <div className="mt-6 flex items-center justify-between gap-4">

          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">

            <input
              type="checkbox"
              name="rememberMe"
              disabled={
                isSubmitting
              }
              className="h-5 w-5 cursor-pointer accent-red-600"
            />

            <span>
              Remember me for 30
              days
            </span>

          </label>

          <Link
            href="/forgot-password"
            className="shrink-0 text-sm font-bold text-[#d40000] transition hover:text-red-700 hover:underline"
          >
            Forgot Password?
          </Link>

        </div>

        {/* ============================== */}
        {/* ERROR */}
        {/* ============================== */}

        {error && (
          <div
            role="alert"
            className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {/* ============================== */}
        {/* SUCCESS */}
        {/* ============================== */}

        {successMessage && (
          <div
            role="status"
            className="mt-6 border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
          >
            {
              successMessage
            }
          </div>
        )}

        {/* ============================== */}
        {/* LOGIN BUTTON */}
        {/* ============================== */}

        <button
          type="submit"
          disabled={
            isSubmitting
          }
          className="mt-7 flex h-14 w-full items-center justify-center bg-[#d40000] px-6 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Signing In..."
            : "Login to Account"}
        </button>

        {/* ============================== */}
        {/* CREATE ACCOUNT */}
        {/* ============================== */}

        <div className="mt-8 border-t border-slate-200 pt-7">

          <p className="text-center text-sm text-slate-600">

            Don&apos;t have an
            account?{" "}

            <Link
              href="/register"
              className="font-bold text-red-600 transition hover:text-red-700"
            >
              Create Account
            </Link>

          </p>

        </div>

      </form>

    </div>
  );
}