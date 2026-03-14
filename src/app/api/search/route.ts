import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function GET(request: Request) {
  const sessionUser = await getSessionUser();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (q === "") {
    return NextResponse.json({ users: [], posts: [] });
  }

  const keyword = `%${q}%`;

  // ユーザー検索
  const { rows: users } = await pool.query(
    `SELECT id, name, handle, avatar_color, avatar_image
     FROM users
     WHERE name ILIKE $1 OR handle ILIKE $1
     ORDER BY name ASC
     LIMIT 10`,
    [keyword]
  );

  // 投稿検索
  const { rows: posts } = await pool.query(
    `SELECT p.*, u.name AS user_name, u.handle, u.avatar_color, u.avatar_image,
       (SELECT COUNT(*) FROM reposts r WHERE r.post_id = p.id) AS repost_count,
       (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.content ILIKE $1
     ORDER BY p.created_at DESC
     LIMIT 30`,
    [keyword]
  );

  // ブックマーク・リポスト状態
  let bookmarkedIds: Set<number> = new Set();
  let repostedIds: Set<number> = new Set();
  if (sessionUser) {
    const { rows: myBookmarks } = await pool.query("SELECT post_id FROM bookmarks WHERE user_id = $1", [sessionUser.id]);
    bookmarkedIds = new Set(myBookmarks.map((r: Record<string, unknown>) => Number(r.post_id)));
    const { rows: myReposts } = await pool.query("SELECT post_id FROM reposts WHERE user_id = $1", [sessionUser.id]);
    repostedIds = new Set(myReposts.map((r: Record<string, unknown>) => Number(r.post_id)));
  }

  return NextResponse.json({
    users: users.map((u: Record<string, unknown>) => ({
      id: String(u.id),
      name: u.name,
      handle: u.handle,
      avatarColor: u.avatar_color,
      avatarImage: u.avatar_image || undefined,
    })),
    posts: posts.map((row: Record<string, unknown>) => ({
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
      isBookmarked: bookmarkedIds.has(Number(row.id)),
    })),
  });
}
