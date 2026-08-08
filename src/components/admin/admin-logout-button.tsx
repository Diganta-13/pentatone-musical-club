"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center gap-4 px-6 py-3 text-left text-[12px] font-bold uppercase tracking-[0.12em] text-red-500 transition hover:bg-white/5 disabled:opacity-50"
    >
      <LogOut className="h-[18px] w-[18px]" />

      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}