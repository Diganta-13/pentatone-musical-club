import { NextResponse } from "next/server";

import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";

import db from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

type MessageRow = RowDataPacket & {
  id: number;
  status: "UNREAD" | "READ";
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
    return null;
  }

  if (
    user.role !== "ADMIN"
  ) {
    return null;
  }

  return user;
}

/*
 * =====================================
 * PATCH
 *
 * Mark message READ / UNREAD
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
    const admin =
      await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized access.",
        },
        {
          status: 401,
        },
      );
    }

    const { id } =
      await context.params;

    const messageId =
      Number(id);

    if (
      !Number.isInteger(
        messageId,
      ) ||
      messageId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid message ID.",
        },
        {
          status: 400,
        },
      );
    }

    const body =
      await request.json();

    const status =
      body.status;

    if (
      status !== "READ" &&
      status !== "UNREAD"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid message status.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * CHECK MESSAGE
     */

    const [rows] =
      await db.execute<
        MessageRow[]
      >(
        `
          SELECT
            id,
            status
          FROM contact_messages
          WHERE id = ?
          LIMIT 1
        `,
        [messageId],
      );

    if (
      rows.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * UPDATE STATUS
     */

    await db.execute<
      ResultSetHeader
    >(
      `
        UPDATE contact_messages
        SET status = ?
        WHERE id = ?
      `,
      [
        status,
        messageId,
      ],
    );

    return NextResponse.json({
      success: true,

      message:
        status === "READ"
          ? "Message marked as read."
          : "Message marked as unread.",
    });
  } catch (error) {
    console.error(
      "Update contact message error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update message.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * =====================================
 * DELETE
 *
 * Delete contact message
 * =====================================
 */

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const admin =
      await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized access.",
        },
        {
          status: 401,
        },
      );
    }

    const { id } =
      await context.params;

    const messageId =
      Number(id);

    if (
      !Number.isInteger(
        messageId,
      ) ||
      messageId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid message ID.",
        },
        {
          status: 400,
        },
      );
    }

    const [result] =
      await db.execute<
        ResultSetHeader
      >(
        `
          DELETE FROM contact_messages
          WHERE id = ?
        `,
        [messageId],
      );

    if (
      result.affectedRows === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Message deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete contact message error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete message.",
      },
      {
        status: 500,
      },
    );
  }
}