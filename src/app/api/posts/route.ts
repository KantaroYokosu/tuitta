import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// GET /api/posts — 「投稿一覧をください」窓口
// ========================================
export async function GET() {
  // posts テーブルと users テーブルを JOIN（結合）して取得
  // → 投稿の棚とユーザーの棚を、user_id で紐づけて一緒に取り出す
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.*, u.name AS user_name, u.handle, u.avatar_color, u.avatar_image
     FROM posts p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC`
  );

  const posts = rows.map((row) => ({
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
    createdAt: new Date(row.created_at).toISOString(),
  }));

  return NextResponse.json(posts);
}

// ========================================
// POST /api/posts — 「新しい投稿をお願いします」窓口
// ========================================
export async function POST(request: Request) {
  const body = await request.json();
  const { userId, content, imageUrl } = body;

  // user_id で誰の投稿かを紐づけて保存
  await pool.query(
    "INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)",
    [userId, content, imageUrl || null]
  );

  return NextResponse.json({ ok: true });
}
