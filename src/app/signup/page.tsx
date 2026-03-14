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

    if (!res.ok) { setError(data.error); setIsLoading(false); return; }
    router.push("/");
  };

  return (
    <div className="page-wrapper items-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Tuitta" className="w-16 h-16 rounded-xl" />
        </div>
        <h1 className="text-3xl font-bold text-primary text-center mb-8">Tuittaに登録</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-muted text-sm block mb-1">名前</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} required className="input-field" placeholder="田中太郎" />
          </div>

          <div>
            <label className="text-muted text-sm block mb-1">ハンドル名</label>
            <div className="flex items-center input-field !rounded-lg">
              <span className="text-muted mr-1">@</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                maxLength={20}
                required
                className="flex-1 bg-transparent text-primary outline-none"
                placeholder="tanaka"
              />
            </div>
          </div>

          <div>
            <label className="text-muted text-sm block mb-1">パスワード</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={4} required className="input-field" placeholder="4文字以上" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5">
            {isLoading ? "登録中..." : "アカウントを作成"}
          </button>
        </form>

        <p className="text-muted text-sm text-center mt-6">
          既にアカウントをお持ちですか？ <Link href="/login" className="text-accent hover:underline">ログイン</Link>
        </p>
      </div>
    </div>
  );
}
