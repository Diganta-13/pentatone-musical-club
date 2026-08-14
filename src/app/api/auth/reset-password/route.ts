import crypto from "crypto";

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import db from "@/lib/db";

/*
 * =====================================
 * VALIDATION
 * =====================================
 */

const resetPasswordSchema =
  z
    .object({
      token: z
        .string()
        .trim()
        .min(1),

      password: z
        .string()
        .min(
          8,
          "Password must contain at least 8 characters.",
        )
        .max(
          100,
          "Password is too long.",
        ),

      confirmPassword: z
        .string()
        .min(1),
    })
    .refine(
      (data) =>
        data.password ===
        data.confirmPassword,
      {
        message:
          "Passwords do not match.",

        path: [
          "confirmPassword",
        ],
      },
    );

/*
 * =====================================
 * TOKEN TYPE
 * =====================================
 */

interface ResetTokenRow
  extends RowDataPacket {
  id: number;

  user_id: number;

  token_hash: string;

  expires_at: Date;
}

/*
 * =====================================
 * POST
 * =====================================
 */

export async function POST(
  request: Request,
) {
  try {
    /*
     * =================================
     * BODY
     * =================================
     */

    const body =
      await request.json();

    const validation =
      resetPasswordSchema.safeParse(
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
            "Invalid password reset request.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      token,
      password,
    } =
      validation.data;

    /*
     * =================================
     * HASH RECEIVED TOKEN
     * =================================
     */

    const tokenHash =
      crypto
        .createHash(
          "sha256",
        )
        .update(token)
        .digest("hex");

    /*
     * =================================
     * FIND VALID TOKEN
     * =================================
     */

    const [tokens] =
      await db.execute<
        ResetTokenRow[]
      >(
        `
          SELECT
            id,
            user_id,
            token_hash,
            expires_at

          FROM password_reset_tokens

          WHERE
            token_hash = ?
            AND expires_at > NOW()

          LIMIT 1
        `,
        [
          tokenHash,
        ],
      );

    if (
      tokens.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This password reset link is invalid or has expired.",
        },
        {
          status: 400,
        },
      );
    }

    const resetToken =
      tokens[0];

    /*
     * =================================
     * HASH NEW PASSWORD
     * =================================
     */

    const passwordHash =
      await bcrypt.hash(
        password,
        12,
      );

    /*
     * =================================
     * UPDATE PASSWORD
     * =================================
     */

    const [result] =
      await db.execute<
        ResultSetHeader
      >(
        `
          UPDATE users

          SET password_hash = ?

          WHERE id = ?
        `,
        [
          passwordHash,
          resetToken.user_id,
        ],
      );

    if (
      result.affectedRows ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Unable to update password.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * =================================
     * DELETE ALL RESET TOKENS
     *
     * One-time use
     * =================================
     */

    await db.execute<
      ResultSetHeader
    >(
      `
        DELETE FROM
          password_reset_tokens

        WHERE user_id = ?
      `,
      [
        resetToken.user_id,
      ],
    );

    /*
     * =================================
     * SUCCESS
     * =================================
     */

    return NextResponse.json(
      {
        success: true,

        message:
          "Your password has been reset successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Reset password error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Something went wrong while resetting your password.",
      },
      {
        status: 500,
      },
    );
  }
}