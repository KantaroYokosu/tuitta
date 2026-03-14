import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";

// ========================================
// POST /api/posts/[id]/repost — 「リポストします」窓口
// ========================================
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  await pool.query(
    "INSERT INTO reposts (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [sessionUser.id, id]
  );

  return NextResponse.json({ ok: true });
}

// ========================================
// DELETE /api/posts/[id]/repost — 「リポストを取り消します」窓口
// ========================================
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  await pool.query(
    "DELETE FROM reposts WHERE user_id = $1 AND post_id = $2",
    [sessionUser.id, id]
  );

  return NextResponse.json({ ok: true });
}
