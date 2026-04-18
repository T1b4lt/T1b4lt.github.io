# Dependency Hygiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate manually-copied FontAwesome and Roboto assets to npm-managed packages, remove the Twitter social link, and update documentation.

**Architecture:** Two independent migrations (icons → `astro-icon`, fonts → `@fontsource/roboto`) that converge on the same Layout/config files. Each migration installs npm packages, updates component markup or CSS, then deletes the old `public/` assets. Documentation updates land last.

**Tech Stack:** Astro 6, Tailwind 4, `astro-icon` + Iconify JSON packs, `@fontsource/roboto`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `astro.config.mjs` | Modify | Register `icon()` integration |
| `src/components/Footer.astro` | Modify | Remove Twitter link, replace 2 icon elements with `<Icon>` |
| `src/components/PostList.astro` | Modify | Replace 1 icon element with `<Icon>` |
| `src/layouts/Layout.astro` | Modify | Remove 4 FontAwesome `<link>` tags |
| `src/styles/global.css` | Modify | Replace 4 `@font-face` blocks with 4 `@import` lines |
| `public/fontawesome/` | Delete | Entire directory |
| `public/fonts/` | Delete | Entire directory |
| `docs/3-design-decisions.md` | Modify | Update "Self-hosted fonts and icons" section |
| `docs/1-tech-stack.md` | Modify | Add new deps, update assets section |
| `docs/5-improvements.md` | Modify | Remove "Urgent" section (lines 5-144) |

---

### Task 1: Create branch and install dependencies

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Create feature branch**

```bash
git checkout -b feat/dependency-hygiene
```

- [ ] **Step 2: Install icon packages**

```bash
npm i astro-icon
npm i -D @iconify-json/fa6-brands @iconify-json/fa6-solid
```

- [ ] **Step 3: Install font package**

```bash
npm i @fontsource/roboto
```

- [ ] **Step 4: Register astro-icon integration in `astro.config.mjs`**

Replace the full file content with:

```js
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://t1b4lt.github.io",
  integrations: [icon()],
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

- [ ] **Step 5: Verify build still works**

```bash
npm run build
```

Expected: Build succeeds (icons not yet migrated, FontAwesome links still present).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json astro.config.mjs
git commit -m "feat: install astro-icon, fontsource, and iconify packages

Add astro-icon integration and npm-managed font/icon dependencies
to replace manually-copied assets in public/."
```

---

### Task 2: Migrate icons in Footer.astro and remove Twitter link

**Files:**
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: Replace `src/components/Footer.astro` with migrated version**

Replace the full file content with:

```astro
---
import { getLangFromUrl, useTranslations } from "../i18n/utils";
import { Icon } from "astro-icon/components";

const actualYear = new Date().getFullYear();

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
---

<footer>
  <div class="bg-zinc-700 py-10 px-4">
    <div class="flex justify-center">
      <div class="w-full lg:w-1/2 px-4">
        <h4 class="text-3xl font-bold text-slate-200">{t("footer.title")}</h4>
        <h5 class="text-lg text-gray-400 font-light">
          {t("footer.subtitle")}
        </h5>
        <div class="flex flex-row justify-between mt-6">
          <a
            href="https://www.github.com/T1b4lt"
            target="_blank"
            class="text-slate-200"
          >
            <Icon name="fa6-brands:github" aria-label="GitHub" />
          </a>
          <a
            href="https://www.linkedin.com/in/guillermo-segovia-fernandez/"
            target="_blank"
            class="text-slate-200"
          >
            <Icon name="fa6-brands:linkedin-in" aria-label="LinkedIn" />
          </a>
        </div>
      </div>
    </div>
    <hr class="my-6 border-slate-200" />
    <div class="text-center text-sm text-gray-400 font-bold my-1 mx-4">
      Guillermo Segovia 🚀 {actualYear}
    </div>
  </div>
</footer>
```

Changes from original:
- Added `import { Icon } from "astro-icon/components";`
- Removed the entire Twitter `<a>` block (lines 19-25 of original)
- Replaced `<i class="fa-brands fa-github">` with `<Icon name="fa6-brands:github" aria-label="GitHub" />`
- Replaced `<i class="fa-brands fa-linkedin-in">` with `<Icon name="fa6-brands:linkedin-in" aria-label="LinkedIn" />`

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat(footer): migrate icons to astro-icon and remove Twitter link

Replace FontAwesome <i> elements with inline SVG <Icon> components.
Remove the Twitter/X social link, keeping only GitHub and LinkedIn."
```

---

### Task 3: Migrate icon in PostList.astro

**Files:**
- Modify: `src/components/PostList.astro`

- [ ] **Step 1: Update `src/components/PostList.astro`**

Add the Icon import to the frontmatter (after the existing imports, line 2):

```astro
import { Icon } from "astro-icon/components";
```

Replace line 47:

```astro
<span class="fa-solid fa-angles-right mr-2" />
```

with:

```astro
<Icon name="fa6-solid:angles-right" class="inline mr-2" aria-hidden="true" />
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PostList.astro
git commit -m "feat(post-list): migrate angles-right icon to astro-icon

Replace FontAwesome <span> with inline SVG <Icon> component.
Mark as aria-hidden since it is purely decorative."
```

---

### Task 4: Remove FontAwesome from Layout.astro and delete old assets

**Files:**
- Modify: `src/layouts/Layout.astro`
- Delete: `public/fontawesome/` (entire directory)

- [ ] **Step 1: Remove the 4 FontAwesome `<link>` tags from `src/layouts/Layout.astro`**

Delete lines 57-60:

```html
    <link href="/fontawesome/css/fontawesome.min.css" rel="stylesheet" />
    <link href="/fontawesome/css/brands.min.css" rel="stylesheet" />
    <link href="/fontawesome/css/regular.min.css" rel="stylesheet" />
    <link href="/fontawesome/css/solid.min.css" rel="stylesheet" />
```

- [ ] **Step 2: Delete the `public/fontawesome/` directory**

```bash
rm -rf public/fontawesome/
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: Build succeeds. All icons now render as inline SVG from astro-icon.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Layout.astro
git rm -r public/fontawesome/
git commit -m "feat: remove FontAwesome CSS/webfonts from public/

Icons are now served as inline SVG via astro-icon.
Removes ~700 KB of CSS and webfont files."
```

---

### Task 5: Migrate fonts to @fontsource/roboto and delete old assets

**Files:**
- Modify: `src/styles/global.css`
- Delete: `public/fonts/` (entire directory)

- [ ] **Step 1: Replace `src/styles/global.css` with migrated version**

Replace the full file content with:

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

Changes from original:
- Removed the 4 `@font-face` blocks (lines 5-32)
- Added 4 `@import "@fontsource/roboto/*.css"` lines
- Kept `@variant dark` and `body` rule unchanged

- [ ] **Step 2: Delete the `public/fonts/` directory**

```bash
rm -rf public/fonts/
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: Build succeeds. Fonts now served as `.woff2` from Astro's asset pipeline.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git rm -r public/fonts/
git commit -m "feat: migrate Roboto fonts to @fontsource/roboto

Replace manual @font-face blocks pointing to .ttf files with
@fontsource/roboto imports that serve optimized .woff2 files.
Removes ~700 KB of .ttf files from public/."
```

---

### Task 6: Run migration verification

- [ ] **Step 1: Check no old references remain**

```bash
grep -rn "fa-\|fontawesome\|fonts/Roboto\|/fonts/" src/ public/
```

Expected: Zero results. If any hits appear, fix them before proceeding.

- [ ] **Step 2: Verify full build**

```bash
npm run build
```

Expected: Clean build, no warnings related to fonts or icons.

- [ ] **Step 3: Start dev server and visually verify**

```bash
npm run dev
```

Check in browser:
- Home page loads with Roboto font
- Blog listing shows `angles-right` icon before each post title
- Footer shows GitHub and LinkedIn icons (no Twitter)
- Dark mode toggle still works
- Both EN (`/`) and ES (`/es/`) routes render correctly

---

### Task 7: Update documentation

**Files:**
- Modify: `docs/3-design-decisions.md`
- Modify: `docs/1-tech-stack.md`
- Modify: `docs/5-improvements.md`

- [ ] **Step 1: Update `docs/3-design-decisions.md`**

Replace the "Self-hosted fonts and icons" section (lines 29-33):

```markdown
## Self-hosted fonts and icons

**Decision.** Roboto and FontAwesome are copied into `public/` rather than pulled from a CDN.

**Why.** Determinism (no network dependency at request time), privacy (no third-party hits from visitors), and offline-friendly dev.
```

with:

```markdown
## Self-hosted fonts and icons

**Decision.** Roboto is managed via `@fontsource/roboto` and icons via `astro-icon` with Iconify JSON packs (`@iconify-json/fa6-brands`, `@iconify-json/fa6-solid`). Assets are bundled into the build output — no CDN requests at runtime.

**Why.** Determinism (no network dependency at request time), privacy (no third-party hits from visitors), and offline-friendly dev. npm management adds versioning, automated updates, and smaller bundles (`.woff2` instead of `.ttf`, tree-shaken inline SVG instead of full CSS+webfont sets).

## Social links limited to GitHub and LinkedIn

**Decision.** The footer links to GitHub and LinkedIn only. The Twitter/X link was removed.

**Why.** The author no longer actively uses the platform.
```

- [ ] **Step 2: Update `docs/1-tech-stack.md`**

Replace the Runtime table (lines 4-9):

```markdown
| Dependency          | Version   | Role |
|---------------------|-----------|------|
| `astro`             | `^6.1.7`  | Static site generator, content collections, i18n routing, image pipeline. |
| `tailwindcss`       | `^4.2.2`  | Utility-first CSS framework. |
| `@tailwindcss/vite` | `^4.2.2`  | Official Vite plugin that wires Tailwind 4 into Astro's Vite build. |
```

with:

```markdown
| Dependency          | Version   | Role |
|---------------------|-----------|------|
| `astro`             | `^6.1.7`  | Static site generator, content collections, i18n routing, image pipeline. |
| `astro-icon`        | *         | Inline SVG icon component powered by Iconify. |
| `@fontsource/roboto`| *         | Self-hosted Roboto font files (`.woff2`) managed via npm. |
| `tailwindcss`       | `^4.2.2`  | Utility-first CSS framework. |
| `@tailwindcss/vite` | `^4.2.2`  | Official Vite plugin that wires Tailwind 4 into Astro's Vite build. |
| `@iconify-json/fa6-brands` | *      | FontAwesome 6 brand icons (GitHub, LinkedIn) for astro-icon. |
| `@iconify-json/fa6-solid`  | *      | FontAwesome 6 solid icons (angles-right) for astro-icon. |
```

Replace the "Assets (self-hosted)" section (lines 19-22):

```markdown
## Assets (self-hosted)

- **Roboto** — `public/fonts/Roboto-{Light,Regular,Medium,Bold}.ttf` loaded as `@font-face` in `src/styles/global.css`.
- **FontAwesome Free** — `public/fontawesome/` (CSS + webfonts) linked directly from `Layout.astro`.
- **Images** — `public/images/` (e.g. the 404 illustration).
```

with:

```markdown
## Assets (self-hosted)

- **Roboto** — served as `.woff2` via `@fontsource/roboto`, imported in `src/styles/global.css`. Weights: 300, 400, 500, 700.
- **Icons** — inline SVG via `astro-icon` + Iconify JSON packs. Only the icons actually used are bundled (GitHub, LinkedIn, angles-right).
- **Images** — `public/images/` (e.g. the 404 illustration).
```

- [ ] **Step 3: Remove the "Urgent" section from `docs/5-improvements.md`**

Delete lines 5-144 (from `## Urgent (dependency hygiene)` through the `---` separator and `#### Follow-up documentation` paragraph, up to but not including `## Critical (SEO / a11y)`).

The file should go from:

```markdown
# Improvements

Audit of the current codebase with concrete suggestions. The project is sound and the decisions in [`3-design-decisions.md`](./3-design-decisions.md) are respected in practice — the items below are refinements, not blockers.

## Urgent (dependency hygiene)
...
## Critical (SEO / a11y)
```

to:

```markdown
# Improvements

Audit of the current codebase with concrete suggestions. The project is sound and the decisions in [`3-design-decisions.md`](./3-design-decisions.md) are respected in practice — the items below are refinements, not blockers.

## Critical (SEO / a11y)
```

- [ ] **Step 4: Commit**

```bash
git add docs/3-design-decisions.md docs/1-tech-stack.md docs/5-improvements.md
git commit -m "docs: update documentation for dependency hygiene migration

Update design decisions and tech stack docs to reflect npm-managed
fonts and icons. Remove completed Urgent section from improvements.
Document removal of Twitter social link."
```

---

### Task 8: Final verification

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Clean build, zero warnings.

- [ ] **Step 2: Run legacy reference check**

```bash
grep -rn "fa-\|fontawesome\|fonts/Roboto\|/fonts/" src/ public/
```

Expected: Zero results.

- [ ] **Step 3: Check git status is clean**

```bash
git status
```

Expected: `nothing to commit, working tree clean`

- [ ] **Step 4: Review commit log**

```bash
git log --oneline feat/dependency-hygiene --not main
```

Expected: 6 commits in order:
1. `feat: install astro-icon, fontsource, and iconify packages`
2. `feat(footer): migrate icons to astro-icon and remove Twitter link`
3. `feat(post-list): migrate angles-right icon to astro-icon`
4. `feat: remove FontAwesome CSS/webfonts from public/`
5. `feat: migrate Roboto fonts to @fontsource/roboto`
6. `docs: update documentation for dependency hygiene migration`
