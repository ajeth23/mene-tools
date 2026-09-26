"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  FileText,
  Combine,
  Scissors,
  Minimize2,
  FileImage,
  ImageDown,
  RefreshCw,
  Eraser,
  Compass,
  Code2,
  KeyRound,
  Hash,
  Binary,
  SearchCode,
  QrCode,
  ShieldAlert,
  PenTool,
  AlignLeft,
  Mic,
  Video,
  Film,
  Search,
  ArrowRight,
  TrendingUp,
  Cpu,
  Command,
  Plus,
  ChevronRight
} from "lucide-react";
import { TOOLS_LIST, ToolMetadata, getToolPath } from "@/lib/tools-config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BrandLogo } from "@/components/BrandLogo";

// Elegant mapping function to support dynamic metadata icon renderings natively
function getIconComponent(iconName: string, className = "w-5 h-5") {
  switch (iconName) {
    case "Sparkles":
      return <Sparkles className={className} />;
    case "FileText":
      return <FileText className={className} />;
    case "Combine":
      return <Combine className={className} />;
    case "Scissors":
      return <Scissors className={className} />;
    case "Minimize2":
      return <Minimize2 className={className} />;
    case "FileImage":
      return <FileImage className={className} />;
    case "ImageDown":
      return <ImageDown className={className} />;
    case "RefreshCw":
      return <RefreshCw className={className} />;
    case "Eraser":
      return <Eraser className={className} />;
    case "Compass":
      return <Compass className={className} />;
    case "Code2":
      return <Code2 className={className} />;
    case "KeyRound":
      return <KeyRound className={className} />;
    case "Hash":
      return <Hash className={className} />;
    case "Binary":
      return <Binary className={className} />;
    case "SearchCode":
      return <SearchCode className={className} />;
    case "QrCode":
      return <QrCode className={className} />;
    case "ShieldAlert":
      return <ShieldAlert className={className} />;
    case "PenTool":
      return <PenTool className={className} />;
    case "AlignLeft":
      return <AlignLeft className={className} />;
    case "Mic":
      return <Mic className={className} />;
    case "Video":
      return <Video className={className} />;
    case "Film":
      return <Film className={className} />;
    default:
      return <Cpu className={className} />;
  }
}

function getCategoryColorClasses(category: string) {
  switch (category) {
    case "PDF":
    case "PDF Suite":
      return {
        bg: "bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20",
        text: "text-blue-600 dark:text-blue-400",
        accent: "bg-blue-500",
        hoverTitle: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
      };
    case "Images":
    case "Image Processing":
      return {
        bg: "bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/20",
        text: "text-teal-600 dark:text-teal-400",
        accent: "bg-teal-500",
        hoverTitle: "group-hover:text-teal-600 dark:group-hover:text-teal-400"
      };
    case "Developers":
    case "Developer Tools":
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        accent: "bg-emerald-500",
        hoverTitle: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
      };
    case "Productivity":
    case "Productivity Kits":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
        accent: "bg-amber-500",
        hoverTitle: "group-hover:text-amber-600 dark:group-hover:text-amber-400"
      };
    case "Media":
    case "Media & Audio":
      return {
        bg: "bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/20",
        text: "text-purple-600 dark:text-purple-400",
        accent: "bg-purple-500",
        hoverTitle: "group-hover:text-purple-600 dark:group-hover:text-purple-400"
      };
    default:
      return {
        bg: "bg-slate-500/10 dark:bg-slate-500/15 border border-slate-500/20",
        text: "text-slate-600 dark:text-slate-400",
        accent: "bg-slate-500",
        hoverTitle: "group-hover:text-slate-900 dark:group-hover:text-white"
      };
  }
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const cats = new Set(TOOLS_LIST.map((t) => t.category));
    return ["All", ...Array.from(cats)];
  }, []);

  const filteredTools = useMemo(() => {
    const queryWords = search.toLowerCase().trim().split(/\s+/).filter(Boolean);

    return TOOLS_LIST.filter((tool) => {
      const matchesCat = activeCategory === "All" || tool.category === activeCategory;
      if (!matchesCat) return false;

      // If search input is empty, show all tools in active category
      if (queryWords.length === 0) return true;

      // Every word in the query must match something in the tool
      return queryWords.every((word) => {
        if (word === "free") return true; // Since all tools are free, "free" matches everything
        return (
          tool.name.toLowerCase().includes(word) ||
          tool.description.toLowerCase().includes(word) ||
          tool.category.toLowerCase().includes(word) ||
          (tool.seoTitle && tool.seoTitle.toLowerCase().includes(word)) ||
          (tool.seoDesc && tool.seoDesc.toLowerCase().includes(word))
        );
      });
    });
  }, [search, activeCategory]);

  const popularTools = useMemo(() => {
    // Return top 4 tools with highest usage numbers as highlights
    return TOOLS_LIST.slice(0, 4);
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFCFD] dark:bg-[#0B1114] text-slate-900 dark:text-zinc-50 selection:bg-indigo-100 dark:selection:bg-white/10 flex flex-col justify-between">
      <div>
        <Header />

        {/* Premium Hero Header Section */}
        <section className="relative overflow-hidden pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-zinc-900/60">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-sm text-[10px] font-mono tracking-wider text-slate-500 dark:text-zinc-400 uppercase select-none hover:border-amber-500/40 hover:shadow-md transition-all duration-300">
              <BrandLogo showText={false} className="!h-4 !w-4" />
              <span className="w-[1.5px] h-3.5 bg-slate-200 dark:bg-zinc-800" />
              <span className="font-sans font-extrabold tracking-wide text-slate-700 dark:text-zinc-300">Mene Ecosystem</span>
            </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display tracking-tight font-black max-w-5xl mx-auto leading-[1.05] text-slate-900 dark:text-zinc-50">
            Free Utilities for <br className="hidden md:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 dark:from-amber-400 dark:via-amber-300 dark:to-yellow-300">
              PDFs, Images, & Developers
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 dark:text-zinc-450 max-w-2xl mx-auto font-medium leading-relaxed">
            The world&apos;s most elegant, minimal utilities platform. Fast, private tools designed for developers, creators, and professionals — processed entirely inside your local sandbox.
          </p>

          {/* Command Bar Style Search */}
          <div className="w-full max-w-2xl mx-auto relative pt-4 group">
            <div className="absolute inset-0 bg-amber-500/10 dark:bg-amber-500/5 blur-2xl group-hover:bg-amber-500/20 transition-all rounded-full"></div>
            <div className="relative flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl p-1 overflow-hidden focus-within:border-amber-500/50">
              <div className="pl-4 pr-2 text-slate-400">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for PDF tools, image converters, developer utilities..."
                className="flex-1 py-4 px-2 outline-none text-slate-700 dark:text-zinc-100 font-medium placeholder:text-slate-300 dark:placeholder-zinc-650 bg-transparent"
              />
              <div className="flex items-center gap-1 pr-3 select-none">
                <kbd className="px-2 py-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Ctrl</kbd>
                <kbd className="px-2 py-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded text-[10px] font-bold text-slate-400 uppercase tracking-tighter">K</kbd>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tools Container Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-900 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full border transition-all cursor-pointer focus:outline-none ${
                    active
                      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 font-extrabold shadow-xs"
                      : "text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 border-transparent font-bold"
                  }`}
                >
                  {cat}
                </button>

              );
            })}
          </div>

          <div className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-widest">
            Displaying <span className="text-slate-800 dark:text-zinc-200 font-extrabold">{filteredTools.length}</span> utilities
          </div>
        </div>

        {/* Dynamic Grid of Tools */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredTools.map((tool) => {
                const colors = getCategoryColorClasses(tool.category);
                return (
                  <motion.div
                    key={tool.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <Link
                      href={getToolPath(tool.category, tool.slug)}
                      className="relative group flex flex-col justify-between h-full bg-zinc-500/[0.02] dark:bg-white/[0.02] hover:bg-zinc-500/[0.05] dark:hover:bg-white/[0.05] backdrop-blur-md border border-zinc-200/60 dark:border-white/[0.06] hover:border-zinc-300/80 dark:hover:border-white/[0.14] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_16px_36px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer overflow-hidden"
                    >
                      {/* Subtle ambient hover glow in dark mode */}
                      <div
                        className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none ${colors.accent}`}
                      />

                      <div className="space-y-4">
                        {/* Top Header: Icon + Category + '● Local' Pill + Subtle Chevron */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${colors.bg} ${colors.text} group-hover:scale-105`}
                            >
                              {getIconComponent(tool.iconName, "w-5 h-5")}
                            </div>
                            <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                              {tool.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Local</span>
                            </span>
                            <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all duration-200" />
                          </div>
                        </div>

                        {/* Main Content: Tool Title & Description */}
                        <div className="space-y-1.5">
                          <h3
                            className={`font-display font-bold text-[17px] tracking-tight leading-snug text-zinc-900 dark:text-zinc-50 transition-colors duration-200 ${colors.hoverTitle}`}
                          >
                            {tool.name}
                          </h3>
                          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-normal tracking-normal">
                            {tool.description}
                          </p>
                        </div>
                      </div>

                      {/* Clean Minimal Footer */}
                      <div className="pt-4 mt-5 border-t border-zinc-100 dark:border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-zinc-400 dark:text-zinc-500 font-medium">
                        <span>{tool.usageCount} calculations</span>
                        <span className="text-[11px] uppercase font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                          Open &rarr;
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-white/[0.08] rounded-3xl space-y-3 bg-zinc-500/[0.02] dark:bg-white/[0.02] backdrop-blur-md">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">NO UTILITIES FOUND MATCHING &quot;{search.toUpperCase()}&quot;</div>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
              className="text-xs text-indigo-600 hover:underline font-bold font-mono focus:outline-none cursor-pointer"
            >
              CLEAR ALL FILTERS
            </button>
          </div>
        )}
      </main>

      {/* SEO-focused Directory Index section */}
      <section className="border-t border-b border-slate-100 dark:border-zinc-900/60 py-16 bg-slate-50/50 dark:bg-zinc-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight text-slate-900 dark:text-zinc-50">
                Tools that work the way you expect
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                Mene Tools is a collection of fast, privacy-focused utilities for developers, creators, and professionals. Many tools process your files directly in your browser, so your data stays on your device instead of being uploaded to a remote server.
              </p>
            </div>
            
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-500">PDF Tools</h3>
                <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-zinc-300">
                  <li>
                    <Link href="/pdf/merge" className="hover:text-indigo-500 transition-colors">Merge PDF</Link>
                  </li>
                  <li>
                    <Link href="/pdf/split" className="hover:text-indigo-500 transition-colors">Split PDF</Link>
                  </li>
                  <li>
                    <Link href="/pdf/compress" className="hover:text-indigo-500 transition-colors">Compress PDF</Link>
                  </li>
                  <li>
                    <Link href="/pdf/to-image" className="hover:text-indigo-500 transition-colors">PDF to Image</Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-pink-500">Image Tools</h3>
                <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-zinc-300">
                  <li>
                    <Link href="/images/compressor" className="hover:text-pink-500 transition-colors">Compress Image</Link>
                  </li>
                  <li>
                    <Link href="/images/converter" className="hover:text-pink-500 transition-colors">Convert Image</Link>
                  </li>
                  <li>
                    <Link href="/images/background-remover" className="hover:text-pink-500 transition-colors">Remove Background</Link>
                  </li>
                  <li>
                    <Link href="/images/svg-optimizer" className="hover:text-pink-500 transition-colors">Optimize SVG</Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500">Developer Tools</h3>
                <ul className="space-y-2 text-xs font-semibold text-slate-600 dark:text-zinc-300">
                  <li>
                    <Link href="/developers/json-formatter" className="hover:text-emerald-500 transition-colors">JSON Formatter</Link>
                  </li>
                  <li>
                    <Link href="/developers/jwt-decoder" className="hover:text-emerald-500 transition-colors">JWT Decoder</Link>
                  </li>
                  <li>
                    <Link href="/developers/uuid-generator" className="hover:text-emerald-500 transition-colors">UUID Generator</Link>
                  </li>
                  <li>
                    <Link href="/developers/regex-tester" className="hover:text-emerald-500 transition-colors">Regex Tester</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlighted Trust & Security Footer Section */}
      <section className="bg-white dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-900 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Direct In-Browser Compute</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
              Files, credentials, and text segments are decoded and compiled completely within your device&apos;s memory. No tracking cookies or cloud storage.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Zero Commercial Ads</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
              An ecosystem stripped of intrusive promotional banners, capture traps, and popups. Designed purely for seamless flow.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">100% Client-Side Private</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
              Every operation executes strictly inside your browser sandbox. No documents, files, or sensitive inputs ever leave your device.
            </p>
          </div>
        </div>
      </section>

      </div>
      <Footer />
    </div>
  );
}
