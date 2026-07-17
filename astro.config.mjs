// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  // Replace with your actual domain once connected.
  // Used for canonical URLs and sitemaps.
  site: 'https://stargazerworkshop.com',
});