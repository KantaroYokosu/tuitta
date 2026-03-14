import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ========================================
// GET /api/users/@tanaka — 「このユーザーの情報をください」窓口
// ========================================
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle);

  const { rows: users } = await pool.query(
    "SELECT * FROM users WHERE handle = $1",
    [decodedHandle]
  );

  if (users.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const user = users[0];

  const { rows: posts } = await pool.query(
    "SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC",
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
    posts: posts.map((row: Record<string, unknown>) => ({
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
      createdAt: new Date(row.created_at as string).toISOString(),
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

  await pool.query(
    "UPDATE users SET name = $1, bio = $2, avatar_image = $3, header_image = $4 WHERE handle = $5",
    [name, bio, avatarImage || null, headerImage || null, decodedHandle]
  );

  return NextResponse.json({ ok: true });
}
