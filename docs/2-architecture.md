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

Routing is filesystem-based under `src/pages/`:

| URL                                    | File |
|----------------------------------------|------|
| `/`                                    | auto-generated redirect → `/es/` |
| `/es/` (default locale)                | `src/pages/es/index.astro` |
| `/en/`                                 | `src/pages/en/index.astro` |
| `/es/blog`, `/en/blog`                 | `src/pages/<lang>/blog.astro` |
| `/es/blog/<slug>`, `/en/blog/<slug>`   | `src/pages/<lang>/blog/[slug].astro` |
| `/404`                                 | `src/pages/404.astro` |

The `/` redirect is produced by Astro because `astro.config.mjs` sets:

```js
i18n: {
  defaultLocale: "es",
  locales: ["es", "en"],
  routing: {
    prefixDefaultLocale: true,     // always emit /es/, never bare /
    redirectToDefaultLocale: true, // / → /es/
  },
}
```

`src/pages/index.astro` is intentionally empty — Astro 6 requires a file at `/` to hang the redirect on, but its content is not rendered.

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
- Post HTML is produced via `render(entry)` from `astro:content`, invoked inside `src/pages/<lang>/blog/[slug].astro`.
- The language pages filter by `entry.id.startsWith("<lang>/")`, then pass entries to `PostList`/`PostLayout`.

### Identifiers: slug vs. idx

The **slug** is the identifier of a post. It comes from the filename (`src/content/blog/<lang>/<slug>.md`) and appears verbatim in the URL (`/<lang>/blog/<slug>`). Slugs are independent per language (e.g. `modelo-3x-kent-beck` vs `kent-beck-3x-model`) so each language gets a readable URL.

The frontmatter field **`idx`** is *not* an identifier — it is a number used only for:

1. **Sort order** in blog listings. Higher `idx` renders first (`src/pages/<lang>/blog.astro` and `PostList.astro`).
2. **Translation linking.** Two posts in different languages with the same `idx` are treated as translations of one another.

### Translation linking

`getPostTranslations(idx, currentLang)` (in `src/i18n/utils.js`) collects all entries with a given `idx` and builds a `{ lang: url }` map from their slugs. `Layout.astro` passes this map to `LanguagePicker`, which links to the correct translated URL (falling back to a naive path swap if the map is missing).

### Scheduled publishing

`PostList.astro` hides posts whose `pubDateLogical` is in the future. This lets you commit and deploy a post in advance and have it appear automatically on the intended date — no rebuild required *relative to the post itself*, but a build on/after that date will include it.

## Theming / dark mode

- Tailwind 4 is imported in `src/styles/global.css` via `@import "tailwindcss"`.
- A custom dark variant is declared: `@variant dark (.dark &);`. Dark mode is class-based (`.dark` on `<html>`).
- `DarkModeToggle.astro` is a client-side inline script: it reads/writes `localStorage.theme`, toggles `.dark` on `document.documentElement`, and respects `prefers-color-scheme` on first load.
- There is no framework runtime (no React/Vue/Svelte); the toggle is plain DOM.

## Styling

- Layout-level utility classes live in the `.astro` components.
- Long-form post content is styled by a scoped global block in `PostLayout.astro` (`.post-content h1 { … }`, etc.) because Markdown output has no class hooks to apply Tailwind utilities to.
- Self-hosted Roboto is declared with `@font-face` in `src/styles/global.css` and set as `body { font-family: "Roboto", sans-serif; }`.

## Build and deploy

- `npm run build` invokes `astro build`, which:
  1. Syncs content and generates types.
  2. Renders all routes to `dist/`.
  3. Optimizes images via `astro:assets` (produces WebP variants).
- `.github/workflows/deploy.yml` runs on every push to `main`:
  1. `actions/checkout@v6` checks out the repo.
  2. `withastro/action@v6` installs dependencies and runs the build.
  3. `actions/deploy-pages@v5` publishes `dist/` to GitHub Pages.
