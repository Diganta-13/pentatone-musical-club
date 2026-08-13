import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { getCurrentUser } from "@/lib/current-user";
import db from "@/lib/db";

/*
 * =====================================
 * CONSTANTS
 * =====================================
 */

const MAX_VIDEO_SIZE =
  100 * 1024 * 1024;

const allowedVideoTypes =
  new Map<string, string>([
    ["video/mp4", "mp4"],
    ["video/webm", "webm"],
    ["video/quicktime", "mov"],
    ["video/x-m4v", "m4v"],
  ]);

/*
 * =====================================
 * TYPES
 * =====================================
 */

interface SessionRow
  extends RowDataPacket {
  id: number;

  title: string;

  status:
    | "DRAFT"
    | "OPEN"
    | "CLOSED"
    | "COMPLETED";

  is_published:
    | number
    | boolean;

  deadline_passed: number;
}

interface DepartmentRow
  extends RowDataPacket {
  id: number;

  name: string;

  short_name: string;
}

interface UserProfileRow
  extends RowDataPacket {
  department_id:
    | number
    | null;
}

interface MembershipRow
  extends RowDataPacket {
  student_id: string;

  department_id: number;
}

interface ExistingApplicationRow
  extends RowDataPacket {
  id: number;

  status:
    | "PENDING"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED";
}

interface SimpleIdRow
  extends RowDataPacket {
  id: number;
}

/*
 * =====================================
 * SESSION ID
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
 * CURRENT SESSION
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
          status,
          is_published,

          CASE
            WHEN
              application_deadline IS NOT NULL
              AND application_deadline < NOW()
            THEN 1
            ELSE 0
          END AS deadline_passed

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
 * DELETE FILE
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
        "Audition video cleanup error:",
        error,
      );
    }
  }
}

/*
 * =====================================
 * SAVE VIDEO
 * =====================================
 */

async function saveVideo(
  file: File,
  sessionId: number,
) {
  const extension =
    allowedVideoTypes.get(
      file.type,
    );

  if (!extension) {
    throw new Error(
      "INVALID_VIDEO_TYPE",
    );
  }

  if (
    file.size >
    MAX_VIDEO_SIZE
  ) {
    throw new Error(
      "VIDEO_TOO_LARGE",
    );
  }

  const directory =
    path.join(
      process.cwd(),
      "public",
      "uploads",
      "auditions",
      "applications",
      String(
        sessionId,
      ),
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
    physicalPath,

    publicUrl:
      `/uploads/auditions/applications/${sessionId}/${filename}`,
  };
}

/*
 * =====================================
 * STRING VALUE
 * =====================================
 */

function getString(
  formData: FormData,
  key: string,
) {
  const value =
    formData.get(key);

  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

/*
 * =====================================
 * GET APPLICATION FORM DATA
 *
 * GET /api/auditions/:id/apply
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
     * =====================================
     * USER
     * =====================================
     */

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please log in to apply for an audition.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * =====================================
     * SESSION
     * =====================================
     */

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

    /*
     * =====================================
     * DEPARTMENTS
     * =====================================
     */

    const [departments] =
      await db.execute<
        DepartmentRow[]
      >(
        `
          SELECT
            id,
            name,
            short_name

          FROM departments

          ORDER BY
            short_name ASC,
            name ASC
        `,
      );

    /*
     * =====================================
     * USER PROFILE
     * =====================================
     */

    const [userRows] =
      await db.execute<
        UserProfileRow[]
      >(
        `
          SELECT
            department_id

          FROM users

          WHERE id = ?

          LIMIT 1
        `,
        [
          user.id,
        ],
      );

    const userProfile =
      userRows[0] ||
      null;

    /*
     * =====================================
     * APPROVED MEMBERSHIP DATA
     *
     * Used only to prefill Student ID
     * and Department if available.
     * =====================================
     */

    const [membershipRows] =
      await db.execute<
        MembershipRow[]
      >(
        `
          SELECT
            student_id,
            department_id

          FROM membership_requests

          WHERE
            user_id = ?
            AND status = 'APPROVED'

          ORDER BY
            reviewed_at DESC,
            created_at DESC

          LIMIT 1
        `,
        [
          user.id,
        ],
      );

    const membership =
      membershipRows[0] ||
      null;

    /*
     * =====================================
     * EXISTING APPLICATION
     * =====================================
     */

    const [existingRows] =
      await db.execute<
        ExistingApplicationRow[]
      >(
        `
          SELECT
            id,
            status

          FROM audition_applications

          WHERE
            session_id = ?
            AND user_id = ?

          LIMIT 1
        `,
        [
          sessionId,
          user.id,
        ],
      );

    const existingApplication =
      existingRows[0] ||
      null;

    /*
     * =====================================
     * RESPONSE
     * =====================================
     */

    return NextResponse.json({
      success: true,

      session: {
        id:
          session.id,

        title:
          session.title,

        status:
          session.status,

        isPublished:
          Boolean(
            session.is_published,
          ),

        deadlinePassed:
          Boolean(
            session.deadline_passed,
          ),
      },

      departments:
        departments.map(
          (department) => ({
            id:
              department.id,

            name:
              department.name,

            shortName:
              department.short_name,
          }),
        ),

      defaults: {
        studentId:
          membership?.student_id ||
          "",

        departmentId:
          membership?.department_id ||
          userProfile?.department_id ||
          null,
      },

      existingApplication:
        existingApplication
          ? {
              id:
                existingApplication.id,

              status:
                existingApplication.status,
            }
          : null,
    });
  } catch (error) {
    console.error(
      "Audition application GET error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to load the audition application form.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================
 * SUBMIT APPLICATION
 *
 * POST /api/auditions/:id/apply
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
  let savedVideoPath:
    | string
    | null = null;

  try {
    /*
     * =====================================
     * USER
     * =====================================
     */

    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please log in before submitting an audition application.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * =====================================
     * SESSION ID
     * =====================================
     */

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

    /*
     * =====================================
     * SESSION
     * =====================================
     */

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

    /*
     * =====================================
     * SESSION MUST BE PUBLIC + OPEN
     * =====================================
     */

    if (
      session.status !==
        "OPEN" ||
      !Boolean(
        session.is_published,
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This audition session is not currently accepting applications.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================
     * DEADLINE
     * =====================================
     */

    if (
      Boolean(
        session.deadline_passed,
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "The application deadline for this audition has passed.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================
     * DUPLICATE CHECK
     * =====================================
     */

    const [existingRows] =
      await db.execute<
        ExistingApplicationRow[]
      >(
        `
          SELECT
            id,
            status

          FROM audition_applications

          WHERE
            session_id = ?
            AND user_id = ?

          LIMIT 1
        `,
        [
          sessionId,
          user.id,
        ],
      );

    if (
      existingRows.length >
      0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "You have already applied for this audition session.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * =====================================
     * FORM DATA
     * =====================================
     */

    const formData =
      await request.formData();

    const studentId =
      getString(
        formData,
        "studentId",
      );

    const departmentValue =
      getString(
        formData,
        "departmentId",
      );

    const instrument =
      getString(
        formData,
        "instrument",
      );

    const experienceYearsValue =
      getString(
        formData,
        "experienceYears",
      );

    const experienceDetails =
      getString(
        formData,
        "experienceDetails",
      );

    const applicantNote =
      getString(
        formData,
        "applicantNote",
      );

    /*
     * =====================================
     * STUDENT ID VALIDATION
     * =====================================
     */

    if (
      studentId.length < 2 ||
      studentId.length > 100
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please enter a valid Student ID.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================
     * DEPARTMENT
     * =====================================
     */

    const departmentId =
      Number(
        departmentValue,
      );

    if (
      !Number.isInteger(
        departmentId,
      ) ||
      departmentId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please select your department.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Verify department exists.
     */

    const [departmentRows] =
      await db.execute<
        SimpleIdRow[]
      >(
        `
          SELECT id

          FROM departments

          WHERE id = ?

          LIMIT 1
        `,
        [
          departmentId,
        ],
      );

    if (
      departmentRows.length ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "The selected department is invalid.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================
     * INSTRUMENT
     * =====================================
     */

    if (
      instrument.length < 2 ||
      instrument.length > 120
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please enter your instrument or musical role.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================
     * EXPERIENCE YEARS
     * =====================================
     */

    let experienceYears:
      | number
      | null = null;

    if (
      experienceYearsValue
    ) {
      const parsed =
        Number(
          experienceYearsValue,
        );

      if (
        !Number.isFinite(
          parsed,
        ) ||
        parsed < 0 ||
        parsed > 99
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Experience must be between 0 and 99 years.",
          },
          {
            status: 400,
          },
        );
      }

      experienceYears =
        Math.round(
          parsed * 10,
        ) / 10;
    }

    /*
     * =====================================
     * EXPERIENCE DETAILS
     * =====================================
     */

    if (
      experienceDetails.length >
      500
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Experience details cannot exceed 500 characters.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================
     * APPLICANT NOTE
     * =====================================
     */

    if (
      applicantNote.length >
      3000
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Applicant note is too long.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================
     * VIDEO
     * =====================================
     */

    const video =
      formData.get(
        "video",
      );

    if (
      !(video instanceof File) ||
      video.size === 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please upload your audition video.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================
     * SAVE VIDEO
     * =====================================
     */

    let videoUrl: string;

    try {
      const savedVideo =
        await saveVideo(
          video,
          sessionId,
        );

      savedVideoPath =
        savedVideo.physicalPath;

      videoUrl =
        savedVideo.publicUrl;
    } catch (error) {
      if (
        error instanceof
          Error &&
        error.message ===
          "INVALID_VIDEO_TYPE"
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Audition video must be MP4, WEBM, MOV or M4V.",
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
          "VIDEO_TOO_LARGE"
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Audition video cannot exceed 100 MB.",
          },
          {
            status: 400,
          },
        );
      }

      throw error;
    }

    /*
     * =====================================
     * INSERT APPLICATION
     * =====================================
     */

    try {
      const [result] =
        await db.execute<
          ResultSetHeader
        >(
          `
            INSERT INTO audition_applications (
              session_id,
              user_id,
              student_id,
              department_id,
              instrument,
              experience_years,
              experience_details,
              video_url,
              applicant_note,
              status
            )

            VALUES (
              ?, ?, ?, ?, ?, ?,
              ?, ?, ?, 'PENDING'
            )
          `,
          [
            sessionId,

            user.id,

            studentId,

            departmentId,

            instrument,

            experienceYears,

            experienceDetails ||
              null,

            videoUrl,

            applicantNote ||
              null,
          ],
        );

      /*
       * File now belongs to DB row.
       */

      savedVideoPath =
        null;

      return NextResponse.json(
        {
          success: true,

          message:
            "Your audition application has been submitted successfully.",

          application: {
            id:
              result.insertId,

            status:
              "PENDING",
          },
        },
        {
          status: 201,
        },
      );
    } catch (error) {
      /*
       * Unique session/user constraint.
       */

      const mysqlError =
        error as {
          code?: string;
        };

      if (
        mysqlError.code ===
        "ER_DUP_ENTRY"
      ) {
        await deletePhysicalFile(
          savedVideoPath,
        );

        savedVideoPath =
          null;

        return NextResponse.json(
          {
            success: false,

            message:
              "You have already applied for this audition session.",
          },
          {
            status: 409,
          },
        );
      }

      throw error;
    }
  } catch (error) {
    /*
     * Remove uploaded video if DB
     * submission failed.
     */

    await deletePhysicalFile(
      savedVideoPath,
    );

    console.error(
      "Submit audition application error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to submit your audition application.",
      },
      {
        status: 500,
      },
    );
  }
}