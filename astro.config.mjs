import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// COOP/COEP enable Cross-Origin Isolation so the in-browser ZK prover can
// use SharedArrayBuffer + Web Workers for multi-threaded proving. Without
// these headers the runtime falls back to single-thread and is 2–4× slower.
const crossOriginIsolation = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
};

export default defineConfig({
  site: 'https://provekit.org',
  trailingSlash: 'never',
  prefetch: true,
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: { headers: crossOriginIsolation },
    preview: { headers: crossOriginIsolation },
  },
});
