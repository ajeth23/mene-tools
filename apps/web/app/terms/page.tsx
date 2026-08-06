import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsPage() {
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-950/20 bg-indigo-50/30 dark:bg-indigo-950/10 text-[9px] font-mono tracking-wider text-indigo-600 dark:text-indigo-400 uppercase font-bold">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>Free Browser-Native Utility Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight leading-none text-zinc-900 dark:text-white">
              TERMS OF SERVICE
            </h1>
            <p className="text-xs font-mono text-zinc-400">
              Last Updated: July 21, 2026 • Free Open Utility Tools
            </p>
          </div>

          {/* Structured Document (Modern Stripe-Doc styling) */}
          <div className="space-y-12">
            <section className="border-l-2 border-[#0052FF] pl-6 space-y-3">
              <h2 className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                1. Agreement to Terms
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                By accessing and using Mene Tools (available at tools.mene.app), you agree to be bound by these simple Terms of Service. 
                If you do not agree, please do not use the utilities.
              </p>
            </section>

            <section className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-6 space-y-3">
              <h2 className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                2. Free Client-Side Service
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                All PDF and image manipulation tools are offered 100% free of charge and execute entirely client-side on your device. 
                We provide no warranty on the accuracy, suitability, or quality of converted assets. 
                Users are responsible for verifying their downloaded files.
              </p>
            </section>

            <section className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-6 space-y-3">
              <h2 className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                3. Prohibited Abuse
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                You may not automate requests to our AI API gateway. 
                We reserve the right to block access or restrict daily quotas for any client IP address showing abnormal usage signatures.
              </p>
            </section>

            <section className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-6 space-y-3">
              <h2 className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                4. Disclaimer of Liability
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Mene Tools and its authors are not liable for any direct or indirect damages, data losses, or business interruptions arising from the use of, or inability to use, our client-side software applications.
              </p>
            </section>

            <section className="border-l-2 border-zinc-200 dark:border-zinc-800 pl-6 space-y-3">
              <h2 className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                5. Revisions
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                We may revise these terms at any time. Your continued use of the website signifies your acceptance of the updated terms.
              </p>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
