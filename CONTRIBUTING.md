# Contributing to Mene Tools

Thank you for your interest in contributing to **Mene Tools**! We welcome bug reports, feature requests, documentation improvements, and code contributions.

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Node.js**: `v18.17.0` or higher (Recommended: `v20.x`)
- **npm**: `v9.x` or higher

### 2. Getting Started
1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mene-tools.git
   cd mene-tools
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Copy `.env.example` to `apps/web/.env.local`:
   ```bash
   cp .env.example apps/web/.env.local
   ```
4. **Start local development**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📜 Code Style & Quality Standards

- **TypeScript**: We enforce strict type safety across all workspaces.
- **Privacy First**: All client-side tools must process files strictly in browser memory. Never send user files or media to external servers without explicit consent.
- **Linting & Formatting**: Ensure code adheres to ESLint rules:
  ```bash
  npm run lint
  ```
- **Building**: Verify production build before submitting pull requests:
  ```bash
  npm run build
  ```

---

## 🚀 Submitting Pull Requests

1. Create a descriptive feature branch (`git checkout -b feature/my-new-tool`).
2. Commit your changes with concise commit messages (`git commit -m "feat: add SVG minifier tool"`).
3. Push to your fork (`git push origin feature/my-new-tool`).
4. Open a Pull Request targeting the `main` branch of the official repository.

---

## 📄 Licensing

By contributing to Mene Tools, you agree that your contributions will be licensed under the project's [Apache License 2.0](LICENSE).
