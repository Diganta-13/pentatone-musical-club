import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import AdminHeader from "@/components/admin/admin-header";
import AdminSidebar from "@/components/admin/admin-sidebar";

import { getCurrentUser } from "@/lib/current-user";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  /*
   * ==============================
   * CURRENT AUTHENTICATED USER
   * ==============================
   */

  const user =
    await getCurrentUser();

  /*
   * ==============================
   * NO VALID SESSION
   * ==============================
   */

  if (!user) {
    redirect("/login");
  }

  /*
   * ==============================
   * ONLY ADMIN CAN ACCESS /admin
   * ==============================
   */

  if (
    user.role !== "ADMIN"
  ) {
    redirect("/dashboard");
  }

  /*
   * ==============================
   * ADMIN LAYOUT
   * ==============================
   */

  return (
    <div className="min-h-screen bg-[#f6f7fc]">

      {/* ============================== */}
      {/* FIXED ADMIN SIDEBAR */}
      {/* ============================== */}

      <AdminSidebar />

      {/* ============================== */}
      {/* ADMIN CONTENT AREA */}
      {/* ============================== */}

      <div className="flex min-h-screen flex-col lg:ml-[250px]">

        {/* ADMIN HEADER */}

        <AdminHeader
          fullName={
            user.fullName
          }
        />

        {/* PAGE CONTENT */}

        <main className="flex-1">
          {children}
        </main>

      </div>

    </div>
  );
}