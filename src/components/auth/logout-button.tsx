"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LogoutButtonProps = {
  variant?:
    | "default"
    | "nav"
    | "sidebar";

  redirectTo?: string;
};

export default function LogoutButton({
  variant = "default",
  redirectTo = "/login",
}: LogoutButtonProps) {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);

      const response =
        await fetch(
          "/api/auth/logout",
          {
            method: "POST",
          },
        );

      if (!response.ok) {
        throw new Error(
          "Logout failed",
        );
      }

      router.replace(
        redirectTo,
      );

      router.refresh();
    } catch (error) {
      console.error(
        error,
      );

      alert(
        "Unable to log out. Please try again.",
      );
    } finally {
      setIsLoggingOut(
        false,
      );
    }
  }

  /*
   * =====================================
   * BUTTON STYLE
   * =====================================
   */

  let className = "";

  if (
    variant === "nav"
  ) {
    className =
      "inline-flex items-center gap-2 text-[13px] font-semibold text-gray-700 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50";
  } else if (
    variant === "sidebar"
  ) {
    className =
      "flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.06em] text-slate-300 transition hover:bg-white/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50";
  } else {
    className =
      "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60";
  }

  return (
    <button
      type="button"
      onClick={
        handleLogout
      }
      disabled={
        isLoggingOut
      }
      className={
        className
      }
    >
      <LogOut
        className="h-[18px] w-[18px] shrink-0"
        strokeWidth={
          1.8
        }
      />

      <span>
        {isLoggingOut
          ? "Logging Out..."
          : "Logout"}
      </span>
    </button>
  );
}