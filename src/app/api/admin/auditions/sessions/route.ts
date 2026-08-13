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
 * TYPES
 * =====================================
 */

type AuditionSessionStatus =
  | "DRAFT"
  | "OPEN"
  | "CLOSED"
  | "COMPLETED";

interface SlugRow
  extends RowDataPacket {
  id: number;
}

interface SessionRow
  extends RowDataPacket {
  id: number;

  title: string;

  slug: string;

  short_description:
    | string
    | null;

  description:
    | string
    | null;

  requirements:
    | string
    | null;

  audition_date: string;

  start_time:
    | string
    | null;

  end_time:
    | string
    | null;

  application_deadline:
    | string
    | null;

  venue:
    | string
    | null;

  cover_image:
    | string
    | null;

  status:
    AuditionSessionStatus;

  is_published:
    | number
    | boolean;

  created_by:
    | number
    | null;

  created_at: Date;

  updated_at: Date;
}

/*
 * =====================================
 * VALIDATION
 * =====================================
 */

const sessionSchema =
  z.object({
    title: z
      .string()
      .trim()
      .min(
        3,
        "Session title must be at least 3 characters.",
      )
      .max(
        180,
        "Session title is too long.",
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

    requirements: z
      .string()
      .trim()
      .max(
        10000,
        "Requirements are too long.",
      )
      .optional()
      .or(z.literal("")),

    auditionDate: z
      .string()
      .trim()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Please select a valid audition date.",
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

    applicationDeadline: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine(
        (value) =>
          !value ||
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(
            value,
          ),
        {
          message:
            "Please provide a valid application deadline.",
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

    status: z.enum([
      "DRAFT",
      "OPEN",
      "CLOSED",
      "COMPLETED",
    ]),

    isPublished:
      z.boolean(),
  });

/*
 * =====================================
 * ADMIN
 * =====================================
 */

async function requireAdmin() {
  const user =
    await getCurrentUser();

  if (!user) {
    return {
      user: null,

      response:
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
    };
  }

  if (
    user.role !==
    "ADMIN"
  ) {
    return {
      user: null,

      response:
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
    };
  }

  return {
    user,

    response: null,
  };
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

  return typeof value ===
    "string"
    ? value
    : "";
}

/*
 * =====================================
 * BOOLEAN
 * =====================================
 */

function parseBoolean(
  value:
    | FormDataEntryValue
    | null,
  defaultValue = false,
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
    "audition-session";

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

          FROM audition_sessions

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
 * DATETIME
 * =====================================
 */

function toMySqlDateTime(
  value: string,
) {
  if (!value) {
    return null;
  }

  return (
    value.replace(
      "T",
      " ",
    ) + ":00"
  );
}

/*
 * =====================================
 * DELETE TEMP FILE
 * =====================================
 */

async function deletePhysicalFile(
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
        "Unable to clean audition cover:",
        error,
      );
    }
  }
}

/*
 * =====================================
 * SAVE COVER
 * =====================================
 */

async function saveCoverImage(
  file: File,
) {
  const extension =
    allowedImageTypes.get(
      file.type,
    );

  if (!extension) {
    throw new Error(
      "INVALID_COVER_TYPE",
    );
  }

  if (
    file.size >
    MAX_COVER_SIZE
  ) {
    throw new Error(
      "COVER_TOO_LARGE",
    );
  }

  const uploadDirectory =
    path.join(
      process.cwd(),
      "public",
      "uploads",
      "auditions",
      "sessions",
    );

  await fs.mkdir(
    uploadDirectory,
    {
      recursive: true,
    },
  );

  const filename =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const physicalPath =
    path.join(
      uploadDirectory,
      filename,
    );

  const bytes =
    await file.arrayBuffer();

  await fs.writeFile(
    physicalPath,
    Buffer.from(bytes),
  );

  return {
    url:
      `/uploads/auditions/sessions/${filename}`,

    physicalPath,
  };
}

/*
 * =====================================
 * GET SESSIONS
 *
 * GET /api/admin/auditions/sessions
 * =====================================
 */

export async function GET() {
  try {
    const auth =
      await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const [rows] =
      await db.execute<
        SessionRow[]
      >(
        `
          SELECT
            id,
            title,
            slug,
            short_description,
            description,
            requirements,

            DATE_FORMAT(
              audition_date,
              '%Y-%m-%d'
            ) AS audition_date,

            TIME_FORMAT(
              start_time,
              '%H:%i'
            ) AS start_time,

            TIME_FORMAT(
              end_time,
              '%H:%i'
            ) AS end_time,

            DATE_FORMAT(
              application_deadline,
              '%Y-%m-%dT%H:%i'
            ) AS application_deadline,

            venue,
            cover_image,
            status,
            is_published,
            created_by,
            created_at,
            updated_at

          FROM audition_sessions

          ORDER BY
            audition_date DESC,
            created_at DESC
        `,
      );

    return NextResponse.json({
      success: true,

      sessions:
        rows.map(
          (session) => ({
            id:
              session.id,

            title:
              session.title,

            slug:
              session.slug,

            shortDescription:
              session.short_description ||
              "",

            description:
              session.description ||
              "",

            requirements:
              session.requirements ||
              "",

            auditionDate:
              session.audition_date,

            startTime:
              session.start_time ||
              "",

            endTime:
              session.end_time ||
              "",

            applicationDeadline:
              session.application_deadline ||
              "",

            venue:
              session.venue ||
              "",

            coverImage:
              session.cover_image,

            status:
              session.status,

            isPublished:
              Boolean(
                session.is_published,
              ),
          }),
        ),
    });
  } catch (error) {
    console.error(
      "Load audition sessions error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to load audition sessions.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================
 * CREATE SESSION
 *
 * POST /api/admin/auditions/sessions
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
     * ADMIN
     */

    const auth =
      await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const user =
      auth.user!;

    /*
     * FORM
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

      requirements:
        formString(
          formData,
          "requirements",
        ),

      auditionDate:
        formString(
          formData,
          "auditionDate",
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

      applicationDeadline:
        formString(
          formData,
          "applicationDeadline",
        ),

      venue:
        formString(
          formData,
          "venue",
        ),

      status:
        formString(
          formData,
          "status",
        ),

      isPublished:
        parseBoolean(
          formData.get(
            "isPublished",
          ),
          false,
        ),
    };

    /*
     * VALIDATE
     */

    const validation =
      sessionSchema.safeParse(
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
            "Invalid audition session information.",
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
      requirements,
      auditionDate,
      startTime,
      endTime,
      applicationDeadline,
      venue,
      status,
      isPublished,
    } = validation.data;

    /*
     * START / END
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
     * DEADLINE
     */

    if (
      applicationDeadline
    ) {
      const auditionStart =
        `${auditionDate}T${
          startTime ||
          "23:59"
        }`;

      if (
        applicationDeadline >
        auditionStart
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Application deadline cannot be after the audition starts.",
          },
          {
            status: 400,
          },
        );
      }
    }

    /*
     * COVER
     */

    const coverFile =
      formData.get(
        "coverImage",
      );

    let coverUrl:
      | string
      | null = null;

    if (
      coverFile instanceof
        File &&
      coverFile.size > 0
    ) {
      try {
        const savedCover =
          await saveCoverImage(
            coverFile,
          );

        coverUrl =
          savedCover.url;

        savedCoverPath =
          savedCover.physicalPath;
      } catch (error) {
        if (
          error instanceof
            Error &&
          error.message ===
            "INVALID_COVER_TYPE"
        ) {
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
          error instanceof
            Error &&
          error.message ===
            "COVER_TOO_LARGE"
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

        throw error;
      }
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
          INSERT INTO audition_sessions (
            title,
            slug,
            short_description,
            description,
            requirements,
            audition_date,
            start_time,
            end_time,
            application_deadline,
            venue,
            cover_image,
            status,
            is_published,
            created_by
          )

          VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?
          )
        `,
        [
          title,

          slug,

          shortDescription ||
            null,

          description ||
            null,

          requirements ||
            null,

          auditionDate,

          startTime ||
            null,

          endTime ||
            null,

          applicationDeadline
            ? toMySqlDateTime(
                applicationDeadline,
              )
            : null,

          venue ||
            null,

          coverUrl,

          status,

          isPublished,

          user.id,
        ],
      );

    /*
     * FILE NOW BELONGS TO SESSION
     */

    savedCoverPath =
      null;

    return NextResponse.json(
      {
        success: true,

        message:
          "Audition session created successfully.",

        session: {
          id:
            result.insertId,

          title,

          slug,

          auditionDate,

          startTime,

          endTime,

          applicationDeadline,

          venue,

          coverImage:
            coverUrl,

          status,

          isPublished,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    await deletePhysicalFile(
      savedCoverPath,
    );

    console.error(
      "Create audition session error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to create audition session.",
      },
      {
        status: 500,
      },
    );
  }
}