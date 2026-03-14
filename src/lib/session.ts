import { cookies } from "next/headers";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// セッション = 「入店済みの腕輪」
// ここではブラウザの Cookie に userId を保存するシンプルな方式
// （本番アプリでは JWT や暗号化セッションを使うべき）

export type SessionUser = {
  id: number;
  name: string;
  handle: string;
  avatarColor: string;
  avatarImage?: string;
};

// Cookie からログイン中のユーザーを取得する
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get("userId");

  if (!userIdCookie) return null;

  const userId = Number(userIdCookie.value);
  if (isNaN(userId)) return null;

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, handle, avatar_color, avatar_image FROM users WHERE id = ?",
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
