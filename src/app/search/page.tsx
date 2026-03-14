"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Post, User } from "@/types";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import PostCard from "@/components/PostCard";
import CommentPanel from "@/components/CommentPanel";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="page-wrapper items-center"><p className="text-muted">読み込み中...</p></div>}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searched, setSearched] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!data.user) { router.push("/login"); return; }
      setCurrentUser(data.user);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery);
  }, [initialQuery]);

  const doSearch = async (q: string) => {
    if (q.trim() === "") return;
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setUsers(data.users);
    setPosts(data.posts);
    setSearched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() === "") return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    doSearch(query);
  };

  const handleLike = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    await fetch(`/api/posts/${id}/like`, { method: post.isLiked ? "DELETE" : "POST" });
    setPosts(posts.map((p) => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const handleRepost = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    await fetch(`/api/posts/${id}/repost`, { method: post.isReposted ? "DELETE" : "POST" });
    setPosts(posts.map((p) => p.id === id ? { ...p, isReposted: !p.isReposted, reposts: p.isReposted ? p.reposts - 1 : p.reposts + 1 } : p));
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    if (activeCommentPostId === id) setActiveCommentPostId(null);
    setPosts(posts.filter((p) => p.id !== id));
  };

  const handleComment = (id: string) => {
    setActiveCommentPostId(activeCommentPostId === id ? null : id);
  };

  const handleBookmark = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    await fetch("/api/bookmarks", {
      method: post.isBookmarked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: id }),
    });
    setPosts(posts.map((p) => p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p));
  };

  if (!currentUser) {
    return <div className="page-wrapper items-center"><p className="text-muted">読み込み中...</p></div>;
  }

  return (
    <div className="page-wrapper">
      <Sidebar currentUser={currentUser} />

      <main className="main-column">
        <header className="sticky-header">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ユーザーや投稿を検索..."
              className="input-round flex-1"
            />
            <button type="submit" disabled={query.trim() === ""} className="btn-primary px-4 py-2 text-sm">
              検索
            </button>
          </form>
        </header>

        {/* ユーザー検索結果 */}
        {users.length > 0 && (
          <div className="p-4 divider">
            <h2 className="font-bold text-primary mb-3">ユーザー</h2>
            <div className="space-y-3">
              {users.map((u) => (
                <Link key={u.id} href={`/${encodeURIComponent(u.handle)}`} className="flex items-center gap-3 card-hover p-2 rounded-lg">
                  {u.avatarImage ? (
                    <img src={u.avatarImage} alt={u.name} className="avatar avatar-md" />
                  ) : (
                    <div className={`avatar avatar-md ${u.avatarColor} flex items-center justify-center text-white font-bold`}>
                      {u.name[0]}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-primary text-sm">{u.name}</div>
                    <div className="text-muted text-sm">{u.handle}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 投稿検索結果 */}
        {posts.length > 0 && (
          <>
            <div className="p-4 divider">
              <h2 className="font-bold text-primary">投稿</h2>
            </div>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser.id}
                onLike={handleLike}
                onRepost={handleRepost}
                onDelete={handleDelete}
                onComment={handleComment}
                onBookmark={handleBookmark}
                isOwn={post.user.id === currentUser.id}
                isCommentOpen={activeCommentPostId === post.id}
              />
            ))}
          </>
        )}

        {searched && users.length === 0 && posts.length === 0 && (
          <p className="p-8 text-center text-muted">「{initialQuery}」に一致する結果がありません</p>
        )}

        {!searched && (
          <p className="p-8 text-center text-muted">キーワードを入力して検索してください</p>
        )}
      </main>

      {activeCommentPostId && (
        <div className="right-sidebar">
          <div className="right-sidebar-inner">
            <CommentPanel
              key={activeCommentPostId}
              postId={activeCommentPostId}
              currentUserId={currentUser.id}
              onClose={() => setActiveCommentPostId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
