import { NextResponse } from "next/server";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { z } from "zod";

import { getCurrentUser } from "@/lib/current-user";
import db from "@/lib/db";

const createProgramSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Program title must be at least 3 characters.")
    .max(150),

  description: z
    .string()
    .trim()
    .max(3000)
    .optional()
    .or(z.literal("")),

  eventDate: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  isPublished: z.boolean().default(true),
});

interface SlugRow extends RowDataPacket {
  id: number;
}

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createUniqueSlug(
  title: string,
) {
  const baseSlug =
    makeSlug(title) || "gallery-program";

  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const [rows] =
      await db.execute<SlugRow[]>(
        `
          SELECT id
          FROM gallery_programs
          WHERE slug = ?
          LIMIT 1
        `,
        [slug],
      );

    if (rows.length === 0) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function POST(
  request: Request,
) {
  try {
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

    if (user.role !== "ADMIN") {
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

    const body =
      await request.json();

    const validation =
      createProgramSchema.safeParse(
        body,
      );

    if (!validation.success) {
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

    const slug =
      await createUniqueSlug(title);

    const [result] =
      await db.execute<ResultSetHeader>(
        `
          INSERT INTO gallery_programs (
            title,
            slug,
            description,
            event_date,
            is_published,
            created_by
          )

          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          title,
          slug,
          description || null,
          eventDate || null,
          isPublished,
          user.id,
        ],
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Gallery program created successfully.",

        program: {
          id: result.insertId,
          title,
          slug,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Create gallery program error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create gallery program.",
      },
      {
        status: 500,
      },
    );
  }
}