"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Trash2,
  RotateCw,
  CheckCircle,
  RefreshCw,
  Lock,
  Download,
  Plus,
  Settings2,
  FileText,
  FileCheck
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import confetti from "canvas-confetti";
import FeedbackWidget from "@/components/FeedbackWidget";

interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  formattedSize: string;
  previewUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  rotation: number; // 0, 90, 180, 270
}

type PageSizeOption = "fit" | "a4" | "letter";
type OrientationOption = "auto" | "portrait" | "landscape";
type MarginOption = "none" | "small" | "normal";
type FitModeOption = "contain" | "fill";

export default function ImageToPDF() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeOption>("fit");
  const [orientation, setOrientation] = useState<OrientationOption>("auto");
  const [margin, setMargin] = useState<MarginOption>("none");
  const [fitMode, setFitMode] = useState<FitModeOption>("contain");
  const [outputFileName, setOutputFileName] = useState("images-converted.pdf");

  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [lastDownloadedUrl, setLastDownloadedUrl] = useState<string | null>(null);
  const [lastDownloadedSize, setLastDownloadedSize] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Helper to load image dimensions and data URL preview
  const processImageFile = (file: File): Promise<ImageItem> => {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2, 9);
      const previewUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        resolve({
          id,
          file,
          name: file.name,
          size: file.size,
          formattedSize: formatSize(file.size),
          previewUrl,
          naturalWidth: img.naturalWidth || 800,
          naturalHeight: img.naturalHeight || 600,
          rotation: 0,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(previewUrl);
        reject(new Error(`Failed to load image: ${file.name}`));
      };

      img.src = previewUrl;
    });
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    setError("");
    setSuccess(false);

    const incoming = Array.from(fileList);
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/bmp",
    ];

    const newItems: ImageItem[] = [];
    for (const f of incoming) {
      if (!validImageTypes.includes(f.type) && !f.type.startsWith("image/")) {
        setError("Only valid image formats (PNG, JPG, WebP, GIF, SVG, BMP) are supported.");
        continue;
      }

      try {
        const item = await processImageFile(f);
        newItems.push(item);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to process one or more images.");
      }
    }

    if (newItems.length > 0) {
      setImages((prev) => [...prev, ...newItems]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // Reset file input value to allow selecting same files again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
    setSuccess(false);
  };

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setSuccess(false);
    setError("");
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setImages(updated);
    setSuccess(false);
  };

  const rotateImage = (id: string) => {
    setImages((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            rotation: (item.rotation + 90) % 360,
          };
        }
        return item;
      })
    );
    setSuccess(false);
  };

  // Convert an ImageItem onto an HTML5 Canvas to handle format normalization and rotation
  const renderItemToBytes = (
    item: ImageItem
  ): Promise<{ bytes: Uint8Array; isPng: boolean; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = async () => {
        try {
          const isRotated = item.rotation === 90 || item.rotation === 270;
          const canvasWidth = isRotated ? img.naturalHeight : img.naturalWidth;
          const canvasHeight = isRotated ? img.naturalWidth : img.naturalHeight;

          const canvas = document.createElement("canvas");
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Unable to create canvas context"));
            return;
          }

          // Fill white background for clean document rendering
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // Apply rotation
          ctx.translate(canvasWidth / 2, canvasHeight / 2);
          ctx.rotate((item.rotation * Math.PI) / 180);
          ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

          // Preserve PNG if source is PNG/SVG, otherwise default to high-grade JPEG
          const isPng = item.file.type === "image/png" || item.file.type === "image/svg+xml";
          const mimeType = isPng ? "image/png" : "image/jpeg";
          const quality = isPng ? undefined : 0.92;

          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                reject(new Error("Failed to encode image from canvas"));
                return;
              }
              const arrBuffer = await blob.arrayBuffer();
              resolve({
                bytes: new Uint8Array(arrBuffer),
                isPng,
                width: canvasWidth,
                height: canvasHeight,
              });
            },
            mimeType,
            quality
          );
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error(`Failed to load image buffer for ${item.name}`));
      img.src = item.previewUrl;
    });
  };

  const handleConvertToPDF = async () => {
    if (images.length === 0) {
      setError("Please add at least one image to convert.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);
    setProgressPercent(5);
    setProgressText("Initializing PDF Document...");

    try {
      const pdfDoc = await PDFDocument.create();

      // Page sizes in PDF points (72 points per inch)
      const A4_WIDTH = 595.28;
      const A4_HEIGHT = 841.89;
      const LETTER_WIDTH = 612.0;
      const LETTER_HEIGHT = 792.0;

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        const progress = Math.round(((i + 0.5) / images.length) * 85);
        setProgressPercent(progress);
        setProgressText(`Processing image ${i + 1} of ${images.length}: ${item.name}...`);

        const { bytes, isPng, width: imgW, height: imgH } = await renderItemToBytes(item);

        const embeddedImage = isPng
          ? await pdfDoc.embedPng(bytes)
          : await pdfDoc.embedJpg(bytes);

        if (pageSize === "fit") {
          // Fit to Image: page dimensions match image pixel dimensions exactly
          const page = pdfDoc.addPage([imgW, imgH]);
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: imgW,
            height: imgH,
          });
        } else {
          // Fixed document page size (A4 or Letter)
          const baseW = pageSize === "a4" ? A4_WIDTH : LETTER_WIDTH;
          const baseH = pageSize === "a4" ? A4_HEIGHT : LETTER_HEIGHT;

          let targetPageW = baseW;
          let targetPageH = baseH;

          if (orientation === "auto") {
            if (imgW > imgH) {
              targetPageW = Math.max(baseW, baseH);
              targetPageH = Math.min(baseW, baseH);
            } else {
              targetPageW = Math.min(baseW, baseH);
              targetPageH = Math.max(baseW, baseH);
            }
          } else if (orientation === "landscape") {
            targetPageW = Math.max(baseW, baseH);
            targetPageH = Math.min(baseW, baseH);
          } else {
            // portrait
            targetPageW = Math.min(baseW, baseH);
            targetPageH = Math.max(baseW, baseH);
          }

          // Margins in points
          let marginPts = 0;
          if (margin === "small") marginPts = 20; // ~7mm
          else if (margin === "normal") marginPts = 40; // ~14mm

          const availW = Math.max(1, targetPageW - marginPts * 2);
          const availH = Math.max(1, targetPageH - marginPts * 2);

          let drawW = availW;
          let drawH = availH;
          let drawX = marginPts;
          let drawY = marginPts;

          if (fitMode === "contain") {
            const scale = Math.min(availW / imgW, availH / imgH);
            drawW = imgW * scale;
            drawH = imgH * scale;
            drawX = marginPts + (availW - drawW) / 2;
            drawY = marginPts + (availH - drawH) / 2;
          }

          const page = pdfDoc.addPage([targetPageW, targetPageH]);
          page.drawImage(embeddedImage, {
            x: drawX,
            y: drawY,
            width: drawW,
            height: drawH,
          });
        }
      }

      setProgressPercent(95);
      setProgressText("Assembling and compressing PDF streams...");

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);

      setLastDownloadedUrl(downloadUrl);
      setLastDownloadedSize(formatSize(pdfBytes.length));

      // Trigger instant download
      let cleanName = outputFileName.trim();
      if (!cleanName.toLowerCase().endsWith(".pdf")) {
        cleanName += ".pdf";
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = cleanName || "images-converted.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setProgressPercent(100);
      setSuccess(true);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to convert images to PDF.");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      if (lastDownloadedUrl) {
        URL.revokeObjectURL(lastDownloadedUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 font-sans">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml, image/bmp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative ${
          isDragOver
            ? "border-amber-500 bg-amber-50/20 dark:bg-amber-950/20"
            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
        }`}
      >
        <div className="max-w-md mx-auto space-y-3 pointer-events-none">
          <div className="w-12 h-12 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center mx-auto text-zinc-500 dark:text-zinc-400 shadow-sm">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              Select or Drop Images to Convert to PDF
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Supports PNG, JPG, JPEG, WebP, GIF, SVG, and BMP. Combine multiple photos into one document.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            <span>Client-side only • No file size limit</span>
          </div>
        </div>
      </div>

      {/* Selected Images Queue */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm">
            {/* Queue Header */}
            <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-300">
                  IMAGE QUEUE ({images.length} {images.length === 1 ? "FILE" : "FILES"})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add More
                </button>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-red-500 hover:underline font-medium cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Queue Items */}
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[420px] overflow-y-auto">
              {images.map((item, index) => (
                <li
                  key={item.id}
                  className="px-5 py-3.5 flex items-center justify-between gap-4 text-sm hover:bg-zinc-50/30 dark:hover:bg-zinc-950/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center text-xs font-mono font-bold text-zinc-400 shrink-0">
                      #{index + 1}
                    </span>

                    {/* Thumbnail with rotation */}
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 overflow-hidden shrink-0 flex items-center justify-center relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        style={{ transform: `rotate(${item.rotation}deg)` }}
                        className="w-full h-full object-cover transition-transform duration-200"
                      />
                      {item.rotation !== 0 && (
                        <div className="absolute top-0.5 right-0.5 px-1 rounded bg-black/70 text-xs font-mono text-white">
                          {item.rotation}°
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 truncate">
                      <p className="font-medium text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 mt-0.5">
                        <span>{item.formattedSize}</span>
                        <span>•</span>
                        <span>
                          {item.rotation === 90 || item.rotation === 270
                            ? `${item.naturalHeight} × ${item.naturalWidth} px`
                            : `${item.naturalWidth} × ${item.naturalHeight} px`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Rotate button */}
                    <button
                      type="button"
                      title="Rotate 90° clockwise"
                      onClick={() => rotateImage(item.id)}
                      className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>

                    {/* Move up */}
                    <button
                      type="button"
                      title="Move up"
                      onClick={() => moveImage(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    {/* Move down */}
                    <button
                      type="button"
                      title="Move down"
                      onClick={() => moveImage(index, "down")}
                      disabled={index === images.length - 1}
                      className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      title="Remove image"
                      onClick={() => removeImage(item.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Document Settings */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200">
              <Settings2 className="w-4 h-4" />
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider">
                PDF Layout & Page Settings
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Page Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  Page Format
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as PageSizeOption)}
                  className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  <option value="fit">Fit to Image (No Borders)</option>
                  <option value="a4">A4 (210 × 297 mm)</option>
                  <option value="letter">US Letter (8.5 × 11 in)</option>
                </select>
                <p className="text-xs text-zinc-400">
                  {pageSize === "fit"
                    ? "Each page matches image dimensions exactly."
                    : "Standard document sheet dimensions."}
                </p>
              </div>

              {/* Orientation */}
              <div className="space-y-1.5">
                <label
                  className={`text-xs font-semibold ${
                    pageSize === "fit"
                      ? "text-zinc-300 dark:text-zinc-700"
                      : "text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  Orientation
                </label>
                <select
                  disabled={pageSize === "fit"}
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as OrientationOption)}
                  className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-zinc-800 dark:text-zinc-200 disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  <option value="auto">Auto (Smart per Image)</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
                <p className="text-xs text-zinc-400">
                  {pageSize === "fit" ? "Defined by image aspect" : "Page sheet alignment"}
                </p>
              </div>

              {/* Margins */}
              <div className="space-y-1.5">
                <label
                  className={`text-xs font-semibold ${
                    pageSize === "fit"
                      ? "text-zinc-300 dark:text-zinc-700"
                      : "text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  Margins
                </label>
                <select
                  disabled={pageSize === "fit"}
                  value={margin}
                  onChange={(e) => setMargin(e.target.value as MarginOption)}
                  className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-zinc-800 dark:text-zinc-200 disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  <option value="none">None (0 mm)</option>
                  <option value="small">Small (7 mm)</option>
                  <option value="normal">Normal (14 mm)</option>
                </select>
                <p className="text-xs text-zinc-400">
                  {pageSize === "fit" ? "Border-free edge fit" : "Border padding on pages"}
                </p>
              </div>

              {/* Fit Mode */}
              <div className="space-y-1.5">
                <label
                  className={`text-xs font-semibold ${
                    pageSize === "fit"
                      ? "text-zinc-300 dark:text-zinc-700"
                      : "text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  Image Scaling
                </label>
                <select
                  disabled={pageSize === "fit"}
                  value={fitMode}
                  onChange={(e) => setFitMode(e.target.value as FitModeOption)}
                  className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-zinc-800 dark:text-zinc-200 disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  <option value="contain">Contain (Keep Proportions)</option>
                  <option value="fill">Fill (Stretch to Margin)</option>
                </select>
                <p className="text-xs text-zinc-400">
                  {pageSize === "fit" ? "Original pixel aspect ratio" : "Scaling within printable bounds"}
                </p>
              </div>
            </div>

            {/* Filename customization */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 shrink-0">
                Output File Name:
              </label>
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  placeholder="images-converted.pdf"
                  className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress State */}
      {loading && (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-600 dark:text-zinc-300">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
              {progressText}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-200 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <p className="text-xs text-red-500 font-mono bg-red-50 dark:bg-red-950/20 px-3 py-2.5 rounded-lg border border-red-100 dark:border-red-950/30">
          {error}
        </p>
      )}

      {/* Success State */}
      {success && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-xl text-xs text-emerald-700 dark:text-emerald-400">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-semibold text-sm">PDF Generated Successfully!</p>
                <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                  Converted {images.length} {images.length === 1 ? "page" : "pages"} ({lastDownloadedSize}). Automatic download triggered.
                </p>
              </div>
            </div>

            {lastDownloadedUrl && (
              <a
                href={lastDownloadedUrl}
                download={outputFileName || "images-converted.pdf"}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-colors cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Download Again
              </a>
            )}
          </div>

          <FeedbackWidget toolName="Image to PDF" />
        </div>
      )}

      {/* Convert Action Button */}
      <button
        onClick={handleConvertToPDF}
        disabled={loading || images.length === 0}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Converting and Compiling PDF...
          </>
        ) : (
          <>
            <FileCheck className="w-4 h-4" />
            <span>
              Convert to PDF ({images.length} {images.length === 1 ? "Image" : "Images"})
            </span>
          </>
        )}
      </button>

      {/* Security Sandbox Footer */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-zinc-400">
        <Lock className="w-3 h-3 text-zinc-400" />
        <span>100% Client-Side In-Browser Execution. Your images never leave your device.</span>
      </div>
    </div>
  );
}
