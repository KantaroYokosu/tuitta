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
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (content.trim() === "" && !imagePreview) return;
    onPost(content, imagePreview ?? undefined);
    setContent("");
    handleRemoveImage();
  };

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex gap-3">
        {currentUser.avatarImage ? (
          <img src={currentUser.avatarImage} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
        ) : (
          <div
            className={`w-10 h-10 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-white font-bold shrink-0`}
          >
            {currentUser.name[0]}
          </div>
        )}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="いまどうしてる？"
            className="w-full bg-transparent text-gray-900 text-lg placeholder-gray-400 outline-none resize-none min-h-[80px]"
            maxLength={140}
          />

          {imagePreview && (
            <div className="relative mt-2 rounded-2xl overflow-hidden border border-gray-200">
              <img
                src={imagePreview}
                alt="プレビュー"
                className="w-full max-h-[300px] object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-200 pt-3 mt-2">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[#4BACC5] hover:text-[#3a9ab3] hover:bg-[#4BACC5]/10 rounded-full p-2 transition-colors"
                title="画像を追加"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </button>
              <span className="text-sm text-gray-400">
                {content.length}/140
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={content.trim() === "" && !imagePreview}
              className="bg-[#4BACC5] hover:bg-[#3a9ab3] disabled:opacity-50 disabled:hover:bg-[#4BACC5] text-white font-bold px-5 py-2 rounded-full transition-colors"
            >
              ポストする
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
