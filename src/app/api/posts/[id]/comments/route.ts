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

  type Row = Record<string, unknown>;
  type CommentData = {
    id: string;
    user: { id: string; name: unknown; handle: unknown; avatarColor: unknown; avatarImage: unknown };
    content: unknown;
    createdAt: string;
    parentId: string | null;
    children: CommentData[];
  };

  const toComment = (row: Row): CommentData => ({
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
    parentId: row.parent_id ? String(row.parent_id) : null,
    children: [],
  });

  const all = rows.map(toComment);
  const topLevel = all.filter((c) => !c.parentId);
  const childMap = new Map<string, CommentData[]>();
  for (const c of all) {
    if (c.parentId) {
      const arr = childMap.get(c.parentId) || [];
      arr.push(c);
      childMap.set(c.parentId, arr);
    }
  }
  for (const t of topLevel) {
    t.children = childMap.get(t.id) || [];
  }

  return NextResponse.json(topLevel);
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

  const { content, parentId } = await request.json();
  if (!content || content.trim() === "") {
    return NextResponse.json({ error: "コメントを入力してください" }, { status: 400 });
  }

  await pool.query(
    "INSERT INTO comments (user_id, post_id, content, parent_id) VALUES ($1, $2, $3, $4)",
    [sessionUser.id, id, content, parentId || null]
  );

  return NextResponse.json({ ok: true });
}

// ========================================
// DELETE /api/posts/[id]/comments — 「コメントを削除します」窓口
// ========================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  const { commentId } = await request.json();

  // 自分のコメントだけ削除できる
  const { rows } = await pool.query(
    "SELECT user_id FROM comments WHERE id = $1",
    [commentId]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "コメントが見つかりません" }, { status: 404 });
  }

  if (String(rows[0].user_id) !== String(sessionUser.id)) {
    return NextResponse.json({ error: "他人のコメントは削除できません" }, { status: 403 });
  }

  await pool.query("DELETE FROM comments WHERE id = $1 AND user_id = $2", [commentId, sessionUser.id]);

  return NextResponse.json({ ok: true });
}
