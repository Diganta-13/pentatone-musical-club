import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type {
  RowDataPacket,
} from "mysql2";

import { z } from "zod";

import db from "@/lib/db";

import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth";

const updateSchema =
  z.discriminatedUnion(
    "action",
    [
      z.object({
        action:
          z.literal("APPROVE"),

        note: z
          .string()
          .trim()
          .max(1000)
          .optional(),
      }),

      z.object({
        action:
          z.literal("REJECT"),

        note: z
          .string()
          .trim()
          .min(
            3,
            "Rejection reason is required.",
          )
          .max(1000),
      }),
    ],
  );

interface AdminRow
  extends RowDataPacket {
  id: number;
  role: string;
  is_active:
    | number
    | boolean;
}

interface MembershipRow
  extends RowDataPacket {
  id: number;
  user_id: number;
  department_id: number;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";
}

interface RoleRow
  extends RowDataPacket {
  id: number;
}

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

    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        SESSION_COOKIE_NAME,
      )?.value;

    if (!token) {
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

    const session =
      await verifySessionToken(
        token,
      );

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid or expired session.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * CURRENT ROLE FROM DB
     */

    const [admins] =
      await db.execute<
        AdminRow[]
      >(
        `
          SELECT
            u.id,
            u.is_active,
            r.name AS role
          FROM users u

          INNER JOIN roles r
            ON r.id = u.role_id

          WHERE u.id = ?
          LIMIT 1
        `,
        [session.userId],
      );

    if (
      admins.length === 0 ||
      !admins[0].is_active ||
      admins[0].role !==
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

    const admin =
      admins[0];

    /*
     * REQUEST ID
     */

    const { id } =
      await context.params;

    const requestId =
      Number(id);

    if (
      !Number.isInteger(
        requestId,
      ) ||
      requestId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid membership request.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * BODY
     */

    const body =
      await request.json();

    const validation =
      updateSchema.safeParse(
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
            "Invalid request.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * TRANSACTION
     */

    const connection =
      await db.getConnection();

    try {
      await connection.beginTransaction();

      const [requests] =
        await connection.execute<
          MembershipRow[]
        >(
          `
            SELECT
              id,
              user_id,
              department_id,
              status
            FROM membership_requests
            WHERE id = ?
            LIMIT 1
            FOR UPDATE
          `,
          [requestId],
        );

      if (
        requests.length ===
        0
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            message:
              "Membership application not found.",
          },
          {
            status: 404,
          },
        );
      }

      const membership =
        requests[0];

      if (
        membership.status !==
        "PENDING"
      ) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            message:
              "This application has already been reviewed.",
          },
          {
            status: 409,
          },
        );
      }

      /*
       * APPROVE
       */

      if (
        validation.data
          .action ===
        "APPROVE"
      ) {
        const [roles] =
          await connection.execute<
            RoleRow[]
          >(
            `
              SELECT id
              FROM roles
              WHERE name = 'MEMBER'
              LIMIT 1
            `,
          );

        if (
          roles.length === 0
        ) {
          throw new Error(
            "MEMBER role is missing.",
          );
        }

        await connection.execute(
          `
            UPDATE membership_requests
            SET
              status = 'APPROVED',
              admin_note = ?,
              reviewed_by = ?,
              reviewed_at = NOW()
            WHERE id = ?
          `,
          [
            validation.data
              .note || null,

            admin.id,

            membership.id,
          ],
        );

        /*
         * User becomes MEMBER.
         * Department also updates
         * from verified application.
         */

        await connection.execute(
          `
            UPDATE users
            SET
              role_id = ?,
              department_id = ?
            WHERE id = ?
          `,
          [
            roles[0].id,

            membership.department_id,

            membership.user_id,
          ],
        );

        await connection.commit();

        return NextResponse.json({
          success: true,
          message:
            "Membership application approved.",
        });
      }

      /*
       * REJECT
       */

      await connection.execute(
        `
          UPDATE membership_requests
          SET
            status = 'REJECTED',
            admin_note = ?,
            reviewed_by = ?,
            reviewed_at = NOW()
          WHERE id = ?
        `,
        [
          validation.data.note,

          admin.id,

          membership.id,
        ],
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message:
          "Membership application rejected.",
      });
    } catch (error) {
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(
      "Admin membership update error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to review membership application.",
      },
      {
        status: 500,
      },
    );
  }
}