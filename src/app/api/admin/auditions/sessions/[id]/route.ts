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

type SessionStatus =
  | "DRAFT"
  | "OPEN"
  | "CLOSED"
  | "COMPLETED";

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
    SessionStatus;

  is_published:
    | number
    | boolean;
}

interface SlugRow
  extends RowDataPacket {
  id: number;
}

/*
 * =====================================
 * VALIDATION
 * =====================================
 */

const updateSchema =
  z.object({
    title: z
      .string()
      .trim()
      .min(
        3,
        "Session title must be at least 3 characters.",
      )
      .max(180),

    shortDescription: z
      .string()
      .trim()
      .max(500),

    description: z
      .string()
      .trim()
      .max(10000),

    requirements: z
      .string()
      .trim()
      .max(10000),

    auditionDate: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Invalid audition date.",
      ),

    startTime: z
      .string()
      .refine(
        (value) =>
          !value ||
          /^([01]\d|2[0-3]):[0-5]\d$/.test(
            value,
          ),
        "Invalid start time.",
      ),

    endTime: z
      .string()
      .refine(
        (value) =>
          !value ||
          /^([01]\d|2[0-3]):[0-5]\d$/.test(
            value,
          ),
        "Invalid end time.",
      ),

    applicationDeadline:
      z.string(),

    venue: z
      .string()
      .trim()
      .max(255),

    status: z.enum([
      "DRAFT",
      "OPEN",
      "CLOSED",
      "COMPLETED",
    ]),

    isPublished:
      z.boolean(),

    removeCover:
      z.boolean(),
  });

/*
 * =====================================
 * ADMIN CHECK
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
 * ID
 * =====================================
 */

async function getSessionId(
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const { id } =
    await context.params;

  const sessionId =
    Number(id);

  if (
    !Number.isInteger(
      sessionId,
    ) ||
    sessionId <= 0
  ) {
    return null;
  }

  return sessionId;
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

  return typeof value ===
    "string"
    ? value
    : "";
}

function parseBoolean(
  value:
    | FormDataEntryValue
    | null,
  fallback: boolean,
) {
  if (
    typeof value !==
    "string"
  ) {
    return fallback;
  }

  return (
    value === "true" ||
    value === "1" ||
    value === "on"
  );
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
 * UNIQUE SLUG
 * =====================================
 */

async function createUniqueSlug(
  title: string,
  sessionId: number,
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
          WHERE
            slug = ?
            AND id != ?
          LIMIT 1
        `,
        [
          slug,
          sessionId,
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

  const directory =
    path.join(
      process.cwd(),
      "public",
      "uploads",
      "auditions",
      "sessions",
    );

  await fs.mkdir(
    directory,
    {
      recursive: true,
    },
  );

  const filename =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const physicalPath =
    path.join(
      directory,
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
 * DELETE COVER
 * =====================================
 */

async function deleteCoverByUrl(
  url:
    | string
    | null,
) {
  if (
    !url ||
    !url.startsWith(
      "/uploads/auditions/sessions/",
    )
  ) {
    return;
  }

  const filename =
    path.basename(url);

  const physicalPath =
    path.join(
      process.cwd(),
      "public",
      "uploads",
      "auditions",
      "sessions",
      filename,
    );

  try {
    await fs.unlink(
      physicalPath,
    );
  } catch (error) {
    const nodeError =
      error as NodeJS.ErrnoException;

    if (
      nodeError.code !==
      "ENOENT"
    ) {
      console.error(
        "Delete audition cover error:",
        error,
      );
    }
  }
}

/*
 * =====================================
 * LOAD CURRENT SESSION
 * =====================================
 */

async function getSession(
  sessionId: number,
) {
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
          is_published

        FROM audition_sessions

        WHERE id = ?

        LIMIT 1
      `,
      [sessionId],
    );

  return (
    rows[0] ||
    null
  );
}

/*
 * =====================================
 * GET
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
    const auth =
      await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const sessionId =
      await getSessionId(
        context,
      );

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid audition session.",
        },
        {
          status: 400,
        },
      );
    }

    const session =
      await getSession(
        sessionId,
      );

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Audition session not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,

      session: {
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
      },
    });
  } catch (error) {
    console.error(
      "Get audition session error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load audition session.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================
 * PATCH
 * =====================================
 */

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  let newlySavedFile:
    | string
    | null = null;

  try {
    const auth =
      await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const sessionId =
      await getSessionId(
        context,
      );

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid audition session.",
        },
        {
          status: 400,
        },
      );
    }

    const current =
      await getSession(
        sessionId,
      );

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Audition session not found.",
        },
        {
          status: 404,
        },
      );
    }

    const formData =
      await request.formData();

    const requestedStatus =
      formString(
        formData,
        "status",
      );

    const rawData = {
      title:
        formData.has(
          "title",
        )
          ? formString(
              formData,
              "title",
            )
          : current.title,

      shortDescription:
        formData.has(
          "shortDescription",
        )
          ? formString(
              formData,
              "shortDescription",
            )
          : current.short_description ||
            "",

      description:
        formData.has(
          "description",
        )
          ? formString(
              formData,
              "description",
            )
          : current.description ||
            "",

      requirements:
        formData.has(
          "requirements",
        )
          ? formString(
              formData,
              "requirements",
            )
          : current.requirements ||
            "",

      auditionDate:
        formData.has(
          "auditionDate",
        )
          ? formString(
              formData,
              "auditionDate",
            )
          : current.audition_date,

      startTime:
        formData.has(
          "startTime",
        )
          ? formString(
              formData,
              "startTime",
            )
          : current.start_time ||
            "",

      endTime:
        formData.has(
          "endTime",
        )
          ? formString(
              formData,
              "endTime",
            )
          : current.end_time ||
            "",

      applicationDeadline:
        formData.has(
          "applicationDeadline",
        )
          ? formString(
              formData,
              "applicationDeadline",
            )
          : current.application_deadline ||
            "",

      venue:
        formData.has(
          "venue",
        )
          ? formString(
              formData,
              "venue",
            )
          : current.venue ||
            "",

      status:
        requestedStatus ||
        current.status,

      isPublished:
        formData.has(
          "isPublished",
        )
          ? parseBoolean(
              formData.get(
                "isPublished",
              ),
              Boolean(
                current.is_published,
              ),
            )
          : Boolean(
              current.is_published,
            ),

      removeCover:
        parseBoolean(
          formData.get(
            "removeCover",
          ),
          false,
        ),
    };

    const validation =
      updateSchema.safeParse(
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
            "Invalid session information.",
        },
        {
          status: 400,
        },
      );
    }

    const data =
      validation.data;

    /*
     * TIME
     */

    if (
      data.startTime &&
      data.endTime &&
      data.endTime <=
        data.startTime
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
      data.applicationDeadline
    ) {
      const auditionStart =
        `${data.auditionDate}T${
          data.startTime ||
          "23:59"
        }`;

      if (
        data.applicationDeadline >
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

    const file =
      formData.get(
        "coverImage",
      );

    let nextCover =
      current.cover_image;

    let replacedCover =
      false;

    if (
      file instanceof File &&
      file.size > 0
    ) {
      const saved =
        await saveCoverImage(
          file,
        );

      nextCover =
        saved.url;

      newlySavedFile =
        saved.physicalPath;

      replacedCover =
        true;
    } else if (
      data.removeCover
    ) {
      nextCover =
        null;
    }

    /*
     * SLUG
     */

    const slug =
      await createUniqueSlug(
        data.title,
        sessionId,
      );

    /*
     * UPDATE DB
     */

    await db.execute<
      ResultSetHeader
    >(
      `
        UPDATE audition_sessions

        SET
          title = ?,
          slug = ?,
          short_description = ?,
          description = ?,
          requirements = ?,
          audition_date = ?,
          start_time = ?,
          end_time = ?,
          application_deadline = ?,
          venue = ?,
          cover_image = ?,
          status = ?,
          is_published = ?

        WHERE id = ?
      `,
      [
        data.title,
        slug,

        data.shortDescription ||
          null,

        data.description ||
          null,

        data.requirements ||
          null,

        data.auditionDate,

        data.startTime ||
          null,

        data.endTime ||
          null,

        data.applicationDeadline
          ? toMySqlDateTime(
              data.applicationDeadline,
            )
          : null,

        data.venue ||
          null,

        nextCover,

        data.status,

        data.isPublished,

        sessionId,
      ],
    );

    /*
     * DELETE OLD COVER
     */

    if (
      current.cover_image &&
      (
        replacedCover ||
        data.removeCover
      ) &&
      current.cover_image !==
        nextCover
    ) {
      await deleteCoverByUrl(
        current.cover_image,
      );
    }

    newlySavedFile =
      null;

    return NextResponse.json({
      success: true,

      message:
        "Audition session updated successfully.",
    });
  } catch (error) {
    if (
      newlySavedFile
    ) {
      try {
        await fs.unlink(
          newlySavedFile,
        );
      } catch {
        // Ignore cleanup failure.
      }
    }

    if (
      error instanceof Error &&
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
      error instanceof Error &&
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

    console.error(
      "Update audition session error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update audition session.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================
 * DELETE
 * =====================================
 */

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

    if (auth.response) {
      return auth.response;
    }

    const sessionId =
      await getSessionId(
        context,
      );

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid audition session.",
        },
        {
          status: 400,
        },
      );
    }

    const current =
      await getSession(
        sessionId,
      );

    if (!current) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Audition session not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * Applications + evaluations
     * are deleted through FK cascade.
     */

    await db.execute<
      ResultSetHeader
    >(
      `
        DELETE FROM audition_sessions
        WHERE id = ?
      `,
      [sessionId],
    );

    await deleteCoverByUrl(
      current.cover_image,
    );

    return NextResponse.json({
      success: true,
      message:
        "Audition session deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete audition session error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete audition session.",
      },
      {
        status: 500,
      },
    );
  }
}