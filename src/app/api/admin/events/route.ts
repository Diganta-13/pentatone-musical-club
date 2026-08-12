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

const createEventSchema =
  z.object({
    title: z
      .string()
      .trim()
      .min(
        3,
        "Event title must be at least 3 characters.",
      )
      .max(
        180,
        "Event title is too long.",
      ),

    shortDescription: z
      .string()
      .trim()
      .max(
        500,
        "Short description cannot exceed 500 characters.",
      )
      .optional()
      .or(z.literal("")),

    description: z
      .string()
      .trim()
      .max(
        10000,
        "Description is too long.",
      )
      .optional()
      .or(z.literal("")),

    eventType: z
      .string()
      .trim()
      .max(
        100,
        "Event type is too long.",
      )
      .optional()
      .or(z.literal("")),

    eventDate: z
      .string()
      .trim()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Please provide a valid event date.",
      ),

    startTime: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine(
        (value) =>
          !value ||
          /^([01]\d|2[0-3]):[0-5]\d$/.test(
            value,
          ),
        {
          message:
            "Please provide a valid start time.",
        },
      ),

    endTime: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine(
        (value) =>
          !value ||
          /^([01]\d|2[0-3]):[0-5]\d$/.test(
            value,
          ),
        {
          message:
            "Please provide a valid end time.",
        },
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

    registrationUrl: z
      .string()
      .trim()
      .max(
        500,
        "Registration URL is too long.",
      )
      .optional()
      .or(z.literal(""))
      .refine(
        (value) => {
          if (!value) {
            return true;
          }

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
        },
        {
          message:
            "Please provide a valid registration URL.",
        },
      ),

    isPublished:
      z.boolean(),

    isFeatured:
      z.boolean(),
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

/*
 * =====================================
 * UNIQUE SLUG
 * =====================================
 */

async function createUniqueSlug(
  title: string,
) {
  const baseSlug =
    makeSlug(title) ||
    "event";

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
          FROM events
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
 * FORM STRING
 * =====================================
 */

function formString(
  formData: FormData,
  key: string,
) {
  const value =
    formData.get(key);

  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value;
}

/*
 * =====================================
 * FORM BOOLEAN
 * =====================================
 */

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

/*
 * =====================================
 * CLEANUP FILE
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
        "Unable to clean event cover:",
        error,
      );
    }
  }
}

/*
 * =====================================
 * CREATE EVENT
 * POST /api/admin/events
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
     * ADMIN CHECK
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
      user.role !==
      "ADMIN"
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
     * FORM DATA
     */

    const formData =
      await request.formData();

    const rawData = {
      title:
        formString(
          formData,
          "title",
        ),

      shortDescription:
        formString(
          formData,
          "shortDescription",
        ),

      description:
        formString(
          formData,
          "description",
        ),

      eventType:
        formString(
          formData,
          "eventType",
        ),

      eventDate:
        formString(
          formData,
          "eventDate",
        ),

      startTime:
        formString(
          formData,
          "startTime",
        ),

      endTime:
        formString(
          formData,
          "endTime",
        ),

      venue:
        formString(
          formData,
          "venue",
        ),

      registrationUrl:
        formString(
          formData,
          "registrationUrl",
        ),

      isPublished:
        parseBoolean(
          formData.get(
            "isPublished",
          ),
          true,
        ),

      isFeatured:
        parseBoolean(
          formData.get(
            "isFeatured",
          ),
          false,
        ),
    };

    /*
     * VALIDATION
     */

    const validation =
      createEventSchema.safeParse(
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
            "Invalid event information.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      title,
      shortDescription,
      description,
      eventType,
      eventDate,
      startTime,
      endTime,
      venue,
      registrationUrl,
      isPublished,
      isFeatured,
    } = validation.data;

    /*
     * TIME CHECK
     */

    if (
      startTime &&
      endTime &&
      endTime <=
        startTime
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "End time must be later than start time.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * COVER IMAGE
     */

    const cover =
      formData.get(
        "coverImage",
      );

    let coverUrl:
      | string
      | null = null;

    if (
      cover instanceof
        File &&
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
          "events",
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
        `/uploads/events/${filename}`;
    }

    /*
     * SLUG
     */

    const slug =
      await createUniqueSlug(
        title,
      );

    /*
     * INSERT
     */

    const [result] =
      await db.execute<
        ResultSetHeader
      >(
        `
          INSERT INTO events (
            title,
            slug,
            short_description,
            description,
            event_type,
            event_date,
            start_time,
            end_time,
            venue,
            cover_image,
            registration_url,
            is_published,
            is_featured,
            created_by
          )

          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?
          )
        `,
        [
          title,
          slug,

          shortDescription ||
            null,

          description ||
            null,

          eventType ||
            null,

          eventDate,

          startTime ||
            null,

          endTime ||
            null,

          venue ||
            null,

          coverUrl,

          registrationUrl ||
            null,

          isPublished,

          isFeatured,

          user.id,
        ],
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Event created successfully.",

        event: {
          id:
            result.insertId,

          title,

          slug,

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
      "Create event error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to create event.",
      },
      {
        status: 500,
      },
    );
  }
}