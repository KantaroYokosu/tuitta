import { cookies } from "next/headers";
import pool from "@/lib/db";

export type SessionUser = {
  id: number;
  name: string;
  handle: string;
  avatarColor: string;
  avatarImage?: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get("userId");

  if (!userIdCookie) return null;

  const userId = Number(userIdCookie.value);
  if (isNaN(userId)) return null;

  const { rows } = await pool.query(
    "SELECT id, name, handle, avatar_color, avatar_image FROM users WHERE id = $1",
    [userId]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    avatarColor: row.avatar_color,
    avatarImage: row.avatar_image || undefined,
  };
}
