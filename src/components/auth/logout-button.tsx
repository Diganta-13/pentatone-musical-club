"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
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
        throw new Error("Logout failed");
      }

      router.push("/login");
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

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" />

      {isLoggingOut
        ? "Logging Out..."
        : "Logout"}
    </button>
  );
}