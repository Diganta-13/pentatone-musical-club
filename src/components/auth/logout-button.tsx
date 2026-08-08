"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LogoutButtonProps = {
  variant?: "default" | "nav";
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
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      const response = await fetch(
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

      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to log out. Please try again.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  const className =
    variant === "nav"
      ? "inline-flex items-center gap-2 text-[13px] font-semibold text-gray-700 transition hover:text-red-600 disabled:opacity-50"
      : "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className}
    >
      <LogOut className="h-4 w-4" />

      {isLoggingOut
        ? "Logging Out..."
        : "Logout"}
    </button>
  );
}