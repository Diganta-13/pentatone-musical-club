import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { z } from "zod";

import { getCurrentUser } from "@/lib/current-user";
import db from "@/lib/db";

/*
 * =====================================
 * CONSTANTS
 * =====================================
 */

const MAX_COVER_SIZE =
  10 * 1024 * 1024;

const allowedImageTypes =
  new Map<string, string>([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
    ["image/gif", "gif"],
  ]);

/*
 * =====================================
 * VALIDATION
 * =====================================
 */

const createAnnouncementSchema =
  z.object({
    title: z
      .string()
      .trim()
      .min(
        3,
        "Announcement title must be at least 3 characters.",
      )
      .max(
        180,
        "Announcement title is too long.",
      ),

    category: z.enum([
      "EVENTS",
      "AUDITIONS",
      "PRACTICE",
      "GENERAL_NOTICE",
    ]),

    shortDescription: z
      .string()
      .trim()
      .max(
        500,
        "Short description cannot exceed 500 characters.",
      )
      .optional()
      .or(z.literal("")),

    content: z
      .string()
      .trim()
      .min(
        5,
        "Announcement content is required.",
      )
      .max(
        10000,
        "Announcement content is too long.",
      ),

    venue: z
      .string()
      .trim()
      .max(
        255,
        "Venue is too long.",
      )
      .optional()
      .or(z.literal("")),

    isPinned: z.boolean(),

    isPublished: z.boolean(),
  });

/*
 * =====================================
 * DATABASE TYPES
 * =====================================
 */

interface SlugRow
  extends RowDataPacket {
  id: number;
}

/*
 * =====================================
 * HELPERS
 * =====================================
 */

function formString(
  formData: FormData,
  key: string,
) {
  const value =
    formData.get(key);

  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value;
}

function parseBoolean(
  value:
    | FormDataEntryValue
    | null,
  defaultValue: boolean,
) {
  if (
    typeof value !== "string"
  ) {
    return defaultValue;
  }

  return (
    value === "true" ||
    value === "1" ||
    value === "on"
  );
}

/*
 * =====================================
 * SLUG
 * =====================================
 */

function makeSlug(
  value: string,
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}

async function createUniqueSlug(
  title: string,
) {
  const baseSlug =
    makeSlug(title) ||
    "announcement";

  let slug =
    baseSlug;

  let counter = 2;

  while (true) {
    const [rows] =
      await db.execute<
        SlugRow[]
      >(
        `
          SELECT id
          FROM announcements
          WHERE slug = ?
          LIMIT 1
        `,
        [slug],
      );

    if (
      rows.length === 0
    ) {
      return slug;
    }

    slug =
      `${baseSlug}-${counter}`;

    counter++;
  }
}

/*
 * =====================================
 * FILE CLEANUP
 * =====================================
 */

async function removeSavedFile(
  filePath:
    | string
    | null,
) {
  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(
      filePath,
    );
  } catch (error) {
    const nodeError =
      error as NodeJS.ErrnoException;

    if (
      nodeError.code !==
      "ENOENT"
    ) {
      console.error(
        "Unable to remove announcement cover:",
        error,
      );
    }
  }
}

/*
 * =====================================
 * CREATE ANNOUNCEMENT
 *
 * POST /api/admin/announcements
 * =====================================
 */

export async function POST(
  request: Request,
) {
  let savedCoverPath:
    | string
    | null = null;

  try {
    /*
     * =================================
     * ADMIN CHECK
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
            "Administrator access required.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * =================================
     * FORM DATA
     * =================================
     */

    const formData =
      await request.formData();

    const rawData = {
      title:
        formString(
          formData,
          "title",
        ),

      category:
        formString(
          formData,
          "category",
        ),

      shortDescription:
        formString(
          formData,
          "shortDescription",
        ),

      content:
        formString(
          formData,
          "content",
        ),

      venue:
        formString(
          formData,
          "venue",
        ),

      isPinned:
        parseBoolean(
          formData.get(
            "isPinned",
          ),
          false,
        ),

      isPublished:
        parseBoolean(
          formData.get(
            "isPublished",
          ),
          true,
        ),
    };

    /*
     * =================================
     * VALIDATION
     * =================================
     */

    const validation =
      createAnnouncementSchema.safeParse(
        rawData,
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
            "Invalid announcement information.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      title,
      category,
      shortDescription,
      content,
      venue,
      isPinned,
      isPublished,
    } = validation.data;

    /*
     * =================================
     * COVER IMAGE
     * =================================
     */

    const cover =
      formData.get(
        "coverImage",
      );

    let coverUrl:
      | string
      | null = null;

    if (
      cover instanceof File &&
      cover.size > 0
    ) {
      const extension =
        allowedImageTypes.get(
          cover.type,
        );

      if (!extension) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cover image must be JPG, PNG, WEBP or GIF.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        cover.size >
        MAX_COVER_SIZE
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Cover image cannot exceed 10 MB.",
          },
          {
            status: 400,
          },
        );
      }

      const uploadDirectory =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "announcements",
        );

      await fs.mkdir(
        uploadDirectory,
        {
          recursive: true,
        },
      );

      const filename =
        `${Date.now()}-${crypto.randomUUID()}.${extension}`;

      savedCoverPath =
        path.join(
          uploadDirectory,
          filename,
        );

      const bytes =
        await cover.arrayBuffer();

      await fs.writeFile(
        savedCoverPath,
        Buffer.from(
          bytes,
        ),
      );

      coverUrl =
        `/uploads/announcements/${filename}`;
    }

    /*
     * =================================
     * UNIQUE SLUG
     * =================================
     */

    const slug =
      await createUniqueSlug(
        title,
      );

    /*
     * =================================
     * INSERT
     * =================================
     */

    const [result] =
      await db.execute<
        ResultSetHeader
      >(
        `
          INSERT INTO announcements (
            title,
            slug,
            category,
            short_description,
            content,
            venue,
            cover_image,
            is_pinned,
            is_published,
            created_by,
            published_at
          )

          VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            CASE
              WHEN ? = TRUE
              THEN CURRENT_TIMESTAMP
              ELSE NULL
            END
          )
        `,
        [
          title,
          slug,
          category,

          shortDescription ||
            null,

          content,

          venue ||
            null,

          coverUrl,

          isPinned,
          isPublished,

          user.id,

          isPublished,
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
          "Announcement created successfully.",

        announcement: {
          id:
            result.insertId,

          title,
          slug,
          category,

          coverImage:
            coverUrl,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    await removeSavedFile(
      savedCoverPath,
    );

    console.error(
      "Create announcement error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to create announcement.",
      },
      {
        status: 500,
      },
    );
  }
}