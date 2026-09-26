"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 transition-colors py-24 sm:py-36 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Slogan Block (Scaled Up) */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-slate-900 dark:text-zinc-50 leading-none">
              LET&apos;S BUILD<br />
              <span className="text-amber-500">SOMETHING</span><br />

              GREAT.
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed font-medium">
              Fast, private in-browser tools built for speed and absolute client-side protection.
            </p>
          </div>

          {/* Links Grid columns (More Spacing) */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-10 sm:gap-12">
            {/* Utilities column */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Utilities
              </h3>
              <ul className="space-y-3.5 text-sm font-medium">
                <li>
                  <Link href="/#category-PDF" className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                    PDF Suite
                  </Link>
                </li>
                <li>
                  <Link href="/#category-Images" className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                    Image Processing
                  </Link>
                </li>
                <li>
                  <Link href="/#category-Media" className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                    Media & Audio
                  </Link>
                </li>
              </ul>
            </div>

            {/* Developer column */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Developer
              </h3>
              <ul className="space-y-3.5 text-sm font-medium">
                <li>
                  <Link href="/#category-Developers" className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                    Dev Tools
                  </Link>
                </li>
                <li>
                  <Link href="/#category-Productivity" className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                    Productivity Kits
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                    Privacy Sandbox
                  </Link>
                </li>
              </ul>
            </div>

            {/* Menu/Info column */}
            <div className="col-span-2 sm:col-span-1 space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Menu
              </h3>
              <ul className="space-y-3.5 text-sm font-medium">
                <li>
                  <Link href="/" className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <a href="https://mene.app" target="_blank" rel="noopener noreferrer" className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                    Mene Company
                  </a>
                </li>
                <li>
                  <a href="mailto:contact@mene.app?subject=Mene Tools - Bug Report" className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                    Report a Bug
                  </a>
                </li>
                <li>
                  <a href="mailto:contact@mene.app" className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom border & details */}
        <div className="mt-24 sm:mt-36 pt-10 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <BrandLogo showText={false} className="!h-6 !w-6" />
            <span className="font-sans font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 text-base">
              Mene.
            </span>
          </div>

          {/* DTI, Policies & Copyright */}
          <div className="flex flex-col items-center text-center space-y-3">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono tracking-tight">
              © 2026 Mene Information Technology Services. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
              <span className="hover:text-zinc-700 dark:hover:text-zinc-350 cursor-default">REGISTERED IN DTI PHILIPPINES</span>
              <span>|</span>
              <Link href="/privacy" className="hover:text-amber-500 dark:hover:text-amber-400">PRIVACY POLICY</Link>
              <span>|</span>
              <Link href="/terms" className="hover:text-amber-500 dark:hover:text-amber-400">TERMS OF SERVICE</Link>

            </div>
          </div>

          {/* Built by anchor */}
          <div className="text-xs font-mono font-semibold text-zinc-400 dark:text-zinc-500 shrink-0">
            Built by Mene.
          </div>
        </div>
      </div>
    </footer>
  );
}
