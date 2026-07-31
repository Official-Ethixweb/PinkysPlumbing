// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.pinkysplumbing.com',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()]
  },
  image: {
    // Allow the built-in Sharp service to upscale-free resize our source webp
    // photos into responsive, art-directed sizes at build time.
    responsiveStyles: true
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  }
});
