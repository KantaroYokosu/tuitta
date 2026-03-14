"use client";

import { useCallback, useRef, useState } from "react";

type ImageCropperProps = {
  imageUrl: string;
  aspectRatio: number;
  isCircle?: boolean;
  onCrop: (croppedDataUrl: string) => void;
  onCancel: () => void;
};

export default function ImageCropper({
  imageUrl,
  aspectRatio,
  isCircle,
  onCrop,
  onCancel,
}: ImageCropperProps) {
  const [scale, setScale] = useState(0.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      posStart.current = { ...position };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [position]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPosition({
        x: posStart.current.x + dx,
        y: posStart.current.y + dy,
      });
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCrop = () => {
    const img = imgRef.current;
    if (!img) return;

    const outputSize = 600;
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize / aspectRatio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cropArea = document.getElementById("crop-area");
    if (!cropArea) return;
    const cropRect = cropArea.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const displayScale = img.naturalWidth / imgRect.width;

    const sx = (cropRect.left - imgRect.left) * displayScale;
    const sy = (cropRect.top - imgRect.top) * displayScale;
    const sw = cropRect.width * displayScale;
    const sh = cropRect.height * displayScale;

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onCrop(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl">
        <h3 className="text-gray-900 font-bold text-lg mb-4">画像を調整</h3>

        <div
          className="relative overflow-hidden bg-gray-100 mx-auto"
          style={{ aspectRatio }}
          id="crop-area"
        >
          {isCircle && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              <div
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(circle, transparent 48%, rgba(0,0,0,0.6) 48%)",
                }}
              />
            </div>
          )}

          <img
            ref={imgRef}
            src={imageUrl}
            alt="クロップ対象"
            className="absolute select-none w-full h-full object-contain"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "center center",
              cursor: isDragging ? "grabbing" : "grab",
            }}
            draggable={false}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <span className="text-gray-400 text-sm">-</span>
          <input
            type="range"
            min={0.3}
            max={3}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="flex-1 accent-[#4BACC5]"
          />
          <span className="text-gray-400 text-sm">+</span>
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <button
            onClick={onCancel}
            className="border border-gray-300 text-gray-900 px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-sm"
          >
            キャンセル
          </button>
          <button
            onClick={handleCrop}
            className="bg-[#4BACC5] hover:bg-[#3a9ab3] text-white font-bold px-4 py-1.5 rounded-full transition-colors text-sm"
          >
            適用
          </button>
        </div>
      </div>
    </div>
  );
}
