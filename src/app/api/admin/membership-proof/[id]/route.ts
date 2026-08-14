import {
  promises as fs,
} from "fs";

import path from "path";

import { NextResponse } from "next/server";

import type {
  RowDataPacket,
} from "mysql2";

import db from "@/lib/db";

import {
  getCurrentUser,
} from "@/lib/current-user";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/*
 * =====================================
 * TYPE
 * =====================================
 */

interface ProofRow
  extends RowDataPacket {
  id: number;

  proof_url: string;
}

/*
 * =====================================
 * GET
 *
 * ADMIN ONLY
 * =====================================
 */

export async function GET(
  _request: Request,

  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    /*
     * =================================
     * ADMIN AUTH
     * =================================
     */

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    if (
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Admin access required.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * =================================
     * REQUEST ID
     * =================================
     */

    const { id } =
      await context.params;

    const requestId =
      Number(id);

    if (
      !Number.isInteger(
        requestId,
      ) ||
      requestId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid membership request.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =================================
     * LOAD PROOF RECORD
     * =================================
     */

    const [rows] =
      await db.execute<
        ProofRow[]
      >(
        `
          SELECT
            id,
            proof_url

          FROM membership_requests

          WHERE id = ?

          LIMIT 1
        `,
        [
          requestId,
        ],
      );

    if (
      rows.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Membership request not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * =================================
     * STORED FILE NAME
     * =================================
     */

    const storedName =
      rows[0].proof_url;

    if (!storedName) {
      return NextResponse.json(
        {
          success: false,

          message:
            "No verification document is attached to this request.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * =================================
     * SAFE FILE NAME
     * =================================
     */

    const fileName =
      path.basename(
        storedName,
      );

    /*
     * Prevent unexpected path values
     */

    if (
      fileName !==
      storedName
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid proof file.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =================================
     * PRIVATE FILE PATH
     * =================================
     */

    const filePath =
      path.join(
        process.cwd(),
        "storage",
        "membership",
        fileName,
      );

    /*
     * =================================
     * READ FILE
     * =================================
     */

    let fileBuffer:
      Buffer;

    try {
      fileBuffer =
        await fs.readFile(
          filePath,
        );
    } catch {
      return NextResponse.json(
        {
          success: false,

          message:
            "Verification document not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * =================================
     * CONTENT TYPE
     * =================================
     */

    const extension =
      path
        .extname(
          fileName,
        )
        .toLowerCase();

    let contentType =
      "application/octet-stream";

    if (
      extension === ".jpg" ||
      extension === ".jpeg"
    ) {
      contentType =
        "image/jpeg";
    } else if (
      extension === ".png"
    ) {
      contentType =
        "image/png";
    } else if (
      extension === ".pdf"
    ) {
      contentType =
        "application/pdf";
    }

    /*
     * =================================
     * BUFFER → UINT8ARRAY
     *
     * NextResponse in Next.js 16
     * accepts BodyInit, so Uint8Array
     * avoids the Buffer type error.
     * =================================
     */

    const fileBytes =
      new Uint8Array(
        fileBuffer,
      );

    /*
     * =================================
     * RESPONSE
     * =================================
     */

    return new NextResponse(
      fileBytes,
      {
        status: 200,

        headers: {
          "Content-Type":
            contentType,

          "Content-Disposition":
            `inline; filename="${fileName}"`,

          "Cache-Control":
            "private, no-store, max-age=0",

          "X-Content-Type-Options":
            "nosniff",
        },
      },
    );
  } catch (error) {
    console.error(
      "Membership proof error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to load verification document.",
      },
      {
        status: 500,
      },
    );
  }
}