# provekit.org

[![CI](https://github.com/atheonxyz/provekit.org/actions/workflows/ci.yml/badge.svg)](https://github.com/atheonxyz/provekit.org/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Astro](https://img.shields.io/badge/Astro-4.x-FF5D01.svg?logo=astro)](https://astro.build)
[![Bun](https://img.shields.io/badge/Bun-1.3-FBF0DF.svg?logo=bun)](https://bun.sh)

The landing page for **[ProveKit](https://provekit.org)** — a client-side
zero-knowledge proving toolkit written in Rust.

The site is a 1:1 implementation of the official ProveKit Design System: a
fixed-width 1600px stage of stacked, bordered panels with category tabs,
restrained mono chrome, and a soft pastel-bloom illustration language.

---

## Stack

| Layer       | Choice                                                                        |
| ----------- | ----------------------------------------------------------------------------- |
| Framework   | [Astro 4](https://astro.build) — static output, MDX-ready                     |
| Styling     | [Tailwind v4](https://tailwindcss.com) via `@tailwindcss/vite` + CSS `@theme` |
| Language    | TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)  |
| Fonts       | Self-hosted Outfit (300/400/500/600) + Geist Mono (400) via `@fontsource`     |
| Package mgr | [Bun](https://bun.sh)                                                         |
| Unit tests  | [Vitest](https://vitest.dev) (jsdom)                                          |
| E2E tests   | [Playwright](https://playwright.dev) (Chromium, Firefox, and WebKit)          |
| Performance | [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)                |
| Deployment  | [Cloudflare Pages](https://pages.cloudflare.com) (or any static host)         |

Total client JavaScript: **< 5 KB**, zero raster images on the critical path.

---

## Pages

| Route         | Sections                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `/`           | Hero · Install · Features · Partners · Benchmarks · FAQ · Footer                                  |
| `/benchmarks` | Hero · Methodology · three Metric Detail panels (proving / memory / verification) · Summary table |

Both pages share the same `Header` and `Footer` components and the same
sortable chart data (`src/data/benchmarks.ts`).

---

## Project structure

```
provekit.org/
├── public/
│   └── figma/            # Brand-approved raster + SVG assets used by the site
├── src/
│   ├── components/       # Astro components, organised by section
│   │   ├── benchmarks/        # Landing-page benchmark section
│   │   ├── benchmarks-page/   # /benchmarks subpage components
│   │   ├── charts/            # Shared LineChart / BarsChart / ColumnsChart
│   │   ├── credits/           # Partners panel
│   │   ├── faq/               # FAQ rows + section
│   │   ├── features/          # Three feature cards
│   │   ├── footer/            # Chip nav + giant ASCII wordmark
│   │   ├── hero/              # Hero panel
│   │   ├── icons/             # Inline SVG icons (ArrowRight)
│   │   ├── install/           # Install code panel
│   │   ├── nav/               # Top bar
│   │   └── panel/             # Shared bordered panel + category tab
│   ├── content/          # Static content (FAQ entries)
│   ├── data/             # Typed data sources (benchmark metrics)
│   ├── layouts/          # BaseLayout (head, meta, fonts, JSON-LD)
│   ├── pages/            # index.astro, benchmarks.astro
│   ├── scripts/          # Vanilla TS bundled to the client
│   └── styles/           # Tokens + component CSS
└── tests/                # Playwright e2e
```

The Astro components in `src/components/` mirror the JSX source shipped in
the ProveKit Design System bundle. Code comments throughout `src/` reference
the corresponding JSX files for provenance.

---

## Local development

```bash
bun install
bun run dev          # http://localhost:4321
```

| Script                      | Purpose                                                  |
| --------------------------- | -------------------------------------------------------- |
| `bun run dev`               | Astro dev server with HMR                                |
| `bun run build`             | Production static build to `./dist`                      |
| `bun run preview`           | Serve the built `./dist`                                 |
| `bun run check`             | `astro check` — TypeScript + Astro diagnostics           |
| `bun run lint`              | ESLint (flat config, TypeScript + Astro rules)           |
| `bun run format`            | Prettier --write across the project                      |
| `bun run test`              | Vitest unit tests (jsdom)                                |
| `bun run test:e2e`          | Playwright E2E across three browser engines              |
| `bun run test:browser-wasm` | Real ProveKit WASM proof + verification in every browser |
| `bun run prepush`           | Full local pre-push gate                                 |
| `bun run lhci`              | Lighthouse CI against the production build               |

---

## Quality gates

Every change is expected to pass:

- **Type-check:** `bun run check` — zero errors
- **Lint:** `bun run lint` — zero errors
- **Format:** `bun run format:check`
- **Unit tests:** `bun run test`
- **E2E tests:** `bun run test:e2e`
- **Lighthouse budgets** (desktop preset):
  - Performance ≥ **0.98**
  - Accessibility = **1.0**
  - Best Practices = **1.0**
  - SEO = **1.0**

The CI workflow at [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)
runs every gate on push and pull request.

---

## Accessibility

- Sticky `<header>` and semantic `<main>` / `<section>` landmarks throughout
- Skip-to-content link as the first focusable element
- All decorative elements marked `aria-hidden="true"`
- Interactive elements expose proper `role` and `aria-pressed` (benchmark
  tabs, summary table column headers)
- The Benchmarks summary table exposes its full numerical comparison to
  screen readers via the figure's accessible name and per-cell text content
- `prefers-reduced-motion: reduce` honored on every animation
  (bloom drift, tooltip flip, reveal-on-scroll)
- WCAG AA color contrast verified for body text on canvas

---

## Deployment

Cloudflare Pages auto-detects Astro:

| Setting          | Value                   |
| ---------------- | ----------------------- |
| Framework preset | Astro                   |
| Build command    | `bun run build`         |
| Output directory | `dist/`                 |
| Node version     | `22` (matches `.nvmrc`) |

Preview deploys are enabled per pull request by default. The site is fully
static — no edge functions, no server routes — so any static host works.

---

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Commits follow
[Conventional Commits](https://www.conventionalcommits.org); all PRs must
pass the full quality-gate matrix above.

---

## License

[MIT](./LICENSE) © 2026 ProveKit contributors.
