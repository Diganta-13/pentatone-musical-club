import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import { NextResponse } from "next/server";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { z } from "zod";

import db from "@/lib/db";
import {
  getCurrentUser,
} from "@/lib/current-user";

export const runtime = "nodejs";

/*
 * =====================================
 * VALIDATION
 * =====================================
 */

const applicationSchema =
  z.object({
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

/*
 * =====================================
 * TYPES
 * =====================================
 */

interface MembershipRow
  extends RowDataPacket {
  id: number;

  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";
}

/*
 * =====================================
 * POST
 * =====================================
 */

export async function POST(
  request: Request,
) {
  let savedFilePath:
    | string
    | null = null;

  try {
    /*
     * =================================
     * AUTHENTICATION
     * =================================
     */

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,

          message:
            "You must be logged in to apply.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * Only GENERAL_USER can apply
     */

    if (
      user.role !==
      "GENERAL_USER"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Only general users can submit membership applications.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * =================================
     * PREVENT DUPLICATE APPLICATION
     * =================================
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

          ORDER BY
            created_at DESC,
            id DESC

          LIMIT 1
        `,
        [
          user.id,
        ],
      );

    if (
      existingRequests.length >
      0
    ) {
      const latest =
        existingRequests[0];

      if (
        latest.status ===
        "PENDING"
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "You already have a pending membership application.",
          },
          {
            status: 409,
          },
        );
      }

      if (
        latest.status ===
        "APPROVED"
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Your membership has already been approved.",
          },
          {
            status: 409,
          },
        );
      }
    }

    /*
     * =================================
     * FORM DATA
     * =================================
     */

    const formData =
      await request.formData();

    const validation =
      applicationSchema.safeParse(
        {
          studentId:
            formData.get(
              "studentId",
            ),

          departmentId:
            formData.get(
              "departmentId",
            ),

          session:
            formData.get(
              "session",
            ),

          currentSemester:
            formData.get(
              "currentSemester",
            ),

          phone:
            formData.get(
              "phone",
            ),

          primarySkill:
            formData.get(
              "primarySkill",
            ),

          proofType:
            formData.get(
              "proofType",
            ),
        },
      );

    if (
      !validation.success
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            validation.error
              .issues[0]
              ?.message ||
            "Please provide valid application information.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =================================
     * PROOF FILE
     * =================================
     */

    const proof =
      formData.get(
        "proof",
      );

    if (
      !proof ||
      typeof proof ===
        "string"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Student verification document is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =================================
     * FILE TYPE
     * =================================
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
        {
          status: 400,
        },
      );
    }

    /*
     * =================================
     * FILE SIZE
     * =================================
     */

    const maxFileSize =
      4 * 1024 * 1024;

    if (
      proof.size >
      maxFileSize
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Verification document must be smaller than 4 MB.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      studentId,
      departmentId,
      session:
        studentSession,
      currentSemester,
      phone,
      primarySkill,
      proofType,
    } = validation.data;

    /*
     * =================================
     * VERIFY DEPARTMENT
     * =================================
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
        [
          departmentId,
        ],
      );

    if (
      departments.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Selected department does not exist.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =================================
     * PRIVATE FILE STORAGE
     *
     * IMPORTANT:
     * NOT inside /public
     * =================================
     */

    const extensionMap: Record<
      string,
      string
    > = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "application/pdf":
        "pdf",
    };

    const extension =
      extensionMap[
        proof.type
      ];

    const fileName =
      `${user.id}-${randomUUID()}.${extension}`;

    /*
     * storage/membership
     */

    const uploadDirectory =
      path.join(
        process.cwd(),
        "storage",
        "membership",
      );

    await fs.mkdir(
      uploadDirectory,
      {
        recursive: true,
      },
    );

    savedFilePath =
      path.join(
        uploadDirectory,
        fileName,
      );

    const buffer =
      Buffer.from(
        await proof.arrayBuffer(),
      );

    await fs.writeFile(
      savedFilePath,
      buffer,
    );

    /*
     * =================================
     * DATABASE INSERT
     * =================================
     */

    const [result] =
      await db.execute<
        ResultSetHeader
      >(
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

          /*
           * Store only private filename
           */

          fileName,
        ],
      );

    /*
     * =================================
     * SUCCESS
     * =================================
     */

    return NextResponse.json(
      {
        success: true,

        message:
          "Membership application submitted successfully.",

        requestId:
          result.insertId,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Membership application error:",
      error,
    );

    /*
     * Remove orphan file
     * if DB operation failed.
     */

    if (savedFilePath) {
      try {
        await fs.unlink(
          savedFilePath,
        );
      } catch {
        /*
         * File may already be absent.
         */
      }
    }

    return NextResponse.json(
      {
        success: false,

        message:
          "Something went wrong while submitting your application.",
      },
      {
        status: 500,
      },
    );
  }
}