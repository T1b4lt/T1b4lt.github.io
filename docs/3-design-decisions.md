# Design Decisions

Non-obvious choices made in this project, and the reasoning behind each.

## Slug is the identifier; `idx` is a separate link/sort key

**Decision.** The slug (filename) is the identifier of a post — it is what appears in the URL (`/blog/<slug>` for EN, `/es/blog/<slug>` for ES). The frontmatter field `idx` is *not* an identifier; it is a number used only as a sort key in listings and as the key to pair translations across languages.

**Why.** Slugs are intentionally different across languages (`modelo-3x-kent-beck` vs `kent-beck-3x-model`) because each language wants its own, readable URL — so slug alone cannot link translations. A separate numeric `idx` decouples translation linking from the slug, so renaming a file never breaks the link to its translation. The same number also drives listing order (higher `idx` = shown first).

## `pubDateLogical` separate from `pubDate`

**Decision.** Posts have two date fields — `pubDate` (display string) and `pubDateLogical` (ISO `YYYY-MM-DD`).

**Why.** `pubDate` is free-form text for the byline (so it can be localized: "8 de abril de 2026" vs "April 8, 2026"). `pubDateLogical` is a machine-comparable date used to filter future posts in `PostList.astro`, enabling scheduled publishing without parsing localized strings.

## Tailwind 4 via `@tailwindcss/vite` (no config file)

**Decision.** Tailwind is pulled in with `@import "tailwindcss"` in `src/styles/global.css` and the Vite plugin. There is no `tailwind.config.js` and no PostCSS setup.

**Why.** Tailwind 4 moved its configuration into CSS (`@theme`, `@variant`, etc.) and the Vite plugin is the canonical integration. Keeping the stack minimal means fewer files to reason about.

## Class-based dark mode with a custom variant

**Decision.** Dark mode is controlled by a `.dark` class on `<html>`, declared with `@variant dark (.dark &);` in `global.css` rather than relying on `prefers-color-scheme` alone.

**Why.** Letting the user override the OS preference is the expected behavior for a blog. The toggle writes to `localStorage` and applies the class before paint (inline `<script>`) to avoid a flash of incorrect theme.

## Self-hosted fonts and icons

**Decision.** Roboto is managed via `@fontsource/roboto` and icons via `astro-icon` with Iconify JSON packs (`@iconify-json/fa6-brands`, `@iconify-json/fa6-solid`). Assets are bundled into the build output — no CDN requests at runtime.

**Why.** Determinism (no network dependency at request time), privacy (no third-party hits from visitors), and offline-friendly dev. npm management adds versioning, automated updates, and smaller bundles (`.woff2` instead of `.ttf`, tree-shaken inline SVG instead of full CSS+webfont sets).

## Social links limited to GitHub and LinkedIn

**Decision.** The footer links to GitHub and LinkedIn only. The Twitter/X link was removed.

**Why.** The author no longer actively uses the platform.

## Post CSS extracted to `src/styles/post.css`

**Decision.** Post-body styles (`.post-content h1 { … }`, etc.) live in `src/styles/post.css`, imported by `PostLayout.astro`. Brand colors reference CSS custom properties defined in `global.css`'s `@theme` block rather than hard-coded hex values.

**Why.** Markdown-rendered HTML has no class hooks to apply utility classes to, and the typography plugin adds opinionated defaults that conflict with the rest of the page. Extracting the styles to a dedicated file keeps `PostLayout.astro` focused on layout and makes the styles reusable. Centralizing colors in `@theme` (`--color-primary`, `--color-highlight`) eliminates scattered hex literals and lets Tailwind utilities like `bg-primary` work across all components.

## SEO metadata computed from the translations map

**Decision.** `Layout.astro` generates `canonical`, `hreflang` (en, es, x-default), Open Graph, and Twitter Card tags for every page. Alternate URLs are derived from the `translations` prop when available, or computed from the current path as a fallback. `PostLayout.astro` adds `BlogPosting` JSON-LD for posts.

**Why.** Without `canonical` and `hreflang`, search engines treat the EN and ES versions as duplicates. Open Graph and Twitter Cards ensure rich link previews on social platforms. Computing alternates from the same `translations` map used by the language picker guarantees consistency between the UI and the metadata.

## EN served at `/`, ES at `/es/`, language auto-detected client-side

**Decision.** English is the default locale with no URL prefix (`prefixDefaultLocale: false`). Spanish lives under `/es/`. An inline `<script>` in `Layout.astro`'s `<head>` inspects `localStorage.lang` and `navigator.languages` to redirect Spanish browsers from `/` to `/es/` before the first paint.

**Why.** GitHub Pages cannot perform server-side language negotiation (no `Accept-Language` header inspection). The previous setup used Astro's `redirectToDefaultLocale` to generate a meta-refresh at `/` → `/es/`, which caused a visible white flash. Serving real content at `/` eliminates the flash entirely. Client-side detection provides a best-effort language match for first-time visitors without requiring an edge runtime.

## Spanish-first authoring, English-first routing

**Decision.** Spanish posts are written first; English mirrors them. However, the web routing convention is English-first: EN is served at `/` (unprefixed) and ES at `/es/`.

**Why.** The author's primary audience speaks Spanish, so authoring begins there. But serving English at the root makes the site accessible to the widest audience by default — Spanish browsers are automatically redirected via client-side detection. This separates the authoring workflow (ES → EN) from the URL structure (EN at root).
