export interface FAQItem {
  question: string;
  answer: string;
}

export interface ToolMetadata {
  id: string;
  name: string;
  slug: string;
  category: "AI" | "PDF" | "Images" | "Developers" | "Productivity" | "Media";
  description: string;
  seoTitle: string;
  seoDesc: string;
  iconName: string;
  usageCount: string;
  benefits: string[];
  howItWorks: string[];
  faqs: FAQItem[];
  relatedSlugs: string[];
}

export const TOOLS_LIST: ToolMetadata[] = [
  // --- AI ---
  {
    id: "ai-text-generator",
    name: "AI Text Generator",
    slug: "ai-text-generator",
    category: "AI",
    description: "Create premium professional copy, essays, articles, and communications instantly with Groq.",
    seoTitle: "Free AI Text Generator - Write Articles & Copy Instantly | Mene",
    seoDesc: "Create high-quality copy, blog posts, essays, and creative outlines instantly. Power your workflow with cutting-edge Groq AI text generation.",
    iconName: "Sparkles",
    usageCount: "128.4K",
    benefits: [
      "Generates human-like, engaging copy tailored to any audience",
      "Saves hours of brainstorming, drafting, and proofreading",
      "Provides standard markdown format perfect for direct publishing"
    ],
    howItWorks: [
      "Select your target topic, content format, tone, and desired length.",
      "Click Generate and watch Groq formulate structured, high-quality markdown.",
      "Review, refine, and easily copy the clean prose to your clipboard."
    ],
    faqs: [
      {
        question: "Is the generated content unique and original?",
        answer: "Yes, the content is synthesized in real-time by the high-speed Llama model via Groq, ensuring highly original, creative, and contextually rich results."
      },
      {
        question: "Can I use the generated copy for commercial purposes?",
        answer: "Absolutely. Any copy generated using Mene Tools is fully yours to use for commercial, personal, or educational writing."
      }
    ],
    relatedSlugs: ["ai-summarizer", "ai-prompt-generator", "markdown-preview"]
  },
  {
    id: "ai-summarizer",
    name: "AI Summarizer",
    slug: "ai-summarizer",
    category: "AI",
    description: "Condense long articles, reports, or legal documents into beautiful, actionable takeaways.",
    seoTitle: "Free AI Text Summarizer - Condense Documents Instantly | Mene",
    seoDesc: "Condense long text, legal agreements, research articles, or transcripts into highly clear bullet points or structural summaries using Groq.",
    iconName: "FileText",
    usageCount: "94.2K",
    benefits: [
      "Extracts core concepts and takeaways in under 5 seconds",
      "Avoids information overload with clean visual bullet points",
      "Accepts large copy-paste payloads with no complex setup"
    ],
    howItWorks: [
      "Paste the raw text of your article, agreement, or transcript into the input pane.",
      "Specify your target style (bullet points or executive paragraph) and target length.",
      "Get a perfectly formatted markdown summary ready for direct integration."
    ],
    faqs: [
      {
        question: "Is there a limit on the text length I can paste?",
        answer: "The underlying Llama model on Groq supports extremely large contexts, so feel free to summarize full chapters or reports!"
      },
      {
        question: "Does it keep the technical details intact?",
        answer: "Yes, our prompt architecture instructs the model to preserve all names, figures, and key technical details while condensing formatting."
      }
    ],
    relatedSlugs: ["ai-text-generator", "markdown-preview", "json-formatter"]
  },
  {
    id: "ai-prompt-generator",
    name: "AI Prompt Generator",
    slug: "ai-prompt-generator",
    category: "AI",
    description: "Refine raw ideas into enterprise-grade, role-based master prompts for Groq, Llama, and ChatGPT.",
    seoTitle: "Free AI Prompt Generator - Master Prompt Engineering | Mene",
    seoDesc: "Convert basic ideas into professional, context-rich master prompts. Get the absolute best answers out of Llama and other LLMs.",
    iconName: "BrainCircuit",
    usageCount: "76.1K",
    benefits: [
      "Improves response quality from AI models by up to 10x",
      "Includes structured role definitions, context, and clear limits",
      "Applies prompt-engineering best practices automatically"
    ],
    howItWorks: [
      "Enter your basic draft idea or prompt goal (e.g., 'help me plan a trip to Kyoto').",
      "Select a category and target LLM model.",
      "Click Generate to receive a complete, copyable master prompt formatted with clear sections."
    ],
    faqs: [
      {
        question: "What makes a good master prompt?",
        answer: "A good prompt specifies a clear role, detailed background context, step-by-step instructions, negative constraints, and output format requirements."
      },
      {
        question: "Does this work for Midjourney or Stable Diffusion too?",
        answer: "Yes, you can write prompt ideas for image models and select corresponding categories to get optimized prompts."
      }
    ],
    relatedSlugs: ["ai-text-generator", "ai-summarizer", "markdown-preview"]
  },

  // --- PDF ---
  {
    id: "merge-pdf",
    name: "Merge PDF",
    slug: "merge-pdf",
    category: "PDF",
    description: "Combine multiple PDF files into a single, beautifully organized document securely in your browser.",
    seoTitle: "Free Merge PDF Online — Private & Secure | Mene Tools",
    seoDesc: "Combine multiple PDF documents into one single high-quality file instantly. Secure client-side processing keeps your files private.",
    iconName: "Combine",
    usageCount: "210.5K",
    benefits: [
      "100% private: your files never touch a backend server, all work is done in-browser",
      "Supports drag-and-drop file sorting for perfect page ordering",
      "Superfast engine handles hundreds of pages in milliseconds"
    ],
    howItWorks: [
      "Drag and drop your PDF files or click to upload them from your system.",
      "Drag cards to re-arrange files in your desired order.",
      "Click Merge and save your unified, high-fidelity PDF instantly."
    ],
    faqs: [
      {
        question: "Are my files uploaded to the server?",
        answer: "No. All PDF processing happens inside your browser's memory using standard JavaScript libraries. Your sensitive data never leaves your device."
      },
      {
        question: "Is there a limit on the number of PDFs I can merge?",
        answer: "There are no hard limits. You can merge as many files as your device's memory can handle safely."
      }
    ],
    relatedSlugs: ["split-pdf", "compress-pdf", "pdf-to-image"]
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    slug: "split-pdf",
    category: "PDF",
    description: "Extract specific pages or split a PDF document into separate page files instantly.",
    seoTitle: "Free Split PDF Online - Extract Pages & Split PDFs | Mene",
    seoDesc: "Extract individual pages or groups of pages from any PDF document. Free, fast, and entirely client-side for maximum file security.",
    iconName: "Scissors",
    usageCount: "148.2K",
    benefits: [
      "Choose exactly which pages to extract (e.g., 1, 3-5, 8)",
      "High fidelity: page resolution, fonts, and hyperlinks are perfectly preserved",
      "Process files locally on your device for absolute privacy"
    ],
    howItWorks: [
      "Select or drop the PDF file you want to split.",
      "Input your desired page range or select individual extracted pages.",
      "Click Split PDF to compile and download your refined document."
    ],
    faqs: [
      {
        question: "Can I extract non-consecutive pages?",
        answer: "Yes, you can write complex comma-separated ranges like '1, 3-5, 12, 15-18' to extract exactly what you need."
      },
      {
        question: "Will the extracted file lose links or metadata?",
        answer: "No. The underlying structures, including hyperlinks, interactive elements, and document tags, are retained."
      }
    ],
    relatedSlugs: ["merge-pdf", "compress-pdf", "pdf-to-image"]
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    slug: "compress-pdf",
    category: "PDF",
    description: "Reduce PDF file size while maintaining pixel-perfect readability for email or web uploading.",
    seoTitle: "Free PDF Compressor Online — Compress PDFs Privately | Mene Tools",
    seoDesc: "Reduce the file size of your PDF documents without losing visual quality. Ideal for email attachment limits and portal uploads.",
    iconName: "Minimize2",
    usageCount: "189.4K",
    benefits: [
      "Shrinks PDFs down by up to 80% of original file weight",
      "Maintains clean vector text and balances image DPI safely",
      "Saves bandwidth and speeds up loading times for email clients"
    ],
    howItWorks: [
      "Upload your heavy PDF document onto the workspace canvas.",
      "Select a compression level: High (smallest file), Medium (balanced), or Low (best quality).",
      "Download the compressed PDF with an instant readout of size reduction savings."
    ],
    faqs: [
      {
        question: "Does PDF compression affect the text quality?",
        answer: "No. Vector text remains perfectly sharp at any zoom level because only bitmap images inside the PDF are optimized."
      },
      {
        question: "Is this tool free of ads and limits?",
        answer: "Yes, Mene Tools is completely free of intrusive banners, visual ads, or arbitrary daily file count limitations."
      }
    ],
    relatedSlugs: ["merge-pdf", "split-pdf", "pdf-to-image"]
  },
  {
    id: "pdf-to-image",
    name: "PDF to Image",
    slug: "pdf-to-image",
    category: "PDF",
    description: "Convert pages of a PDF document into premium-quality PNG or JPEG images.",
    seoTitle: "Free PDF to Image Converter - Export PDF to PNG/JPG | Mene",
    seoDesc: "Convert any PDF page into a high-resolution, uncompressed PNG or JPEG image inside your browser with a responsive preview interface.",
    iconName: "FileImage",
    usageCount: "135.0K",
    benefits: [
      "Extracts all pages into crisp, stand-alone graphic assets",
      "Allows manual page selection for targeted image extraction",
      "Generates pixel-perfect files with transparent PNG support"
    ],
    howItWorks: [
      "Select your source PDF. The system will parse and render page previews.",
      "Select the desired output format (PNG or JPEG) and image rendering density.",
      "Click Convert and download your images in high resolution."
    ],
    faqs: [
      {
        question: "Can I convert multi-page PDFs to images?",
        answer: "Yes, you can browse all pages inside our grid view and download them as individual files or in a batch."
      },
      {
        question: "What resolution are the images extracted in?",
        answer: "By default, pages are rendered at standard high-density 150-300 DPI, making them highly crisp for presentations and layouts."
      }
    ],
    relatedSlugs: ["merge-pdf", "image-compressor", "image-converter"]
  },

  // --- Images ---
  {
    id: "image-compressor",
    name: "Image Compressor",
    slug: "image-compressor",
    category: "Images",
    description: "Compress JPEG, PNG, and WebP images by up to 90% without losing visual clarity.",
    seoTitle: "Free Image Compressor — Compress JPG, PNG & WebP | Mene Tools",
    seoDesc: "Reduce image file size instantly while keeping perfect visual details. Compresses JPEG, PNG, and WebP images in seconds locally.",
    iconName: "ImageDown",
    usageCount: "310.2K",
    benefits: [
      "Superb visual-to-weight compression ratio",
      "Real-time visual comparison slider (Before vs After)",
      "Protects privacy: images stay 100% on your local machine"
    ],
    howItWorks: [
      "Drag and drop your images or click to select files.",
      "Adjust the target quality slider and compare live file size updates.",
      "Click Download to save your highly optimized image."
    ],
    faqs: [
      {
        question: "Does this support transparent PNG compression?",
        answer: "Yes, our engine retains full alpha transparency channels while removing unneeded color profile blocks."
      },
      {
        question: "How fast is the compressor?",
        answer: "Since compression runs locally via browser canvas rendering, it is near-instant, occurring in under 100ms."
      }
    ],
    relatedSlugs: ["image-converter", "background-remover", "svg-optimizer"]
  },
  {
    id: "image-converter",
    name: "Image Converter",
    slug: "image-converter",
    category: "Images",
    description: "Convert images seamlessly between PNG, JPEG, WebP, SVG, and GIF formats.",
    seoTitle: "Free Image Converter - Format WebP, PNG, JPG Online | Mene",
    seoDesc: "Convert image formats instantly. Cross-convert PNG, JPEG, WebP, and other image assets with perfect preservation of dimensions and quality.",
    iconName: "RefreshCw",
    usageCount: "220.4K",
    benefits: [
      "Converts to modern WebP or AVIF for lighter websites",
      "Handles batch conversions with instant file asset creation",
      "Zero registration required, completely unlimited"
    ],
    howItWorks: [
      "Select your image file in any common format.",
      "Choose your desired output format from the dropdown selection list.",
      "Click Convert to trigger the in-memory export and click to download."
    ],
    faqs: [
      {
        question: "Why should I convert my images to WebP?",
        answer: "WebP provides superior compression and quality, being on average 30% smaller than traditional JPEGs."
      },
      {
        question: "Are there file dimension restrictions?",
        answer: "No, our browser-canvas based transcoder handles extreme resolutions smoothly without downsizing."
      }
    ],
    relatedSlugs: ["image-compressor", "background-remover", "svg-optimizer"]
  },
  {
    id: "background-remover",
    name: "Background Remover",
    slug: "background-remover",
    category: "Images",
    description: "Remove image backgrounds instantly. Extract subjects with color-keying threshold controls.",
    seoTitle: "Free Background Remover Online - Key Out Solid Colors | Mene",
    seoDesc: "Extract objects or remove solid background colors from photos locally. Clean color-keying threshold engine.",
    iconName: "Eraser",
    usageCount: "165.7K",
    benefits: [
      "Saves hours of complex lasso masking in design tools",
      "Interactive color picker: tap a color to transparentize it",
      "Smooth edge feathering slider for seamless cutouts"
    ],
    howItWorks: [
      "Upload your photo containing a solid or simple high-contrast background.",
      "Click anywhere on the background using the sampler pipette, or use automated threshold adjustments.",
      "Fine-tune tolerance and feather sliders, then download your transparent PNG."
    ],
    faqs: [
      {
        question: "Does it work best on solid backgrounds?",
        answer: "Yes, chromakey color extraction is extremely accurate for studio setups, product mockups, logos, and clear contrasts."
      },
      {
        question: "Can I adjust which color gets removed?",
        answer: "Absolutely. You can click on the pipette tool and pick any specific color from your image canvas to erase."
      }
    ],
    relatedSlugs: ["image-compressor", "image-converter", "svg-optimizer"]
  },
  {
    id: "svg-optimizer",
    name: "SVG Optimizer",
    slug: "svg-optimizer",
    category: "Images",
    description: "Optimize vector SVG graphics by stripping editor metadata, comments, and empty properties.",
    seoTitle: "Free SVG Optimizer - Minify & Optimize Vector Files | Mene",
    seoDesc: "Sanitize and compress SVG files. Remove unneeded namespaces, comments, meta tags, and whitespace to reduce loading times.",
    iconName: "Compass",
    usageCount: "92.3K",
    benefits: [
      "Reduces SVG payload size, critical for fast page-load speeds",
      "Maintains coordinate precision with adjustable decimal truncation",
      "Outputs clean, raw code blocks ready for inline CSS or HTML"
    ],
    howItWorks: [
      "Paste your raw SVG code or upload your `.svg` asset file.",
      "Select optimization parameters (remove tags, format code, trim precision).",
      "Copy the cleaned inline SVG code or download the minified asset."
    ],
    faqs: [
      {
        question: "Will optimizing my SVG change its shape or colors?",
        answer: "No. The visual structure and rendering coordinates remain identical. Only unneeded XML headers and editor-specific metadata (Illustrator, Figma tags) are removed."
      },
      {
        question: "What is path precision truncation?",
        answer: "It rounds fractional values like 12.345678 to 12.35. This saves substantial space while keeping visual alterations imperceptible."
      }
    ],
    relatedSlugs: ["image-compressor", "image-converter", "json-formatter"]
  },

  // --- Developers ---
  {
    id: "json-formatter",
    name: "JSON Formatter",
    slug: "json-formatter",
    category: "Developers",
    description: "Validate, beautify, and minify raw JSON payloads with live error detection and syntax highlighting.",
    seoTitle: "Free JSON Formatter & Validator Online | Mene Tools",
    seoDesc: "Format, validate, beautify, or minify JSON data. Clean developer interface with live syntax checks, instant error highlighting, and tree rendering.",
    iconName: "Code2",
    usageCount: "410.8K",
    benefits: [
      "Detects syntax syntax errors immediately with precise line highlighting",
      "Supports 2-space, 4-space, or tabbed alignment layout preferences",
      "Minifies complex arrays for raw API request configuration"
    ],
    howItWorks: [
      "Paste your raw, unformatted JSON text block into the editor panel.",
      "See live validation status. If broken, it highlights the exact error line.",
      "Click Format to beatify, or Minify to compact your JSON instantly."
    ],
    faqs: [
      {
        question: "Is my JSON data secure?",
        answer: "Yes, our JSON formatter runs entirely inside your client browser. No keys, secrets, or payloads are transmitted across networks."
      },
      {
        question: "Does it support JSON validation?",
        answer: "Yes, it parses your JSON and catches trailing commas, mismatched brackets, or missing quotes with clear hints."
      }
    ],
    relatedSlugs: ["jwt-decoder", "base64-encoder", "uuid-generator"]
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    slug: "jwt-decoder",
    category: "Developers",
    description: "Decode JSON Web Tokens instantly to inspect header properties, claims payload, and signatures.",
    seoTitle: "Free JWT Decoder - Decode JSON Web Token Online | Mene",
    seoDesc: "Decode and inspect JSON Web Tokens (JWT) locally. Review payload parameters, issuer claims, algorithm metadata, and expiration timestamps.",
    iconName: "KeyRound",
    usageCount: "254.1K",
    benefits: [
      "Decodes Header, Claims Payload, and Cryptographic Signature blocks instantly",
      "Converts epoch timestamps (iat, exp) into legible local date/time displays",
      "100% offline: safe for production JWT inspection"
    ],
    howItWorks: [
      "Paste your encoded JSON Web Token (encoded as a three-part dot string).",
      "Instantly read the decoded Header algorithms and Payload claims.",
      "View expiry validity status with real-time countdown relative to current time."
    ],
    faqs: [
      {
        question: "Are JWT payloads encrypted?",
        answer: "Standard JWTs are base64url-encoded, not encrypted. Anyone who has the token can read the claims, which is why decoding is done strictly on your device."
      },
      {
        question: "Can this verify my cryptographic signature?",
        answer: "Our JWT decoder extracts the signature block and validates the structural format. Secret verification is client-side if you provide your key locally."
      }
    ],
    relatedSlugs: ["json-formatter", "base64-encoder", "uuid-generator"]
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    slug: "uuid-generator",
    category: "Developers",
    description: "Generate high-entropy Version 4 UUIDs in bulk. Perfect for database primary keys and telemetry tracking.",
    seoTitle: "Free UUID Generator - Generate RFC 4122 v4 UUIDs | Mene",
    seoDesc: "Generate secure, random RFC 4122 Version 4 UUIDs. Generate single or bulk identifiers with custom formatting configurations.",
    iconName: "Hash",
    usageCount: "192.5K",
    benefits: [
      "Generates cryptographically secure, high-entropy unique values",
      "Supports bulk generation (up to 1,000 UUIDs in one click)",
      "Provides plain-text copy lists or CSV exports effortlessly"
    ],
    howItWorks: [
      "Select your target quantity and choose formatting (uppercase, hyphens, braces).",
      "Click Generate to run the client-side cryptographic random algorithm.",
      "Copy single records, copy the full list, or download them as a clean `.txt` file."
    ],
    faqs: [
      {
        question: "Are these UUIDs cryptographically random?",
        answer: "Yes, we use the browser's standard `crypto.getRandomValues()` API, which meets military-grade cryptographic entropy standards."
      },
      {
        question: "What is a UUID version 4?",
        answer: "It is an identifier constructed purely of random bits (122 random bits of the 128 total), making collision probabilities effectively zero."
      }
    ],
    relatedSlugs: ["json-formatter", "base64-encoder", "regex-tester"]
  },
  {
    id: "base64-encoder",
    name: "Base64 Encoder",
    slug: "base64-encoder",
    category: "Developers",
    description: "Encode or decode strings and binary data blocks into standard RFC 4648 Base64 values instantly.",
    seoTitle: "Free Base64 Encoder & Decoder - Secure Online Tool | Mene",
    seoDesc: "Encode text to Base64 or decode Base64 strings. Pure client-side tool with instant character and bit density readouts.",
    iconName: "Binary",
    usageCount: "174.9K",
    benefits: [
      "Perfect dual pane: encode text or decode values simultaneously",
      "Supports base64url padding configuration flags for API routing",
      "Includes instant payload size readouts in bytes and characters"
    ],
    howItWorks: [
      "Type or paste your text into either the Input Pane (to encode) or Output Pane (to decode).",
      "Watch the corresponding translated stream populate dynamically as you type.",
      "Copy the finished stream instantly with one-click clipboard access."
    ],
    faqs: [
      {
        question: "What is Base64 used for?",
        answer: "Base64 is a binary-to-text encoding scheme. It is primarily used to transmit binary data (like images or assets) over text-only transport channels (like HTML, CSS, or JSON)."
      },
      {
        question: "Can I decode non-UTF8 binary strings safely?",
        answer: "Yes, standard ASCII and UTF-8 strings are handled perfectly, with clean feedback fallback for invalid UTF-8 payloads."
      }
    ],
    relatedSlugs: ["json-formatter", "jwt-decoder", "uuid-generator"]
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    slug: "regex-tester",
    category: "Developers",
    description: "Write and test regular expressions with real-time match highlighting, group capture details, and syntax reference.",
    seoTitle: "Free Regex Tester & Debugger - Live Regular Expressions | Mene",
    seoDesc: "Test regular expressions with real-time feedback, highlight matches, extract captured groups, and consult our quick cheat sheet.",
    iconName: "SearchCode",
    usageCount: "158.3K",
    benefits: [
      "Real-time highlighting of regular expression matches as you type",
      "Extensive panel showing matched captures, index groups, and string bounds",
      "Interactive cheat sheet containing common syntax definitions"
    ],
    howItWorks: [
      "Input your regular expression pattern and specify search flags (global, case-insensitive, multiline).",
      "Paste your mock text into the Test String input panel.",
      "Inspect the live color highlights and detailed capture table to refine your expression."
    ],
    faqs: [
      {
        question: "What regex flavor does this tester use?",
        answer: "It uses standard ECMAScript (JavaScript) regular expressions, which are extremely close to PCRE, Python, and Go structures."
      },
      {
        question: "How are capture groups represented?",
        answer: "Captured groups are color-coded and mapped in our evaluation table, showing the matched characters and match boundaries."
      }
    ],
    relatedSlugs: ["json-formatter", "uuid-generator", "base64-encoder"]
  },

  // --- Productivity ---
  {
    id: "qr-generator",
    name: "QR Generator",
    slug: "qr-generator",
    category: "Productivity",
    description: "Generate customized high-resolution QR codes with customizable colors, size, and margin values.",
    seoTitle: "Free QR Code Generator - Create Custom QR Codes | Mene",
    seoDesc: "Generate high-quality custom QR codes. Set text or URLs, adjust size, modify foreground/background colors, and export as SVG or high-res PNG.",
    iconName: "QrCode",
    usageCount: "265.4K",
    benefits: [
      "Generates vector SVG or high-resolution PNG copies",
      "Adjustable color wheels: create brand-accurate QR matching custom hexes",
      "Saves generation parameters for bulk printing consistency"
    ],
    howItWorks: [
      "Type your URL, social handle, Wi-Fi credentials, or plain text into the content box.",
      "Select your custom colors, margin spacing, and error correction level.",
      "Export your pristine vector or raster asset instantly to your local computer."
    ],
    faqs: [
      {
        question: "Do these QR codes ever expire?",
        answer: "Never. These are standard static QR codes encoding the raw characters directly. They remain valid forever."
      },
      {
        question: "What is Error Correction Level?",
        answer: "It dictates how much of the QR pattern can be damaged or covered (up to 30% on High) while remaining fully readable by scanners."
      }
    ],
    relatedSlugs: ["password-generator", "color-palette-generator", "markdown-preview"]
  },
  {
    id: "password-generator",
    name: "Password Generator",
    slug: "password-generator",
    category: "Productivity",
    description: "Generate cryptographically secure passwords with custom length constraints, character sets, and strength rating.",
    seoTitle: "Free Password Generator - Secure Cryptographic Passwords | Mene",
    seoDesc: "Generate strong, secure random passwords. Configure lengths, include numbers, custom symbols, avoid ambiguous letters, and check entropy score.",
    iconName: "ShieldAlert",
    usageCount: "242.0K",
    benefits: [
      "Generates passwords inside browser memory utilizing high-entropy cryptographic seeds",
      "Excludes lookalike characters (0/O, l/I, s/5) to prevent input confusion",
      "Dynamic password strength analyzer (visual rating & entropy bits calculation)"
    ],
    howItWorks: [
      "Set your desired password length (up to 128 characters) using the slide control.",
      "Toggle include options (symbols, uppercase, numbers, custom blocks).",
      "Click Generate, evaluate the strength score, and copy your secure secret."
    ],
    faqs: [
      {
        question: "Does Mene Tools store my generated passwords?",
        answer: "Absolutely not. All passwords are created locally in-browser and are never logged, cached, or transmitted to any server. When you close the tab, they are lost forever."
      },
      {
        question: "What is password entropy?",
        answer: "Entropy measures the randomness of your password in bits. Passwords with over 80 bits of entropy are practically impossible to crack using modern supercomputers."
      }
    ],
    relatedSlugs: ["qr-generator", "uuid-generator", "color-palette-generator"]
  },
  {
    id: "markdown-preview",
    name: "Markdown Preview",
    slug: "markdown-preview",
    category: "Productivity",
    description: "Compose markdown content in a premium dual-pane editor with live rendered typography previews.",
    seoTitle: "Free Markdown Preview - Live Editor & Renderer Online | Mene",
    seoDesc: "Write, test, and preview markdown files. Real-time visual rendering with gorgeous typographical formatting powered by Tailwind Typography.",
    iconName: "PenTool",
    usageCount: "135.2K",
    benefits: [
      "Premium side-by-side splits with synchronized visual scrolling",
      "Beautiful typography styled for readable articles and documents",
      "Export markdown contents instantly as a clean HTML file or `.md` asset"
    ],
    howItWorks: [
      "Type or paste standard markdown syntax into our interactive text editor pane.",
      "Watch the rendered visual preview populate instantly in the adjacent layout pane.",
      "Use quick toggle tools to copy the raw HTML compilation or save your file."
    ],
    faqs: [
      {
        question: "Does this support standard Github-Flavored Markdown?",
        answer: "Yes, it renders tables, task lists, code blocks, strikes, and standard text emphasis tags correctly."
      },
      {
        question: "Can I paste HTML directly into the markdown editor?",
        answer: "Yes, standard embedded HTML tags will pass through safely to give you maximum layout control."
      }
    ],
    relatedSlugs: ["ai-text-generator", "ai-summarizer", "json-formatter"]
  },
  {
    id: "word-counter",
    name: "Word Counter",
    slug: "word-counter",
    category: "Productivity",
    description: "Calculate detailed characters, words, sentences, estimated reading times, and SEO keyword densities.",
    seoTitle: "Free Word Counter & Keyword Density Analyzer | Mene",
    seoDesc: "Count characters, sentences, paragraphs, estimate silent/speaking times, and extract keyword frequencies on your device.",
    iconName: "FileText",
    usageCount: "115.4K",
    benefits: [
      "Performs deep token analysis with fast local JS parsing",
      "Calculates speaking vs silent reading duration parameters",
      "Analyzes repeating words to optimize SEO article density"
    ],
    howItWorks: [
      "Paste your text block or article into the input window.",
      "Metrics and counts refresh instantly on every keystroke.",
      "Inspect the bottom list to discover top keywords and frequencies."
    ],
    faqs: [
      {
        question: "Does it exclude common words from keywords?",
        answer: "Yes, standard stop-words (the, a, and, or, in, of, are, was, etc.) are excluded from keyword density scores."
      },
      {
        question: "Is there any word limit?",
        answer: "No, the processing is handled entirely client-side, enabling fast calculations on extremely long reports."
      }
    ],
    relatedSlugs: ["markdown-preview", "diff-checker", "json-formatter"]
  },
  {
    id: "diff-checker",
    name: "Diff Checker",
    slug: "diff-checker",
    category: "Productivity",
    description: "Compare two text versions or source code branches line-by-line with clean added/deleted highlight markers.",
    seoTitle: "Free Diff Checker - Compare Text & Code Online | Mene",
    seoDesc: "Compare two code structures or drafts side-by-side. Visualized line highlights make deletions and additions clear instantly.",
    iconName: "AlignLeft",
    usageCount: "94.8K",
    benefits: [
      "Executes fast, clean line-by-line comparison heuristics",
      "Clear visual indicators: red deletions and green additions",
      "Secure and client-safe processing within browser sandbox"
    ],
    howItWorks: [
      "Paste your original baseline text into the left container pane.",
      "Paste your modified/edited text into the right container pane.",
      "Click Compare to compile color highlights and differences."
    ],
    faqs: [
      {
        question: "Does it do character-level highlighting?",
        answer: "Our engine executes line-by-line evaluation, highlighting modified, deleted, and added lines in unified sheets."
      },
      {
        question: "Can I copy the diff results?",
        answer: "Yes, you can copy elements or review lines directly from the interactive merged diff window."
      }
    ],
    relatedSlugs: ["markdown-preview", "word-counter", "json-formatter"]
  },

  // --- Media ---
  {
    id: "voice-recorder",
    name: "Voice Recorder",
    slug: "voice-recorder",
    category: "Media",
    description: "Capture clear audio notes from your device microphone with standard pause, resume, and file downloads.",
    seoTitle: "Free Voice Recorder - Record Audio from Microphone | Mene",
    seoDesc: "Record voice notes and audio feeds locally with HTML5 capture APIs. Download clean WebM audio clips securely.",
    iconName: "Mic",
    usageCount: "138.5K",
    benefits: [
      "Uses standard browser MediaRecorder: zero external servers",
      "Tracks real-time capture duration with a highly precise countdown",
      "Enables instant playback and single-click WebM file download"
    ],
    howItWorks: [
      "Allow microphone access when prompted by your secure browser bar.",
      "Click Initiate Recording, with full flexibility to pause or resume.",
      "Click Stop to finalize, listen to the playback, and download the asset."
    ],
    faqs: [
      {
        question: "Are my audio clips uploaded or stored?",
        answer: "Never. Your recording streams directly into local browser memory buffers, staying 100% private and on your device."
      },
      {
        question: "Which formats are available for download?",
        answer: "Snippets are encoded and saved in modern, high-quality `.webm` containers."
      }
    ],
    relatedSlugs: ["screen-recorder", "audio-cutter", "video-to-gif"]
  },
  {
    id: "screen-recorder",
    name: "Screen Recorder",
    slug: "screen-recorder",
    category: "Media",
    description: "Record entire desktop monitors, target windows, or browser tabs securely completely offline.",
    seoTitle: "Free Screen Recorder - Record Screen Online | Mene",
    seoDesc: "Capture screencasts, tutorial streams, or windows with direct HTML5 display capture APIs. Export files instantly.",
    iconName: "Video",
    usageCount: "185.0K",
    benefits: [
      "Requires no heavy extensions, plugins, or third-party software",
      "Allows capturing standard desktop, chrome tabs, or window surfaces",
      "Zero time restrictions or watermarks added to output clips"
    ],
    howItWorks: [
      "Click Capture Desktop to select a window, tab, or screen to record.",
      "Manage duration and click Stop once screen actions are complete.",
      "Preview the recording inside our deck and download to save locally."
    ],
    faqs: [
      {
        question: "Can I record screen audio as well?",
        answer: "Yes, you can select 'Share system audio' when selecting your screen surface in Chrome."
      },
      {
        question: "Is there any watermark placed on output files?",
        answer: "No. Our tools are completely free, native, and place absolutely zero watermark tags onto files."
      }
    ],
    relatedSlugs: ["voice-recorder", "audio-cutter", "video-to-gif"]
  },
  {
    id: "audio-cutter",
    name: "Audio Cutter",
    slug: "audio-cutter",
    category: "Media",
    description: "Trim, clip, and segment MP3 or WAV audio tracks with interactive dual-handle visual sliders.",
    seoTitle: "Free Audio Cutter - Trim and Clip Audio Tracks | Mene",
    seoDesc: "Trim audio tracks with high accuracy. Upload MP3 or WAV, drag sliders to clip ranges, and download WAV files.",
    iconName: "Scissors",
    usageCount: "128.6K",
    benefits: [
      "Decodes audio using browser hardware acceleration APIs",
      "Interactive sliders allow selection to the tenth of a second",
      "Generates clean uncompressed PCM WAV segments locally"
    ],
    howItWorks: [
      "Upload your audio file. The browser will decode channel data.",
      "Drag the start and end sliders to choose your preferred range.",
      "Click Cut and download your refined WAV clip instantly."
    ],
    faqs: [
      {
        question: "Which audio formats can be cut?",
        answer: "Any format supported natively by your browser's decoding engine, including MP3, WAV, OGG, and FLAC."
      },
      {
        question: "Will the audio quality be degraded?",
        answer: "No, we copy original channel PCM float packets directly, keeping output uncompressed."
      }
    ],
    relatedSlugs: ["voice-recorder", "screen-recorder", "video-to-gif"]
  },
  {
    id: "video-to-gif",
    name: "Video to GIF",
    slug: "video-to-gif",
    category: "Media",
    description: "Extract high-resolution image sequences or frame sheets from video clips locally.",
    seoTitle: "Free Video to GIF - Frame Extractor Online | Mene",
    seoDesc: "Seek and capture keyframes from MP4 or WebM videos. Decompile sheets to downloadable high-res PNG frame packets.",
    iconName: "Film",
    usageCount: "98.2K",
    benefits: [
      "Processes locally: skips heavy slow WebAssembly downloads",
      "Adjust frame rate (FPS) sampling parameters dynamically",
      "One-click PNG sequence extraction of selected moments"
    ],
    howItWorks: [
      "Select your MP4 or WebM video. Seek/preview inside the deck.",
      "Select your target sampling frequency rate (frames per second).",
      "Decompile frames and click on any Moment card to download."
    ],
    faqs: [
      {
        question: "Why does it limit frame extraction counts?",
        answer: "Extrating hundreds of high-res image buffers can crash tab memory. We limit extraction to 12 frames to ensure smooth, safe operations."
      },
      {
        question: "Can I download individual frames?",
        answer: "Yes, clicking on any extracted segment instantly triggers download of that specific high-res PNG frame."
      }
    ],
    relatedSlugs: ["voice-recorder", "screen-recorder", "audio-cutter"]
  }
];

export function getToolPath(category: string, slug: string): string {
  const cat = category.toLowerCase();
  let s = slug.toLowerCase();
  if (cat === "pdf") {
    if (s === "merge-pdf") s = "merge";
    else if (s === "split-pdf") s = "split";
    else if (s === "compress-pdf") s = "compress";
    else if (s === "pdf-to-image") s = "to-image";
  } else if (cat === "images") {
    if (s === "image-compressor") s = "compressor";
    else if (s === "image-converter") s = "converter";
    else if (s === "svg-optimizer") s = "svg-optimizer";
  } else if (cat === "ai") {
    if (s === "ai-text-generator") s = "text-generator";
    else if (s === "ai-summarizer") s = "summarizer";
    else if (s === "ai-prompt-generator") s = "prompt-generator";
  }
  return `/${cat}/${s}`;
}

export function findToolByCategoryAndSlug(categoryParam: string, slugParam: string): ToolMetadata | undefined {
  const cleanCategory = categoryParam.toLowerCase();
  const cleanSlug = slugParam.toLowerCase();

  return TOOLS_LIST.find((t) => {
    const toolCategory = t.category.toLowerCase();
    if (toolCategory !== cleanCategory) return false;

    // Direct match on slug
    if (t.slug === cleanSlug) return true;

    // Shortened variations matching
    if (t.slug === `${cleanSlug}-${cleanCategory}`) return true;
    if (t.slug === `${cleanCategory}-${cleanSlug}`) return true;
    if (cleanSlug === "to-image" && t.slug === "pdf-to-image") return true;

    // Handle singular form (e.g. "image" category parameter for "images" tools)
    const catSingular = cleanCategory.endsWith('s') ? cleanCategory.slice(0, -1) : cleanCategory;
    if (t.slug === `${catSingular}-${cleanSlug}`) return true;
    if (t.slug === `${cleanSlug}-${catSingular}`) return true;

    // Extra manual overrides to be bulletproof
    if (cleanCategory === "pdf" && cleanSlug === "merge" && t.slug === "merge-pdf") return true;
    if (cleanCategory === "pdf" && cleanSlug === "split" && t.slug === "split-pdf") return true;
    if (cleanCategory === "pdf" && cleanSlug === "compress" && t.slug === "compress-pdf") return true;
    if (cleanCategory === "pdf" && cleanSlug === "to-image" && t.slug === "pdf-to-image") return true;

    if (cleanCategory === "images" && cleanSlug === "compressor" && t.slug === "image-compressor") return true;
    if (cleanCategory === "images" && cleanSlug === "converter" && t.slug === "image-converter") return true;
    if (cleanCategory === "images" && cleanSlug === "svg-optimizer" && t.slug === "svg-optimizer") return true;

    if (cleanCategory === "ai" && cleanSlug === "text-generator" && t.slug === "ai-text-generator") return true;
    if (cleanCategory === "ai" && cleanSlug === "summarizer" && t.slug === "ai-summarizer") return true;
    if (cleanCategory === "ai" && cleanSlug === "prompt-generator" && t.slug === "ai-prompt-generator") return true;

    return false;
  });
}


