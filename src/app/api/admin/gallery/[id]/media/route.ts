import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import db from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

/*
 * =====================================
 * TYPES
 * =====================================
 */

interface ProgramRow extends RowDataPacket {
  id: number;
}

interface MediaRow extends RowDataPacket {
  id: number;
  program_id: number;
  media_type: "IMAGE" | "VIDEO";
  file_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  sort_order: number;
  created_at: Date;
}

interface SortRow extends RowDataPacket {
  max_sort: number | null;
}

/*
 * =====================================
 * FILE SETTINGS
 * =====================================
 */

const MAX_FILES = 10;

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024; // 10 MB

const MAX_VIDEO_SIZE =
  100 * 1024 * 1024; // 100 MB

const allowedTypes: Record<
  string,
  {
    extension: string;
    mediaType: "IMAGE" | "VIDEO";
  }
> = {
  "image/jpeg": {
    extension: "jpg",
    mediaType: "IMAGE",
  },

  "image/png": {
    extension: "png",
    mediaType: "IMAGE",
  },

  "image/webp": {
    extension: "webp",
    mediaType: "IMAGE",
  },

  "image/gif": {
    extension: "gif",
    mediaType: "IMAGE",
  },

  "video/mp4": {
    extension: "mp4",
    mediaType: "VIDEO",
  },

  "video/webm": {
    extension: "webm",
    mediaType: "VIDEO",
  },

  "video/quicktime": {
    extension: "mov",
    mediaType: "VIDEO",
  },
};

/*
 * =====================================
 * ADMIN CHECK
 * =====================================
 */

async function getAdmin() {
  const user =
    await getCurrentUser();

  if (!user) {
    return {
      user: null,

      response: NextResponse.json(
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

  if (user.role !== "ADMIN") {
    return {
      user: null,

      response: NextResponse.json(
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
 * GET PROGRAM ID
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
 * CHECK PROGRAM EXISTS
 * =====================================
 */

async function programExists(
  programId: number,
) {
  const [rows] =
    await db.execute<
      ProgramRow[]
    >(
      `
        SELECT id

        FROM gallery_programs

        WHERE id = ?

        LIMIT 1
      `,
      [programId],
    );

  return rows.length > 0;
}

/*
 * =====================================
 * GET MEDIA
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
      await getAdmin();

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
     * CHECK PROGRAM
     */

    const exists =
      await programExists(
        programId,
      );

    if (!exists) {
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
     * GET MEDIA
     */

    const [media] =
      await db.execute<
        MediaRow[]
      >(
        `
          SELECT
            id,
            program_id,
            media_type,
            file_url,
            thumbnail_url,
            caption,
            sort_order,
            created_at

          FROM gallery_media

          WHERE program_id = ?

          ORDER BY
            sort_order ASC,
            created_at DESC
        `,
        [programId],
      );

    return NextResponse.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error(
      "Gallery media GET error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load gallery media.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================
 * UPLOAD MEDIA
 * =====================================
 */

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const savedFilePaths:
    string[] = [];

  try {
    /*
     * ADMIN AUTH
     */

    const auth =
      await getAdmin();

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
     * CHECK PROGRAM
     */

    const exists =
      await programExists(
        programId,
      );

    if (!exists) {
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
     * FORM DATA
     */

    const formData =
      await request.formData();

    const fileEntries =
      formData.getAll(
        "files",
      );

    const files =
      fileEntries.filter(
        (
          item,
        ): item is File =>
          item instanceof File,
      );

    const captionValue =
      formData.get(
        "caption",
      );

    const caption =
      typeof captionValue ===
      "string"
        ? captionValue
            .trim()
            .slice(0, 255)
        : "";

    /*
     * VALIDATE FILE COUNT
     */

    if (files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select at least one photo or video.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      files.length >
      MAX_FILES
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            `You can upload maximum ${MAX_FILES} files at a time.`,
        },
        {
          status: 400,
        },
      );
    }

    /*
     * VALIDATE FILES
     */

    for (const file of files) {
      const typeInfo =
        allowedTypes[
          file.type
        ];

      if (!typeInfo) {
        return NextResponse.json(
          {
            success: false,
            message:
              `"${file.name}" is not a supported image or video file.`,
          },
          {
            status: 400,
          },
        );
      }

      if (
        typeInfo.mediaType ===
          "IMAGE" &&
        file.size >
          MAX_IMAGE_SIZE
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `"${file.name}" exceeds the 10 MB image limit.`,
          },
          {
            status: 400,
          },
        );
      }

      if (
        typeInfo.mediaType ===
          "VIDEO" &&
        file.size >
          MAX_VIDEO_SIZE
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `"${file.name}" exceeds the 100 MB video limit.`,
          },
          {
            status: 400,
          },
        );
      }
    }

    /*
     * UPLOAD DIRECTORY
     */

    const uploadDirectory =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "gallery",
        String(programId),
      );

    await fs.mkdir(
      uploadDirectory,
      {
        recursive: true,
      },
    );

    /*
     * GET CURRENT SORT ORDER
     */

    const [sortRows] =
      await db.execute<
        SortRow[]
      >(
        `
          SELECT
            MAX(sort_order)
              AS max_sort

          FROM gallery_media

          WHERE program_id = ?
        `,
        [programId],
      );

    let sortOrder =
      Number(
        sortRows[0]
          ?.max_sort ?? 0,
      );

    /*
     * DATABASE TRANSACTION
     */

    const connection =
      await db.getConnection();

    try {
      await connection.beginTransaction();

      const uploadedMedia: {
        id: number;
        mediaType:
          | "IMAGE"
          | "VIDEO";
        fileUrl: string;
        caption:
          | string
          | null;
        sortOrder: number;
      }[] = [];

      for (const file of files) {
        const typeInfo =
          allowedTypes[
            file.type
          ];

        /*
         * UNIQUE FILE NAME
         */

        const uniqueId =
          crypto.randomUUID();

        const filename =
          `${Date.now()}-${uniqueId}.${typeInfo.extension}`;

        const absolutePath =
          path.join(
            uploadDirectory,
            filename,
          );

        const publicUrl =
          `/uploads/gallery/${programId}/${filename}`;

        /*
         * SAVE FILE
         */

        const arrayBuffer =
          await file.arrayBuffer();

        const buffer =
          Buffer.from(
            arrayBuffer,
          );

        await fs.writeFile(
          absolutePath,
          buffer,
        );

        savedFilePaths.push(
          absolutePath,
        );

        sortOrder++;

        /*
         * INSERT DATABASE RECORD
         */

        const [result] =
          await connection.execute<
            ResultSetHeader
          >(
            `
              INSERT INTO gallery_media (
                program_id,
                media_type,
                file_url,
                thumbnail_url,
                caption,
                sort_order
              )

              VALUES (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?
              )
            `,
            [
              programId,
              typeInfo.mediaType,
              publicUrl,
              null,
              caption || null,
              sortOrder,
            ],
          );

        uploadedMedia.push({
          id:
            result.insertId,

          mediaType:
            typeInfo.mediaType,

          fileUrl:
            publicUrl,

          caption:
            caption || null,

          sortOrder,
        });
      }

      await connection.commit();

      return NextResponse.json(
        {
          success: true,

          message:
            files.length === 1
              ? "Media uploaded successfully."
              : `${files.length} media files uploaded successfully.`,

          media:
            uploadedMedia,
        },
        {
          status: 201,
        },
      );
    } catch (error) {
      await connection.rollback();

      /*
       * CLEAN UP PHYSICAL FILES
       * IF DB TRANSACTION FAILS
       */

      for (
        const filePath
        of savedFilePaths
      ) {
        try {
          await fs.unlink(
            filePath,
          );
        } catch {
          // Ignore cleanup errors
        }
      }

      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(
      "Gallery media upload error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to upload gallery media.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================
 * UPDATE MEDIA CAPTION
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
      await getAdmin();

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
     * CHECK PROGRAM
     */

    const exists =
      await programExists(
        programId,
      );

    if (!exists) {
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
     * REQUEST BODY
     */

    const body =
      await request.json();

    const mediaId =
      Number(
        body.mediaId,
      );

    const caption =
      typeof body.caption ===
      "string"
        ? body.caption.trim()
        : "";

    /*
     * VALIDATE MEDIA ID
     */

    if (
      !Number.isInteger(
        mediaId,
      ) ||
      mediaId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid media item.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * VALIDATE CAPTION
     */

    if (
      caption.length > 255
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Caption cannot exceed 255 characters.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * CHECK MEDIA EXISTS
     */

    const [mediaRows] =
      await db.execute<
        MediaRow[]
      >(
        `
          SELECT
            id,
            program_id,
            media_type,
            file_url,
            thumbnail_url,
            caption,
            sort_order,
            created_at

          FROM gallery_media

          WHERE
            id = ?
            AND program_id = ?

          LIMIT 1
        `,
        [
          mediaId,
          programId,
        ],
      );

    if (
      mediaRows.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Media item not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * UPDATE CAPTION
     */

    await db.execute(
      `
        UPDATE gallery_media

        SET caption = ?

        WHERE
          id = ?
          AND program_id = ?
      `,
      [
        caption || null,
        mediaId,
        programId,
      ],
    );

    return NextResponse.json({
      success: true,

      message:
        caption
          ? "Caption updated successfully."
          : "Caption removed successfully.",

      media: {
        id: mediaId,
        caption:
          caption || null,
      },
    });
  } catch (error) {
    console.error(
      "Gallery media PATCH error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update media caption.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================
 * DELETE MEDIA
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
      await getAdmin();

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
     * MEDIA ID FROM URL
     */

    const url =
      new URL(
        request.url,
      );

    const mediaId =
      Number(
        url.searchParams.get(
          "mediaId",
        ),
      );

    if (
      !Number.isInteger(
        mediaId,
      ) ||
      mediaId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid media item.",
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

    let fileUrl:
      | string
      | null = null;

    try {
      await connection.beginTransaction();

      /*
       * FIND + LOCK MEDIA
       */

      const [mediaRows] =
        await connection.execute<
          MediaRow[]
        >(
          `
            SELECT
              id,
              program_id,
              media_type,
              file_url,
              thumbnail_url,
              caption,
              sort_order,
              created_at

            FROM gallery_media

            WHERE
              id = ?
              AND program_id = ?

            LIMIT 1

            FOR UPDATE
          `,
          [
            mediaId,
            programId,
          ],
        );

      if (
        mediaRows.length === 0
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            message:
              "Media item not found.",
          },
          {
            status: 404,
          },
        );
      }

      const media =
        mediaRows[0];

      fileUrl =
        media.file_url;

      /*
       * DELETE DB RECORD
       */

      await connection.execute(
        `
          DELETE FROM gallery_media

          WHERE
            id = ?
            AND program_id = ?
        `,
        [
          mediaId,
          programId,
        ],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }

    /*
     * DELETE PHYSICAL FILE
     */

    if (fileUrl) {
      try {
        /*
         * Only use basename to prevent
         * path traversal.
         */

        const filename =
          path.basename(
            fileUrl,
          );

        const absolutePath =
          path.join(
            process.cwd(),
            "public",
            "uploads",
            "gallery",
            String(programId),
            filename,
          );

        await fs.unlink(
          absolutePath,
        );
      } catch (error) {
        const nodeError =
          error as NodeJS.ErrnoException;

        /*
         * Ignore already missing files.
         */

        if (
          nodeError.code !==
          "ENOENT"
        ) {
          console.error(
            "Unable to remove physical gallery file:",
            error,
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Media deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Gallery media DELETE error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete gallery media.",
      },
      {
        status: 500,
      },
    );
  }
}