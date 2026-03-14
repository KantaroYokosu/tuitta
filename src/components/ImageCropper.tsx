"use client";

import { useCallback, useRef, useState } from "react";

type ImageCropperProps = {
  imageUrl: string;
  aspectRatio: number;
  isCircle?: boolean;
  onCrop: (croppedDataUrl: string) => void;
  onCancel: () => void;
};

export default function ImageCropper({ imageUrl, aspectRatio, isCircle, onCrop, onCancel }: ImageCropperProps) {
  const [scale, setScale] = useState(0.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...position };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: posStart.current.x + (e.clientX - dragStart.current.x),
      y: posStart.current.y + (e.clientY - dragStart.current.y),
    });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => setIsDragging(false), []);

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

    ctx.drawImage(img,
      (cropRect.left - imgRect.left) * displayScale,
      (cropRect.top - imgRect.top) * displayScale,
      cropRect.width * displayScale,
      cropRect.height * displayScale,
      0, 0, canvas.width, canvas.height
    );
    onCrop(canvas.toDataURL("image/jpeg", 0.85));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card !max-w-lg">
        <h3 className="text-primary font-bold text-lg mb-4">画像を調整</h3>

        {/* クロップエリア */}
        <div className="relative overflow-hidden bg-gray-100 mx-auto" style={{ aspectRatio }} id="crop-area">
          {isCircle && (
            <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: "radial-gradient(circle, transparent 48%, rgba(0,0,0,0.6) 48%)" }} />
          )}
          <img
            ref={imgRef}
            src={imageUrl}
            alt="クロップ対象"
            className="absolute select-none w-full h-full object-contain"
            style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transformOrigin: "center", cursor: isDragging ? "grabbing" : "grab" }}
            draggable={false}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </div>

        {/* ズーム */}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-muted text-sm">-</span>
          <input type="range" min={0.3} max={3} step={0.05} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="flex-1 accent-accent" />
          <span className="text-muted text-sm">+</span>
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <button onClick={onCancel} className="btn-outline px-4 py-1.5 text-sm">キャンセル</button>
          <button onClick={handleCrop} className="btn-primary px-4 py-1.5 text-sm">適用</button>
        </div>
      </div>
    </div>
  );
}
