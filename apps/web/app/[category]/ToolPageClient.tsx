"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import {
  Star,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Link as LinkIcon
} from "lucide-react";
import { TOOLS_LIST, ToolMetadata } from "@/lib/tools-config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Custom elegant fallback loader for tools as they load in-browser
const LoadingTool = () => (
  <div className="w-full min-h-[400px] flex flex-col items-center justify-center py-12 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-900/60 shadow-sm">
    <div className="w-8 h-8 rounded-full border-2 border-slate-100 dark:border-zinc-800 border-t-indigo-500 animate-spin" />
    <span className="text-xs text-slate-400 dark:text-zinc-500 mt-3 font-mono font-medium">Initializing tool sandbox...</span>
  </div>
);

// Dynamic lazy loading of all fully built modules to optimize bundle size and speed
const AITextGenerator = dynamic(() => import("@/components/tools/AITextGenerator"), { ssr: false, loading: LoadingTool });
const AISummarizer = dynamic(() => import("@/components/tools/AISummarizer"), { ssr: false, loading: LoadingTool });
const AIPromptGenerator = dynamic(() => import("@/components/tools/AIPromptGenerator"), { ssr: false, loading: LoadingTool });
const MergePDF = dynamic(() => import("@/components/tools/MergePDF"), { ssr: false, loading: LoadingTool });
const SplitPDF = dynamic(() => import("@/components/tools/SplitPDF"), { ssr: false, loading: LoadingTool });
const CompressPDF = dynamic(() => import("@/components/tools/CompressPDF"), { ssr: false, loading: LoadingTool });
const PDFToImage = dynamic(() => import("@/components/tools/PDFToImage"), { ssr: false, loading: LoadingTool });
const ImageCompressor = dynamic(() => import("@/components/tools/ImageCompressor"), { ssr: false, loading: LoadingTool });
const ImageConverter = dynamic(() => import("@/components/tools/ImageConverter"), { ssr: false, loading: LoadingTool });
const BackgroundRemover = dynamic(() => import("@/components/tools/BackgroundRemover"), { ssr: false, loading: LoadingTool });
const SVGMinifier = dynamic(() => import("@/components/tools/SVGMinifier"), { ssr: false, loading: LoadingTool });
const JSONFormatter = dynamic(() => import("@/components/tools/JSONFormatter"), { ssr: false, loading: LoadingTool });
const JWTDecoder = dynamic(() => import("@/components/tools/JWTDecoder"), { ssr: false, loading: LoadingTool });
const UUIDGenerator = dynamic(() => import("@/components/tools/UUIDGenerator"), { ssr: false, loading: LoadingTool });
const Base64Tool = dynamic(() => import("@/components/tools/Base64Tool"), { ssr: false, loading: LoadingTool });
const RegexTester = dynamic(() => import("@/components/tools/RegexTester"), { ssr: false, loading: LoadingTool });
const QRGenerator = dynamic(() => import("@/components/tools/QRGenerator"), { ssr: false, loading: LoadingTool });
const PasswordGenerator = dynamic(() => import("@/components/tools/PasswordGenerator"), { ssr: false, loading: LoadingTool });
const MarkdownPreviewer = dynamic(() => import("@/components/tools/MarkdownPreviewer"), { ssr: false, loading: LoadingTool });
const WordCounter = dynamic(() => import("@/components/tools/WordCounter"), { ssr: false, loading: LoadingTool });
const DiffChecker = dynamic(() => import("@/components/tools/DiffChecker"), { ssr: false, loading: LoadingTool });
const VoiceRecorder = dynamic(() => import("@/components/tools/VoiceRecorder"), { ssr: false, loading: LoadingTool });
const ScreenRecorder = dynamic(() => import("@/components/tools/ScreenRecorder"), { ssr: false, loading: LoadingTool });
const AudioCutter = dynamic(() => import("@/components/tools/AudioCutter"), { ssr: false, loading: LoadingTool });
const VideoToGIF = dynamic(() => import("@/components/tools/VideoToGIF"), { ssr: false, loading: LoadingTool });

interface ToolPageClientProps {
  slug: string;
}

export default function ToolPageClient({ slug }: ToolPageClientProps) {
  const tool = useMemo(() => {
    return TOOLS_LIST.find((t) => t.slug === slug);
  }, [slug]);

  if (!tool) {
    notFound();
  }

  const ratingCount = useMemo(() => {
    if (!tool) return 150;
    if (tool.usageCount.includes("K")) {
      return Math.floor(parseFloat(tool.usageCount.replace("K", "")) * 10);
    } else {
      return Math.floor(parseFloat(tool.usageCount) * 0.1) || 150;
    }
  }, [tool]);

  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const storedFavs = localStorage.getItem("mene_favorites");
        if (storedFavs) {
          const parsed = JSON.parse(storedFavs) as string[];
          return parsed.includes(slug);
        }
      } catch (e) {}
    }
    return false;
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Sync recents on mount
  useEffect(() => {
    const storedRecents = localStorage.getItem("mene_recents");
    let recents: string[] = [];
    if (storedRecents) {
      try {
        recents = JSON.parse(storedRecents) as string[];
      } catch (e) {}
    }
    // Remove if already in list and push to top
    recents = [slug, ...recents.filter((r) => r !== slug)].slice(0, 5);
    localStorage.setItem("mene_recents", JSON.stringify(recents));
  }, [slug]);

  const toggleFavorite = () => {
    const storedFavs = localStorage.getItem("mene_favorites");
    let favs: string[] = [];
    if (storedFavs) {
      try {
        favs = JSON.parse(storedFavs) as string[];
      } catch (e) {}
    }

    let nextFavs: string[];
    if (favs.includes(slug)) {
      nextFavs = favs.filter((f) => f !== slug);
      setIsFavorite(false);
    } else {
      nextFavs = [...favs, slug];
      setIsFavorite(true);
    }

    localStorage.setItem("mene_favorites", JSON.stringify(nextFavs));
    // Trigger storage event to notify header
    window.dispatchEvent(new Event("storage"));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Render correct module conditionally matching the registry slug
  const renderToolComponent = () => {
    switch (tool.slug) {
      case "ai-text-generator":
        return <AITextGenerator />;
      case "ai-summarizer":
        return <AISummarizer />;
      case "ai-prompt-generator":
        return <AIPromptGenerator />;
      case "merge-pdf":
        return <MergePDF />;
      case "split-pdf":
        return <SplitPDF />;
      case "compress-pdf":
        return <CompressPDF />;
      case "pdf-to-image":
        return <PDFToImage />;
      case "image-compressor":
        return <ImageCompressor />;
      case "image-converter":
        return <ImageConverter />;
      case "background-remover":
        return <BackgroundRemover />;
      case "svg-optimizer":
        return <SVGMinifier />;
      case "json-formatter":
        return <JSONFormatter />;
      case "jwt-decoder":
        return <JWTDecoder />;
      case "uuid-generator":
        return <UUIDGenerator />;
      case "base64-encoder":
        return <Base64Tool />;
      case "regex-tester":
        return <RegexTester />;
      case "qr-generator":
        return <QRGenerator />;
      case "password-generator":
        return <PasswordGenerator />;
      case "markdown-preview":
        return <MarkdownPreviewer />;
      case "word-counter":
        return <WordCounter />;
      case "diff-checker":
        return <DiffChecker />;
      case "voice-recorder":
        return <VoiceRecorder />;
      case "screen-recorder":
        return <ScreenRecorder />;
      case "audio-cutter":
        return <AudioCutter />;
      case "video-to-gif":
        return <VideoToGIF />;
      default:
        return (
          <div className="py-12 text-center text-xs font-mono text-zinc-400">
            This workspace utility is currently under compilation.
          </div>
        );
    }
  };

  // Filter related tools lists
  const relatedTools = TOOLS_LIST.filter((t) => tool.relatedSlugs.includes(t.slug));

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-50 selection:bg-zinc-900/10 dark:selection:bg-white/10 flex flex-col justify-between">
      <div>
        {/* Sticky Header */}
        <Header />

        {/* Workspace navigation area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mb-6">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-300" />
            <span className="uppercase">{tool.category}</span>
            <ChevronRight className="w-3 h-3 text-zinc-300" />
            <span className="text-zinc-600 dark:text-zinc-300 font-bold">{tool.name}</span>
          </div>

          {/* Hero details layout */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200/60 dark:border-zinc-900">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-zinc-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
                  <TrendingUp className="w-3 h-3 text-indigo-500 animate-pulse" />
                  <span>{tool.usageCount} calculations completed</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-amber-250/30 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10 text-[10px] font-mono tracking-wider text-amber-600 dark:text-amber-400 uppercase font-bold">
                  <span className="text-amber-500 text-xs">★</span>
                  <span>4.9 / 5 ({ratingCount} votes)</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                {tool.name}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                {tool.description}
              </p>
              {/* Trust badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {tool.category === "AI" ? (
                  <>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">
                      FREE
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200/40 dark:border-zinc-800/60">
                      NO ACCOUNT REQUIRED
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30">
                      POWERED BY GROQ AI
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">
                      FREE
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30">
                      NO UPLOAD REQUIRED
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200/40 dark:border-zinc-800/60">
                      NO ACCOUNT REQUIRED
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Favorites and Copy Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleFavorite}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer focus:outline-none flex items-center gap-2 text-xs font-mono font-bold ${
                  isFavorite
                    ? "bg-amber-50/50 dark:bg-amber-950/15 border-amber-300 dark:border-amber-900 text-amber-600 dark:text-amber-500"
                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                }`}
                title="Add to Favorite Shortcuts"
              >
                <Star className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                <span className="hidden sm:inline">{isFavorite ? "FAVORITED" : "FAVORITE"}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="p-2.5 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-all cursor-pointer focus:outline-none flex items-center gap-2 text-xs font-mono font-bold"
                title="Copy tool link"
              >
                {copiedLink ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedLink ? "COPIED" : "SHARE"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Feature Canvas Frame */}
          <div className="mt-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 shadow-sm rounded-3xl p-6 sm:p-8 min-h-[400px]">
            {renderToolComponent()}
          </div>

          {/* Collateral informational grids: How it works & FAQs */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-zinc-150 dark:border-zinc-900 pt-16">
            {/* Guide column */}
            <div className="lg:col-span-4 space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 uppercase">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>Interactive Guide</span>
                </div>
                <h2 className="text-xl font-display font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                  How it works
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  Mene operations run directly on your browser thread. This isolates variables, provides extreme speeds, and preserves confidentiality.
                </p>
              </div>

              <ol className="space-y-4 font-mono text-xs">
                {tool.howItWorks.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center shrink-0 font-bold text-zinc-500 dark:text-zinc-400">
                      {idx + 1}
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-300 leading-relaxed font-semibold pt-0.5">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* FAQs Accordion column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 uppercase">
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                <span>Knowledgebase FAQs</span>
              </div>

              <div className="space-y-3">
                {tool.faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={index}
                      className="border border-zinc-200/80 dark:border-zinc-900 rounded-2xl bg-white dark:bg-zinc-950/20 overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between text-xs sm:text-sm font-sans font-extrabold text-zinc-800 dark:text-zinc-200 hover:text-indigo-500 focus:outline-none transition-colors cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        <span className="text-zinc-400 font-mono text-xs pl-2 shrink-0 select-none">
                          {isOpen ? "[ CLOSE ]" : "[ OPEN ]"}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Related utilities navigation bar */}
          {relatedTools.length > 0 && (
            <div className="mt-16 border-t border-zinc-150 dark:border-zinc-900 pt-12 space-y-6">
              <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                COMPATIBLE COMPANION UTILITIES
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedTools.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/${rel.slug}`}
                    className="border border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-5 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-800 hover:shadow-sm transition-all"
                  >
                    <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase block mb-1">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 hover:text-indigo-500 transition-colors">
                      {rel.name}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed font-medium">
                      {rel.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shared Footer component */}
      <Footer />
    </div>
  );
}
