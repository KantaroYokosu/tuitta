"use client";

import { useEffect, useState } from "react";
import { User } from "@/types";
import { formatTimeAgo } from "@/lib/utils";

type Comment = {
  id: string;
  user: User;
  content: string;
  createdAt: string;
  parentId: string | null;
  children: Comment[];
};

type CommentPanelProps = {
  postId: string;
  currentUserId: string;
  onClose: () => void;
};

export default function CommentPanel({ postId, currentUserId, onClose }: CommentPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      setComments(data);
      setLoading(false);
    };
    fetchComments();
  }, [postId]);

  const submitComment = async () => {
    if (commentText.trim() === "" || submitting) return;
    setSubmitting(true);
    const text = commentText;
    const parentId = replyTo?.id ?? null;
    setCommentText("");
    setReplyTo(null);
    await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, parentId }),
    });
    const res = await fetch(`/api/posts/${postId}/comments`);
    const data = await res.json();
    setComments(data);
    setSubmitting(false);
  };

  const deleteComment = async (commentId: string) => {
    await fetch(`/api/posts/${postId}/comments`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });
    setComments(comments.filter((c) => {
      if (c.id === commentId) return false;
      c.children = c.children.filter((child) => child.id !== commentId);
      return true;
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      submitComment();
    }
  };

  const renderComment = (comment: Comment, isChild = false) => (
    <div key={comment.id} className={`flex gap-2 mb-3 group/comment ${isChild ? "ml-8" : ""}`}>
      {comment.user.avatarImage ? (
        <img src={comment.user.avatarImage} alt={comment.user.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
      ) : (
        <div className={`w-7 h-7 rounded-full ${comment.user.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
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
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-white text-sm mt-0.5 whitespace-pre-wrap">{comment.content}</p>
        {!isChild && (
          <button
            onClick={() => setReplyTo({ id: comment.id, name: comment.user.name })}
            className="text-gray-500 hover:text-sky-500 text-xs mt-1 transition-colors"
          >
            返信
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-white font-bold">コメント</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-gray-500 text-sm">読み込み中...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm">コメントはまだありません</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id}>
              {renderComment(comment)}
              {comment.children.map((child) => renderComment(child, true))}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        {replyTo && (
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
            <span>{replyTo.name} に返信中</span>
            <button onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-white">✕</button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="コメントを入力..."
            maxLength={140}
            rows={2}
            className="flex-1 bg-transparent border border-gray-600 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-sky-500 resize-none"
          />
          <button
            onClick={submitComment}
            disabled={commentText.trim() === "" || submitting}
            className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-full text-sm transition-colors self-end"
          >
            返信
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-1">Ctrl+Enter（Mac: ⌘+Enter）で送信</p>
      </div>
    </div>
  );
}
