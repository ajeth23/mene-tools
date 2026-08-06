<div align="center">

# ⚡ Mene Tools

**Engineering-First, Privacy-Focused, High-Performance Web Utility Suite**

*100% Client-Side In-Browser Execution • Powered by Next.js 15 & Groq AI*

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.1-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Privacy Guaranteed](https://img.shields.io/badge/Privacy-100%25_Client--Side-10B981?style=flat-square&logo=shield)](https://tools.mene.app/privacy)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat-square)](LICENSE)


[Live Demo](https://tools.mene.app) • [Privacy Policy](https://tools.mene.app/privacy) • [Terms of Service](https://tools.mene.app/terms) • [Report a Bug](mailto:contact@mene.app)

---

</div>

## 📌 Overview

**Mene Tools** is a state-of-the-art monorepo suite of developer, media, PDF, and AI utilities. Designed for maximum speed, privacy, and visual elegance, **Mene Tools** processes files, images, and documents **100% locally in your browser memory sandbox**. No uploaded files are ever sent to or stored on backend servers or databases.

Whether you're merging multi-gigabyte PDFs, compressing images with live before/after previews, generating QR codes, or synthesizing AI content via Groq, Mene Tools provides lightning-fast performance with zero latency and absolute confidentiality.

---

## 🔥 Key Features

### 🛡️ 100% Privacy & Security Guarantee
- **Local Sandbox Execution**: PDF manipulation, image transcoding, vector optimization, and developer tools run client-side using WebAssembly, Canvas API, and HTML5 APIs.
- **Zero File Uploads**: Your sensitive documents, photos, and code snippets never leave your device.
- **No Database Persistence**: No tracking databases, user accounts, or server-side document storage.

### ✨ AI-Powered Utilities (Groq AI Gateway)
- **AI Text Generator**: Formulate articles, blog posts, essays, and landing page copy instantly.
- **AI Summarizer**: Condense lengthy reports, legal agreements, and transcripts into clear markdown bullet points.
- **AI Master Prompt Generator**: Refine basic prompts into role-defined, context-rich master prompts for LLMs.

### 📄 Enterprise PDF Suite
- **PDF to Image Converter**: Render PDF pages into high-resolution PNG/JPEG images with real-time thumbnail previews and single-click **Download All as ZIP**.
- **Split PDF**: Visually preview pages, select custom page ranges, or check thumbnail grids with live dual-binding formula synchronization.
- **Merge PDF**: Combine multiple PDF files seamlessly with drag-and-drop ordering and cover thumbnail previews.
- **Compress PDF**: Optimize PDF binary object streams with real-time file size savings visualization.

### 🖼️ Advanced Image Processing
- **Image Compressor**: Dual-column live side-by-side comparison dashboard (Original vs. Compressed) with real-time quality slider adjustments.
- **Image Converter**: Transcode images between WebP, PNG, JPEG, and GIF formats.
- **Background Remover**: AI-powered client-side background extraction (`@imgly/background-removal`).
- **SVG Optimizer**: Minify and clean SVG code payloads locally.

### 🛠️ Developer & Media Toolkit
- **JSON Formatter & Validator**: Format, beautify, and validate JSON payloads.
- **JWT Decoder**: Inspect JSON Web Tokens header, payload, and signatures.
- **UUID & Base64 Tools**: Generate cryptographically secure UUID v4 strings and encode/decode Base64 buffers.
- **Regex Tester & QR Generator**: Test complex regular expressions and generate high-entropy QR codes.
- **Diff Checker & Word Counter**: Compare text deltas and analyze character/word reading metrics.

---

## 🏗️ Monorepo Architecture

```
mene-tools/
├── apps/
│   └── web/                   # Next.js 15 application (App Router, SSG static exports)
│       ├── app/               # Routes, metadata, sitemaps, robots, privacy & terms
│       ├── components/        # UI components & standalone tool sandboxes
│       │   ├── tools/         # Isolated tool implementations (PDFToImage, ImageCompressor, etc.)
│       │   └── FeedbackWidget # Dynamic contextual feedback loop
│       └── lib/               # Reusable PDF utilities (pdf-utils.ts), AI Gateway, tools config
├── packages/                  # Shared monorepo packages (@mene/types, @mene/ui, @mene/ai)
├── services/                  # Backend / edge services & infrastructure
├── infra/                     # Infrastructure & deployment manifests
└── package.json               # Monorepo workspaces configuration
```

---

## ⚙️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Static Exports)
- **UI Engine**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Motion (Framer Motion)](https://motion.dev/)
- **Icons & Typography**: [Lucide React](https://lucide.dev/), Inter / Geist / Font Display
- **PDF & Processing**: `pdf.js` (Mozilla CDN worker), `pdf-lib`, `JSZip`
- **Image Processing**: `@imgly/background-removal`, HTML5 Canvas 2D Context
- **AI Provider**: Groq API Gateway (`Llama-3.3-70b-versatile` / `Google GenAI`)
- **SEO & Schema**: JSON-LD `SoftwareApplication` Structured Data, OpenGraph, Dynamic Sitemaps

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.17.0` or higher (Recommended: `v20.x`)
- **npm**: `v9.x` or higher

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ajeth23/mene-tools.git
   cd mene-tools
   ```

2. **Install Monorepo Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env.local` file inside `apps/web/`:
   ```bash
   cp .env.example apps/web/.env.local
   ```
   Add your API keys (optional for local AI testing):
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🧪 Available Scripts

In the root directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on port 3000 |
| `npm run build` | Builds `apps/web` for production static export into `/dist` |
| `npm run start` | Runs the production web application |
| `npm run lint` | Runs ESLint checks across the workspace |
| `npm run clean` | Cleans Next.js build artifacts and caches |

---

## 🔒 Privacy & Compliance

- **No Cookies Tracking**: We do not use third-party tracking cookies or invasive analytics scripts.
- **Client Storage Only**: Settings (dark mode preferences, favorited shortcuts) are kept strictly in `localStorage`.
- **Search Engine Structured Data**: Every tool outputs Google JSON-LD `AggregateRating` metadata (`★ 4.9`) for search engine snippets.
- **Compliance**: Fully compliant with international data protection standards by avoiding data collection entirely.

---

## 🤝 Contributing & Community Guidelines

Contributions, bug reports, and feature requests are welcome!

- **Contributing**: Please read our [Contributing Guide](CONTRIBUTING.md) before submitting Pull Requests.
- **Code of Conduct**: We expect all contributors to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).
- **Security Vulnerabilities**: Please review our [Security Policy](SECURITY.md) to report security issues responsibly.
- **Report a Bug**: Email us directly at [contact@mene.app](mailto:contact@mene.app?subject=Mene%20Tools%20Bug%20Report)
- **Live Application**: [tools.mene.app](https://tools.mene.app)

---

## ⚖️ License & Trademarks

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for full details.

> **Trademark Notice**: "Mene", "Mene Tools", and associated logos are trademarks of **Mene Information Technology Services**. The Apache 2.0 license grants permissions for source code usage, but does **not** grant permission to use our brand names, logos, or domain assets. See [TRADEMARK.md](TRADEMARK.md) for brand guidelines.

---

<div align="center">

© 2026 **Mene Information Technology Services**. All rights reserved.  
*Crafted for absolute speed, precision, and privacy.*

</div>

