import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// ========================================
// GET /api/users/@tanaka — 「このユーザーの情報をください」窓口
// ========================================
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  // handle は URL から来るので "@" が "%40" にエンコードされている場合がある
  const decodedHandle = decodeURIComponent(handle);

  // ユーザー情報を取得
  const [users] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE handle = ?",
    [decodedHandle]
  );

  if (users.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const user = users[0];

  // そのユーザーの投稿を取得
  const [posts] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC",
    [user.id]
  );

  return NextResponse.json({
    user: {
      id: String(user.id),
      name: user.name,
      handle: user.handle,
      avatarColor: user.avatar_color,
      avatarImage: user.avatar_image || undefined,
      headerImage: user.header_image || undefined,
      bio: user.bio || "",
      createdAt: new Date(user.created_at).toISOString(),
    },
    posts: posts.map((row) => ({
      id: String(row.id),
      user: {
        id: String(user.id),
        name: user.name,
        handle: user.handle,
        avatarColor: user.avatar_color,
        avatarImage: user.avatar_image || undefined,
      },
      content: row.content,
      imageUrl: row.image_url || undefined,
      likes: row.likes,
      isLiked: false,
      createdAt: new Date(row.created_at).toISOString(),
    })),
  });
}

// ========================================
// PUT /api/users/@myself — 「プロフィールを更新してください」窓口
// ========================================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle);
  const body = await request.json();
  const { name, bio, avatarImage, headerImage } = body;

  // 金庫番に「このユーザーの情報を書き換えて」と指示
  await pool.query(
    "UPDATE users SET name = ?, bio = ?, avatar_image = ?, header_image = ? WHERE handle = ?",
    [name, bio, avatarImage || null, headerImage || null, decodedHandle]
  );

  return NextResponse.json({ ok: true });
}
