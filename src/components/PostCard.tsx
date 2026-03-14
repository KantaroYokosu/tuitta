"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Post, User } from "@/types";
import { formatTimeAgo } from "@/lib/utils";

type Comment = {
  id: string;
  user: User;
  content: string;
  createdAt: string;
};

type PostCardProps = {
  post: Post;
  currentUserId: string;
  onLike: (id: string) => void;
  onRepost: (id: string) => void;
  onDelete: (id: string) => void;
  isOwn: boolean;
};

export default function PostCard({ post, currentUserId, onLike, onRepost, onDelete, isOwn }: PostCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post.comments);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const composingRef = useRef(false);

  const toggleComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    // まずUIを開いてからデータを取得（体感速度を上げる）
    setShowComments(true);
    setLoadingComments(true);
    const res = await fetch(`/api/posts/${post.id}/comments`);
    const data = await res.json();
    setComments(data);
    setLoadingComments(false);
  };

  const submitComment = async () => {
    if (commentText.trim() === "" || submitting) return;
    setSubmitting(true);
    const text = commentText;
    setCommentText("");
    await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    const res = await fetch(`/api/posts/${post.id}/comments`);
    const data = await res.json();
    setComments(data);
    setCommentCount(data.length);
    setSubmitting(false);
  };

  const deleteComment = async (commentId: string) => {
    await fetch(`/api/posts/${post.id}/comments`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);
    setCommentCount(updated.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !composingRef.current) {
      e.preventDefault();
      submitComment();
    }
  };

  return (
    <>
      <div className="border-b border-gray-700 p-4 hover:bg-gray-900/50 transition-colors">
        <div className="flex gap-3">
          {post.user.avatarImage ? (
            <img
              src={post.user.avatarImage}
              alt={post.user.name}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full ${post.user.avatarColor} flex items-center justify-center text-white font-bold shrink-0`}
            >
              {post.user.name[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href={`/${encodeURIComponent(post.user.handle)}`} className="font-bold text-white truncate hover:underline">
                {post.user.name}
              </Link>
              <Link href={`/${encodeURIComponent(post.user.handle)}`} className="text-gray-500 truncate hover:underline">
                {post.user.handle}
              </Link>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 whitespace-nowrap text-sm">
                {formatTimeAgo(post.createdAt)}
              </span>
              {isOwn && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="ml-auto text-gray-500 hover:text-red-500 transition-colors"
                  title="削除"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-white mt-1 whitespace-pre-wrap break-words">
              {post.content}
            </p>
            {post.imageUrl && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-gray-700">
                <img
                  src={post.imageUrl}
                  alt="投稿画像"
                  className="w-full max-h-[512px] object-cover"
                />
              </div>
            )}
            <div className="flex items-center gap-6 mt-3">
              {/* コメントボタン */}
              <button
                onClick={toggleComments}
                className={`flex items-center gap-1 transition-colors ${
                  showComments ? "text-sky-500" : "text-gray-500 hover:text-sky-500"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
                </svg>
                <span className="text-sm">{commentCount}</span>
              </button>

              {/* リポストボタン */}
              <button
                onClick={() => onRepost(post.id)}
                className={`flex items-center gap-1 transition-colors ${
                  post.isReposted
                    ? "text-green-500"
                    : "text-gray-500 hover:text-green-500"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M17 1l4 4-4 4" />
                  <path d="M3 11V9a4 4 0 014-4h14" />
                  <path d="M7 23l-4-4 4-4" />
                  <path d="M21 13v2a4 4 0 01-4 4H3" />
                </svg>
                <span className="text-sm">{post.reposts}</span>
              </button>

              {/* いいねボタン */}
              <button
                onClick={() => onLike(post.id)}
                className={`flex items-center gap-1 group transition-colors ${
                  post.isLiked
                    ? "text-pink-500"
                    : "text-gray-500 hover:text-pink-500"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill={post.isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={post.isLiked ? 0 : 1.5}
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">{post.likes}</span>
              </button>
            </div>
          </div>
        </div>

        {/* コメント欄: PC版は右に、モバイルは下に */}
        {showComments && (
          <div className="mt-3 ml-13 border-t border-gray-700 pt-3 lg:absolute lg:left-full lg:top-0 lg:ml-2 lg:border-t-0 lg:border lg:border-gray-700 lg:rounded-xl lg:bg-gray-900 lg:p-4 lg:w-80 lg:shadow-xl">
            {loadingComments ? (
              <p className="text-gray-500 text-sm">読み込み中...</p>
            ) : (
              <>
                {comments.length === 0 && (
                  <p className="text-gray-500 text-sm mb-3">コメントはまだありません</p>
                )}
                <div className="max-h-60 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2 mb-3 group/comment">
                      {comment.user.avatarImage ? (
                        <img src={comment.user.avatarImage} alt={comment.user.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className={`w-6 h-6 rounded-full ${comment.user.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {comment.user.name[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{comment.user.name}</span>
                          <span className="text-gray-500 text-xs">{formatTimeAgo(comment.createdAt)}</span>
                          {comment.user.id === currentUserId && (
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="ml-auto text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover/comment:opacity-100"
                              title="コメントを削除"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <p className="text-white text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onCompositionStart={() => { composingRef.current = true; }}
                    onCompositionEnd={() => { composingRef.current = false; }}
                    onKeyDown={handleKeyDown}
                    placeholder="コメントを入力..."
                    maxLength={140}
                    className="flex-1 bg-transparent border border-gray-600 rounded-full px-3 py-1.5 text-white text-sm outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={submitComment}
                    disabled={commentText.trim() === "" || submitting}
                    className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold px-4 py-1.5 rounded-full text-sm transition-colors"
                  >
                    返信
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 削除確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-2">ポストを削除しますか？</h3>
            <p className="text-gray-500 text-sm mb-6">この操作は取り消せません。</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onDelete(post.id);
                  setShowDeleteModal(false);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full transition-colors"
              >
                削除する
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full border border-gray-600 text-white font-bold py-3 rounded-full hover:bg-gray-800 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
