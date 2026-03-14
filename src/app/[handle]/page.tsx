"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Post, User } from "@/types";
import Sidebar from "@/components/Sidebar";
import PostCard from "@/components/PostCard";
import ImageCropper from "@/components/ImageCropper";
import Link from "next/link";

type UserProfile = {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  avatarImage?: string;
  headerImage?: string;
  bio: string;
  createdAt: string;
  followers: number;
  following: number;
  isFollowing: boolean;
};

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const handle = decodeURIComponent(params.handle as string);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notFound, setNotFound] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarImage, setEditAvatarImage] = useState<string | undefined>(undefined);
  const [editHeaderImage, setEditHeaderImage] = useState<string | undefined>(undefined);

  const [cropTarget, setCropTarget] = useState<"avatar" | "header" | null>(null);
  const [cropRawImage, setCropRawImage] = useState<string>("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = currentUser ? handle === currentUser.handle : false;

  // ログイン中のユーザーを確認
  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!data.user) {
        router.push("/login");
        return;
      }
      setCurrentUser(data.user);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`/api/users/${encodeURIComponent(handle)}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setPosts(data.posts);
    };
    fetchProfile();
  }, [handle]);

  const startEditing = () => {
    if (!user) return;
    setEditName(user.name);
    setEditBio(user.bio);
    setEditAvatarImage(user.avatarImage);
    setEditHeaderImage(user.headerImage);
    setIsEditing(true);
  };

  // 画像を選んだらまずクロッパーを開く
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    setCropRawImage(dataUrl);
    setCropTarget("avatar");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleHeaderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    setCropRawImage(dataUrl);
    setCropTarget("header");
    if (headerInputRef.current) headerInputRef.current.value = "";
  };

  // クロッパーで「適用」が押された
  const handleCropDone = (croppedDataUrl: string) => {
    if (cropTarget === "avatar") {
      setEditAvatarImage(croppedDataUrl);
    } else if (cropTarget === "header") {
      setEditHeaderImage(croppedDataUrl);
    }
    setCropTarget(null);
    setCropRawImage("");
  };

  const handleCropCancel = () => {
    setCropTarget(null);
    setCropRawImage("");
  };

  const saveProfile = async () => {
    if (!user || editName.trim() === "") return;

    await fetch(`/api/users/${encodeURIComponent(handle)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        bio: editBio,
        avatarImage: editAvatarImage,
        headerImage: editHeaderImage,
      }),
    });

    setUser({
      ...user,
      name: editName,
      bio: editBio,
      avatarImage: editAvatarImage,
      headerImage: editHeaderImage,
    });
    setIsEditing(false);
  };

  const handleFollow = async () => {
    if (!user) return;

    if (user.isFollowing) {
      await fetch("/api/follow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: user.id }),
      });
      setUser({ ...user, isFollowing: false, followers: user.followers - 1 });
    } else {
      await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followingId: user.id }),
      });
      setUser({ ...user, isFollowing: true, followers: user.followers + 1 });
    }
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
    setPosts(posts.filter((p) => p.id !== id));
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-black flex justify-center">
        {currentUser && <Sidebar currentUser={currentUser} />}
        <main className="w-full max-w-[600px] border-x border-gray-700">
          <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-700 p-4">
            <Link href="/" className="text-white hover:text-gray-300 mr-4">← 戻る</Link>
          </header>
          <div className="p-8 text-center text-gray-500">
            ユーザーが見つかりません
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  const displayAvatarImage = isEditing ? editAvatarImage : user.avatarImage;
  const displayHeaderImage = isEditing ? editHeaderImage : user.headerImage;

  return (
    <div className="min-h-screen bg-black flex justify-center">
      {currentUser && <Sidebar currentUser={currentUser} />}
      <main className="w-full max-w-[600px] border-x border-gray-700">
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-700 p-4 flex items-center gap-4">
          <Link href="/" className="text-white hover:text-gray-300">
            ← 戻る
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{user.name}</h1>
            <p className="text-sm text-gray-500">{posts.length}件のポスト</p>
          </div>
        </header>

        <div className="p-4 border-b border-gray-700">
          {/* ヘッダー画像エリア */}
          <div
            className="h-32 bg-gray-800 rounded-xl mb-4 relative overflow-hidden cursor-pointer"
            onClick={() => isEditing && headerInputRef.current?.click()}
          >
            {displayHeaderImage && (
              <img src={displayHeaderImage} alt="ヘッダー" className="w-full h-full object-cover" />
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-sm bg-black/60 px-3 py-1 rounded-full">画像を変更</span>
              </div>
            )}
            <input ref={headerInputRef} type="file" accept="image/*" onChange={handleHeaderSelect} className="hidden" />
          </div>

          {/* アバターと編集ボタン */}
          <div className="flex items-end justify-between -mt-16 mb-4">
            <div
              className="relative cursor-pointer"
              onClick={() => isEditing && avatarInputRef.current?.click()}
            >
              {displayAvatarImage ? (
                <img
                  src={displayAvatarImage}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-black"
                />
              ) : (
                <div
                  className={`w-24 h-24 rounded-full ${user.avatarColor} flex items-center justify-center text-white text-3xl font-bold border-4 border-black`}
                >
                  {user.name[0]}
                </div>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">変更</span>
                </div>
              )}
              <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
            </div>
            {isOwnProfile && !isEditing && (
              <button
                onClick={startEditing}
                className="border border-gray-600 text-white font-bold px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors text-sm"
              >
                プロフィールを編集
              </button>
            )}
            {!isOwnProfile && currentUser && (
              <button
                onClick={handleFollow}
                className={`font-bold px-4 py-1.5 rounded-full transition-colors text-sm ${
                  user.isFollowing
                    ? "border border-gray-600 text-white hover:border-red-500 hover:text-red-500"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {user.isFollowing ? "フォロー中" : "フォローする"}
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-gray-500 text-sm block mb-1">名前</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                  className="w-full bg-transparent border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-gray-500 text-sm block mb-1">自己紹介</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={160}
                  rows={3}
                  className="w-full bg-transparent border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-sky-500 resize-none"
                />
                <p className="text-gray-500 text-xs text-right">{editBio.length}/160</p>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="border border-gray-600 text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition-colors text-sm"
                >
                  キャンセル
                </button>
                <button
                  onClick={saveProfile}
                  disabled={editName.trim() === ""}
                  className="bg-white text-black font-bold px-4 py-1.5 rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors text-sm"
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-500">{user.handle}</p>

              {user.bio && (
                <p className="text-white mt-3">{user.bio}</p>
              )}

              <div className="flex gap-4 mt-3">
                <span className="text-sm">
                  <span className="text-white font-bold">{user.following}</span>
                  <span className="text-gray-500"> フォロー</span>
                </span>
                <span className="text-sm">
                  <span className="text-white font-bold">{user.followers}</span>
                  <span className="text-gray-500"> フォロワー</span>
                </span>
              </div>

              <p className="text-gray-500 text-sm mt-3">
                {new Date(user.createdAt).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                })}
                からTuittaを利用しています
              </p>
            </>
          )}
        </div>

        <div>
          {posts.length === 0 ? (
            <p className="p-8 text-center text-gray-500">まだ投稿がありません</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onRepost={handleRepost}
                onDelete={handleDelete}
                isOwn={post.user.id === user.id}
              />
            ))
          )}
        </div>
      </main>

      {/* クロッパーモーダル */}
      {cropTarget && (
        <ImageCropper
          imageUrl={cropRawImage}
          aspectRatio={cropTarget === "avatar" ? 1 : 3}
          isCircle={cropTarget === "avatar"}
          onCrop={handleCropDone}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
