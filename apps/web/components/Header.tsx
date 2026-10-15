"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, AudioLines, Code2, FileText, Grid2X2, Image, Menu, Moon, Search, ShieldCheck, Star, Sun, X, Zap, Clock3 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { TOOLS_LIST, getToolPath } from "@/lib/tools-config";
const categories = [
  { name: "PDF", label: "PDF tools", icon: FileText },
  { name: "Images", label: "Image tools", icon: Image },
  { name: "Developers", label: "Developer tools", icon: Code2 },
  { name: "Productivity", label: "Productivity", icon: Zap },
  { name: "Media", label: "Audio & video", icon: AudioLines },
];
export default function Header({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => {
      setDark(document.documentElement.classList.contains("dark"));
      for (const [key, setter] of [["mene_favorites", setFavorites], ["mene_recents", setRecents]] as const) {
        try { const value: unknown = JSON.parse(localStorage.getItem(key) || "[]"); setter(Array.isArray(value) ? value.filter((s): s is string => typeof s === "string") : []); } catch { setter([]); }
      }
    };
    sync(); window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [pathname]);
  useEffect(() => {
    const searchShortcut = (event: KeyboardEvent) => {
      if (pathname !== "/" && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); router.push("/#tool-search");
      }
    };
    window.addEventListener("keydown", searchShortcut);
    return () => window.removeEventListener("keydown", searchShortcut);
  }, [pathname, router]);
  useEffect(() => {
    if (!open) return;
    const sidebar = document.getElementById("workspace-sidebar");
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebar?.querySelector<HTMLButtonElement>("button")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab") {
        const items = sidebar?.querySelectorAll<HTMLElement>("a[href],button:not([disabled])");
        if (!items?.length) return;
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", keydown);
    return () => { window.removeEventListener("keydown", keydown); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [open]);
  function toggleTheme() {
    const next = !dark; setDark(next); document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { /* Theme works without storage. */ }
  }
  return <>
    <header className="workspace-topbar"><div className="flex items-center gap-3"><button className="icon-button mobile-menu" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="workspace-sidebar" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button><span className="topbar-label">Your everyday workspace</span></div><div className="flex items-center gap-4"><span className="topbar-privacy"><ShieldCheck size={15} /> Private by design</span><button className="icon-button" onClick={toggleTheme} aria-label={dark ? "Use light theme" : "Use dark theme"}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button></div></header>
    {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside id="workspace-sidebar" className={`workspace-sidebar ${open ? "is-open" : ""}`}>
      <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={18} /></button>
      <Link href="/" className="workspace-brand" onClick={() => setOpen(false)}><BrandLogo showText={false} iconClassName="w-9 h-9" /><span>Mene<span className="brand-light"> Tools</span><small>A little more done.</small></span></Link>
      <Link href="/#tool-search" className="sidebar-search" onClick={() => { setOpen(false); onSearchOpen?.(); }}><Search size={16} /> Find a tool <kbd>⌘ K</kbd></Link>
      <nav aria-label="Main navigation"><Link href="/" className={`sidebar-link ${pathname === "/" ? "is-active" : ""}`} onClick={() => setOpen(false)}><Grid2X2 size={18} /> All tools <span>{TOOLS_LIST.length}</span></Link><p className="sidebar-heading">Explore</p>
        {categories.map(({ name, label, icon: Icon }) => <Link className={`sidebar-link ${pathname.startsWith(`/${name.toLowerCase()}/`) ? "is-active" : ""}`} key={name} href={`/#category-${name}`} onClick={() => setOpen(false)}><Icon size={18} />{label}<span>{TOOLS_LIST.filter(t => t.category === name).length}</span></Link>)}
        {[{ label: "Favorites", slugs: favorites, icon: Star }, { label: "Recently used", slugs: recents.slice(0, 3), icon: Clock3 }].map(({ label, slugs, icon: Icon }) => <div key={label}><p className="sidebar-heading flex items-center gap-2"><Icon size={13} />{label}</p>{slugs.length ? slugs.map(slug => { const tool = TOOLS_LIST.find(t => t.slug === slug); return tool ? <Link key={slug} className="sidebar-link saved-tool" href={getToolPath(tool.category, slug)} onClick={() => setOpen(false)}>{tool.name}</Link> : null; }) : <p className="sidebar-empty">{label === "Favorites" ? "Save your go-to tools here." : "Your next tool starts here."}</p>}</div>)}
      </nav><div className="sidebar-bottom"><div className="privacy-note"><ShieldCheck size={20} /><strong>Your files. Your device.</strong><p>Tools run in your browser.<br />No account needed.</p></div><a href="https://mene.app" target="_blank" rel="noopener noreferrer" className="sidebar-company">Made by Mene <ArrowUpRight size={14} /></a></div>
    </aside>
  </>;
}
