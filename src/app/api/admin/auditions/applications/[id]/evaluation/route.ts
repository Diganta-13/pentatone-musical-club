import { NextResponse } from "next/server";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import { getCurrentUser } from "@/lib/current-user";
import db from "@/lib/db";

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

type EvaluationDecision =
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

interface ApplicationRow extends RowDataPacket {
  id: number;

  user_id: number;

  status:
    | "PENDING"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED";
}

interface EvaluationRow extends RowDataPacket {
  id: number;
}

/*
 * =========================================================
 * GET APPLICATION ID
 * =========================================================
 */

async function getApplicationId(
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const { id } =
    await context.params;

  const applicationId =
    Number(id);

  if (
    !Number.isInteger(
      applicationId,
    ) ||
    applicationId <= 0
  ) {
    return null;
  }

  return applicationId;
}

/*
 * =========================================================
 * SCORE VALIDATION
 *
 * Database migration uses TINYINT,
 * therefore scores are integers: 0 - 10.
 * =========================================================
 */

function parseScore(
  value: unknown,
) {
  const score = Number(value);

  // Allow decimal scores like 8.5, 7.5
  if (
    !Number.isFinite(score) ||
    score < 0 ||
    score > 10
  ) {
    return null;
  }

  // Keep maximum one decimal place
  return Math.round(score * 10) / 10;
}

/*
 * =========================================================
 * POST
 *
 * POST:
 * /api/admin/auditions/applications/[id]/evaluation
 *
 * Saves:
 * - scores
 * - evaluator notes
 * - evaluator decision
 * - application status
 * =========================================================
 */

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const connection =
    await db.getConnection();

  let transactionStarted =
    false;

  try {
    /*
     * =====================================================
     * ADMIN AUTH
     * =====================================================
     */

    const admin =
      await getCurrentUser();

    if (!admin) {
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
      admin.role !==
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
     * =====================================================
     * APPLICATION ID
     * =====================================================
     */

    const applicationId =
      await getApplicationId(
        context,
      );

    if (!applicationId) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid audition application.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================================
     * REQUEST BODY
     * =====================================================
     */

    let body: {
      technicalSkill?: unknown;

      rhythmTiming?: unknown;

      creativity?: unknown;

      stagePresence?: unknown;

      overallPerformance?: unknown;

      notes?: unknown;

      decision?: unknown;
    };

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid request data.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================================
     * VALIDATE SCORES
     * =====================================================
     */

    const technicalSkill =
      parseScore(
        body.technicalSkill,
      );

    const rhythmTiming =
      parseScore(
        body.rhythmTiming,
      );

    const creativity =
      parseScore(
        body.creativity,
      );

    const stagePresence =
      parseScore(
        body.stagePresence,
      );

    const overallPerformance =
      parseScore(
        body.overallPerformance,
      );

    if (
      technicalSkill ===
        null ||
      rhythmTiming ===
        null ||
      creativity ===
        null ||
      stagePresence ===
        null ||
      overallPerformance ===
        null
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Every score must be a number between 0 and 10 with maximum one decimal place.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================================
     * NOTES
     * =====================================================
     */

    const notes =
      typeof body.notes ===
      "string"
        ? body.notes.trim()
        : "";

    if (
      notes.length >
      5000
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Evaluator notes cannot exceed 5000 characters.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================================
     * DECISION
     * =====================================================
     */

    const decision =
      body.decision;

    if (
      decision !==
        "UNDER_REVIEW" &&
      decision !==
        "APPROVED" &&
      decision !==
        "REJECTED"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid audition decision.",
        },
        {
          status: 400,
        },
      );
    }

    const validDecision =
      decision as EvaluationDecision;

    /*
     * =====================================================
     * BEGIN TRANSACTION
     * =====================================================
     */

    await connection.beginTransaction();

    transactionStarted =
      true;

    /*
     * =====================================================
     * LOCK APPLICATION
     * =====================================================
     */

    const [applicationRows] =
      await connection.execute<
        ApplicationRow[]
      >(
        `
          SELECT
            id,
            user_id,
            status

          FROM audition_applications

          WHERE id = ?

          LIMIT 1

          FOR UPDATE
        `,
        [
          applicationId,
        ],
      );

    const application =
      applicationRows[0];

    if (!application) {
      await connection.rollback();

      transactionStarted =
        false;

      return NextResponse.json(
        {
          success: false,

          message:
            "Audition application not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * =====================================================
     * CHECK THIS ADMIN'S EXISTING EVALUATION
     *
     * Migration:
     * UNIQUE(application_id, evaluator_id)
     * =====================================================
     */

    const [evaluationRows] =
      await connection.execute<
        EvaluationRow[]
      >(
        `
          SELECT id

          FROM audition_evaluations

          WHERE
            application_id = ?
            AND evaluator_id = ?

          LIMIT 1

          FOR UPDATE
        `,
        [
          applicationId,
          admin.id,
        ],
      );

    const existingEvaluation =
      evaluationRows[0] ||
      null;

    /*
     * =====================================================
     * UPDATE EXISTING EVALUATION
     * =====================================================
     */

    if (
      existingEvaluation
    ) {
      await connection.execute<
        ResultSetHeader
      >(
        `
          UPDATE audition_evaluations

          SET
            technical_skill = ?,
            rhythm_timing = ?,
            creativity = ?,
            stage_presence = ?,
            overall_performance = ?,
            notes = ?,
            decision = ?,
            evaluated_at = NOW(),
            updated_at = NOW()

          WHERE
            id = ?
            AND evaluator_id = ?
        `,
        [
          technicalSkill,

          rhythmTiming,

          creativity,

          stagePresence,

          overallPerformance,

          notes || null,

          validDecision,

          existingEvaluation.id,

          admin.id,
        ],
      );
    } else {
      /*
       * ===================================================
       * CREATE NEW EVALUATION
       * ===================================================
       */

      await connection.execute<
        ResultSetHeader
      >(
        `
          INSERT INTO audition_evaluations (
            application_id,
            evaluator_id,
            technical_skill,
            rhythm_timing,
            creativity,
            stage_presence,
            overall_performance,
            notes,
            decision,
            evaluated_at
          )

          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
          )
        `,
        [
          applicationId,

          admin.id,

          technicalSkill,

          rhythmTiming,

          creativity,

          stagePresence,

          overallPerformance,

          notes || null,

          validDecision,
        ],
      );
    }

    /*
     * =====================================================
     * UPDATE APPLICATION STATUS
     *
     * Schema contains:
     * reviewed_by
     * reviewed_at
     * =====================================================
     */

    await connection.execute<
      ResultSetHeader
    >(
      `
        UPDATE audition_applications

        SET
          status = ?,
          reviewed_by = ?,
          reviewed_at = NOW(),
          updated_at = NOW()

        WHERE id = ?
      `,
      [
        validDecision,

        admin.id,

        applicationId,
      ],
    );

    /*
     * =====================================================
     * COMMIT
     * =====================================================
     */

    await connection.commit();

    transactionStarted =
      false;

    /*
     * =====================================================
     * SCORE SUMMARY
     * =====================================================
     */

    const totalScore =
      technicalSkill +
      rhythmTiming +
      creativity +
      stagePresence +
      overallPerformance;

    const averageScore =
      totalScore / 5;

    /*
     * =====================================================
     * SUCCESS RESPONSE
     * =====================================================
     */

    return NextResponse.json({
      success: true,

      message:
        validDecision ===
        "APPROVED"
          ? "Audition approved successfully."
          : validDecision ===
              "REJECTED"
            ? "Audition application rejected successfully."
            : "Audition application is now under review.",

      application: {
        id:
          applicationId,

        status:
          validDecision,
      },

      evaluation: {
        technicalSkill,

        rhythmTiming,

        creativity,

        stagePresence,

        overallPerformance,

        totalScore,

        averageScore,

        notes,

        decision:
          validDecision,

        evaluatorId:
          admin.id,
      },
    });
  } catch (error) {
    /*
     * =====================================================
     * ROLLBACK
     * =====================================================
     */

    if (
      transactionStarted
    ) {
      try {
        await connection.rollback();
      } catch (
        rollbackError
      ) {
        console.error(
          "Audition evaluation rollback error:",
          rollbackError,
        );
      }
    }

    console.error(
      "Audition evaluation API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to save the audition evaluation.",
      },
      {
        status: 500,
      },
    );
  } finally {
    /*
     * =====================================================
     * RELEASE CONNECTION
     * =====================================================
     */

    connection.release();
  }
}