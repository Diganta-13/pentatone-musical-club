import fs from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import type {
  RowDataPacket,
} from "mysql2";

import db from "@/lib/db";

import {
  getCurrentUser,
} from "@/lib/current-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * =====================================
 * TYPE
 * =====================================
 */

interface ResourceFileRow
  extends RowDataPacket {
  id: number;
  title: string;
  resource_type: string;
  file_path: string | null;
  is_published: number | boolean;
}

/*
 * =====================================
 * GET RESOURCE FILE
 *
 * MEMBER + ADMIN ONLY
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
     * AUTH
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
      user.role !== "MEMBER" &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Resource access is available only to Pentatone members.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * =================================
     * RESOURCE ID
     * =================================
     */

    const { id } =
      await context.params;

    const resourceId =
      Number(id);

    if (
      !Number.isInteger(
        resourceId,
      ) ||
      resourceId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid resource.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =================================
     * LOAD RESOURCE
     * =================================
     */

    const [rows] =
      await db.execute<
        ResourceFileRow[]
      >(
        `
          SELECT
            id,
            title,
            resource_type,
            file_path,
            is_published

          FROM resources

          WHERE id = ?

          LIMIT 1
        `,
        [
          resourceId,
        ],
      );

    if (
      rows.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Resource not found.",
        },
        {
          status: 404,
        },
      );
    }

    const resource =
      rows[0];

    /*
     * =================================
     * PUBLISHED CHECK
     *
     * ADMIN may view unpublished.
     * MEMBER cannot.
     * =================================
     */

    if (
      !Boolean(
        resource.is_published,
      ) &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Resource is not available.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * =================================
     * PDF CHECK
     * =================================
     */

    if (
      resource.resource_type !==
        "PDF" ||
      !resource.file_path
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "PDF file is unavailable.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * =================================
     * CURRENT FILE LOCATION
     *
     * Handles current:
     * /uploads/resources/files/x.pdf
     * =================================
     */

    if (
      !resource.file_path.startsWith(
        "/uploads/resources/files/",
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid resource file.",
        },
        {
          status: 400,
        },
      );
    }

    const fileName =
      path.basename(
        resource.file_path,
      );

    const filePath =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "resources",
        "files",
        fileName,
      );

    /*
     * =================================
     * READ FILE
     * =================================
     */

    let fileBuffer: Buffer;

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
            "Resource file not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * =================================
     * RESPONSE
     * =================================
     */

    const fileBytes =
      new Uint8Array(
        fileBuffer,
      );

    return new NextResponse(
      fileBytes,
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="${safeFileName(
              resource.title,
            )}.pdf"`,

          "Cache-Control":
            "private, no-store, max-age=0",

          "X-Content-Type-Options":
            "nosniff",
        },
      },
    );
  } catch (error) {
    console.error(
      "Protected resource file error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load resource file.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================
 * SAFE DOWNLOAD NAME
 * =====================================
 */

function safeFileName(
  title: string,
) {
  return (
    title
      .trim()
      .replace(
        /[^a-zA-Z0-9-_ ]/g,
        "",
      )
      .replace(
        /\s+/g,
        "-",
      )
      .slice(
        0,
        80,
      ) || "pentatone-resource"
  );
}