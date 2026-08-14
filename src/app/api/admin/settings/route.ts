import bcrypt from "bcryptjs";

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
 * TYPES
 * =====================================
 */

interface PasswordRow
  extends RowDataPacket {
  password_hash:
    | string
    | null;
}

/*
 * =====================================
 * VALIDATION
 * =====================================
 */

const profileSchema =
  z.object({
    action:
      z.literal(
        "profile",
      ),

    fullName: z
      .string()
      .trim()
      .min(
        2,
        "Full name must be at least 2 characters.",
      )
      .max(
        120,
        "Full name is too long.",
      ),
  });

const passwordSchema =
  z.object({
    action:
      z.literal(
        "password",
      ),

    currentPassword:
      z
        .string()
        .min(
          1,
          "Current password is required.",
        ),

    newPassword:
      z
        .string()
        .min(
          8,
          "New password must contain at least 8 characters.",
        )
        .max(
          128,
          "New password is too long.",
        ),

    confirmPassword:
      z.string(),
  })
  .refine(
    (data) =>
      data.newPassword ===
      data.confirmPassword,
    {
      message:
        "New password and confirm password do not match.",

      path: [
        "confirmPassword",
      ],
    },
  );

/*
 * =====================================
 * PATCH
 * /api/admin/settings
 * =====================================
 */

export async function PATCH(
  request: Request,
) {
  try {
    /*
     * =================================
     * ADMIN AUTH
     * =================================
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
      user.role !== "ADMIN"
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
     * =================================
     * REQUEST BODY
     * =================================
     */

    const body =
      await request.json();

    /*
     * =================================
     * PROFILE UPDATE
     * =================================
     */

    if (
      body.action ===
      "profile"
    ) {
      const validation =
        profileSchema.safeParse(
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
              "Invalid profile information.",
          },
          {
            status: 400,
          },
        );
      }

      const {
        fullName,
      } = validation.data;

      await db.execute<
        ResultSetHeader
      >(
        `
          UPDATE users

          SET full_name = ?

          WHERE id = ?
        `,
        [
          fullName,
          user.id,
        ],
      );

      return NextResponse.json(
        {
          success: true,

          message:
            "Admin profile updated successfully.",
        },
        {
          status: 200,
        },
      );
    }

    /*
     * =================================
     * PASSWORD CHANGE
     * =================================
     */

    if (
      body.action ===
      "password"
    ) {
      const validation =
        passwordSchema.safeParse(
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
              "Invalid password information.",
          },
          {
            status: 400,
          },
        );
      }

      const {
        currentPassword,
        newPassword,
      } = validation.data;

      /*
       * GET CURRENT HASH
       */

      const [rows] =
        await db.execute<
          PasswordRow[]
        >(
          `
            SELECT
              password_hash

            FROM users

            WHERE id = ?

            LIMIT 1
          `,
          [
            user.id,
          ],
        );

      if (
        rows.length === 0
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Admin account was not found.",
          },
          {
            status: 404,
          },
        );
      }

      const passwordHash =
        rows[0]
          .password_hash;

      if (!passwordHash) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Password change is not available for this account.",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * VERIFY CURRENT PASSWORD
       */

      const currentMatches =
        await bcrypt.compare(
          currentPassword,
          passwordHash,
        );

      if (
        !currentMatches
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Current password is incorrect.",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * PREVENT SAME PASSWORD
       */

      const samePassword =
        await bcrypt.compare(
          newPassword,
          passwordHash,
        );

      if (
        samePassword
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "New password must be different from the current password.",
          },
          {
            status: 400,
          },
        );
      }

      /*
       * HASH NEW PASSWORD
       */

      const newPasswordHash =
        await bcrypt.hash(
          newPassword,
          12,
        );

      /*
       * UPDATE PASSWORD
       */

      await db.execute<
        ResultSetHeader
      >(
        `
          UPDATE users

          SET password_hash = ?

          WHERE id = ?
        `,
        [
          newPasswordHash,
          user.id,
        ],
      );

      return NextResponse.json(
        {
          success: true,

          message:
            "Password changed successfully.",
        },
        {
          status: 200,
        },
      );
    }

    /*
     * =================================
     * INVALID ACTION
     * =================================
     */

    return NextResponse.json(
      {
        success: false,

        message:
          "Invalid settings action.",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error(
      "Admin settings error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to update settings.",
      },
      {
        status: 500,
      },
    );
  }
}