"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

interface HeaderProps {
  onSearchOpen?: () => void;
}

export default function Header({ onSearchOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 dark:border-zinc-900/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none"
            id="brand-logo-link"
          >
            <BrandLogo showText={false} iconClassName="w-10 h-10 md:w-12 md:h-12" />
            <span className="font-sans font-bold tracking-tight text-xl text-slate-900 dark:text-zinc-50 leading-none">
              Mene Tools
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
