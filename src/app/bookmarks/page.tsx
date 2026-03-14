"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Post, User } from "@/types";
import Sidebar from "@/components/Sidebar";
import PostCard from "@/components/PostCard";
import CommentPanel from "@/components/CommentPanel";

export default function BookmarksPage() {
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

  useEffect(() => {
    if (!currentUser) return;
    const fetchBookmarks = async () => {
      const res = await fetch("/api/bookmarks");
      const data = await res.json();
      setPosts(data);
    };
    fetchBookmarks();
  }, [currentUser]);

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
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: id }),
    });
    setPosts(posts.filter((p) => p.id !== id));
  };

  if (!currentUser) {
    return <div className="page-wrapper items-center"><p className="text-muted">読み込み中...</p></div>;
  }

  return (
    <div className="page-wrapper">
      <Sidebar currentUser={currentUser} />

      <main className="main-column">
        <header className="sticky-header">
          <h1 className="text-xl font-bold text-primary">ブックマーク</h1>
        </header>

        <div>
          {posts.length === 0 ? (
            <p className="p-8 text-center text-muted">ブックマークした投稿はまだありません</p>
          ) : (
            posts.map((post) => (
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
            ))
          )}
        </div>
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
