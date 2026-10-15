"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Star,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Link as LinkIcon
} from "lucide-react";
import { TOOLS_LIST, getToolPath } from "@/lib/tools-config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolIcon from "@/components/ToolIcon";

// Custom elegant fallback loader for tools as they load in-browser
const LoadingTool = () => (
  <div className="w-full min-h-[400px] flex flex-col items-center justify-center py-12 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-900/60 shadow-sm">
    <div className="w-8 h-8 rounded-full border-2 border-slate-100 dark:border-zinc-800 border-t-indigo-500 animate-spin" />
    <span className="text-xs text-slate-400 dark:text-zinc-500 mt-3 font-mono font-medium">Getting your tool ready…</span>
  </div>
);

// Dynamic lazy loading of all fully built modules to optimize bundle size and speed
const MergePDF = dynamic(() => import("@/components/tools/MergePDF"), { ssr: false, loading: LoadingTool });
const SplitPDF = dynamic(() => import("@/components/tools/SplitPDF"), { ssr: false, loading: LoadingTool });
const CompressPDF = dynamic(() => import("@/components/tools/CompressPDF"), { ssr: false, loading: LoadingTool });
const PDFToImage = dynamic(() => import("@/components/tools/PDFToImage"), { ssr: false, loading: LoadingTool });
const ImageToPDF = dynamic(() => import("@/components/tools/ImageToPDF"), { ssr: false, loading: LoadingTool });
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
    window.dispatchEvent(new Event("storage"));
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
      case "merge-pdf":
        return <MergePDF />;
      case "split-pdf":
        return <SplitPDF />;
      case "compress-pdf":
        return <CompressPDF />;
      case "pdf-to-image":
        return <PDFToImage />;
      case "image-to-pdf":
        return <ImageToPDF />;
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
    <div className="tool-page min-h-screen flex flex-col justify-between">
      <div>
        {/* Sticky Header */}
        <Header />

        {/* Workspace navigation area */}
        <div className="tool-page-content" id="main-content" tabIndex={-1}>
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

          <div className="tool-page-heading">
            <div className={`tool-icon category-${tool.category.toLowerCase()}`}><ToolIcon name={tool.iconName} size={28} /></div>
            <div className="tool-page-title"><span className="eyebrow">{tool.category} / Your workspace</span><h1>{tool.name}</h1><p>{tool.description}</p></div>
            <div className="tool-page-actions"><button className={`secondary-button ${isFavorite ? "is-favorite" : ""}`} onClick={toggleFavorite} aria-pressed={isFavorite}><Star size={16} className={isFavorite ? "fill-current" : ""} />{isFavorite ? "Saved" : "Save tool"}</button><button className="icon-button" onClick={handleCopyLink} aria-label={copiedLink ? "Link copied" : "Copy tool link"}>{copiedLink ? <CheckCircle size={18} /> : <LinkIcon size={18} />}</button></div>
          </div>
          <div className="workspace-trust"><ShieldCheck size={15} /><span>Files stay on your device</span><span className="trust-divider" />Free to use<span className="trust-divider" />No account needed</div>

          {/* Interactive Feature Canvas Frame */}
          <div className="tool-canvas">
            {renderToolComponent()}
          </div>

          {/* Collateral informational grids: How it works & FAQs */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-zinc-150 dark:border-zinc-900 pt-16">
            {/* Guide column */}
            <div className="lg:col-span-4 space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 uppercase">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>Quick start</span>
                </div>
                <h2 className="text-xl font-display font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                  How it works
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  A few simple steps, and you’re done. Your files are processed right here in your browser.
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
                <span>Frequently asked questions</span>
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
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between text-xs sm:text-sm font-sans font-extrabold text-zinc-800 dark:text-zinc-200 hover:text-indigo-500 focus:outline-none transition-colors cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        <span className="text-zinc-400 font-mono text-xs pl-2 shrink-0 select-none">
                          {isOpen ? "−" : "+"}
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
                Keep your workflow going
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedTools.map((rel) => (
                  <Link
                    key={rel.id}
                    href={getToolPath(rel.category, rel.slug)}
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
