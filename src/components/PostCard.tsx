"use client";

import { useState } from "react";
import Link from "next/link";
import { Post } from "@/types";
import { formatTimeAgo } from "@/lib/utils";

type PostCardProps = {
  post: Post;
  currentUserId: string;
  onLike: (id: string) => void;
  onRepost: (id: string) => void;
  onDelete: (id: string) => void;
  onComment: (id: string) => void;
  isOwn: boolean;
  isCommentOpen?: boolean;
};

export default function PostCard({ post, onLike, onRepost, onDelete, onComment, isOwn, isCommentOpen }: PostCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <div className={`border-b border-gray-200 p-4 hover:bg-gray-50/50 transition-colors ${isCommentOpen ? "bg-gray-50/30" : ""}`}>
        {post.repostedBy && (
          <div className="flex items-center gap-2 ml-12 mb-1 text-gray-400 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 014-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 01-4 4H3" />
            </svg>
            <span>{post.repostedBy}がリポスト</span>
          </div>
        )}
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
              <Link href={`/${encodeURIComponent(post.user.handle)}`} className="font-bold text-gray-900 truncate hover:underline">
                {post.user.name}
              </Link>
              <Link href={`/${encodeURIComponent(post.user.handle)}`} className="text-gray-500 truncate hover:underline">
                {post.user.handle}
              </Link>
              <span className="text-gray-400">·</span>
              <span className="text-gray-400 whitespace-nowrap text-sm">
                {formatTimeAgo(post.createdAt)}
              </span>
              {isOwn && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                  title="削除"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-gray-900 mt-1 whitespace-pre-wrap break-words">
              {post.content}
            </p>
            {post.imageUrl && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200">
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
                onClick={() => onComment(post.id)}
                className={`flex items-center gap-1 transition-colors ${
                  isCommentOpen ? "text-[#4BACC5]" : "text-gray-400 hover:text-[#4BACC5]"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
                </svg>
                <span className="text-sm">{post.comments}</span>
              </button>

              {/* リポストボタン */}
              <button
                onClick={() => onRepost(post.id)}
                className={`flex items-center gap-1 transition-colors ${
                  post.isReposted
                    ? "text-green-500"
                    : "text-gray-400 hover:text-green-500"
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
                    : "text-gray-400 hover:text-pink-500"
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
      </div>

      {/* 削除確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">ポストを削除しますか？</h3>
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
                className="w-full border border-gray-300 text-gray-900 font-bold py-3 rounded-full hover:bg-gray-100 transition-colors"
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
