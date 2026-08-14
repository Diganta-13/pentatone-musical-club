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

export const runtime = "nodejs";

/* =========================================================
   CONSTANTS
   ========================================================= */

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

/* =========================================================
   TYPES
   ========================================================= */

interface ResourceRow
  extends RowDataPacket {
  id: number;
  title: string;
  slug: string;

  category:
    | "PRACTICE_NOTES"
    | "MUSIC_THEORY"
    | "VOCAL_TRAINING"
    | "INSTRUMENT_GUIDES";

  resource_type:
    | "PDF"
    | "VIDEO"
    | "LINK";

  level:
    | "BEGINNER"
    | "INTERMEDIATE"
    | "ADVANCED"
    | "ALL_LEVELS";

  description:
    | string
    | null;

  resource_url:
    | string
    | null;

  file_path:
    | string
    | null;

  cover_image:
    | string
    | null;

  is_featured:
    | number
    | boolean;

  is_published:
    | number
    | boolean;
}

interface SlugRow
  extends RowDataPacket {
  id: number;
}

/* =========================================================
   VALIDATION
   ========================================================= */

const updateResourceSchema =
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

    isFeatured:
      z.boolean(),

    isPublished:
      z.boolean(),

    removeCover:
      z.boolean(),
  });

/* =========================================================
   HELPERS
   ========================================================= */

function formString(
  formData: FormData,
  key: string,
) {
  const value =
    formData.get(key);

  return typeof value ===
    "string"
    ? value
    : "";
}

function parseBoolean(
  value:
    | FormDataEntryValue
    | null,
  defaultValue: boolean,
) {
  if (
    typeof value !==
    "string"
  ) {
    return defaultValue;
  }

  return (
    value === "true" ||
    value === "1" ||
    value === "on"
  );
}

function isValidHttpUrl(
  value: string,
) {
  try {
    const url =
      new URL(value);

    return (
      url.protocol ===
        "http:" ||
      url.protocol ===
        "https:"
    );
  } catch {
    return false;
  }
}

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
  resourceId: number,
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
            AND id != ?
          LIMIT 1
        `,
        [
          slug,
          resourceId,
        ],
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

/* =========================================================
   PUBLIC FILE HELPERS
   ========================================================= */

function publicUrlToFilePath(
  publicUrl:
    | string
    | null,
) {
  if (
    !publicUrl ||
    !publicUrl.startsWith(
      "/uploads/",
    )
  ) {
    return null;
  }

  const relativePath =
    publicUrl.replace(
      /^\/+/,
      "",
    );

  return path.join(
    process.cwd(),
    "public",
    relativePath,
  );
}

async function removePublicFile(
  publicUrl:
    | string
    | null,
) {
  const filePath =
    publicUrlToFilePath(
      publicUrl,
    );

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

async function removeAbsoluteFile(
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
        "Unable to remove uploaded file:",
        error,
      );
    }
  }
}

/* =========================================================
   GET EXISTING RESOURCE
   ========================================================= */

async function getResource(
  id: number,
) {
  const [rows] =
    await db.execute<
      ResourceRow[]
    >(
      `
        SELECT
          id,
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
          is_published
        FROM resources
        WHERE id = ?
        LIMIT 1
      `,
      [id],
    );

  return rows[0] ?? null;
}

/* =========================================================
   AUTH
   ========================================================= */

async function requireAdmin() {
  const user =
    await getCurrentUser();

  if (!user) {
    return {
      error:
        NextResponse.json(
          {
            success: false,
            message:
              "Authentication required.",
          },
          {
            status: 401,
          },
        ),
      user: null,
    };
  }

  if (
    user.role !== "ADMIN"
  ) {
    return {
      error:
        NextResponse.json(
          {
            success: false,
            message:
              "Administrator access required.",
          },
          {
            status: 403,
          },
        ),
      user: null,
    };
  }

  return {
    error: null,
    user,
  };
}

/* =========================================================
   PATCH
   /api/admin/resources/:id
   ========================================================= */

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  let newCoverAbsolutePath:
    | string
    | null = null;

  let newPdfAbsolutePath:
    | string
    | null = null;

  try {
    const auth =
      await requireAdmin();

    if (auth.error) {
      return auth.error;
    }

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
            "Invalid resource ID.",
        },
        {
          status: 400,
        },
      );
    }

    const existing =
      await getResource(
        resourceId,
      );

    if (!existing) {
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

    const formData =
      await request.formData();

    const validation =
      updateResourceSchema.safeParse(
        {
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

          removeCover:
            parseBoolean(
              formData.get(
                "removeCover",
              ),
              false,
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
      removeCover,
    } = validation.data;

    /* =====================================================
       RESOURCE INPUT RULES
       ===================================================== */

    const resourceFile =
      formData.get(
        "resourceFile",
      );

    if (
      resourceType ===
        "VIDEO" ||
      resourceType ===
        "LINK"
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

    if (
      resourceType ===
      "PDF"
    ) {
      const hasExistingPdf =
        existing.resource_type ===
          "PDF" &&
        Boolean(
          existing.file_path,
        );

      const hasNewPdf =
        resourceFile instanceof
          File &&
        resourceFile.size > 0;

      if (
        !hasExistingPdf &&
        !hasNewPdf
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

      if (hasNewPdf) {
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
    }

    /* =====================================================
       COVER IMAGE
       ===================================================== */

    const coverImage =
      formData.get(
        "coverImage",
      );

    let nextCoverImage =
      removeCover
        ? null
        : existing.cover_image;

    if (
      coverImage instanceof
        File &&
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

      const directory =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "resources",
          "covers",
        );

      await fs.mkdir(
        directory,
        {
          recursive: true,
        },
      );

      const filename =
        `${Date.now()}-${crypto.randomUUID()}.${extension}`;

      newCoverAbsolutePath =
        path.join(
          directory,
          filename,
        );

      const bytes =
        await coverImage.arrayBuffer();

      await fs.writeFile(
        newCoverAbsolutePath,
        Buffer.from(
          bytes,
        ),
      );

      nextCoverImage =
        `/uploads/resources/covers/${filename}`;
    }

    /* =====================================================
       PDF FILE
       ===================================================== */

    let nextFilePath:
      | string
      | null = null;

    if (
      resourceType ===
      "PDF"
    ) {
      if (
        existing.resource_type ===
          "PDF"
      ) {
        nextFilePath =
          existing.file_path;
      }

      if (
        resourceFile instanceof
          File &&
        resourceFile.size > 0
      ) {
        const directory =
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "resources",
            "files",
          );

        await fs.mkdir(
          directory,
          {
            recursive: true,
          },
        );

        const filename =
          `${Date.now()}-${crypto.randomUUID()}.pdf`;

        newPdfAbsolutePath =
          path.join(
            directory,
            filename,
          );

        const bytes =
          await resourceFile.arrayBuffer();

        await fs.writeFile(
          newPdfAbsolutePath,
          Buffer.from(
            bytes,
          ),
        );

        nextFilePath =
          `/uploads/resources/files/${filename}`;
      }
    }

    /* =====================================================
       SLUG
       ===================================================== */

    const slug =
      await createUniqueSlug(
        title,
        resourceId,
      );

    /* =====================================================
       UPDATE DATABASE
       ===================================================== */

    await db.execute<
      ResultSetHeader
    >(
      `
        UPDATE resources

        SET
          title = ?,
          slug = ?,
          category = ?,
          resource_type = ?,
          level = ?,
          description = ?,
          resource_url = ?,
          file_path = ?,
          cover_image = ?,
          is_featured = ?,
          is_published = ?

        WHERE id = ?
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

        nextFilePath,

        nextCoverImage,

        isFeatured,
        isPublished,

        resourceId,
      ],
    );

    /* =====================================================
       DELETE OLD COVER IF REPLACED / REMOVED
       ===================================================== */

    const coverChanged =
      existing.cover_image !==
      nextCoverImage;

    if (
      coverChanged &&
      existing.cover_image
    ) {
      await removePublicFile(
        existing.cover_image,
      );
    }

    /* =====================================================
       DELETE OLD PDF IF CHANGED
       ===================================================== */

    const pdfChanged =
      existing.file_path !==
      nextFilePath;

    if (
      pdfChanged &&
      existing.file_path
    ) {
      await removePublicFile(
        existing.file_path,
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Resource updated successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    /*
     * Only remove newly-uploaded files
     * if update failed.
     */

    await Promise.all([
      removeAbsoluteFile(
        newCoverAbsolutePath,
      ),

      removeAbsoluteFile(
        newPdfAbsolutePath,
      ),
    ]);

    console.error(
      "Update resource error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update resource.",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   DELETE
   /api/admin/resources/:id
   ========================================================= */

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const auth =
      await requireAdmin();

    if (auth.error) {
      return auth.error;
    }

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
            "Invalid resource ID.",
        },
        {
          status: 400,
        },
      );
    }

    const existing =
      await getResource(
        resourceId,
      );

    if (!existing) {
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

    await db.execute<
      ResultSetHeader
    >(
      `
        DELETE FROM resources
        WHERE id = ?
      `,
      [resourceId],
    );

    /*
     * Database delete succeeded.
     * Now remove local files.
     */

    await Promise.all([
      removePublicFile(
        existing.cover_image,
      ),

      removePublicFile(
        existing.file_path,
      ),
    ]);

    return NextResponse.json(
      {
        success: true,
        message:
          "Resource deleted successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Delete resource error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete resource.",
      },
      {
        status: 500,
      },
    );
  }
}