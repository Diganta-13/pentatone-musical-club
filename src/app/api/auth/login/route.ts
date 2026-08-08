import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { RowDataPacket } from "mysql2";

import db from "@/lib/db";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address."),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(128),

  rememberMe: z.boolean().optional().default(false),
});

interface LoginUserRow extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  password_hash: string | null;
  is_active: number | boolean;
  role: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error.issues[0]?.message ||
            "Invalid login information.",
        },
        { status: 400 },
      );
    }

    const { email, password, rememberMe } =
      validation.data;

    const [users] = await db.execute<LoginUserRow[]>(
      `
        SELECT
          u.id,
          u.full_name,
          u.email,
          u.password_hash,
          u.is_active,
          r.name AS role
        FROM users u
        INNER JOIN roles r
          ON r.id = u.role_id
        WHERE u.email = ?
        LIMIT 1
      `,
      [email],
    );

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    const user = users[0];

    if (!user.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "This account is currently inactive.",
        },
        { status: 403 },
      );
    }

    if (!user.password_hash) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password login is not available for this account.",
        },
        { status: 401 },
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    const maxAge = rememberMe
      ? 60 * 60 * 24 * 30
      : 60 * 60 * 24;

    const token = await createSessionToken(
      {
        userId: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
      maxAge,
    );

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while signing in.",
      },
      { status: 500 },
    );
  }
}