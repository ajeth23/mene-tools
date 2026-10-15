"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, X, Zap, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolIcon from "@/components/ToolIcon";
import { TOOLS_LIST, getToolPath, ToolMetadata } from "@/lib/tools-config";
const categories = ["All", "PDF", "Images", "Developers", "Productivity", "Media"];
function ToolCard({ tool }: { tool: ToolMetadata }) {
  return <Link className="tool-card" href={getToolPath(tool.category, tool.slug)}><div className="tool-card-top"><span className={`tool-icon category-${tool.category.toLowerCase()}`}><ToolIcon name={tool.iconName} /></span><ArrowRight className="card-arrow" size={18} /></div><h3>{tool.name}</h3><p>{tool.description}</p><span className="card-category">{tool.category}</span></Link>;
}
export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const syncHash = () => { const hash = decodeURIComponent(window.location.hash); const selected = hash.replace("#category-", ""); if (categories.includes(selected)) { setCategory(selected); setSearch(""); } if (hash === "#tool-search") input.current?.focus(); };
    const shortcut = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); input.current?.focus(); } };
    syncHash(); window.addEventListener("hashchange", syncHash); window.addEventListener("keydown", shortcut);
    return () => { window.removeEventListener("hashchange", syncHash); window.removeEventListener("keydown", shortcut); };
  }, []);
  const filtered = TOOLS_LIST.filter(t => (category === "All" || category === t.category) && search.toLowerCase().trim().split(/\s+/).every(word => `${t.name} ${t.description} ${t.category} ${t.seoTitle}`.toLowerCase().includes(word)));
  const featured = ["merge-pdf", "image-compressor", "json-formatter", "qr-generator"].map(slug => TOOLS_LIST.find(t => t.slug === slug)!);
  return <div className="min-h-screen flex flex-col"><Header /><main className="dashboard-main" id="main-content">
    <section className="dashboard-hero"><div className="hero-copy"><span className="eyebrow"><span /> Small tools. Big possibilities.</span><h1>Everyday tools.<br /><span>Effortlessly.</span></h1><p>A simpler way to work with PDFs, images, code, and more.<br className="hidden sm:block" /> Everything you need, right in your browser.</p><div className="hero-proof"><span><ShieldCheck size={15} /> Files stay on your device</span><span><Zap size={15} /> Free. No sign-up.</span></div></div><div className="hero-art" aria-hidden="true"><div className="art-grid" /><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="floating-tile tile-pdf"><ToolIcon name="FileText" size={33} /><span>PDF</span></div><div className="floating-tile tile-image"><ToolIcon name="ImageDown" size={32} /><span>Images</span></div><div className="floating-tile tile-code"><ToolIcon name="Code2" size={30} /><span>Code</span></div><span className="art-spark"><Sparkles size={22} /></span><div className="art-caption"><span /> Less friction. More flow.</div></div></section>
    <section className="discovery-section" aria-label="Find tools"><div className="search-box"><Search size={20} /><input ref={input} id="tool-search" aria-label="Search tools" placeholder="What would you like to get done?" value={search} onChange={e => setSearch(e.target.value)} />{search ? <button aria-label="Clear search" onClick={() => setSearch("")}><X size={17} /></button> : <kbd>Ctrl / ⌘ K</kbd>}</div><div className="category-tabs" aria-label="Filter tools">{categories.map(cat => <button key={cat} aria-pressed={category === cat} className={category === cat ? "is-active" : ""} onClick={() => { setCategory(cat); window.history.replaceState(null, "", cat === "All" ? "/" : `/#category-${cat}`); }}>{cat === "All" ? "All tools" : cat}<span>{cat === "All" ? TOOLS_LIST.length : TOOLS_LIST.filter(t => t.category === cat).length}</span></button>)}</div></section>
    {!search && category === "All" && <section className="featured-section"><div className="section-heading"><div><span className="eyebrow">A good place to start</span><h2>Everyday essentials</h2></div><span className="section-aside">Less effort, more done</span></div><div className="featured-grid">{featured.map(tool => <Link className="featured-card" key={tool.slug} href={getToolPath(tool.category, tool.slug)}><span className={`tool-icon category-${tool.category.toLowerCase()}`}><ToolIcon name={tool.iconName} size={20} /></span><div><h3>{tool.name}</h3><span>{tool.category}</span></div><ArrowRight size={16} /></Link>)}</div></section>}
    <section className="tools-section"><div className="section-heading"><div><h2>{search ? "Search results" : category === "All" ? "Your toolkit, all in one place" : `${category === "Developers" ? "Developer" : category === "Images" ? "Image" : category} tools`}</h2><p>{search ? `Tools matching “${search}”` : "Pick a tool. Make something happen."}</p></div><span className="result-count" role="status">{filtered.length} tools</span></div>{filtered.length ? <div className="tools-grid">{filtered.map(t => <ToolCard key={t.slug} tool={t} />)}</div> : <div className="empty-results"><Search size={30} /><h3>No tools found</h3><p>Try another keyword or explore all tools.</p><button className="primary-button" onClick={() => { setSearch(""); setCategory("All"); }}>Show all tools <ArrowRight size={16} /></button></div>}</section>
    <div className="dashboard-bottom-note"><ShieldCheck size={20} /><div><strong>A private space to get things done.</strong><p>No uploads to our servers. No accounts. Just useful tools.</p></div><Link href="/privacy">Our privacy promise <ArrowRight size={15} /></Link></div>
  </main><Footer /></div>;
}
