import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";

// ========================================
// POST /api/follow — 「この人をフォローします」窓口
// ========================================
export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  const { followingId } = await request.json();

  // 自分自身はフォローできない
  if (sessionUser.id === Number(followingId)) {
    return NextResponse.json({ error: "自分自身はフォローできません" }, { status: 400 });
  }

  // フォロー登録（既にフォロー済みなら何もしない）
  await pool.query(
    "INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [sessionUser.id, followingId]
  );

  return NextResponse.json({ ok: true });
}

// ========================================
// DELETE /api/follow — 「この人のフォローを解除します」窓口
// ========================================
export async function DELETE(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  const { followingId } = await request.json();

  await pool.query(
    "DELETE FROM follows WHERE follower_id = $1 AND following_id = $2",
    [sessionUser.id, followingId]
  );

  return NextResponse.json({ ok: true });
}
