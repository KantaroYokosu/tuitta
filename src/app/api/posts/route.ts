import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";

// ========================================
// GET /api/posts — 「投稿一覧をください」窓口
// ========================================
export async function GET() {
  const sessionUser = await getSessionUser();

  const { rows } = await pool.query(
    `SELECT p.*, u.name AS user_name, u.handle, u.avatar_color, u.avatar_image,
       (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.id) AS repost_count,
       (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
       (SELECT ru.name FROM reposts r2 JOIN users ru ON r2.user_id = ru.id
        WHERE r2.post_id = p.id ORDER BY r2.created_at DESC LIMIT 1) AS last_reposter_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC`
  );

  // 自分がリポスト・ブックマーク済みの投稿IDを取得
  let repostedIds: Set<number> = new Set();
  let bookmarkedIds: Set<number> = new Set();
  if (sessionUser) {
    const { rows: myReposts } = await pool.query("SELECT post_id FROM reposts WHERE user_id = $1", [sessionUser.id]);
    repostedIds = new Set(myReposts.map((r: Record<string, unknown>) => Number(r.post_id)));
    const { rows: myBookmarks } = await pool.query("SELECT post_id FROM bookmarks WHERE user_id = $1", [sessionUser.id]);
    bookmarkedIds = new Set(myBookmarks.map((r: Record<string, unknown>) => Number(r.post_id)));
  }

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
    repostedBy: row.last_reposter_name || undefined,
    isBookmarked: bookmarkedIds.has(Number(row.id)),
  }));

  return NextResponse.json(posts);
}

// ========================================
// POST /api/posts — 「新しい投稿をお願いします」窓口
// ========================================
export async function POST(request: Request) {
  const body = await request.json();
  const { userId, content, imageUrl } = body;

  await pool.query(
    "INSERT INTO posts (user_id, content, image_url) VALUES ($1, $2, $3)",
    [userId, content, imageUrl || null]
  );

  return NextResponse.json({ ok: true });
}
