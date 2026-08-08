import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to log out.",
      },
      { status: 500 },
    );
  }
}