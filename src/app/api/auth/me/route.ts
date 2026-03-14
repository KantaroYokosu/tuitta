import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

// ========================================
// GET /api/auth/me — 「今ログインしているのは誰？」窓口
// ========================================
export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: String(user.id),
      name: user.name,
      handle: user.handle,
      avatarColor: user.avatarColor,
      avatarImage: user.avatarImage,
    },
  });
}
