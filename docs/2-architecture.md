# Architecture

## High-level flow

```
Markdown posts (src/content/blog/<lang>/*.md)
        │
        ▼
Content collection (src/content.config.ts, glob loader + Zod schema)
        │
        ▼
Page components (src/pages/<lang>/…) + shared layouts/components
        │
        ▼
Astro build  →  static HTML + optimized assets in dist/
        │
        ▼
GitHub Actions  →  GitHub Pages
```

The entire site is prerendered at build time (`output: "static"`, which is Astro's default). There is no runtime server.

## Routing

Routing is filesystem-based under `src/pages/`. English is the default locale with no URL prefix; Spanish lives under `/es/`:

| URL               | File                                   |
| ----------------- | -------------------------------------- |
| `/`               | `src/pages/index.astro` (English home) |
| `/blog`           | `src/pages/blog.astro`                 |
| `/blog/<slug>`    | `src/pages/blog/[slug].astro`          |
| `/es/`            | `src/pages/es/index.astro`             |
| `/es/blog`        | `src/pages/es/blog.astro`              |
| `/es/blog/<slug>` | `src/pages/es/blog/[slug].astro`       |
| `/404`            | `src/pages/404.astro`                  |

This is configured in `astro.config.mjs`:

```js
i18n: {
  defaultLocale: "en",
  locales: ["en", "es"],
  routing: {
    prefixDefaultLocale: false,      // EN has no prefix → served at /
    redirectToDefaultLocale: false,  // no server-side redirect
  },
}
```

An inline `<script>` in `Layout.astro`'s `<head>` provides client-side language detection: it reads `localStorage.lang` (set by the language picker) and falls back to `navigator.languages` to redirect Spanish browsers from `/` to `/es/` before the first paint. Deep links are never redirected — only `/` triggers auto-detection.

## Content pipeline

Blog posts are Markdown files loaded through the Content Layer API:

```ts
// src/content.config.ts
defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({ idx, title, author, pubDate, pubDateLogical, tags }),
});
```

- `entry.id` is the path relative to `base`, without extension (e.g. `es/modelo-3x-kent-beck`).
- Post HTML is produced via `render(entry)` from `astro:content`, invoked inside `src/pages/blog/[slug].astro` (EN) and `src/pages/es/blog/[slug].astro` (ES).
- Blog index pages call `getFormattedPosts(lang)` which handles filtering, sorting, and formatting. Post pages use `getBlogStaticPaths(lang)` for route generation.

### Identifiers: slug vs. idx

The **slug** is the identifier of a post. It comes from the filename (`src/content/blog/<lang>/<slug>.md`) and appears verbatim in the URL (`/blog/<slug>` for EN, `/es/blog/<slug>` for ES). Slugs are independent per language (e.g. `modelo-3x-kent-beck` vs `kent-beck-3x-model`) so each language gets a readable URL.

The frontmatter field **`idx`** is _not_ an identifier — it is a number used only for:

1. **Sort order** in blog listings. Higher `idx` renders first (`src/pages/<lang>/blog.astro` and `PostList.astro`).
2. **Translation linking.** Two posts in different languages with the same `idx` are treated as translations of one another.

### Translation linking

`getPostTranslations(idx, currentLang)` (in `src/i18n/utils.ts`) collects all entries with a given `idx` and builds a `{ lang: url }` map from their slugs. `Layout.astro` passes this map to `LanguagePicker`, which links to the correct translated URL (falling back to a naive path swap if the map is missing). The same translations map is used to generate `hreflang` alternate links in `<head>`.

### Shared blog helpers

`src/i18n/utils.ts` exports typed helper functions that eliminate duplication across blog pages:

- `getBlogEntriesByLang(lang)` — fetches and filters collection entries by language prefix.
- `sortPostsByIdx(posts)` — sorts entries by `idx` descending.
- `filterFuturePosts(posts)` — hides entries whose `pubDateLogical` is in the future.
- `getFormattedPosts(lang)` — combines fetch + sort + filter + format into a single call used by blog index pages.
- `getBlogStaticPaths(lang)` — generates `getStaticPaths()` return values for `[slug].astro` pages.

### Scheduled publishing

`filterFuturePosts()` in `src/i18n/utils.ts` hides posts whose `pubDateLogical` is in the future. This lets you commit and deploy a post in advance and have it appear automatically on the intended date — no rebuild required _relative to the post itself_, but a build on/after that date will include it.

## Theming / dark mode

- Tailwind 4 is imported in `src/styles/global.css` via `@import "tailwindcss"`.
- A custom dark variant is declared: `@variant dark (.dark &);`. Dark mode is class-based (`.dark` on `<html>`).
- `DarkModeToggle.astro` is a client-side inline script: it reads/writes `localStorage.theme`, toggles `.dark` on `document.documentElement`, and respects `prefers-color-scheme` on first load.
- There is no framework runtime (no React/Vue/Svelte); the toggle is plain DOM.

## SEO metadata

`Layout.astro` emits the following in `<head>` for every page:

- `<link rel="canonical">` pointing to the current URL.
- `<link rel="alternate" hreflang="en|es|x-default">` computed from the `translations` prop (or derived from the current path when no translations map is passed).
- Open Graph tags (`og:title`, `og:description`, `og:url`, `og:type`, `og:locale`, `og:site_name`).
- Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`).
- Dynamic `<meta name="description">` per page.

`PostLayout.astro` additionally emits:

- `article:published_time`, `article:author`, and `article:tag` meta properties.
- A `BlogPosting` JSON-LD block (`<script type="application/ld+json">`).

`@astrojs/sitemap` generates `sitemap-index.xml` and per-locale sitemap files at build time. `public/robots.txt` points search engines to the sitemap.

## Styling

- Layout-level utility classes live in the `.astro` components.
- Brand colors are centralized in a Tailwind v4 `@theme` block in `src/styles/global.css` as CSS custom properties (`--color-primary`, `--color-highlight`), referenced via Tailwind utilities (e.g. `bg-primary`) and `var()` in CSS.
- Long-form post content is styled in `src/styles/post.css` (`.post-content h1 { … }`, etc.) because Markdown output has no class hooks to apply Tailwind utilities to. `PostLayout.astro` imports this file.
- Self-hosted Roboto is declared with `@font-face` in `src/styles/global.css` and set as `body { font-family: "Roboto", sans-serif; }`.

## Build and deploy

- `npm run build` invokes `astro build`, which:
  1. Syncs content and generates types.
  2. Renders all routes to `dist/`.
  3. Optimizes images via `astro:assets` (produces WebP variants).
- Two GitHub Actions workflows run on every push to `main`:
  1. **Lint** (`lint.yml`): checks formatting (`prettier --check`), runs ESLint, and runs `astro check` for TypeScript diagnostics. Also runs on every pull request as a required check.
  2. **Deploy** (`deploy.yml`): `withastro/action@v6` builds the site, then `actions/deploy-pages@v5` publishes `dist/` to GitHub Pages.
