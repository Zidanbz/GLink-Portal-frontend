'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, PenTool, Upload, RefreshCw } from 'lucide-react';

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

/**
 * Process uploaded signature image:
 * - Scale down to reasonable signature dimensions (max 600x300)
 * - Optionally remove paper/white background with smooth anti-aliasing
 * - Auto-trim empty margins
 */
function processSignatureImage(
  img: HTMLImageElement,
  removeWhiteBg: boolean,
  maxWidth = 600,
  maxHeight = 300
): string {
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;

  if (w <= 0 || h <= 0) return '';

  // Scale down if image is large
  if (w > maxWidth || h > maxHeight) {
    const scale = Math.min(maxWidth / w, maxHeight / h);
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.drawImage(img, 0, 0, w, h);

  if (removeWhiteBg) {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Sample corners to estimate paper brightness
    const cornerIndices = [0, (w - 1) * 4, ((h - 1) * w) * 4, ((h - 1) * w + (w - 1)) * 4];
    let avgPaperLum = 0;
    let sampleCount = 0;
    for (const idx of cornerIndices) {
      if (idx < data.length) {
        avgPaperLum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        sampleCount++;
      }
    }
    avgPaperLum = sampleCount ? avgPaperLum / sampleCount : 240;

    // Threshold relative to paper tone
    const threshold = Math.max(170, Math.min(230, avgPaperLum - 30));

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a === 0) continue;

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

      // White/grey/light-paper background (neutral color and high luminance)
      if (lum >= threshold && maxDiff < 35) {
        if (lum >= threshold + 25) {
          data[i + 3] = 0; // Transparent
        } else {
          // Smooth edge falloff
          const factor = (threshold + 25 - lum) / 25;
          data[i + 3] = Math.round(a * Math.max(0, factor));
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  return trimCanvas(canvas);
}

export default function SignaturePad({
  label,
  onSave,
  initialValue,
  height = 130
}: SignaturePadProps) {
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const rawImageRef = useRef<HTMLImageElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState<boolean>(Boolean(initialValue));
  const [currentSignatureUrl, setCurrentSignatureUrl] = useState<string>(initialValue || '');
  const [removeBg, setRemoveBg] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Draw image on canvas centered with aspect ratio preserved
  const drawImageToCanvas = useCallback((dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas || !dataUrl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = Math.ceil(window.devicePixelRatio || 1);
    const canvasW = canvas.offsetWidth || canvas.width / ratio || 300;
    const canvasH = height;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
      const imgRatio = (img.naturalWidth || img.width) / (img.naturalHeight || img.height || 1);
      let drawW = canvasW * 0.85;
      let drawH = drawW / imgRatio;
      if (drawH > canvasH * 0.85) {
        drawH = canvasH * 0.85;
        drawW = drawH * imgRatio;
      }
      const drawX = (canvasW - drawW) / 2;
      const drawY = (canvasH - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    };
    img.src = dataUrl;
  }, [height]);

  // Canvas setup and initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ratio = Math.ceil(window.devicePixelRatio || 1);
    const width = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 300;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = '#0f172a';

    if (initialValue) {
      drawImageToCanvas(initialValue);
    }
  }, [height, initialValue, drawImageToCanvas]);

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
      if (trimmedUrl) {
        setCurrentSignatureUrl(trimmedUrl);
        setHasSignature(true);
        onSave(trimmedUrl);
      }
    }
  };

  const clearSignature = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const ratio = Math.ceil(window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio);
      }
    }
    rawImageRef.current = null;
    setCurrentSignatureUrl('');
    setHasSignature(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onSave('');
  };

  const handleProcessFile = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Hanya file gambar (PNG, JPG, WEBP) yang diperbolehkan.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        rawImageRef.current = img;
        const processed = processSignatureImage(img, removeBg);
        if (processed) {
          setCurrentSignatureUrl(processed);
          setHasSignature(true);
          onSave(processed);
          drawImageToCanvas(processed);
        } else {
          setUploadError('Gambar tanda tangan tidak dapat diproses.');
        }
      };
      img.onerror = () => {
        setUploadError('Gagal memuat gambar.');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleToggleRemoveBg = (checked: boolean) => {
    setRemoveBg(checked);
    if (rawImageRef.current) {
      const processed = processSignatureImage(rawImageRef.current, checked);
      if (processed) {
        setCurrentSignatureUrl(processed);
        setHasSignature(true);
        onSave(processed);
        drawImageToCanvas(processed);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  return (
    <div className="w-full">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-blue-600" />
          {label}
        </label>

        <div className="flex items-center gap-2">
          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setMode('draw')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                mode === 'draw'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3 h-3" />
              <span>Tulis</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                mode === 'upload'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>Upload</span>
            </button>
          </div>

          {/* Clear Button */}
          {hasSignature && (
            <button
              type="button"
              onClick={clearSignature}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors"
            >
              <Eraser className="w-3 h-3" />
              <span>Hapus</span>
            </button>
          )}
        </div>
      </div>

      {/* DRAW MODE */}
      <div className={mode === 'draw' ? 'block' : 'hidden'}>
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
            className="cursor-crosshair touch-none block"
          />
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium px-4 text-center">
              Tanda tangan di area ini (Gunakan mouse atau sentuhan)
            </div>
          )}
        </div>
      </div>

      {/* UPLOAD MODE */}
      <div className={mode === 'upload' ? 'block' : 'hidden'}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {hasSignature && currentSignatureUrl ? (
          /* Preview state when signature is present */
          <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/60 space-y-2">
            <div
              className="relative flex items-center justify-center bg-white rounded-lg border border-slate-200 overflow-hidden"
              style={{
                height: `${Math.max(70, height - 35)}px`,
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                backgroundSize: '12px 12px'
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentSignatureUrl}
                alt="Tanda Tangan"
                className="max-h-full max-w-full object-contain p-2 select-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 px-0.5">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={removeBg}
                  onChange={e => handleToggleRemoveBg(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Transparankan background kertas</span>
              </label>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Ganti Gambar</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty dropzone state */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ height: `${height}px` }}
            className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all bg-white p-4 text-center ${
              isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400'
            }`}
          >
            <div className="p-2 rounded-full bg-blue-50 text-blue-600 mb-1.5">
              <Upload className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-blue-600 hover:underline">
                Klik untuk upload
              </span>
              <span className="text-slate-500"> atau seret file ke sini</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Format PNG, JPG, atau WEBP (Maks. 5MB)
            </div>
          </div>
        )}

        {uploadError && (
          <p className="text-[11px] text-rose-500 font-medium mt-1">
            {uploadError}
          </p>
        )}
      </div>
    </div>
  );
}
