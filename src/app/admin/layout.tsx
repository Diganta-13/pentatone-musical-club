import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import AdminHeader from "@/components/admin/admin-header";
import AdminSidebar from "@/components/admin/admin-sidebar";
import Footer from "@/components/layout/footer";

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

  const user = await getCurrentUser();

  /*
   * No valid session
   */

  if (!user) {
    redirect("/login");
  }

  /*
   * Only ADMIN can access /admin
   */

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

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
        {/* Admin Header */}

        <AdminHeader
          fullName={user.fullName}
        />

        {/* Page Content */}

        <div className="flex-1">
          {children}
        </div>

        {/* ============================== */}
        {/* SAME GLOBAL FOOTER */}
        {/* ============================== */}

        <Footer />
      </div>
    </div>
  );
}