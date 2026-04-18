# Tech Stack

## Runtime

| Dependency                 | Version   | Role                                                                      |
| -------------------------- | --------- | ------------------------------------------------------------------------- |
| `astro`                    | `^6.1.7`  | Static site generator, content collections, i18n routing, image pipeline. |
| `astro-icon`               | `^1.1.5`  | Inline SVG icon component powered by Iconify.                             |
| `@fontsource/roboto`       | `^5.2.10` | Self-hosted Roboto font files (`.woff2`) managed via npm.                 |
| `tailwindcss`              | `^4.2.2`  | Utility-first CSS framework.                                              |
| `@tailwindcss/vite`        | `^4.2.2`  | Official Vite plugin that wires Tailwind 4 into Astro's Vite build.       |
| `@iconify-json/fa6-brands` | `^1.2.6`  | FontAwesome 6 brand icons (GitHub, LinkedIn) for astro-icon.              |
| `@iconify-json/fa6-solid`  | `^1.2.4`  | FontAwesome 6 solid icons (angles-right) for astro-icon.                  |
| `@astrojs/sitemap`         | `^3.7.2`  | Generates `sitemap-index.xml` at build time with i18n hreflang support.   |

## Tooling

- **Node.js ≥ 22** — required by Astro 6.
- **TypeScript (strict mode)** — `tsconfig.json` extends `astro/tsconfigs/strict`. Used for the content schema (`src/content.config.ts`), typed component props, and i18n utilities.
- **ESLint** — flat config in `eslint.config.mjs`. Uses `@eslint/js` (recommended rules), `typescript-eslint` (TS-aware rules), `eslint-plugin-astro` (`.astro` file support), and `eslint-config-prettier` (disables formatting rules that conflict with Prettier).
- **Prettier** — config in `.prettierrc.mjs`. Uses `prettier-plugin-astro` to format `.astro` files. Ignored paths in `.prettierignore`.
- **`@astrojs/check`** — runs TypeScript diagnostics across `.astro` and `.ts` files via `npx astro check`.
- **Vite 7** — bundled by Astro 6; no direct configuration needed beyond the Tailwind plugin.
- **Zod 4** — ships with Astro; used for content collection schema validation via `astro/zod`.

## Assets (self-hosted)

- **Roboto** — served as `.woff2` via `@fontsource/roboto`, imported in `src/styles/global.css`. Weights: 300, 400, 500, 700.
- **Icons** — inline SVG via `astro-icon` + Iconify JSON packs. Only the icons actually used are bundled (GitHub, LinkedIn, angles-right).
- **Images** — `public/images/` (e.g. the 404 illustration).

## CI / CD

- **GitHub Actions** — `.github/workflows/deploy.yml` runs on push to `main`.
- **Lint job** — runs before the build: `npm run format:check`, `npm run lint`, and `npx astro check`. Uses `actions/setup-node@v4` with Node 22 and npm cache.
- **Build job** — depends on the lint job passing. Uses `withastro/action@v6` (installs deps, builds, uploads artifact).
- **Deploy job** — `actions/deploy-pages@v5` publishes the artifact to GitHub Pages.

## Why these choices

- **Astro over Next/Remix/Hugo.** Markdown content with typed frontmatter + component islands for the few interactive pieces (dark mode toggle) without shipping a React/Vue runtime. Static output is ideal for GitHub Pages.
- **Tailwind 4 with the Vite plugin.** Tailwind 4 dropped the PostCSS setup and moved config into CSS (`@import "tailwindcss"`); the Vite plugin is the canonical integration. No `tailwind.config.js` is needed.
- **Self-hosted fonts and icons.** No third-party CDN requests and no FOUT; deterministic builds.
