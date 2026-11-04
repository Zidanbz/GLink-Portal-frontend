'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Eraser, PenTool } from 'lucide-react';

interface SignaturePadProps {
  label: string;
  onSave: (dataUrl: string) => void;
  initialValue?: string | null;
  height?: number;
}

function trimCanvas(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.toDataURL('image/png');

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width, minY = height, maxX = 0, maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found) return '';

  // Add small padding around the signature
  const padding = 12;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width, maxX + padding);
  maxY = Math.min(height, maxY + padding);

  const cropWidth = maxX - minX;
  const cropHeight = maxY - minY;

  const trimmedCanvas = document.createElement('canvas');
  trimmedCanvas.width = cropWidth;
  trimmedCanvas.height = cropHeight;
  const trimmedCtx = trimmedCanvas.getContext('2d');
  if (!trimmedCtx) return canvas.toDataURL('image/png');

  trimmedCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return trimmedCanvas.toDataURL('image/png');
}

export default function SignaturePad({
  label,
  onSave,
  initialValue,
  height = 130
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const ratio = Math.ceil(window.devicePixelRatio || 1);
    const width = canvas.offsetWidth;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3.2; // Slightly thicker for crisp signature
    ctx.strokeStyle = '#0f172a';

    if (initialValue) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setHasSignature(true);
      };
      img.src = initialValue;
    }
  }, [height, initialValue]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const trimmedUrl = trimCanvas(canvas);
      onSave(trimmedUrl);
    }
  };

  const clearCanvas = (e: React.MouseEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = Math.ceil(window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
    setHasSignature(false);
    onSave('');
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-blue-600" />
          {label}
        </label>
        {hasSignature && (
          <button
            type="button"
            onClick={clearCanvas}
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors"
          >
            <Eraser className="w-3 h-3" />
            Hapus Tanda Tangan
          </button>
        )}
      </div>
      <div className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white hover:border-blue-400 transition-colors shadow-inner">
        <canvas
          ref={canvasRef}
          style={{ height: `${height}px`, width: '100%' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair touch-none"
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium">
            Tanda tangan di area ini (Gunakan mouse atau sentuhan)
          </div>
        )}
      </div>
    </div>
  );
}
