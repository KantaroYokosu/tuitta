import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ========================================
// POST /api/posts/[id]/like — 「いいねします」窓口
// ========================================
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await pool.query("UPDATE posts SET likes = likes + 1 WHERE id = $1", [id]);

  return NextResponse.json({ ok: true });
}

// ========================================
// DELETE /api/posts/[id]/like — 「いいねを取り消します」窓口
// ========================================
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await pool.query(
    "UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = $1",
    [id]
  );

  return NextResponse.json({ ok: true });
}
