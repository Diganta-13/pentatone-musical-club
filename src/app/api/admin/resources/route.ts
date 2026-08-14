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
 * NODE RUNTIME
 * =====================================
 */

export const runtime = "nodejs";

/*
 * =====================================
 * CONSTANTS
 * =====================================
 */

const MAX_COVER_SIZE =
  10 * 1024 * 1024;

const MAX_RESOURCE_FILE_SIZE =
  20 * 1024 * 1024;

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

const createResourceSchema =
  z.object({
    title: z
      .string()
      .trim()
      .min(
        3,
        "Resource title must be at least 3 characters.",
      )
      .max(
        180,
        "Resource title is too long.",
      ),

    category: z.enum([
      "PRACTICE_NOTES",
      "MUSIC_THEORY",
      "VOCAL_TRAINING",
      "INSTRUMENT_GUIDES",
    ]),

    resourceType: z.enum([
      "PDF",
      "VIDEO",
      "LINK",
    ]),

    level: z.enum([
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
      "ALL_LEVELS",
    ]),

    description: z
      .string()
      .trim()
      .max(
        1000,
        "Description cannot exceed 1000 characters.",
      )
      .optional()
      .or(z.literal("")),

    resourceUrl: z
      .string()
      .trim()
      .max(
        1000,
        "Resource URL is too long.",
      )
      .optional()
      .or(z.literal("")),

    isFeatured: z.boolean(),

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
 * FORM HELPERS
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
 * URL VALIDATION
 * =====================================
 */

function isValidHttpUrl(
  value: string,
) {
  if (!value) {
    return false;
  }

  try {
    const url =
      new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
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
    "resource";

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
          FROM resources
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
        "Unable to remove resource file:",
        error,
      );
    }
  }
}

/*
 * =====================================
 * CREATE RESOURCE
 *
 * POST /api/admin/resources
 * =====================================
 */

export async function POST(
  request: Request,
) {
  let savedCoverPath:
    | string
    | null = null;

  let savedResourcePath:
    | string
    | null = null;

  try {
    /*
     * =================================
     * ADMIN AUTHORIZATION
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

      resourceType:
        formString(
          formData,
          "resourceType",
        ),

      level:
        formString(
          formData,
          "level",
        ),

      description:
        formString(
          formData,
          "description",
        ),

      resourceUrl:
        formString(
          formData,
          "resourceUrl",
        ),

      isFeatured:
        parseBoolean(
          formData.get(
            "isFeatured",
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
     * VALIDATE BASIC DATA
     * =================================
     */

    const validation =
      createResourceSchema.safeParse(
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
            "Invalid resource information.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      title,
      category,
      resourceType,
      level,
      description,
      resourceUrl,
      isFeatured,
      isPublished,
    } = validation.data;

    /*
     * =================================
     * RESOURCE FILE / URL RULE
     * =================================
     */

    const resourceFile =
      formData.get(
        "resourceFile",
      );

    /*
     * PDF:
     * admin uploads a PDF file.
     */

    if (
      resourceType === "PDF"
    ) {
      if (
        !(
          resourceFile instanceof
            File
        ) ||
        resourceFile.size === 0
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Please upload a PDF resource file.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        resourceFile.type !==
        "application/pdf"
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Resource file must be a PDF.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        resourceFile.size >
        MAX_RESOURCE_FILE_SIZE
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "PDF file cannot exceed 20 MB.",
          },
          {
            status: 400,
          },
        );
      }
    }

    /*
     * VIDEO / LINK:
     * admin must provide a URL.
     */

    if (
      resourceType === "VIDEO" ||
      resourceType === "LINK"
    ) {
      if (
        !isValidHttpUrl(
          resourceUrl || "",
        )
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              resourceType ===
              "VIDEO"
                ? "Please provide a valid video URL."
                : "Please provide a valid resource URL.",
          },
          {
            status: 400,
          },
        );
      }
    }

    /*
     * =================================
     * COVER IMAGE
     * =================================
     */

    const coverImage =
      formData.get(
        "coverImage",
      );

    let coverUrl:
      | string
      | null = null;

    if (
      coverImage instanceof File &&
      coverImage.size > 0
    ) {
      const extension =
        allowedImageTypes.get(
          coverImage.type,
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
        coverImage.size >
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

      const coverDirectory =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "resources",
          "covers",
        );

      await fs.mkdir(
        coverDirectory,
        {
          recursive: true,
        },
      );

      const filename =
        `${Date.now()}-${crypto.randomUUID()}.${extension}`;

      savedCoverPath =
        path.join(
          coverDirectory,
          filename,
        );

      const bytes =
        await coverImage.arrayBuffer();

      await fs.writeFile(
        savedCoverPath,
        Buffer.from(
          bytes,
        ),
      );

      coverUrl =
        `/uploads/resources/covers/${filename}`;
    }

    /*
     * =================================
     * PDF RESOURCE UPLOAD
     * =================================
     */

    let resourceFileUrl:
      | string
      | null = null;

    if (
      resourceType === "PDF" &&
      resourceFile instanceof File &&
      resourceFile.size > 0
    ) {
      const resourceDirectory =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "resources",
          "files",
        );

      await fs.mkdir(
        resourceDirectory,
        {
          recursive: true,
        },
      );

      const filename =
        `${Date.now()}-${crypto.randomUUID()}.pdf`;

      savedResourcePath =
        path.join(
          resourceDirectory,
          filename,
        );

      const bytes =
        await resourceFile.arrayBuffer();

      await fs.writeFile(
        savedResourcePath,
        Buffer.from(
          bytes,
        ),
      );

      resourceFileUrl =
        `/uploads/resources/files/${filename}`;
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
     * DATABASE INSERT
     * =================================
     */

    const [result] =
      await db.execute<
        ResultSetHeader
      >(
        `
          INSERT INTO resources (
            title,
            slug,
            category,
            resource_type,
            level,
            description,
            resource_url,
            file_path,
            cover_image,
            is_featured,
            is_published,
            created_by
          )

          VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?
          )
        `,
        [
          title,

          slug,

          category,

          resourceType,

          level,

          description ||
            null,

          resourceType ===
            "PDF"
            ? null
            : resourceUrl ||
              null,

          resourceFileUrl,

          coverUrl,

          isFeatured,

          isPublished,

          user.id,
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
          "Resource created successfully.",

        resource: {
          id:
            result.insertId,

          title,

          slug,

          category,

          resourceType,

          filePath:
            resourceFileUrl,

          resourceUrl:
            resourceType ===
            "PDF"
              ? null
              : resourceUrl,

          coverImage:
            coverUrl,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    /*
     * Remove uploaded files
     * if database save fails.
     */

    await Promise.all([
      removeSavedFile(
        savedCoverPath,
      ),

      removeSavedFile(
        savedResourcePath,
      ),
    ]);

    console.error(
      "Create resource error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to create resource.",
      },
      {
        status: 500,
      },
    );
  }
}