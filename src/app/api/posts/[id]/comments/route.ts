import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";

// ========================================
// GET /api/posts/[id]/comments — 「コメント一覧をください」窓口
// ========================================
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { rows } = await pool.query(
    `SELECT c.*, u.name, u.handle, u.avatar_color, u.avatar_image
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC`,
    [id]
  );

  const comments = rows.map((row: Record<string, unknown>) => ({
    id: String(row.id),
    user: {
      id: String(row.user_id),
      name: row.name,
      handle: row.handle,
      avatarColor: row.avatar_color,
      avatarImage: row.avatar_image || undefined,
    },
    content: row.content,
    createdAt: new Date(row.created_at as string).toISOString(),
  }));

  return NextResponse.json(comments);
}

// ========================================
// POST /api/posts/[id]/comments — 「コメントします」窓口
// ========================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  const { content } = await request.json();
  if (!content || content.trim() === "") {
    return NextResponse.json({ error: "コメントを入力してください" }, { status: 400 });
  }

  await pool.query(
    "INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3)",
    [sessionUser.id, id, content]
  );

  return NextResponse.json({ ok: true });
}
