# Cloudflare Infrastructure

This directory contains deployment and setup references for provisioning Mene Tools on Cloudflare.

## Architecture Overview

1. **Web Application (`apps/web`)**
   - Deployed on **Cloudflare Pages**
   - Built with static site generation (`output: 'export'`)
   - Auto-deploys via GitHub integration on `main` branch pushes

2. **AI Proxy Gateway (`services/ai-gateway`)**
   - Deployed on **Cloudflare Workers**
   - Handles serverless rate-limiting and AI API routing
   - Operates edge proxy protection for model backend endpoints

## Deployment Commands

```bash
# Deploy AI Gateway Worker
cd services/ai-gateway
npx wrangler deploy

# Set environment secrets
npx wrangler secret put GROQ_API_KEY
```
