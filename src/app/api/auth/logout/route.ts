import { NextResponse } from "next/server";

// ========================================
// POST /api/auth/logout — 「退店します」窓口（腕輪を外す）
// ========================================
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("userId");
  return response;
}
