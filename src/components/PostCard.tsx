"use client";

import Link from "next/link";
import { Post } from "@/types";
import { formatTimeAgo } from "@/lib/utils";

type PostCardProps = {
  post: Post;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  isOwn: boolean;
};

export default function PostCard({ post, onLike, onDelete, isOwn }: PostCardProps) {
  return (
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
                onClick={() => onDelete(post.id)}
                className="ml-auto text-gray-500 hover:text-red-500 transition-colors"
                title="削除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
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
            <button className="flex items-center gap-1 text-gray-500 hover:text-sky-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
              </svg>
              <span className="text-sm">0</span>
            </button>
            <button className="flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M4 12v1a3 3 0 003 3h10M17 10l-3-3m3 3l-3 3M16 8v1a3 3 0 01-3 3H3M3 10l3-3M3 10l3 3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
