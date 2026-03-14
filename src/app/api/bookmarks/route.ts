import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";

// GET /api/bookmarks — ブックマーク一覧
export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  const { rows } = await pool.query(
    `SELECT p.*, u.name AS user_name, u.handle, u.avatar_color, u.avatar_image,
       (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.id) AS repost_count,
       (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
     FROM bookmarks b
     JOIN posts p ON b.post_id = p.id
     JOIN users u ON p.user_id = u.id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [sessionUser.id]
  );

  let repostedIds: Set<number> = new Set();
  const { rows: myReposts } = await pool.query("SELECT post_id FROM reposts WHERE user_id = $1", [sessionUser.id]);
  repostedIds = new Set(myReposts.map((r: Record<string, unknown>) => Number(r.post_id)));

  const posts = rows.map((row: Record<string, unknown>) => ({
    id: String(row.id),
    user: {
      id: String(row.user_id),
      name: row.user_name,
      handle: row.handle,
      avatarColor: row.avatar_color,
      avatarImage: row.avatar_image || undefined,
    },
    content: row.content,
    imageUrl: row.image_url || undefined,
    likes: row.likes,
    isLiked: false,
    reposts: Number(row.repost_count),
    isReposted: repostedIds.has(Number(row.id)),
    comments: Number(row.comment_count),
    createdAt: new Date(row.created_at as string).toISOString(),
    isBookmarked: true,
  }));

  return NextResponse.json(posts);
}

// POST /api/bookmarks — ブックマーク追加
export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  const { postId } = await request.json();
  await pool.query(
    "INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [sessionUser.id, postId]
  );

  return NextResponse.json({ ok: true });
}

// DELETE /api/bookmarks — ブックマーク削除
export async function DELETE(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  const { postId } = await request.json();
  await pool.query(
    "DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2",
    [sessionUser.id, postId]
  );

  return NextResponse.json({ ok: true });
}
