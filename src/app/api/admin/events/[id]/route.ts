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

type EventStatusOverride =
  | "AUTO"
  | "COMPLETED";

interface EventRow
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

  event_type:
    | string
    | null;

  event_date: string;

  start_time:
    | string
    | null;

  end_time:
    | string
    | null;

  venue:
    | string
    | null;

  cover_image:
    | string
    | null;

  registration_url:
    | string
    | null;

  is_published:
    | number
    | boolean;

  is_featured:
    | number
    | boolean;

  status_override:
    EventStatusOverride;

  created_by:
    | number
    | null;

  created_at: Date;

  updated_at: Date;
}

interface SlugRow
  extends RowDataPacket {
  id: number;
}

/*
 * =====================================
 * UPDATE VALIDATION
 * =====================================
 */

const updateEventSchema =
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
      .or(
        z.literal(""),
      ),

    description: z
      .string()
      .trim()
      .max(
        10000,
        "Description is too long.",
      )
      .optional()
      .or(
        z.literal(""),
      ),

    eventType: z
      .string()
      .trim()
      .max(
        100,
        "Event type is too long.",
      )
      .optional()
      .or(
        z.literal(""),
      ),

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
      .or(
        z.literal(""),
      )
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
      .or(
        z.literal(""),
      )
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
      .or(
        z.literal(""),
      ),

    registrationUrl: z
      .string()
      .trim()
      .max(
        500,
        "Registration URL is too long.",
      )
      .optional()
      .or(
        z.literal(""),
      )
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

    removeCover:
      z.boolean(),

    statusOverride:
      z.enum([
        "AUTO",
        "COMPLETED",
      ]),
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
 * EVENT ID
 * =====================================
 */

async function getEventId(
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const { id } =
    await context.params;

  const eventId =
    Number(id);

  if (
    !Number.isInteger(
      eventId,
    ) ||
    eventId <= 0
  ) {
    return null;
  }

  return eventId;
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
  eventId: number,
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

          WHERE
            slug = ?
            AND id != ?

          LIMIT 1
        `,
        [
          slug,
          eventId,
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

  const physicalPath =
    path.join(
      uploadDirectory,
      filename,
    );

  const bytes =
    await file.arrayBuffer();

  await fs.writeFile(
    physicalPath,
    Buffer.from(
      bytes,
    ),
  );

  return {
    url:
      `/uploads/events/${filename}`,

    physicalPath,
  };
}

/*
 * =====================================
 * DELETE COVER BY URL
 * =====================================
 */

async function deleteCoverByUrl(
  coverUrl:
    | string
    | null,
) {
  if (!coverUrl) {
    return;
  }

  /*
   * Only delete files inside
   * public/uploads/events.
   */

  if (
    !coverUrl.startsWith(
      "/uploads/events/",
    )
  ) {
    return;
  }

  const filename =
    path.basename(
      coverUrl,
    );

  if (!filename) {
    return;
  }

  const physicalPath =
    path.join(
      process.cwd(),
      "public",
      "uploads",
      "events",
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
        "Unable to delete event cover:",
        error,
      );
    }
  }
}

/*
 * =====================================
 * DELETE NEW FILE ON FAILURE
 * =====================================
 */

async function deletePhysicalFile(
  physicalPath:
    | string
    | null,
) {
  if (!physicalPath) {
    return;
  }

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
        "Unable to clean uploaded event cover:",
        error,
      );
    }
  }
}

/*
 * =====================================
 * GET EVENT
 *
 * GET /api/admin/events/[id]
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
     * ADMIN
     */

    const auth =
      await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    /*
     * ID
     */

    const eventId =
      await getEventId(
        context,
      );

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid event.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * QUERY
     */

    const [rows] =
      await db.execute<
        EventRow[]
      >(
        `
          SELECT
            id,
            title,
            slug,
            short_description,
            description,
            event_type,

            DATE_FORMAT(
              event_date,
              '%Y-%m-%d'
            ) AS event_date,

            TIME_FORMAT(
              start_time,
              '%H:%i'
            ) AS start_time,

            TIME_FORMAT(
              end_time,
              '%H:%i'
            ) AS end_time,

            venue,
            cover_image,
            registration_url,
            is_published,
            is_featured,
            status_override,
            created_by,
            created_at,
            updated_at

          FROM events

          WHERE id = ?

          LIMIT 1
        `,
        [eventId],
      );

    if (
      rows.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Event not found.",
        },
        {
          status: 404,
        },
      );
    }

    const event =
      rows[0];

    /*
     * RETURN
     */

    return NextResponse.json({
      success: true,

      event: {
        id:
          event.id,

        title:
          event.title,

        slug:
          event.slug,

        shortDescription:
          event.short_description ||
          "",

        description:
          event.description ||
          "",

        eventType:
          event.event_type ||
          "",

        eventDate:
          event.event_date,

        startTime:
          event.start_time ||
          "",

        endTime:
          event.end_time ||
          "",

        venue:
          event.venue ||
          "",

        coverImage:
          event.cover_image,

        registrationUrl:
          event.registration_url ||
          "",

        isPublished:
          Boolean(
            event.is_published,
          ),

        isFeatured:
          Boolean(
            event.is_featured,
          ),

        statusOverride:
          event.status_override,
      },
    });
  } catch (error) {
    console.error(
      "Get event error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to load event.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================
 * UPDATE EVENT
 *
 * PATCH /api/admin/events/[id]
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
  let newCoverPhysicalPath:
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

    /*
     * ID
     */

    const eventId =
      await getEventId(
        context,
      );

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid event.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * CURRENT EVENT
     */

    const [currentRows] =
      await db.execute<
        EventRow[]
      >(
        `
          SELECT
            id,
            title,
            slug,
            short_description,
            description,
            event_type,

            DATE_FORMAT(
              event_date,
              '%Y-%m-%d'
            ) AS event_date,

            TIME_FORMAT(
              start_time,
              '%H:%i'
            ) AS start_time,

            TIME_FORMAT(
              end_time,
              '%H:%i'
            ) AS end_time,

            venue,
            cover_image,
            registration_url,
            is_published,
            is_featured,
            status_override,
            created_by,
            created_at,
            updated_at

          FROM events

          WHERE id = ?

          LIMIT 1
        `,
        [eventId],
      );

    if (
      currentRows.length ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Event not found.",
        },
        {
          status: 404,
        },
      );
    }

    const currentEvent =
      currentRows[0];

    /*
     * FORM DATA
     */

    const formData =
      await request.formData();

    const requestedStatusOverride =
      formString(
        formData,
        "statusOverride",
      );

    const rawData = {
      title:
        formString(
          formData,
          "title",
        ) ||
        currentEvent.title,

      shortDescription:
        formData.has(
          "shortDescription",
        )
          ? formString(
              formData,
              "shortDescription",
            )
          : currentEvent.short_description ||
            "",

      description:
        formData.has(
          "description",
        )
          ? formString(
              formData,
              "description",
            )
          : currentEvent.description ||
            "",

      eventType:
        formData.has(
          "eventType",
        )
          ? formString(
              formData,
              "eventType",
            )
          : currentEvent.event_type ||
            "",

      eventDate:
        formString(
          formData,
          "eventDate",
        ) ||
        currentEvent.event_date,

      startTime:
        formData.has(
          "startTime",
        )
          ? formString(
              formData,
              "startTime",
            )
          : currentEvent.start_time ||
            "",

      endTime:
        formData.has(
          "endTime",
        )
          ? formString(
              formData,
              "endTime",
            )
          : currentEvent.end_time ||
            "",

      venue:
        formData.has(
          "venue",
        )
          ? formString(
              formData,
              "venue",
            )
          : currentEvent.venue ||
            "",

      registrationUrl:
        formData.has(
          "registrationUrl",
        )
          ? formString(
              formData,
              "registrationUrl",
            )
          : currentEvent.registration_url ||
            "",

      isPublished:
        parseBoolean(
          formData.get(
            "isPublished",
          ),
          Boolean(
            currentEvent.is_published,
          ),
        ),

      isFeatured:
        parseBoolean(
          formData.get(
            "isFeatured",
          ),
          Boolean(
            currentEvent.is_featured,
          ),
        ),

      removeCover:
        parseBoolean(
          formData.get(
            "removeCover",
          ),
          false,
        ),

      statusOverride:
        requestedStatusOverride ||
        currentEvent.status_override,
    };

    /*
     * VALIDATE
     */

    const validation =
      updateEventSchema.safeParse(
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
      removeCover,
      statusOverride,
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
     * COVER
     */

    const coverFile =
      formData.get(
        "coverImage",
      );

    let nextCoverUrl =
      currentEvent.cover_image;

    let hasNewCover =
      false;

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

        nextCoverUrl =
          savedCover.url;

        newCoverPhysicalPath =
          savedCover.physicalPath;

        hasNewCover =
          true;
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
    } else if (
      removeCover
    ) {
      nextCoverUrl =
        null;
    }

    /*
     * SLUG
     */

    const slug =
      await createUniqueSlug(
        title,
        eventId,
      );

    /*
     * UPDATE
     */

    await db.execute<
      ResultSetHeader
    >(
      `
        UPDATE events

        SET
          title = ?,
          slug = ?,
          short_description = ?,
          description = ?,
          event_type = ?,
          event_date = ?,
          start_time = ?,
          end_time = ?,
          venue = ?,
          cover_image = ?,
          registration_url = ?,
          is_published = ?,
          is_featured = ?,
          status_override = ?

        WHERE id = ?
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

        nextCoverUrl,

        registrationUrl ||
          null,

        isPublished,

        isFeatured,

        statusOverride,

        eventId,
      ],
    );

    /*
     * DELETE OLD COVER
     */

    if (
      currentEvent.cover_image &&
      (
        hasNewCover ||
        removeCover
      ) &&
      currentEvent.cover_image !==
        nextCoverUrl
    ) {
      await deleteCoverByUrl(
        currentEvent.cover_image,
      );
    }

    /*
     * NEW FILE IS NOW USED
     */

    newCoverPhysicalPath =
      null;

    /*
     * SUCCESS
     */

    return NextResponse.json({
      success: true,

      message:
        statusOverride ===
        "COMPLETED"
          ? "Event marked as completed."
          : "Event updated successfully.",

      event: {
        id:
          eventId,

        title,

        slug,

        shortDescription:
          shortDescription ||
          "",

        description:
          description ||
          "",

        eventType:
          eventType ||
          "",

        eventDate,

        startTime:
          startTime ||
          "",

        endTime:
          endTime ||
          "",

        venue:
          venue ||
          "",

        coverImage:
          nextCoverUrl,

        registrationUrl:
          registrationUrl ||
          "",

        isPublished,

        isFeatured,

        statusOverride,
      },
    });
  } catch (error) {
    /*
     * CLEAN NEW COVER
     */

    await deletePhysicalFile(
      newCoverPhysicalPath,
    );

    console.error(
      "Update event error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to update event.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================
 * DELETE EVENT
 *
 * DELETE /api/admin/events/[id]
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
    /*
     * ADMIN
     */

    const auth =
      await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    /*
     * ID
     */

    const eventId =
      await getEventId(
        context,
      );

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid event.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * CONNECTION
     */

    const connection =
      await db.getConnection();

    let coverUrl:
      | string
      | null = null;

    try {
      await connection.beginTransaction();

      /*
       * LOCK EVENT
       */

      const [eventRows] =
        await connection.execute<
          EventRow[]
        >(
          `
            SELECT
              id,
              title,
              slug,
              short_description,
              description,
              event_type,

              DATE_FORMAT(
                event_date,
                '%Y-%m-%d'
              ) AS event_date,

              TIME_FORMAT(
                start_time,
                '%H:%i'
              ) AS start_time,

              TIME_FORMAT(
                end_time,
                '%H:%i'
              ) AS end_time,

              venue,
              cover_image,
              registration_url,
              is_published,
              is_featured,
              status_override,
              created_by,
              created_at,
              updated_at

            FROM events

            WHERE id = ?

            LIMIT 1

            FOR UPDATE
          `,
          [eventId],
        );

      if (
        eventRows.length ===
        0
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,

            message:
              "Event not found.",
          },
          {
            status: 404,
          },
        );
      }

      coverUrl =
        eventRows[0]
          .cover_image;

      /*
       * DELETE EVENT
       */

      const [result] =
        await connection.execute<
          ResultSetHeader
        >(
          `
            DELETE FROM events

            WHERE id = ?
          `,
          [eventId],
        );

      if (
        result.affectedRows ===
        0
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,

            message:
              "Event was not deleted.",
          },
          {
            status: 404,
          },
        );
      }

      /*
       * COMMIT
       */

      await connection.commit();
    } catch (error) {
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }

    /*
     * DELETE COVER
     */

    await deleteCoverByUrl(
      coverUrl,
    );

    /*
     * SUCCESS
     */

    return NextResponse.json({
      success: true,

      message:
        "Event deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete event error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to delete event.",
      },
      {
        status: 500,
      },
    );
  }
}