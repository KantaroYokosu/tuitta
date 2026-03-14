import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";

// ========================================
// POST /api/auth/login — 「会員カードを見せて入店します」窓口
// ========================================
export async function POST(request: Request) {
  const body = await request.json();
  const { handle, password } = body;

  const fullHandle = handle.startsWith("@") ? handle : `@${handle}`;

  // 金庫からユーザーを探す
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, password_hash FROM users WHERE handle = ?",
    [fullHandle]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "ハンドル名またはパスワードが正しくありません" }, { status: 401 });
  }

  const user = rows[0];

  // パスワードを照合（同じ肉をミンチにして、保存済みのミンチと比較）
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return NextResponse.json({ error: "ハンドル名またはパスワードが正しくありません" }, { status: 401 });
  }

  // ログイン成功 → 腕輪（Cookie）をつける
  const response = NextResponse.json({ ok: true });
  response.cookies.set("userId", String(user.id), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
