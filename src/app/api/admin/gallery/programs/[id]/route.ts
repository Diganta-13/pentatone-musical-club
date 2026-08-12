import { NextResponse } from "next/server";

import fs from "fs/promises";
import path from "path";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { z } from "zod";

import db from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

/*
 * =====================================
 * TYPES
 * =====================================
 */

interface ProgramRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  description: string | null;

  event_date:
    | Date
    | string
    | null;

  cover_image:
    | string
    | null;

  is_published:
    | number
    | boolean;

  created_by:
    | number
    | null;

  created_at: Date;
  updated_at: Date;
}

interface SlugRow extends RowDataPacket {
  id: number;
}

/*
 * =====================================
 * VALIDATION
 * =====================================
 */

const updateProgramSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      3,
      "Program title must be at least 3 characters.",
    )
    .max(
      150,
      "Program title is too long.",
    ),

  description: z
    .string()
    .trim()
    .max(
      3000,
      "Description is too long.",
    )
    .optional()
    .or(z.literal("")),

  eventDate: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  isPublished:
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
    user.role !== "ADMIN"
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
 * PROGRAM ID
 * =====================================
 */

async function getProgramId(
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const { id } =
    await context.params;

  const programId =
    Number(id);

  if (
    !Number.isInteger(
      programId,
    ) ||
    programId <= 0
  ) {
    return null;
  }

  return programId;
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
  programId: number,
) {
  const baseSlug =
    makeSlug(title) ||
    "gallery-program";

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

          FROM gallery_programs

          WHERE
            slug = ?
            AND id != ?

          LIMIT 1
        `,
        [
          slug,
          programId,
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
 * GET PROGRAM
 * =====================================
 */

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    /*
     * ADMIN AUTH
     */

    const auth =
      await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    /*
     * PROGRAM ID
     */

    const programId =
      await getProgramId(
        context,
      );

    if (!programId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid gallery program.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * FIND PROGRAM
     */

    const [rows] =
      await db.execute<
        ProgramRow[]
      >(
        `
          SELECT
            id,
            title,
            slug,
            description,
            event_date,
            cover_image,
            is_published,
            created_by,
            created_at,
            updated_at

          FROM gallery_programs

          WHERE id = ?

          LIMIT 1
        `,
        [programId],
      );

    if (
      rows.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gallery program not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      program: rows[0],
    });
  } catch (error) {
    console.error(
      "Get gallery program error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load gallery program.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================
 * EDIT PROGRAM
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
  try {
    /*
     * ADMIN AUTH
     */

    const auth =
      await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    /*
     * PROGRAM ID
     */

    const programId =
      await getProgramId(
        context,
      );

    if (!programId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid gallery program.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * REQUEST BODY
     */

    const body =
      await request.json();

    const validation =
      updateProgramSchema.safeParse(
        body,
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
            "Invalid program information.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      title,
      description,
      eventDate,
      isPublished,
    } = validation.data;

    /*
     * DATE VALIDATION
     */

    if (
      eventDate &&
      !/^\d{4}-\d{2}-\d{2}$/.test(
        eventDate,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid event date.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * CHECK PROGRAM
     */

    const [programRows] =
      await db.execute<
        ProgramRow[]
      >(
        `
          SELECT
            id,
            title,
            slug,
            description,
            event_date,
            cover_image,
            is_published,
            created_by,
            created_at,
            updated_at

          FROM gallery_programs

          WHERE id = ?

          LIMIT 1
        `,
        [programId],
      );

    if (
      programRows.length ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gallery program not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * GENERATE SLUG
     */

    const slug =
      await createUniqueSlug(
        title,
        programId,
      );

    /*
     * UPDATE
     */

    const [result] =
      await db.execute<
        ResultSetHeader
      >(
        `
          UPDATE gallery_programs

          SET
            title = ?,
            slug = ?,
            description = ?,
            event_date = ?,
            is_published = ?

          WHERE id = ?
        `,
        [
          title,
          slug,

          description ||
            null,

          eventDate ||
            null,

          isPublished,

          programId,
        ],
      );

    if (
      result.affectedRows === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gallery program was not updated.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Gallery program updated successfully.",

      program: {
        id: programId,
        title,
        slug,

        description:
          description ||
          null,

        eventDate:
          eventDate ||
          null,

        isPublished,
      },
    });
  } catch (error) {
    console.error(
      "Update gallery program error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update gallery program.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================
 * DELETE PROGRAM
 * =====================================
 */

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    /*
     * ADMIN AUTH
     */

    const auth =
      await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    /*
     * PROGRAM ID
     */

    const programId =
      await getProgramId(
        context,
      );

    if (!programId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid gallery program.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * DATABASE TRANSACTION
     */

    const connection =
      await db.getConnection();

    try {
      await connection.beginTransaction();

      /*
       * Lock program
       */

      const [programRows] =
        await connection.execute<
          ProgramRow[]
        >(
          `
            SELECT
              id,
              title,
              slug,
              description,
              event_date,
              cover_image,
              is_published,
              created_by,
              created_at,
              updated_at

            FROM gallery_programs

            WHERE id = ?

            LIMIT 1

            FOR UPDATE
          `,
          [programId],
        );

      if (
        programRows.length ===
        0
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            message:
              "Gallery program not found.",
          },
          {
            status: 404,
          },
        );
      }

      /*
       * DELETE PROGRAM
       *
       * gallery_media rows are
       * automatically removed by
       * ON DELETE CASCADE.
       */

      await connection.execute<
        ResultSetHeader
      >(
        `
          DELETE FROM gallery_programs

          WHERE id = ?
        `,
        [programId],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }

    /*
     * =====================================
     * DELETE PHYSICAL MEDIA FOLDER
     * =====================================
     */

    const uploadDirectory =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "gallery",
        String(
          programId,
        ),
      );

    try {
      await fs.rm(
        uploadDirectory,
        {
          recursive: true,
          force: true,
        },
      );
    } catch (error) {
      /*
       * Database deletion already
       * succeeded, so folder cleanup
       * failure should not restore the
       * deleted program.
       */

      console.error(
        "Unable to remove gallery program folder:",
        error,
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Gallery program deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete gallery program error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete gallery program.",
      },
      {
        status: 500,
      },
    );
  }
}