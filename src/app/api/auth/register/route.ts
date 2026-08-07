import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { RowDataPacket } from "mysql2";

import db from "@/lib/db";

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters.")
    .max(120, "Full name is too long."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(255),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(128, "Password is too long."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error.issues[0]?.message ||
            "Invalid registration information.",
        },
        { status: 400 },
      );
    }

    const { fullName, email, password } = validation.data;

    // Check whether the email is already registered
    const [existingUsers] = await db.execute<RowDataPacket[]>(
      `
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [email],
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    // Find GENERAL_USER role
    const [roles] = await db.execute<RowDataPacket[]>(
      `
        SELECT id
        FROM roles
        WHERE name = ?
        LIMIT 1
      `,
      ["GENERAL_USER"],
    );

    if (roles.length === 0) {
      console.error("GENERAL_USER role was not found.");

      return NextResponse.json(
        {
          success: false,
          message: "Unable to create account right now.",
        },
        { status: 500 },
      );
    }

    const roleId = Number(roles[0].id);

    // Hash password before saving
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    await db.execute(
      `
        INSERT INTO users (
          full_name,
          email,
          password_hash,
          google_id,
          avatar_url,
          email_verified,
          role_id,
          department_id,
          is_active
        )
        VALUES (?, ?, ?, NULL, NULL, FALSE, ?, NULL, TRUE)
      `,
      [fullName, email, passwordHash, roleId],
    );

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    const mysqlError = error as {
      code?: string;
    };

    if (mysqlError.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating your account.",
      },
      { status: 500 },
    );
  }
}