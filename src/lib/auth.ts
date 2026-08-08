import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "pentatone_session";

export type SessionPayload = {
  userId: number;
  fullName: string;
  email: string;
  role: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload,
  expiresInSeconds: number,
) {
  return new SignJWT({
    userId: payload.userId,
    fullName: payload.fullName,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(
      Math.floor(Date.now() / 1000) + expiresInSeconds,
    )
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      getSecret(),
      {
        algorithms: ["HS256"],
      },
    );

    if (
      typeof payload.userId !== "number" ||
      typeof payload.fullName !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      fullName: payload.fullName,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}