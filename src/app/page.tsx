"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Post, User } from "@/types";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ComposePost from "@/components/ComposePost";
import PostCard from "@/components/PostCard";
import CommentPanel from "@/components/CommentPanel";

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
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

  const fetchPosts = useCallback(async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  }, []);

  useEffect(() => {
    if (currentUser) fetchPosts();
  }, [currentUser, fetchPosts]);

  const handlePost = async (content: string, imageUrl?: string) => {
    if (!currentUser) return;
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, content, imageUrl }),
    });
    await fetchPosts();
  };

  const handleLike = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    await fetch(`/api/posts/${id}/like`, { method: post.isLiked ? "DELETE" : "POST" });
    setPosts(posts.map((p) =>
      p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const handleRepost = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    await fetch(`/api/posts/${id}/repost`, { method: post.isReposted ? "DELETE" : "POST" });
    setPosts(posts.map((p) =>
      p.id === id ? { ...p, isReposted: !p.isReposted, reposts: p.isReposted ? p.reposts - 1 : p.reposts + 1 } : p
    ));
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    if (activeCommentPostId === id) setActiveCommentPostId(null);
    await fetchPosts();
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
    return (
      <div className="page-wrapper items-center">
        <p className="text-muted">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Sidebar currentUser={currentUser} />

      <main className="main-column">
        <header className="sticky-header flex items-center gap-3">
          <Link href={`/${encodeURIComponent(currentUser.handle)}`} className="lg:hidden">
            <img src="/logo.png" alt="Tuitta" className="w-8 h-8 rounded-lg" />
          </Link>
          <h1 className="text-xl font-bold text-primary">ホーム</h1>
        </header>

        <ComposePost onPost={handlePost} currentUser={currentUser} />

        <div>
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
        </div>
      </main>

      {/* 右サイドバー */}
      <div className="right-sidebar">
        <div className="right-sidebar-inner">
          {activeCommentPostId ? (
            <CommentPanel
              key={activeCommentPostId}
              postId={activeCommentPostId}
              currentUserId={currentUser.id}
              onClose={() => setActiveCommentPostId(null)}
            />
          ) : (
            <div className="p-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <h2 className="text-xl font-bold text-primary mb-4">トレンド</h2>
                <TrendItem category="テクノロジー" topic="Next.js" posts="1.2万" />
                <TrendItem category="プログラミング" topic="TypeScript" posts="8,500" />
                <TrendItem category="トレンド" topic="React" posts="5,200" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TrendItem({ category, topic, posts }: { category: string; topic: string; posts: string }) {
  return (
    <div className="py-3 card-hover -mx-4 px-4 cursor-pointer rounded-lg">
      <p className="text-muted text-xs">{category}</p>
      <p className="text-primary font-bold">{topic}</p>
      <p className="text-muted text-xs">{posts}件のポスト</p>
    </div>
  );
}
