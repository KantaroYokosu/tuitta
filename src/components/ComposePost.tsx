"use client";

import { useRef, useState } from "react";
import { User } from "@/types";

type ComposePostProps = {
  onPost: (content: string, imageUrl?: string) => void;
  currentUser: User;
};

export default function ComposePost({ onPost, currentUser }: ComposePostProps) {
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (content.trim() === "" && !imagePreview) return;
    onPost(content, imagePreview ?? undefined);
    setContent("");
    handleRemoveImage();
  };

  return (
    <div className="divider p-4">
      <div className="flex gap-3">
        {/* アバター */}
        {currentUser.avatarImage ? (
          <img src={currentUser.avatarImage} alt={currentUser.name} className="avatar avatar-md" />
        ) : (
          <div className={`avatar avatar-md ${currentUser.avatarColor} flex items-center justify-center text-white font-bold`}>
            {currentUser.name[0]}
          </div>
        )}

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="いまどうしてる？"
            className="w-full bg-transparent text-primary text-lg placeholder-gray-400 outline-none resize-none min-h-[80px]"
            maxLength={140}
          />

          {/* 画像プレビュー */}
          {imagePreview && (
            <div className="relative mt-2 rounded-2xl overflow-hidden divider">
              <img src={imagePreview} alt="プレビュー" className="w-full max-h-[300px] object-cover" />
              <button onClick={handleRemoveImage} className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full w-8 h-8 flex items-center justify-center">
                ✕
              </button>
            </div>
          )}

          {/* ツールバー */}
          <div className="flex items-center justify-between divider pt-3 mt-2">
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="text-accent hover:bg-accent/10 rounded-full p-2 transition-colors" title="画像を追加">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                </svg>
              </button>
              <span className="text-sm text-muted">{content.length}/140</span>
            </div>
            <button onClick={handleSubmit} disabled={content.trim() === "" && !imagePreview} className="btn-primary px-5 py-2 text-sm">
              ポストする
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
