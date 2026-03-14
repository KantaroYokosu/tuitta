"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Post, User } from "@/types";
import Sidebar from "@/components/Sidebar";
import ComposePost from "@/components/ComposePost";
import PostCard from "@/components/PostCard";

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  // まず「今ログインしているのは誰？」を確認
  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!data.user) {
        // ログインしていない → ログインページへ
        router.push("/login");
        return;
      }
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
      body: JSON.stringify({
        userId: currentUser.id,
        content,
        imageUrl,
      }),
    });
    await fetchPosts();
  };

  const handleLike = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    if (post.isLiked) {
      await fetch(`/api/posts/${id}/like`, { method: "DELETE" });
    } else {
      await fetch(`/api/posts/${id}/like`, { method: "POST" });
    }

    setPosts(
      posts.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleRepost = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    if (post.isReposted) {
      await fetch(`/api/posts/${id}/repost`, { method: "DELETE" });
    } else {
      await fetch(`/api/posts/${id}/repost`, { method: "POST" });
    }

    setPosts(
      posts.map((p) =>
        p.id === id
          ? { ...p, isReposted: !p.isReposted, reposts: p.isReposted ? p.reposts - 1 : p.reposts + 1 }
          : p
      )
    );
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    await fetchPosts();
  };

  // ログイン確認中
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <Sidebar currentUser={currentUser} />
      <main className="w-full max-w-[600px] border-x border-gray-700">
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-700 p-4">
          <h1 className="text-xl font-bold text-white">ホーム</h1>
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
              isOwn={post.user.id === currentUser.id}
            />
          ))}
        </div>
      </main>
      <div className="w-80 shrink-0 hidden xl:block">
        <div className="fixed w-80 p-4">
          <div className="bg-gray-900 rounded-2xl p-4">
            <h2 className="text-xl font-bold text-white mb-4">トレンド</h2>
            <TrendItem category="テクノロジー" topic="Next.js" posts="1.2万" />
            <TrendItem category="プログラミング" topic="TypeScript" posts="8,500" />
            <TrendItem category="トレンド" topic="React" posts="5,200" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendItem({
  category,
  topic,
  posts,
}: {
  category: string;
  topic: string;
  posts: string;
}) {
  return (
    <div className="py-3 hover:bg-gray-800 -mx-4 px-4 cursor-pointer transition-colors">
      <p className="text-gray-500 text-xs">{category}</p>
      <p className="text-white font-bold">{topic}</p>
      <p className="text-gray-500 text-xs">{posts}件のポスト</p>
    </div>
  );
}
