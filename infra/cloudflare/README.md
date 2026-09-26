# Cloudflare Infrastructure

This directory contains deployment and setup references for provisioning Mene Tools on Cloudflare.

## Architecture Overview

1. **Web Application (`apps/web`)**
   - Deployed on **Cloudflare Pages**
   - Built with static site generation (`output: 'export'`)
   - Auto-deploys via GitHub integration on `master` branch pushes
   - 100% client-side in-browser execution with zero server or database dependencies
