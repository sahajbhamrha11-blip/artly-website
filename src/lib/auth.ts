import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from "./session";

export async function createSession(user: { id: string; email: string }) {
  const token = await signSession({ sub: user.id, email: user.email });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession() {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

/** Use at the top of every admin server action / route handler. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const user = await db.adminUser.findUnique({ where: { id: session.sub } });
  if (!user) redirect("/admin/login");
  return user;
}

/** Same as requireAdmin but returns null instead of redirecting (for API routes). */
export async function getAdminOrNull() {
  const session = await getSession();
  if (!session) return null;
  return db.adminUser.findUnique({ where: { id: session.sub } });
}
