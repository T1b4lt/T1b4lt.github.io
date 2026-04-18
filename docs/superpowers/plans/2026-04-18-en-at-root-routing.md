# EN-at-Root Routing + Client-Side Language Detection — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the root-redirect flash on GitHub Pages by serving English at `/` and redirecting Spanish browsers to `/es/` client-side before the first paint.

**Architecture:** Flip Astro's i18n config so English becomes the default locale without a URL prefix (`prefixDefaultLocale: false`, `defaultLocale: "en"`). Move the current `src/pages/en/*` tree up to `src/pages/*`. Keep `src/pages/es/*` untouched. Add an inline `<script>` inside `Layout.astro`'s `<head>` that inspects `localStorage.lang` and `navigator.languages` to redirect before paint only from `/` and only when no explicit user preference is stored. Update `LanguagePicker` to persist the user's choice and to build hrefs correctly for the new unprefixed EN URLs. No SEO tags (hreflang, sitemap, robots) are in scope for this branch — they are tracked as the separate "Critical (SEO / a11y)" section and will land in a follow-up PR.

**Tech Stack:** Astro 6, Tailwind 4 (vite plugin), vanilla inline `<script>` for client-side redirect. No test framework in the repo; verification is `npm run build` + browser checks.

**Spec:** `docs/5-improvements.md` section "Critical: Eliminate the root redirect flash — EN-at-root with client-side language detection" (lines 7–174). This plan implements that section verbatim.

**Out of scope (do NOT touch):**

- `hreflang` / `canonical` / `x-default` tags in `Layout.astro` (item #2 in improvements doc)
- `@astrojs/sitemap` and `robots.txt` (item #3)
- Follow-up documentation updates to `docs/3-design-decisions.md` (spec lines 168–173)

---

## File Structure

**Modified:**

- `astro.config.mjs` — flip i18n config + add `site`
- `src/i18n/ui.js` — change `defaultLang` from `"es"` to `"en"`
- `src/i18n/utils.js` — `getPostTranslations` drops EN prefix
- `src/components/LanguagePicker.astro` — handle unprefixed EN + persist choice to `localStorage`
- `src/layouts/Layout.astro` — add inline language-detection script in `<head>`

**Created:**

- `src/pages/blog.astro` — EN blog index (was `src/pages/en/blog.astro`)
- `src/pages/blog/[slug].astro` — EN blog post (was `src/pages/en/blog/[slug].astro`)

**Overwritten:**

- `src/pages/index.astro` — EN home content (was a placeholder comment)

**Deleted:**

- `src/pages/en/index.astro`
- `src/pages/en/blog.astro`
- `src/pages/en/blog/[slug].astro`
- `src/pages/en/blog/` (directory)
- `src/pages/en/` (directory)

---

## Task 1: Flip i18n routing — EN at `/`, ES at `/es/`

This task is atomic: config, page relocation, helpers and picker all land in a single commit because any intermediate state leaves the site broken (cross-language navigation depends on every piece).

**Files:**

- Modify: `astro.config.mjs`
- Modify: `src/i18n/ui.js:6`
- Overwrite: `src/pages/index.astro`
- Create: `src/pages/blog.astro`
- Create: `src/pages/blog/[slug].astro`
- Delete: `src/pages/en/index.astro`, `src/pages/en/blog.astro`, `src/pages/en/blog/[slug].astro`, `src/pages/en/` (and its `blog/` subdir)
- Modify: `src/i18n/utils.js:44`
- Modify: `src/components/LanguagePicker.astro:12-22`

### Step 1.1: Update `astro.config.mjs`

- [ ] Replace the file contents with:

```js
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://t1b4lt.github.io",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
```

What changed vs. current: `defaultLocale` is now `"en"`, `prefixDefaultLocale` flipped to `false`, `redirectToDefaultLocale` flipped to `false`, and `site` added (required for future sitemap/hreflang; harmless now).

### Step 1.2: Update `src/i18n/ui.js`

- [ ] Change line 6 from:

```js
export const defaultLang = "es";
```

to:

```js
export const defaultLang = "en";
```

Leave the rest of the file (the `languages` map and the `ui` translation dictionaries) untouched.

Why: `getLangFromUrl` in `utils.js` falls back to `defaultLang` when no language prefix is present in the path. With EN served at `/`, the unprefixed case must resolve to `"en"`, not `"es"`.

### Step 1.3: Overwrite `src/pages/index.astro` with the English home

- [ ] Replace the current placeholder contents with the English home (moved from `src/pages/en/index.astro`). Only the `Layout` import path changes — it now has one fewer `../` level:

```astro
---
import Layout from "../layouts/Layout.astro";
---

<Layout title="T1b4lt | Home">
  <div class="flex justify-center p-10">
    <div class="w-full lg:w-1/2 space-y-5 text-lg">
      <hr class="border-zinc-900 dark:border-slate-200" />
      <h1 class="text-3xl font-bold">
        Guillermo: Innovation, Technology and Constant Growth
      </h1>
      <hr class="my-6 border-zinc-900 dark:border-slate-200" />
      <p>
        Welcome to my blog, Guillermo's blog! I'm Guillermo, a passionate IT
        professional with a background in innovation and digital development.
        Let me introduce you to my story and interests.
      </p>
      <h2 class="text-3xl font-bold">About me</h2>
      <p>
        Currently working in the CDO innovation area at Telefónica, in a
        position that allows me to participate in the rapid prototyping of
        digital products. My team is specialized in applying emerging
        technologies to improve existing products and develop new ones. My job
        is to carry out the rapid prototyping of digital products, applying
        these emerging technologies to:
        <ul class="space-y-4 ml-4">
          <li>1. improve existing solutions,</li>
          <li>2. create new experiences for our users and</li>
          <li>3. undo the uncertainty surrounding these new technologies.</li>
        </ul>
      </p>
      <h2 class="text-3xl font-bold">My areas of interest</h2>
      <p>
        As a professional, my curiosity and passion lead me to explore diverse
        areas:
        <ul class="space-y-4 ml-4">
          <li>
            <b>• Machine Learning:</b> I am fascinated by the potential of machine
            learning techniques to transform the way we interact with technology.
            From traditional classification algorithms and neural networks to new
            Generative AI trends, which are giving us so many opportunities. I am
            always looking to learn more and apply this knowledge in innovative projects.
          </li>
          <li>
            <b>• Software and Application Development:</b> Programming was my gateway
            to the world of technology. I love building solutions from scratch, whether
            it's developing web, mobile, backend systems or all at once for a single
            solution. Creativity, problem solving and creating tangible solutions
            are my driving force.
          </li>
          <li>
            <b>• Data Analysis:</b> Data is the new oil, and I am a passionate geologist.
            Exploring data sets, extracting insights and making evidence-based decisions
            is something I am passionate about. From SQL to visualization tools, I
            am always honing my analytical skills.
          </li>
        </ul>
      </p>
      <h2 class="text-3xl font-bold">My professional goals</h2>
      <p>
        My professional path is focused on continuous growth. I aspire to:
        <ul class="space-y-4 ml-4">
          <li>
            <b>• Keep Learning:</b> Never stop learning. I feel, <i>and hope</i
            >, that this curiosity that technology and innovation arouses in me
            will not cease. Courses, conferences, books... any source of
            knowledge is welcome.
          </li>
          <li>
            <b>• Contribute to the Community:</b> Share what I know and learn from
            others. Collaboration in the technological field is key to achieving unimaginable
            goals. I really believe in the power and philosophy of Open Source
          </li>
          <li>
            <b>• Innovate:</b> Always look for new ways to solve problems and create
            disruptive solutions. Keeping up to date with what is happening in this
            world and fitting the pieces together in ways that have not been done
            before.
          </li>
          <li>
            <b>• Create:</b> Build tangible solutions that have a positive impact.
            From mobile applications to artificial intelligence systems, I am always
            looking to create solutions that reach people.
          </li>
        </ul>
      </p>
      <h2 class="text-3xl font-bold">Visit my blog</h2>
      <p>
        In this blog, I will share my experiences, knowledge and opinions on
        topics related to technology, innovation and professional growth. I hope
        you enjoy reading it!
      </p>
      <p>See you soon!</p>
    </div>
  </div></Layout
>
```

### Step 1.4: Create `src/pages/blog.astro`

- [ ] Create the file with this content. Two changes vs. `src/pages/en/blog.astro`: import paths drop one `../` level, and the post `url` drops the `/en` prefix.

```astro
---
import Layout from "../layouts/Layout.astro";
import PostList from "../components/PostList.astro";
import { getCollection } from "astro:content";

const posts = await getCollection("blog", ({ id }) => {
  return id.startsWith("en/");
});

// Ordenar por idx
const sortedPosts = posts.sort((a, b) => b.data.idx - a.data.idx);

// Convertir al formato esperado por PostList
const formattedPosts = sortedPosts.map((entry) => {
  const slug = entry.id.replace("en/", "");
  return {
    url: `/blog/${slug}`,
    frontmatter: entry.data,
  };
});
---

<Layout title="T1b4lt | Blog">
  <PostList posts={formattedPosts} />
</Layout>
```

### Step 1.5: Create `src/pages/blog/[slug].astro`

- [ ] Create the directory if needed and the file with this content. Only change vs. `src/pages/en/blog/[slug].astro`: import paths drop one `../` level.

```astro
---
import { getCollection, render } from "astro:content";
import PostLayout from "../../layouts/PostLayout.astro";
import { getPostTranslations } from "../../i18n/utils";

export async function getStaticPaths() {
  const blogEntries = await getCollection("blog", ({ id }) => {
    return id.startsWith("en/");
  });

  return blogEntries.map((entry) => {
    const slug = entry.id.replace("en/", "");
    return {
      params: { slug },
      props: { entry },
    };
  });
}

const { entry } = Astro.props;
const { Content } = await render(entry);

const translations = await getPostTranslations(entry.data.idx, "en");
---

<PostLayout frontmatter={entry.data} translations={translations}>
  <Content />
</PostLayout>
```

### Step 1.6: Delete the `src/pages/en/` tree

- [ ] Remove all three files and the two directories:

```bash
rm src/pages/en/blog/\[slug\].astro
rm src/pages/en/blog.astro
rm src/pages/en/index.astro
rmdir src/pages/en/blog
rmdir src/pages/en
```

Expected: `ls src/pages` shows `404.astro  blog  blog.astro  es  index.astro` (no `en` directory).

### Step 1.7: Update `src/i18n/utils.js` — drop EN prefix in `getPostTranslations`

- [ ] Change line 44 from:

```js
translations[lang] = `/${lang}/blog/${slug}`;
```

to:

```js
translations[lang] = lang === "en" ? `/blog/${slug}` : `/${lang}/blog/${slug}`;
```

That is the only line that changes in this file. `getLangFromUrl` already handles the unprefixed case correctly once `defaultLang` is `"en"` (Step 1.2). Leave the rest of the file alone.

### Step 1.8: Update `src/components/LanguagePicker.astro`

- [ ] Replace the `changeLangFromUrl` function (lines 12–22) with the new implementation and add `data-lang` + `onclick` to the anchor so the picker persists the user's choice. Full new file contents:

```astro
---
import { languages } from "../i18n/ui";
import { getLangFromUrl } from "../i18n/utils";

interface Props {
  translations?: Record<string, string>;
}

const { translations } = Astro.props;
const currentLang = getLangFromUrl(Astro.url);

function changeLangFromUrl(actualUrl: URL, lang: string) {
  // Si hay traducciones disponibles, usar la URL de traducción
  if (translations && translations[lang]) {
    return translations[lang];
  }

  const path = actualUrl.pathname;
  const stripped = path.startsWith("/es/")
    ? path.slice(3)
    : path === "/es"
      ? "/"
      : path;

  return lang === "en" ? stripped : `/es${stripped === "/" ? "/" : stripped}`;
}
---

<ul class="flex space-x-4">
  {
    Object.entries(languages).map(([lang, label]) => (
      <li>
        <a
          href={changeLangFromUrl(Astro.url, lang)}
          data-lang={lang}
          onclick="localStorage.setItem('lang', this.dataset.lang)"
          class={`px-3 py-2 rounded-md text-sm font-medium hover:text-slate-200 hover:bg-zinc-900 dark:hover:text-zinc-900 dark:hover:bg-slate-200 ${
            lang === currentLang
              ? "text-slate-200 bg-zinc-900 dark:text-zinc-900 dark:bg-slate-200"
              : ""
          }`}
        >
          {label}
        </a>
      </li>
    ))
  }
</ul>
```

What changed:

- `changeLangFromUrl` no longer assumes every URL starts with `/<lang>/`. It strips the `/es` prefix when present and, when going back to Spanish, prepends `/es`.
- Anchor now has `data-lang={lang}` and `onclick="localStorage.setItem('lang', this.dataset.lang)"` so clicking the picker persists the user's choice for future visits.

### Step 1.9: Verify the build

- [ ] Run:

```bash
npm run build
```

Expected: build succeeds with no errors. Verify `dist/` contains both `dist/index.html` (English home) and `dist/es/index.html` (Spanish home), and that `dist/blog/` and `dist/es/blog/` both exist with the same number of `[slug]/index.html` files.

```bash
ls dist/index.html dist/es/index.html
ls dist/blog/
ls dist/es/blog/
```

Expected: neither command errors; blog directory listings have the same entries.

### Step 1.10: Verify in the dev server

- [ ] Run `npm run dev` and open the site. Confirm manually:
  - `/` renders the English home (no redirect, no flash).
  - `/es/` renders the Spanish home.
  - `/blog` renders the English blog index; each link points to `/blog/<slug>` (no `/en/` prefix).
  - `/es/blog` renders the Spanish blog index; each link points to `/es/blog/<slug>`.
  - Clicking the language picker on `/` → navigates to `/es/`.
  - Clicking the language picker on `/es/blog/<some-slug>` → navigates to `/blog/<same-slug>` (uses the `translations` prop).
  - Clicking the language picker on `/blog` → navigates to `/es/blog`.

Stop the dev server once confirmed.

### Step 1.11: Commit

- [ ] Stage and commit:

```bash
git add astro.config.mjs src/i18n/ui.js src/i18n/utils.js src/pages/index.astro src/pages/blog.astro src/pages/blog/ src/components/LanguagePicker.astro
git add -u src/pages/en  # stage deletions
git status   # confirm no src/pages/en/ entries remain
git commit -m "$(cat <<'EOF'
feat(i18n): serve English at / and Spanish at /es/

Flip Astro's i18n config so English is the unprefixed default locale and
Spanish lives under /es/. Relocate the EN page tree from src/pages/en/ to
src/pages/ (home, blog index, blog post template). Update getPostTranslations
to drop the /en prefix for English links, and fix LanguagePicker's URL
rewriter so it handles the unprefixed EN case both directions. The picker
also now persists the user's language choice to localStorage; the next task
reads that preference to redirect client-side before paint.

This change alone removes the server-generated meta-refresh at / that caused
a visible white-flash on GitHub Pages.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: commit created.

---

## Task 2: Client-side language detection script

Adds a redirect-before-paint for Spanish browsers landing on `/` and for users with an explicit preference stored from a previous visit. Independent of Task 1 — the site works correctly without this script; this only makes the language choice auto-apply.

**Files:**

- Modify: `src/layouts/Layout.astro`

### Step 2.1: Add the inline script to `Layout.astro`

- [ ] Insert a `<script is:inline>` block inside `<head>`, immediately after `<meta charset="UTF-8" />` (as early as possible so the redirect happens before paint). Full new `<head>` section for `src/layouts/Layout.astro`:

```astro
<head>
  <meta charset="UTF-8" />
  <script is:inline>
    (function () {
      try {
        const path = location.pathname;
        const isSpanishPath = path === "/es" || path.startsWith("/es/");
        const stored = localStorage.getItem("lang");

        // Explicit user preference always wins — it can even undo the auto-detect.
        if (stored === "es" && !isSpanishPath) {
          location.replace("/es" + (path === "/" ? "/" : path));
          return;
        }
        if (stored === "en" && isSpanishPath) {
          location.replace(path.replace(/^\/es/, "") || "/");
          return;
        }

        // Auto-detection only on the root path. Deep links never bounce.
        if (stored === null && path === "/") {
          const langs =
            navigator.languages && navigator.languages.length
              ? navigator.languages
              : [navigator.language];
          const prefersSpanish = langs.some((l) =>
            (l || "").toLowerCase().startsWith("es"),
          );
          if (prefersSpanish) location.replace("/es/");
        }
      } catch (_) {
        // localStorage unavailable (private mode, SSR, etc.) → serve whatever the URL says.
      }
    })();
  </script>
  <meta name="description" content="T1b4lt's blog" />
  <meta name="viewport" content="width=device-width" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta name="generator" content={Astro.generator} />
  <link href="/fontawesome/css/fontawesome.min.css" rel="stylesheet" />
  <link href="/fontawesome/css/brands.min.css" rel="stylesheet" />
  <link href="/fontawesome/css/regular.min.css" rel="stylesheet" />
  <link href="/fontawesome/css/solid.min.css" rel="stylesheet" />
  <title>{title}</title>
</head>
```

Leave the rest of the file (imports, the outer `<html>` tag, `<body>` contents) exactly as it is.

### Step 2.2: Verify the build

- [ ] Run:

```bash
npm run build
```

Expected: success. Then confirm the script appears in the rendered HTML:

```bash
grep -c "navigator.languages" dist/index.html dist/es/index.html
```

Expected: both files print `1`.

### Step 2.3: Verify in the dev server (multiple browser scenarios)

- [ ] Run `npm run dev` and walk through each scenario. Use the browser devtools console to set/clear `localStorage` between runs (`localStorage.clear()` and `localStorage.setItem('lang', 'es')`).

  Run every check from the spec's edge-case list:
  - [ ] **EN browser, empty localStorage, visit `/`** → renders English home instantly. No redirect.
  - [ ] **ES browser, empty localStorage, visit `/`** → redirects to `/es/` before paint. No visible flash of the English page.
  - [ ] **ES browser, empty localStorage, visit `/blog/<slug>`** → does **not** bounce. English post renders. (Deep links never auto-redirect.)
  - [ ] **Click ES in the picker on `/`, then revisit `/`** → lands on `/es/` even from an EN browser (explicit preference wins).
  - [ ] **Click EN in the picker while on `/es/foo`, then revisit `/foo`** → stays on `/foo` (no redirect back to `/es/foo`).
  - [ ] **Disable localStorage (private browsing or devtools → Application → Storage → block)** → the script silently no-ops. EN is served. No JS error in console.
  - [ ] **Auto-redirect `/` → `/es/` on an ES browser, then press the browser Back button** → goes back to the originating site (or prior history entry). Does **not** loop between `/` and `/es/`. (`location.replace` keeps the redirect out of history.)
  - [ ] **`npm run build` produces both `/index.html` and `/es/index.html`** (already checked in 2.2 but confirm again).

  Stop the dev server once confirmed.

### Step 2.4: Commit

- [ ] Stage and commit:

```bash
git add src/layouts/Layout.astro
git commit -m "$(cat <<'EOF'
feat(i18n): redirect before paint based on localStorage and navigator.language

Add an inline script in Layout.astro that runs before any rendered content.
It inspects localStorage.lang (set by the language picker) and, falling back
to navigator.languages, redirects the browser with location.replace so the
redirect stays out of history. Auto-detection only fires on / — deep links
never bounce — and an explicit stored preference always beats navigator.

This completes the elimination of the root-redirect flash: Spanish browsers
now land directly on /es/ without painting the English page first, and the
language picker's choice is honored on subsequent visits.
EOF
)"
```

Expected: commit created. `git log --oneline` shows two new commits on top of `main`.

---

## Task 3: Final verification sweep

No commit. Just confirm the whole feature behaves as specified by walking the spec's acceptance-criteria list once more end to end.

- [ ] Run `npm run build` one last time. It must succeed with no warnings related to i18n or routing.
- [ ] Inspect `dist/`:
  - `dist/index.html` contains "Guillermo: Innovation, Technology and Constant Growth" (English home).
  - `dist/es/index.html` contains the Spanish home headline.
  - `dist/blog/index.html` exists. Each `<a>` inside points to `/blog/<slug>` (not `/en/blog/<slug>`).
  - `dist/es/blog/index.html` exists. Each `<a>` points to `/es/blog/<slug>`.
  - `dist/en/` does **not** exist.
- [ ] Grep the build output for any leftover `/en/` references (there should be none in generated HTML hrefs, though `/en/` may appear inside blog post CONTENT that a user wrote — that is out of scope):

```bash
grep -RIn 'href="/en' dist/ || echo "OK: no /en hrefs in generated pages"
```

Expected: prints `OK: no /en hrefs in generated pages`.

- [ ] Start `npm run dev` and manually re-run each edge case from Task 2, Step 2.3. All must pass.
- [ ] Confirm there are no console errors on any page.

If any check fails, stop and fix before handing off. Do not claim completion based on "it built" alone — the spec explicitly lists browser-verifiable behaviors and the verification-before-completion skill requires evidence from the actual runtime, not just type/build checks.

---

## Done criteria

- Two commits on `feat/en-at-root-routing`: (1) routing reshape, (2) client-side detection script.
- `npm run build` succeeds.
- Every edge case in Task 2 Step 2.3 and Task 3 passes in a real browser.
- `src/pages/en/` is gone.
- No changes to SEO tags, sitemap, or `robots.txt` — those stay for a follow-up PR.
