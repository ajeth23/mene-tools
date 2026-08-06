import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-50 flex flex-col justify-between font-sans selection:bg-zinc-900/10 dark:selection:bg-white/10 relative overflow-hidden">
      {/* Premium background decorative blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div>
        <Header />
        
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-zinc-400 hover:text-[#0052FF] dark:hover:text-zinc-200 transition-colors group mb-8 uppercase cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Workspace</span>
          </Link>

          {/* Heading */}
          <div className="space-y-4 border-b border-zinc-200/60 dark:border-zinc-900 pb-8 mb-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-950/20 bg-emerald-50/30 dark:bg-emerald-950/10 text-[9px] font-mono tracking-wider text-emerald-600 dark:text-emerald-400 uppercase font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% In-Browser Execution Sandbox</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight leading-none text-zinc-900 dark:text-white">
              PRIVACY POLICY
            </h1>
            <p className="text-xs font-mono text-zinc-400">
              Last Updated: July 21, 2026 • Your data never leaves your device.
            </p>
          </div>

          {/* Structured Document (Modern Stripe-Doc styling) */}
          <div className="space-y-12">
            <section className="border-l-2 border-[#0052FF] pl-6 space-y-3">
              <h2 className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                1. Local In-Browser Processing Guarantee
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Mene Tools is designed from the ground up as a client-side execution utility suite. 
                **We do not collect, transmit, upload, or store any files, documents, text inputs, or images that you process on our website.** 
                All parsing, merging, splitting, converting, compressing, and text generation operations occur locally inside your browser thread. 
                Once you close the browser tab, all session caches are immediately cleared.
              </p>
            </section>

            <section className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-6 space-y-3">
              <h2 className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                2. No Database Tracking
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                We do not operate backend databases or user accounts for storage. 
                We do not track file uploads, because no files are ever sent to our servers.
              </p>
            </section>

            <section className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-6 space-y-3">
              <h2 className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                3. Third-Party API Services
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                For our AI utilities (such as the AI Summarizer and AI Text Generator), text prompts are securely routed through our serverless AI Gateway to Groq APIs. 
                These requests do not contain any file metadata, and no logging or retention policies are applied to your text input data.
              </p>
            </section>

            <section className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-6 space-y-3">
              <h2 className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                4. Cookies & Analytics
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                We use lightweight client-side storage (<code className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 rounded font-mono text-xs">localStorage</code>) 
                to remember your local settings (such as dark mode preferences and favorited tool shortcuts). 
                We do not collect analytics cookies or tracking pixels.
              </p>
            </section>

            <section className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-6 space-y-3">
              <h2 className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                5. Contact Information
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                If you have any questions about this client-side privacy standard, please contact us at:{" "}
                <a href="mailto:contact@mene.app" className="text-[#0052FF] dark:text-[#38bdf8] hover:underline font-bold">
                  contact@mene.app
                </a>
              </p>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
