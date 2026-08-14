import nodemailer from "nodemailer";

/*
 * =====================================
 * ENVIRONMENT VARIABLES
 * =====================================
 */

const mailUser =
  process.env.MAIL_USER;

const mailAppPassword =
  process.env.MAIL_APP_PASSWORD;

const appUrl =
  process.env.APP_URL ||
  "http://localhost:3000";

/*
 * =====================================
 * MAIL TRANSPORTER
 * =====================================
 */

const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: mailUser,
      pass: mailAppPassword,
    },
  });

/*
 * =====================================
 * CHECK MAIL CONFIG
 * =====================================
 */

function ensureMailConfig() {
  if (
    !mailUser ||
    !mailAppPassword
  ) {
    throw new Error(
      "MAIL_USER or MAIL_APP_PASSWORD is missing.",
    );
  }
}

/*
 * =====================================
 * SEND PASSWORD RESET EMAIL
 * =====================================
 */

export async function sendPasswordResetEmail({
  email,
  token,
  name,
}: {
  email: string;
  token: string;
  name?: string | null;
}) {
  ensureMailConfig();

  /*
   * =================================
   * RESET URL
   * =================================
   */

  const resetUrl =
    new URL(
      "/reset-password",
      appUrl,
    );

  resetUrl.searchParams.set(
    "token",
    token,
  );

  /*
   * =================================
   * EMAIL
   * =================================
   */

  await transporter.sendMail({
    from: `"Pentatone Musical Club" <${mailUser}>`,

    to: email,

    subject:
      "Reset Your Pentatone Password",

    text: `
Hello ${name || "there"},

We received a request to reset your Pentatone Musical Club account password.

Reset your password using this link:

${resetUrl.toString()}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.

Pentatone Musical Club
Sylhet Engineering College
    `.trim(),

    html: `
<!DOCTYPE html>
<html>
  <body
    style="
      margin:0;
      padding:0;
      background:#f4f4f5;
      font-family:Arial,Helvetica,sans-serif;
      color:#111827;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        padding:40px 15px;
        background:#f4f4f5;
      "
    >
      <tr>
        <td align="center">

          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width:560px;
              background:#ffffff;
              border-radius:16px;
              overflow:hidden;
              box-shadow:
                0 10px 30px rgba(0,0,0,0.08);
            "
          >

            <!-- HEADER -->

            <tr>
              <td
                style="
                  background:#d40000;
                  padding:28px 35px;
                  text-align:center;
                  color:#ffffff;
                "
              >
                <div
                  style="
                    font-size:22px;
                    font-weight:800;
                  "
                >
                  PENTATONE
                </div>

                <div
                  style="
                    margin-top:5px;
                    font-size:11px;
                    letter-spacing:2px;
                    opacity:0.85;
                  "
                >
                  MUSICAL CLUB
                </div>
              </td>
            </tr>

            <!-- BODY -->

            <tr>
              <td
                style="
                  padding:40px 38px;
                "
              >

                <h2
                  style="
                    margin:0;
                    font-size:24px;
                    color:#111827;
                  "
                >
                  Reset your password
                </h2>

                <p
                  style="
                    margin-top:22px;
                    font-size:14px;
                    line-height:1.7;
                    color:#4b5563;
                  "
                >
                  Hello ${
                    name
                      ? escapeHtml(name)
                      : "there"
                  },
                </p>

                <p
                  style="
                    font-size:14px;
                    line-height:1.7;
                    color:#4b5563;
                  "
                >
                  We received a request to reset
                  the password for your Pentatone
                  Musical Club account.
                </p>

                <!-- BUTTON -->

                <div
                  style="
                    margin:32px 0;
                    text-align:center;
                  "
                >
                  <a
                    href="${resetUrl.toString()}"
                    style="
                      display:inline-block;
                      padding:14px 28px;
                      background:#d40000;
                      color:#ffffff;
                      text-decoration:none;
                      border-radius:8px;
                      font-size:13px;
                      font-weight:700;
                    "
                  >
                    Reset Password
                  </a>
                </div>

                <p
                  style="
                    font-size:13px;
                    line-height:1.7;
                    color:#6b7280;
                  "
                >
                  This password reset link will
                  expire in
                  <strong>15 minutes</strong>.
                </p>

                <p
                  style="
                    font-size:13px;
                    line-height:1.7;
                    color:#6b7280;
                  "
                >
                  If you did not request a
                  password reset, you can safely
                  ignore this email.
                </p>

                <hr
                  style="
                    border:none;
                    border-top:1px solid #e5e7eb;
                    margin:30px 0;
                  "
                />

                <p
                  style="
                    margin:0;
                    font-size:11px;
                    line-height:1.6;
                    color:#9ca3af;
                  "
                >
                  If the button does not work,
                  copy and paste this link into
                  your browser:
                </p>

                <p
                  style="
                    word-break:break-all;
                    font-size:11px;
                    line-height:1.6;
                    color:#d40000;
                  "
                >
                  ${resetUrl.toString()}
                </p>

              </td>
            </tr>

            <!-- FOOTER -->

            <tr>
              <td
                style="
                  padding:22px 30px;
                  text-align:center;
                  background:#111827;
                  color:#9ca3af;
                  font-size:11px;
                "
              >
                Pentatone Musical Club
                <br />
                Sylhet Engineering College
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
    `.trim(),
  });
}

/*
 * =====================================
 * BASIC HTML ESCAPE
 * =====================================
 */

function escapeHtml(
  value: string,
) {
  return value
    .replace(
      /&/g,
      "&amp;",
    )
    .replace(
      /</g,
      "&lt;",
    )
    .replace(
      />/g,
      "&gt;",
    )
    .replace(
      /"/g,
      "&quot;",
    )
    .replace(
      /'/g,
      "&#039;",
    );
}