import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";

// ========================================
// POST /api/auth/signup — 「会員カードを作ってください」窓口
// ========================================
export async function POST(request: Request) {
  const body = await request.json();
  const { name, handle, password } = body;

  // バリデーション（入力チェック）
  if (!name || !handle || !password) {
    return NextResponse.json({ error: "全ての項目を入力してください" }, { status: 400 });
  }

  if (password.length < 4) {
    return NextResponse.json({ error: "パスワードは4文字以上にしてください" }, { status: 400 });
  }

  // ハンドルに @ を自動付与
  const fullHandle = handle.startsWith("@") ? handle : `@${handle}`;

  // 同じハンドルが既に存在しないかチェック
  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE handle = ?",
    [fullHandle]
  );

  if (existing.length > 0) {
    return NextResponse.json({ error: "このハンドル名は既に使われています" }, { status: 400 });
  }

  // パスワードをハッシュ化（ミンチにする）
  const passwordHash = await bcrypt.hash(password, 10);

  // ユーザーを金庫に登録
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO users (name, handle, password_hash) VALUES (?, ?, ?)",
    [name, fullHandle, passwordHash]
  );

  // ログイン状態にする（腕輪をつける）
  const response = NextResponse.json({ ok: true });
  response.cookies.set("userId", String(result.insertId), {
    httpOnly: true,  // JavaScriptからアクセスできないようにする（セキュリティ）
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7日間有効
  });

  return response;
}
