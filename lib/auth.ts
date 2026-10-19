import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "album_session";
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET);

export async function createSession() {
  const token = await new SignJWT({ role: "editor" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function isAuthed() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, key());
    return true;
  } catch {
    return false;
  }
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}
