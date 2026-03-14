import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ========================================
// DELETE /api/posts/[id] — 「この投稿を削除してください」窓口
// ========================================
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await pool.query("DELETE FROM posts WHERE id = $1", [id]);

  return NextResponse.json({ ok: true });
}
