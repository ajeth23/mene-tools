"use client";

import { useState } from "react";
import { Combine, Upload, FileText, ArrowUp, ArrowDown, Trash2, CheckCircle, RefreshCw, Lock, Image as ImageIcon } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { getPdfDoc, renderPdfPageDataUrl } from "@/lib/pdf-utils";
import FeedbackWidget from "@/components/FeedbackWidget";

interface SelectedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  pages: number | string;
  preview?: string;
}

export default function MergePDF() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    
    setError("");
    setSuccess(false);

    // Process files sequentially to get page counts and trigger preview renders
    for (const f of incoming) {
      if (f.type !== "application/pdf") {
        setError("Invalid file format. Please upload PDF files only.");
        continue;
      }

      const fileId = Math.random().toString(36).substring(2, 9);
      let pageCount: number | string = "Pending";
      let pdfDoc: any = null;

      try {
        pdfDoc = await getPdfDoc(f);
        pageCount = pdfDoc.numPages;
      } catch (err) {
        pageCount = "Unreadable";
      }

      // Add file to list (without preview initially)
      const newFileObj: SelectedFile = {
        id: fileId,
        file: f,
        name: f.name,
        size: formatSize(f.size),
        pages: pageCount,
      };

      setFiles((prev) => [...prev, newFileObj]);

      // Render the first page preview asynchronously
      if (pdfDoc && typeof pageCount === "number") {
        (async () => {
          try {
            const dataUrl = await renderPdfPageDataUrl(pdfDoc, 1, 0.25);
            setFiles((prev) =>
              prev.map((item) => (item.id === fileId ? { ...item, preview: dataUrl } : item))
            );
          } catch (err) {
            console.error(`Failed to render preview for merged file ${f.name}`, err);
          }
        })();
      }
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setSuccess(false);
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= files.length) return;

    const reordered = [...files];
    const [removed] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, removed);
    setFiles(reordered);
    setSuccess(false);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please upload at least two PDF files to merge.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Create a fresh PDF container
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const fileBuffer = await item.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      // Save PDF as bytes
      const pdfBytes = await mergedPdf.save();

      // Download
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `merged_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred during local PDF merging.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-8 text-center hover:border-zinc-300 dark:hover:border-zinc-700 transition-all relative">
        <input
          type="file"
          multiple
          accept="application/pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center mx-auto text-zinc-500 dark:text-zinc-400 shadow-sm">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              Select or Drop PDF Files
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Select multiple PDFs to merge. Processing occurs entirely in-browser.
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-500">
              MERGE QUEUE ({files.length} FILES)
            </span>
            <button
              onClick={() => setFiles([])}
              className="text-xs text-red-500 hover:underline focus:outline-none"
            >
              Clear All
            </button>
          </div>

          <ul className="divide-y divide-zinc-100 dark:divide-zinc-850">
            {files.map((item, index) => (
              <li
                key={item.id}
                className="px-5 py-4 flex items-center justify-between gap-4 text-sm hover:bg-zinc-50/30 dark:hover:bg-zinc-950/20 transition-colors animate-[fadeIn_0.2s_ease-out]"
              >
                <div className="flex items-center gap-3 truncate">
                  {/* Visual first-page preview */}
                  {item.preview ? (
                    <div className="w-10 h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={item.preview} alt="First page preview" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-10 h-12 bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded shadow-sm shrink-0 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
                      <FileText className="w-5 h-5 shrink-0" />
                    </div>
                  )}

                  <div className="truncate">
                    <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {item.name}
                    </p>
                    <div className="flex gap-2 text-xs text-zinc-400 mt-0.5 font-mono">
                      <span>{item.size}</span>
                      <span>•</span>
                      <span>{item.pages} {item.pages === 1 ? "page" : "pages"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveFile(index, "up")}
                    disabled={index === 0}
                    className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-400 hover:text-zinc-850 dark:hover:text-zinc-250 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFile(index, "down")}
                    disabled={index === files.length - 1}
                    className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-400 hover:text-zinc-850 dark:hover:text-zinc-250 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 font-mono bg-red-50 dark:bg-red-950/20 px-3 py-2.5 rounded-lg border border-red-100 dark:border-red-950/30">
          {error}
        </p>
      )}

      {success && (
        <>
          <div className="flex items-center gap-2.5 px-4 py-3 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>PDF files merged successfully! Download triggered.</span>
          </div>
           <FeedbackWidget toolName="Merge PDF" />
        </>
      )}

      <button
        onClick={handleMerge}
        disabled={loading || files.length < 2}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-sm font-semibold transition-all shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Merging document layers...
          </>
        ) : (
          <>
            <Combine className="w-4 h-4" />
            <span>Merge PDFs ({files.length} Files)</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-zinc-400">
        <Lock className="w-3 h-3 text-zinc-400" />
        <span>Processed locally on your device with high-entropy client sandbox.</span>
      </div>
    </div>
  );
}
