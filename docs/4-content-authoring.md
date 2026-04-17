# Content Authoring

How to add, translate, and schedule a blog post.

## 1. Create the Markdown files

The **filename is the slug** — it becomes the URL at `/<lang>/blog/<slug>`. Create both language versions:

```
src/content/blog/es/<spanish-slug>.md
src/content/blog/en/<english-slug>.md
```

The slugs can (and usually should) differ between languages. To link the two files as translations of one another, give them the same `idx` in the frontmatter (see below). Pick the next `idx` value as `highest existing idx + 1`.

## 2. Frontmatter

Every post must declare the fields defined in `src/content.config.ts`:

```yaml
---
idx: 3
title: "Título del post"
author: "Guillermo Segovia"
pubDate: "8 de abril de 2026"      # Free-form display string (localized)
pubDateLogical: "2026-04-08"       # Machine-comparable, used for scheduling
tags: ["astro", "blog"]
---
```

- `idx` — a number that (a) determines listing order (higher = shown first) and (b) must match across translations so `getPostTranslations` can link them. It does *not* appear in URLs.
- `pubDate` — shown in the post header; localize it to the target language.
- `pubDateLogical` — ISO date (`YYYY-MM-DD`). Posts with a `pubDateLogical` in the future are hidden from `PostList` until that date.

## 3. Body

Standard Markdown. Headings, lists, links, blockquotes, tables, and images all have dedicated styles in `src/layouts/PostLayout.astro` (`.post-content …`). `<mark>` is supported and renders with a highlight color.

For images, place the file under `public/images/` and reference it with `/images/…`. For images that should go through Astro's image optimizer, import them from `src/` in a page/component and pass them to `<Image>` from `astro:assets` (see `src/pages/404.astro` for an example).

## 4. Translations

Each post in `src/content/blog/es/` should have a counterpart in `src/content/blog/en/` with the same `idx`. The `LanguagePicker` in the header uses `getPostTranslations(idx, currentLang)` (in `src/i18n/utils.js`) to find the counterpart and link to it. If no translation exists, the picker falls back to a naive path swap — so *always* ship both languages.

## 5. Scheduling

To schedule a post for the future, set `pubDateLogical` to that future date (`YYYY-MM-DD`). The post stays hidden from listings until a build runs on or after that date.

Two implications:

- **Commit ahead of time.** You can merge a post weeks before it should appear.
- **A build must happen.** GitHub Actions only builds on push. If nothing else gets pushed around the publish date, trigger the workflow manually (`Actions` tab → `Deploy to GitHub Pages` → `Run workflow`) or add a scheduled `workflow_dispatch` trigger.

## 6. Verify locally

```bash
npm run dev     # check both /es/blog/<slug> and /en/blog/<slug>
npm run build   # catches schema errors and broken references
```

Schema violations (missing or mistyped frontmatter fields) fail the build with a precise error pointing at the offending file.
