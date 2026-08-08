import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { z } from "zod";

import db from "@/lib/db";

import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth";

const applicationSchema = z.object({
  studentId: z
    .string()
    .trim()
    .min(3)
    .max(100),

  departmentId: z.coerce
    .number()
    .int()
    .positive(),

  session: z
    .string()
    .trim()
    .min(2)
    .max(30),

  currentSemester: z
    .string()
    .trim()
    .min(2)
    .max(50),

  phone: z
    .string()
    .trim()
    .min(6)
    .max(30),

  primarySkill: z
    .string()
    .trim()
    .min(2)
    .max(100),

  proofType: z.enum([
    "STUDENT_ID",
    "REGISTRATION_CARD",
    "OTHER",
  ]),
});

interface UserRow extends RowDataPacket {
  id: number;
  role: string;
  is_active: number | boolean;
}

interface MembershipRow
  extends RowDataPacket {
  id: number;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";
}

export async function POST(
  request: Request,
) {
  try {
    /*
     * Authentication
     */

    const cookieStore =
      await cookies();

    const token = cookieStore.get(
      SESSION_COOKIE_NAME,
    )?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be logged in to apply.",
        },
        { status: 401 },
      );
    }

    const session =
      await verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your session is invalid or expired.",
        },
        { status: 401 },
      );
    }

    /*
     * Get CURRENT role from database.
     * Database is authoritative.
     */

    const [users] =
      await db.execute<UserRow[]>(
        `
          SELECT
            u.id,
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
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      );
    }

    const user = users[0];

    if (!user.is_active) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account is inactive.",
        },
        { status: 403 },
      );
    }

    if (user.role !== "GENERAL_USER") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only general users can submit membership applications.",
        },
        { status: 403 },
      );
    }

    /*
     * Prevent duplicate active applications
     */

    const [existingRequests] =
      await db.execute<
        MembershipRow[]
      >(
        `
          SELECT
            id,
            status
          FROM membership_requests
          WHERE user_id = ?
          ORDER BY created_at DESC
          LIMIT 1
        `,
        [user.id],
      );

    if (
      existingRequests.length > 0
    ) {
      const latest =
        existingRequests[0];

      if (
        latest.status === "PENDING"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You already have a pending membership application.",
          },
          { status: 409 },
        );
      }

      if (
        latest.status === "APPROVED"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Your membership has already been approved.",
          },
          { status: 409 },
        );
      }
    }

    /*
     * Read multipart form
     */

    const formData =
      await request.formData();

    const validation =
      applicationSchema.safeParse({
        studentId:
          formData.get("studentId"),

        departmentId:
          formData.get(
            "departmentId",
          ),

        session:
          formData.get("session"),

        currentSemester:
          formData.get(
            "currentSemester",
          ),

        phone:
          formData.get("phone"),

        primarySkill:
          formData.get(
            "primarySkill",
          ),

        proofType:
          formData.get("proofType"),
      });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error.issues[0]
              ?.message ||
            "Please provide valid application information.",
        },
        { status: 400 },
      );
    }

    const proof =
      formData.get("proof");

    if (
      !proof ||
      typeof proof === "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Student verification document is required.",
        },
        { status: 400 },
      );
    }

    /*
     * File validation
     */

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];

    if (
      !allowedTypes.includes(
        proof.type,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, PNG and PDF documents are allowed.",
        },
        { status: 400 },
      );
    }

    const maxFileSize =
      4 * 1024 * 1024;

    if (
      proof.size > maxFileSize
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification document must be smaller than 4 MB.",
        },
        { status: 400 },
      );
    }

    const {
      studentId,
      departmentId,
      session: studentSession,
      currentSemester,
      phone,
      primarySkill,
      proofType,
    } = validation.data;

    /*
     * Verify department exists
     */

    const [departments] =
      await db.execute<
        RowDataPacket[]
      >(
        `
          SELECT id
          FROM departments
          WHERE id = ?
          LIMIT 1
        `,
        [departmentId],
      );

    if (departments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected department does not exist.",
        },
        { status: 400 },
      );
    }

    /*
     * Save verification document
     *
     * Demo/local implementation.
     */

    const extensionMap: Record<
      string,
      string
    > = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "application/pdf": "pdf",
    };

    const extension =
      extensionMap[proof.type];

    const fileName = `${user.id}-${randomUUID()}.${extension}`;

    const uploadDirectory =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "membership",
      );

    await fs.mkdir(
      uploadDirectory,
      {
        recursive: true,
      },
    );

    const filePath = path.join(
      uploadDirectory,
      fileName,
    );

    const buffer = Buffer.from(
      await proof.arrayBuffer(),
    );

    await fs.writeFile(
      filePath,
      buffer,
    );

    const proofUrl =
      `/uploads/membership/${fileName}`;

    /*
     * Save application
     */

    await db.execute(
      `
        INSERT INTO membership_requests (
          user_id,
          student_id,
          department_id,
          session,
          current_semester,
          phone,
          primary_skill,
          proof_type,
          proof_url,
          status
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING'
        )
      `,
      [
        user.id,
        studentId,
        departmentId,
        studentSession,
        currentSemester,
        phone,
        primarySkill,
        proofType,
        proofUrl,
      ],
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Membership application submitted successfully.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Membership application error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while submitting your application.",
      },
      { status: 500 },
    );
  }
}