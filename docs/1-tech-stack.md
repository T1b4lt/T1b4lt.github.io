# Tech Stack

## Runtime

| Dependency          | Version   | Role |
|---------------------|-----------|------|
| `astro`             | `^6.1.7`  | Static site generator, content collections, i18n routing, image pipeline. |
| `astro-icon`        | `^1.1.5`  | Inline SVG icon component powered by Iconify. |
| `@fontsource/roboto`| `^5.2.10` | Self-hosted Roboto font files (`.woff2`) managed via npm. |
| `tailwindcss`       | `^4.2.2`  | Utility-first CSS framework. |
| `@tailwindcss/vite` | `^4.2.2`  | Official Vite plugin that wires Tailwind 4 into Astro's Vite build. |
| `@iconify-json/fa6-brands` | `^1.2.6` | FontAwesome 6 brand icons (GitHub, LinkedIn) for astro-icon. |
| `@iconify-json/fa6-solid`  | `^1.2.4` | FontAwesome 6 solid icons (angles-right) for astro-icon. |

## Tooling

- **Node.js ≥ 22** — required by Astro 6.
- **TypeScript** — `tsconfig.json` extends `astro/tsconfigs/base`. Used for the content schema (`src/content.config.ts`) and typed component props.
- **Vite 7** — bundled by Astro 6; no direct configuration needed beyond the Tailwind plugin.
- **Zod 4** — ships with Astro; used for content collection schema validation via `astro/zod`.

## Assets (self-hosted)

- **Roboto** — served as `.woff2` via `@fontsource/roboto`, imported in `src/styles/global.css`. Weights: 300, 400, 500, 700.
- **Icons** — inline SVG via `astro-icon` + Iconify JSON packs. Only the icons actually used are bundled (GitHub, LinkedIn, angles-right).
- **Images** — `public/images/` (e.g. the 404 illustration).

## CI / CD

- **GitHub Actions** — `.github/workflows/deploy.yml` runs on push to `main`.
- **`actions/checkout@v6`** — checks out the repo.
- **`withastro/action@v6`** — official Astro action that installs deps, builds, and uploads the artifact.
- **`actions/deploy-pages@v5`** — publishes the artifact to GitHub Pages.

## Why these choices

- **Astro over Next/Remix/Hugo.** Markdown content with typed frontmatter + component islands for the few interactive pieces (dark mode toggle) without shipping a React/Vue runtime. Static output is ideal for GitHub Pages.
- **Tailwind 4 with the Vite plugin.** Tailwind 4 dropped the PostCSS setup and moved config into CSS (`@import "tailwindcss"`); the Vite plugin is the canonical integration. No `tailwind.config.js` is needed.
- **Self-hosted fonts and icons.** No third-party CDN requests and no FOUT; deterministic builds.
