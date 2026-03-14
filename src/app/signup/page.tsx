"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, handle, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setIsLoading(false);
      return;
    }

    // サインアップ成功 → ホームへ
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Tuittaに登録
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-500 text-sm block mb-1">名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              required
              className="w-full bg-transparent border border-gray-600 rounded-lg px-3 py-2.5 text-white outline-none focus:border-sky-500"
              placeholder="田中太郎"
            />
          </div>

          <div>
            <label className="text-gray-500 text-sm block mb-1">ハンドル名</label>
            <div className="flex items-center border border-gray-600 rounded-lg focus-within:border-sky-500">
              <span className="text-gray-500 pl-3">@</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                maxLength={20}
                required
                className="w-full bg-transparent px-2 py-2.5 text-white outline-none"
                placeholder="tanaka"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-500 text-sm block mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={4}
              required
              className="w-full bg-transparent border border-gray-600 rounded-lg px-3 py-2.5 text-white outline-none focus:border-sky-500"
              placeholder="4文字以上"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-full transition-colors"
          >
            {isLoading ? "登録中..." : "アカウントを作成"}
          </button>
        </form>

        <p className="text-gray-500 text-sm text-center mt-6">
          既にアカウントをお持ちですか？{" "}
          <Link href="/login" className="text-sky-500 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
