import crypto from "crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import db from "@/lib/db";
import {
  sendPasswordResetEmail,
} from "@/lib/mail";

/*
 * =====================================
 * VALIDATION
 * =====================================
 */

const forgotPasswordSchema =
  z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(
        "Please enter a valid email address.",
      )
      .max(255),
  });

/*
 * =====================================
 * USER TYPE
 * =====================================
 */

interface UserRow
  extends RowDataPacket {
  id: number;

  full_name: string;

  email: string;

  password_hash:
    | string
    | null;

  is_active:
    | number
    | boolean;
}

/*
 * =====================================
 * POST
 *
 * FORGOT PASSWORD
 * =====================================
 */

export async function POST(
  request: Request,
) {
  try {
    /*
     * =================================
     * REQUEST BODY
     * =================================
     */

    const body =
      await request.json();

    const validation =
      forgotPasswordSchema.safeParse(
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
            "Please enter a valid email address.",
        },
        {
          status: 400,
        },
      );
    }

    const { email } =
      validation.data;

    /*
     * =================================
     * GENERIC SUCCESS MESSAGE
     *
     * Do not reveal whether
     * email exists or not.
     * =================================
     */

    const successResponse = {
      success: true,

      message:
        "If an account exists with this email, a password reset link has been sent.",
    };

    /*
     * =================================
     * FIND USER
     * =================================
     */

    const [users] =
      await db.execute<
        UserRow[]
      >(
        `
          SELECT
            id,
            full_name,
            email,
            password_hash,
            is_active

          FROM users

          WHERE email = ?

          LIMIT 1
        `,
        [
          email,
        ],
      );

    /*
     * =================================
     * USER NOT FOUND
     *
     * Return generic response.
     * =================================
     */

    if (
      users.length === 0
    ) {
      return NextResponse.json(
        successResponse,
        {
          status: 200,
        },
      );
    }

    const user =
      users[0];

    /*
     * =================================
     * INACTIVE ACCOUNT
     * =================================
     */

    if (
      !Boolean(
        user.is_active,
      )
    ) {
      return NextResponse.json(
        successResponse,
        {
          status: 200,
        },
      );
    }

    /*
     * =================================
     * PASSWORD LOGIN CHECK
     *
     * If account has no password,
     * do not create reset token.
     * =================================
     */

    if (
      !user.password_hash
    ) {
      return NextResponse.json(
        successResponse,
        {
          status: 200,
        },
      );
    }

    /*
     * =================================
     * CREATE SECURE TOKEN
     *
     * Raw token goes to email.
     * Hash goes to database.
     * =================================
     */

    const rawToken =
      crypto
        .randomBytes(32)
        .toString("hex");

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    /*
     * =================================
     * TOKEN EXPIRY
     *
     * 15 minutes
     * =================================
     */

    const expiresAt =
      new Date(
        Date.now() +
          15 *
            60 *
            1000,
      );

    /*
     * =================================
     * REMOVE OLD TOKENS
     *
     * One active reset request
     * per user.
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
        user.id,
      ],
    );

    /*
     * =================================
     * STORE HASHED TOKEN
     * =================================
     */

    await db.execute<
      ResultSetHeader
    >(
      `
        INSERT INTO
          password_reset_tokens (
            user_id,
            token_hash,
            expires_at
          )

        VALUES (?, ?, ?)
      `,
      [
        user.id,
        tokenHash,
        expiresAt,
      ],
    );

    /*
     * =================================
     * SEND RESET EMAIL
     * =================================
     */

    try {
      await sendPasswordResetEmail(
        {
          email:
            user.email,

          token:
            rawToken,

          name:
            user.full_name,
        },
      );
    } catch (mailError) {
      console.error(
        "Password reset email error:",
        mailError,
      );

      /*
       * Delete unusable token
       * if email sending failed.
       */

      await db.execute(
        `
          DELETE FROM
            password_reset_tokens

          WHERE
            user_id = ?
            AND token_hash = ?
        `,
        [
          user.id,
          tokenHash,
        ],
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "Unable to send the password reset email right now. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * =================================
     * SUCCESS
     * =================================
     */

    return NextResponse.json(
      successResponse,
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Forgot password error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Something went wrong. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}