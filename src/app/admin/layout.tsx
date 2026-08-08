import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";

import AdminHeader from "@/components/admin/admin-header";
import AdminSidebar from "@/components/admin/admin-sidebar";

import db from "@/lib/db";

import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth";

interface AdminRow extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: number | boolean;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    SESSION_COOKIE_NAME,
  )?.value;

  if (!token) {
    redirect("/login");
  }

  const session =
    await verifySessionToken(token);

  if (!session) {
    redirect("/login");
  }

  const [users] =
    await db.execute<AdminRow[]>(
      `
        SELECT
          u.id,
          u.full_name,
          u.email,
          u.is_active,
          r.name AS role
        FROM users u
        INNER JOIN roles r
          ON r.id = u.role_id
        WHERE u.id = ?
        LIMIT 1
      `,
      [session.userId],
    );

  if (users.length === 0) {
    redirect("/login");
  }

  const admin = users[0];

  if (!admin.is_active) {
    redirect("/login");
  }

  if (admin.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f6f7fc]">
      <AdminSidebar />

      <div className="min-h-screen lg:ml-[250px]">
        <AdminHeader
          fullName={admin.full_name}
        />

        {children}
      </div>
    </div>
  );
}