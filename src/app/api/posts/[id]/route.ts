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

  // 金庫番に「伝票番号○番を棚から捨てて」と指示
  await pool.query("DELETE FROM posts WHERE id = ?", [id]);

  return NextResponse.json({ ok: true });
}
