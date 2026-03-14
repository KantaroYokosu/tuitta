import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";

// ========================================
// DELETE /api/posts/[id] — 「この投稿を削除してください」窓口
// ========================================
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // ログインしているか確認
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  // 自分の投稿だけ削除できる
  const { rows } = await pool.query(
    "SELECT user_id FROM posts WHERE id = $1",
    [id]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
  }

  if (String(rows[0].user_id) !== String(sessionUser.id)) {
    return NextResponse.json({ error: "他人の投稿は削除できません" }, { status: 403 });
  }

  await pool.query("DELETE FROM posts WHERE id = $1 AND user_id = $2", [id, sessionUser.id]);

  return NextResponse.json({ ok: true });
}
