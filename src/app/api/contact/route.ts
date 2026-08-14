import { NextResponse } from "next/server";

import type {
  ResultSetHeader,
} from "mysql2";

import { z } from "zod";

import db from "@/lib/db";

/*
 * =====================================
 * VALIDATION
 * =====================================
 */

const contactSchema =
  z.object({
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

    email: z
      .string()
      .trim()
      .email(
        "Please enter a valid email address.",
      )
      .max(
        180,
        "Email address is too long.",
      ),

    phone: z
      .string()
      .trim()
      .max(
        30,
        "Phone number is too long.",
      )
      .optional()
      .or(z.literal("")),

    subject: z
      .string()
      .trim()
      .min(
        3,
        "Subject must be at least 3 characters.",
      )
      .max(
        180,
        "Subject is too long.",
      ),

    message: z
      .string()
      .trim()
      .min(
        10,
        "Message must be at least 10 characters.",
      )
      .max(
        5000,
        "Message is too long.",
      ),
  });

/*
 * =====================================
 * POST
 *
 * POST /api/contact
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

    /*
     * =================================
     * VALIDATION
     * =================================
     */

    const validation =
      contactSchema.safeParse(
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
            "Invalid contact information.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      fullName,
      email,
      phone,
      subject,
      message,
    } = validation.data;

    /*
     * =================================
     * DATABASE INSERT
     * =================================
     */

    const [result] =
      await db.execute<
        ResultSetHeader
      >(
        `
          INSERT INTO contact_messages (
            full_name,
            email,
            phone,
            subject,
            message
          )

          VALUES (
            ?, ?, ?, ?, ?
          )
        `,
        [
          fullName,

          email.toLowerCase(),

          phone || null,

          subject,

          message,
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
          "Your message has been sent successfully.",

        messageId:
          result.insertId,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Contact message error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to send your message. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}