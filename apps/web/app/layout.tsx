import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tools.mene.app"),
  title: "Mene Tools - Elegant Online Utilities & Developer Kit",
  description: "The fastest, most elegant, and minimal collection of modern online tools for developers, creators, and professionals. 100% private, client-side, and secure.",
  applicationName: "Mene Tools",
  keywords: [
    "developer tools",
    "online utilities",
    "PDF suite",
    "image converter",
    "image compressor",
    "AI summarizer",
    "regex tester",
    "JSON formatter",
    "QR generator",
    "voice recorder",
    "audio cutter",
    "minimalist web tools"
  ],
  authors: [{ name: "Mene Ecosystem", url: "https://mene.app" }],
  creator: "Mene",
  publisher: "Mene",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/mene_tools_circle.png", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/mene_tools_circle.png",
    apple: "/mene_tools_circle.png",
  },
  openGraph: {
    title: "Mene Tools - Elegant Online Utilities & Developer Kit",
    description: "The fastest, most elegant, and minimal collection of modern online tools for developers, creators, and professionals. 100% private and client-side.",
    url: "https://tools.mene.app",
    siteName: "Mene Tools",
    images: [
      {
        url: "/mene_tools_circle.png",
        width: 512,
        height: 512,
        alt: "Mene Tools Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mene Tools - Elegant Online Utilities & Developer Kit",
    description: "Fast, minimal, and fully private utilities on Mene Tools. Direct browser-only compute.",
    images: ["/mene_tools_circle.png"],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-flash script for the Theme Switcher */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('theme');
                  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans antialiased selection:bg-amber-500/30 selection:text-amber-900 dark:selection:bg-amber-500/30 dark:selection:text-amber-100 transition-colors duration-200">

        {children}
      </body>
    </html>
  );
}
