import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ========================================
// GET /api/posts — 「投稿一覧をください」窓口
// ========================================
export async function GET() {
  const { rows } = await pool.query(
    `SELECT p.*, u.name AS user_name, u.handle, u.avatar_color, u.avatar_image
     FROM posts p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC`
  );

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
    createdAt: new Date(row.created_at as string).toISOString(),
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
