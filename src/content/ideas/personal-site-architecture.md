---
title: "personal site architecture"
date: 2026-07-17
status: growing
tags: ["web", "infrastructure"]
---

Started with Astro + Cloudflare Pages. The main appeal:

- content collections for blog, ideas, and art
- wrangler.jsonc as config-as-code for everything CF-related
- can add Workers/D1/KV incrementally without rearchitecting
- static output by default, SSR available per-page when needed

Next: wire up the GitHub Actions deploy, point the domain.
