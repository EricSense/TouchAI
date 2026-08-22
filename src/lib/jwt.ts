import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "bu_session";

export type Session = {
  userId: string;
  name: string;
  email: string;
};

export function getAuthSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(value);
}

export async function signSession(session: Session) {
  return new SignJWT({
    userId: session.userId,
    name: session.name,
    email: session.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAuthSecret());
}

export async function readSessionFromToken(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    if (!payload.userId || !payload.email || !payload.name) return null;
    return {
      userId: String(payload.userId),
      name: String(payload.name),
      email: String(payload.email),
    };
  } catch {
    return null;
  }
}
