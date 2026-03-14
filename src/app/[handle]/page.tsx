"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Post, User } from "@/types";
import Sidebar from "@/components/Sidebar";
import PostCard from "@/components/PostCard";
import CommentPanel from "@/components/CommentPanel";
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
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarImage, setEditAvatarImage] = useState<string | undefined>(undefined);
  const [editHeaderImage, setEditHeaderImage] = useState<string | undefined>(undefined);

  const [cropTarget, setCropTarget] = useState<"avatar" | "header" | null>(null);
  const [cropRawImage, setCropRawImage] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = currentUser ? handle === currentUser.handle : false;

  // 認証チェック
  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!data.user) { router.push("/login"); return; }
      setCurrentUser(data.user);
    };
    checkAuth();
  }, [router]);

  // プロフィール取得
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`/api/users/${encodeURIComponent(handle)}`);
      if (!res.ok) { setNotFound(true); return; }
      const data = await res.json();
      setUser(data.user);
      setPosts(data.posts);
    };
    fetchProfile();
  }, [handle]);

  // ---- 編集系 ----
  const startEditing = () => {
    if (!user) return;
    setEditName(user.name);
    setEditBio(user.bio);
    setEditAvatarImage(user.avatarImage);
    setEditHeaderImage(user.headerImage);
    setIsEditing(true);
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropRawImage(await readFileAsDataURL(file));
    setCropTarget("avatar");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleHeaderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropRawImage(await readFileAsDataURL(file));
    setCropTarget("header");
    if (headerInputRef.current) headerInputRef.current.value = "";
  };

  const handleCropDone = (croppedDataUrl: string) => {
    if (cropTarget === "avatar") setEditAvatarImage(croppedDataUrl);
    else if (cropTarget === "header") setEditHeaderImage(croppedDataUrl);
    setCropTarget(null);
    setCropRawImage("");
  };

  const handleCropCancel = () => { setCropTarget(null); setCropRawImage(""); };

  const saveProfile = async () => {
    if (!user || editName.trim() === "") return;
    await fetch(`/api/users/${encodeURIComponent(handle)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, bio: editBio, avatarImage: editAvatarImage, headerImage: editHeaderImage }),
    });
    setUser({ ...user, name: editName, bio: editBio, avatarImage: editAvatarImage, headerImage: editHeaderImage });
    setIsEditing(false);
  };

  // ---- アクション系 ----
  const handleFollow = async () => {
    if (!user) return;
    if (user.isFollowing) {
      await fetch("/api/follow", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ followingId: user.id }) });
      setUser({ ...user, isFollowing: false, followers: user.followers - 1 });
    } else {
      await fetch("/api/follow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ followingId: user.id }) });
      setUser({ ...user, isFollowing: true, followers: user.followers + 1 });
    }
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

  // ---- レンダリング ----
  if (notFound) {
    return (
      <div className="page-wrapper">
        {currentUser && <Sidebar currentUser={currentUser} />}
        <main className="main-column">
          <header className="sticky-header">
            <Link href="/" className="text-primary hover:text-muted mr-4">← 戻る</Link>
          </header>
          <div className="p-8 text-center text-muted">ユーザーが見つかりません</div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-wrapper items-center">
        <p className="text-muted">読み込み中...</p>
      </div>
    );
  }

  const displayAvatarImage = isEditing ? editAvatarImage : user.avatarImage;
  const displayHeaderImage = isEditing ? editHeaderImage : user.headerImage;

  return (
    <div className="page-wrapper">
      {currentUser && <Sidebar currentUser={currentUser} />}

      <main className="main-column">
        <header className="sticky-header flex items-center gap-4">
          <Link href="/" className="text-primary hover:text-muted">← 戻る</Link>
          <div>
            <h1 className="text-xl font-bold text-primary">{user.name}</h1>
            <p className="text-sm text-muted">{posts.length}件のポスト</p>
          </div>
        </header>

        <div className="p-4 divider">
          {/* ヘッダー画像 */}
          <div className="h-32 bg-gray-100 rounded-xl mb-4 relative overflow-hidden cursor-pointer" onClick={() => isEditing && headerInputRef.current?.click()}>
            {displayHeaderImage && <img src={displayHeaderImage} alt="ヘッダー" className="w-full h-full object-cover" />}
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-sm bg-black/60 px-3 py-1 rounded-full">画像を変更</span>
              </div>
            )}
            <input ref={headerInputRef} type="file" accept="image/*" onChange={handleHeaderSelect} className="hidden" />
          </div>

          {/* アバター + 編集/フォローボタン */}
          <div className="flex items-end justify-between -mt-16 mb-4">
            <div className="relative cursor-pointer" onClick={() => isEditing && avatarInputRef.current?.click()}>
              {displayAvatarImage ? (
                <img src={displayAvatarImage} alt={user.name} className="avatar avatar-lg border-4 border-white" />
              ) : (
                <div className={`avatar avatar-lg ${user.avatarColor} flex items-center justify-center text-white text-3xl font-bold border-4 border-white`}>
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
              <button onClick={startEditing} className="btn-outline px-4 py-1.5 text-sm">プロフィールを編集</button>
            )}
            {!isOwnProfile && currentUser && (
              <button onClick={handleFollow} className={`font-bold px-4 py-1.5 rounded-full text-sm transition-colors ${user.isFollowing ? "btn-outline hover:border-red-500 hover:text-red-500" : "btn-primary"}`}>
                {user.isFollowing ? "フォロー中" : "フォローする"}
              </button>
            )}
          </div>

          {/* 編集フォーム or プロフィール表示 */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-muted text-sm block mb-1">名前</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={50} className="input-field" />
              </div>
              <div>
                <label className="text-muted text-sm block mb-1">自己紹介</label>
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} maxLength={160} rows={3} className="input-field resize-none" />
                <p className="text-muted text-xs text-right">{editBio.length}/160</p>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsEditing(false)} className="btn-outline px-4 py-1.5 text-sm">キャンセル</button>
                <button onClick={saveProfile} disabled={editName.trim() === ""} className="btn-primary px-4 py-1.5 text-sm">保存</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-primary">{user.name}</h2>
              <p className="text-muted">{user.handle}</p>
              {user.bio && <p className="text-primary mt-3">{user.bio}</p>}
              <div className="flex gap-4 mt-3">
                <span className="text-sm"><span className="text-primary font-bold">{user.following}</span> <span className="text-muted">フォロー</span></span>
                <span className="text-sm"><span className="text-primary font-bold">{user.followers}</span> <span className="text-muted">フォロワー</span></span>
              </div>
              <p className="text-muted text-sm mt-3">
                {new Date(user.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}からTuittaを利用しています
              </p>
            </>
          )}
        </div>

        {/* 投稿一覧 */}
        <div>
          {posts.length === 0 ? (
            <p className="p-8 text-center text-muted">まだ投稿がありません</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser?.id ?? ""}
                onLike={handleLike}
                onRepost={handleRepost}
                onDelete={handleDelete}
                onComment={handleComment}
                onBookmark={handleBookmark}
                isOwn={post.user.id === currentUser?.id}
                isCommentOpen={activeCommentPostId === post.id}
              />
            ))
          )}
        </div>
      </main>

      {/* コメントサイドバー */}
      {activeCommentPostId && currentUser && (
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
