import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Astro configuration for LiveTVStreaming.services
// Static output only, for deployment to Cloudflare Pages
export default defineConfig({
  site: 'https://livetvstreaming.services',
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  },
  build: {
    format: 'directory'
  },
  compressHTML: true
});
