# Improvements

Audit of the current codebase with concrete suggestions. The project is sound and the decisions in [`3-design-decisions.md`](./3-design-decisions.md) are respected in practice — the items below are refinements, not blockers.

## Urgent (dependency hygiene)

### Migrate icons and fonts from hand-copied files in `public/` to npm-managed packages

FontAwesome (`public/fontawesome/`) and Roboto (`public/fonts/`) currently live in the repo as manually copied assets. The **self-hosting principle documented in [`3-design-decisions.md`](./3-design-decisions.md) is correct and should be preserved** — what changes is *how* the files get there. Moving to npm gives versioning, automated updates, licensing metadata, smaller bundles, and no third-party CDN hits at request time.

---

#### Icons — adopt [`astro-icon`](https://github.com/natemoo-re/astro-icon)

**Do not adopt `react-icons`.** This project has no React; pulling in a framework for icons is overkill and contradicts the rest of the stack.

**Current usage — only 4 icons in the entire codebase:**

| File | Icon class |
|------|-----------|
| `src/components/Footer.astro:24` | `fa-brands fa-twitter` |
| `src/components/Footer.astro:31` | `fa-brands fa-github` |
| `src/components/Footer.astro:38` | `fa-brands fa-linkedin-in` |
| `src/components/PostList.astro:47` | `fa-solid fa-angles-right` |

Today the site ships **four full CSS files** (`fontawesome.min.css`, `brands.min.css`, `regular.min.css`, `solid.min.css`) and the accompanying webfonts to render those four glyphs. None of it is tree-shaken.

**Migration steps.**

1. Install packages — the specific Iconify JSON packs keep the bundle tiny because only imported icons are inlined:

    ```bash
    npm i astro-icon
    npm i -D @iconify-json/fa6-brands @iconify-json/fa6-solid
    ```

2. Register the integration in `astro.config.mjs`:

    ```js
    import icon from "astro-icon";

    export default defineConfig({
      integrations: [icon()],
      // ...
    });
    ```

3. Replace each `<i class="fa-*">` with an `<Icon>` component. Iconify names follow `{pack}:{icon}`:

    ```astro
    ---
    import { Icon } from "astro-icon/components";
    ---
    <!-- Before -->
    <i class="fa-brands fa-twitter"></i>

    <!-- After -->
    <Icon name="fa6-brands:twitter" aria-label="Twitter" />
    ```

    Mapping for the four existing icons:
    - `fa-brands fa-twitter` → `fa6-brands:twitter` (or `fa6-brands:x-twitter` for the newer logo)
    - `fa-brands fa-github` → `fa6-brands:github`
    - `fa-brands fa-linkedin-in` → `fa6-brands:linkedin-in`
    - `fa-solid fa-angles-right` → `fa6-solid:angles-right`

4. Remove the four FontAwesome `<link>` tags from `src/layouts/Layout.astro:24-27`.

5. Delete the `public/fontawesome/` directory entirely.

**A11y bonus.** Icon fonts are read as garbage characters by some screen readers. Inline SVG via `<Icon>` lets you set `aria-label` on icons that carry meaning (social links) and `aria-hidden="true"` on purely decorative ones (the `angles-right` in `PostList`).

---

#### Fonts — adopt [`@fontsource/roboto`](https://fontsource.org/)

**Current usage — 4 weights of Roboto:**

| Weight | File in `public/fonts/` | Referenced from |
|--------|------------------------|-----------------|
| 300 (Light) | `Roboto-Light.ttf` | `src/styles/global.css:6-11` |
| 400 (Regular) | `Roboto-Regular.ttf` | `src/styles/global.css:13-18` |
| 500 (Medium) | `Roboto-Medium.ttf` | `src/styles/global.css:20-25` |
| 700 (Bold) | `Roboto-Bold.ttf` | `src/styles/global.css:27-32` |

Files are `.ttf`, not `.woff2` — so they are already larger than they need to be.

**Migration steps.**

1. Install:

    ```bash
    npm i @fontsource/roboto
    ```

2. Replace the four `@font-face` blocks in `src/styles/global.css:5-32` with four per-weight imports. `@fontsource` ships `.woff2` (smaller, modern) and `font-display: swap` is already set:

    ```css
    @import "tailwindcss";

    @import "@fontsource/roboto/300.css";
    @import "@fontsource/roboto/400.css";
    @import "@fontsource/roboto/500.css";
    @import "@fontsource/roboto/700.css";

    @variant dark (.dark &);

    body {
      font-family: "Roboto", sans-serif;
    }
    ```

3. Delete the `public/fonts/` directory entirely.

**Confirm.** After build, inspect `dist/` and verify there are no requests to `/fonts/` paths and that `.woff2` files are fingerprinted and served from Astro's asset pipeline.

---

#### File cleanup summary after both migrations

- **Deleted** `public/fontawesome/` (entire tree, ~700 KB of CSS and webfonts)
- **Deleted** `public/fonts/` (four `.ttf` files, ~700 KB)
- **Modified** `src/layouts/Layout.astro` (remove 4 `<link>` lines)
- **Modified** `src/styles/global.css` (replace 4 `@font-face` blocks with 4 `@import` lines)
- **Modified** `src/components/Footer.astro` (3 icon swaps)
- **Modified** `src/components/PostList.astro` (1 icon swap)
- **Modified** `astro.config.mjs` (register `icon()` integration)
- **Added** `package.json` dependencies: `astro-icon`, `@fontsource/roboto`, `@iconify-json/fa6-brands`, `@iconify-json/fa6-solid`

**Verification command after migration:**

```bash
grep -rn "fa-\|fontawesome\|fonts/Roboto\|/fonts/" src/ public/
```

Should return zero hits.

---

#### Follow-up documentation

Update `docs/3-design-decisions.md` under *Self-hosted fonts and icons*: replace "copied into `public/`" with "self-hosted, managed via npm (`@fontsource/roboto`, `astro-icon` + Iconify JSON packs)". The rationale (determinism, privacy, offline) is unchanged.

Also update `docs/1-tech-stack.md` to list the new dependencies.

## Critical (SEO / a11y)

*Now that EN is served at `/` and ES at `/es/`, these tags and the sitemap can reflect the final URL shape.*

### Missing `canonical` and `hreflang`

`src/layouts/Layout.astro` does not emit a `<link rel="canonical">` or `<link rel="alternate" hreflang="…">`. Without these, search engines may index the ES and EN versions as duplicates.

Suggested addition to `Layout.astro` (assuming the EN-at-root routing change above has landed, so EN lives at `/` and ES at `/es/`):

```astro
<link rel="canonical" href={new URL(Astro.url.pathname, Astro.site)} />
<link rel="alternate" hreflang="en" href={new URL(enPath, Astro.site)} />
<link rel="alternate" hreflang="es" href={new URL(esPath, Astro.site)} />
<link rel="alternate" hreflang="x-default" href={new URL(enPath, Astro.site)} />
```

`enPath` and `esPath` are the sibling URLs of the current page — for a post, these come from `getPostTranslations(idx)`; for the home/blog index, they are `"/"` / `"/es/"` and `"/blog"` / `"/es/blog"` respectively. Accept them as `Layout.astro` props so every page can pass its own pair.

### No Open Graph / Twitter Card metadata

Neither `Layout.astro` nor `PostLayout.astro` emit `og:*` or `twitter:*` tags. Link previews on social platforms fall back to the bare title. Posts should also expose a `BlogPosting` JSON-LD block.

### Generic meta description

`Layout.astro` hard-codes `<meta name="description" content="T1b4lt's blog">` for every page. Accept a `description` prop and, for posts, derive it from the first paragraph or an explicit frontmatter field.

### Placeholder alt text

`src/pages/404.astro:14` uses `alt="descriptive text"`. Replace with a real description (e.g. `alt="Lost astronaut illustration"`).

### Missing ARIA hints on interactive elements

- `src/components/NavBar.astro` — active links have no `aria-current="page"`.
- `src/components/DarkModeToggle.astro` — the toggle is a `<button>` with no `aria-label` or `title`, so screen readers announce nothing.

## Medium (code quality)

### Duplicated sorting logic

`posts.sort((a, b) => b.data.idx - a.data.idx)` appears in `src/components/PostList.astro`, `src/pages/es/blog.astro` and `src/pages/blog.astro`. Extract into `src/i18n/utils.ts` (or a new `src/lib/posts.ts`) alongside a `filterFuturePosts(posts)` helper that uses `pubDateLogical`.

### Post-body CSS hard-coded in `PostLayout.astro`

The `<style is:global>` block (~125 lines) repeats hex values (`#3E78B2`, etc.) and is not reusable. Two options, in order of effort:

1. Extract the block into `src/styles/post.css` and `@import` it from the layout.
2. Lift the repeated colors into a Tailwind v4 `@theme` block in `global.css`, then reference them as CSS custom properties (`color: var(--color-primary)`).

### `Props` not typed in components

`src/components/PostList.astro:7` declares `interface Props { posts; }`. `posts` is implicitly `any`, so TypeScript cannot catch a missing `frontmatter.idx` or `url`. Define a `Post` type and use it.

### Duplicated `[slug].astro` pages

`src/pages/es/blog/[slug].astro` and `src/pages/blog/[slug].astro` are nearly identical except for the language filter. A `getBlogEntriesByLang(lang)` helper in `utils.ts` would collapse the duplication.

### Tailwind v4 `@theme` unused

`global.css` pulls in Tailwind but defines no `@theme`. Centralizing the brand palette there would remove the hex literals scattered across `NavBar.astro` (`bg-[#3E78B2]`) and `PostLayout.astro`.

## Minor / nice-to-have

### No `robots.txt` or `sitemap.xml`

Neither exists. `@astrojs/sitemap` generates the sitemap automatically, and a two-line `public/robots.txt` pointing to it is enough for search engine discovery.

### Zod schema is permissive

`src/content.config.ts` does not enforce:

- `idx` uniqueness per language (duplicate idx silently breaks translation pairing)
- `pubDateLogical` as ISO `YYYY-MM-DD` (a `.regex(/^\d{4}-\d{2}-\d{2}$/)` would catch typos at build time)

### Markdown images not optimized

Posts embed remote images with plain markdown syntax — no `loading="lazy"`, no width hints, no Astro Assets pipeline. For posts that ship their own images, prefer local assets under `src/content/blog/.../` and the `<Image />` component.

### Emoji in the footer

`src/components/Footer.astro` ships 🚀 as the separator. Rendering varies across OS / font stacks. A small inline SVG (or nothing) is more predictable.

## Suggested priority order

| # | Change | Effort | Impact |
|---|--------|--------|--------|
| 1 | `canonical` + `hreflang` + `x-default` in `Layout.astro` | ~30 min | SEO (high) |
| 2 | `robots.txt` + `@astrojs/sitemap` | ~15 min | SEO (medium) |
| 3 | Migrate icons to `astro-icon` and fonts to `@fontsource/roboto` | ~1 h | Bundle / a11y / dep hygiene (high) |
| 4 | Open Graph + Twitter Card + `BlogPosting` JSON-LD in `PostLayout.astro` | ~30 min | Social / SEO (high) |
| 5 | Extract post CSS and lift colors into `@theme` | ~45 min | Maintainability (medium) |
| 6 | Shared `utils.ts` (sort, filter, per-language collection) + typed `Props` | ~30 min | Code quality (medium) |

Items 1 and 2 should land together — they both touch SEO metadata and should reflect the same URL shape. Items 3–6 are independent and can ship in any order.
