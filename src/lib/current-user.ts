import "server-only";

import { cookies } from "next/headers";
import type { RowDataPacket } from "mysql2";

import db from "@/lib/db";

import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth";

export type CurrentUser = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

interface CurrentUserRow extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: number | boolean;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get(
      SESSION_COOKIE_NAME,
    )?.value;

    if (!token) {
      return null;
    }

    const session =
      await verifySessionToken(token);

    if (!session) {
      return null;
    }

    const [users] =
      await db.execute<CurrentUserRow[]>(
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

    if (
      users.length === 0 ||
      !users[0].is_active
    ) {
      return null;
    }

    const user = users[0];

    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error(
      "Current user lookup failed:",
      error,
    );

    return null;
  }
}