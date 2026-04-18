# Overview

## What this project is

`T1b4lt.github.io` is the personal portfolio and blog of Guillermo Segovia, published at [t1b4lt.github.io](https://t1b4lt.github.io). It is a fully static site generated with Astro and deployed to GitHub Pages.

## Goals

- **Introduce the author.** A concise landing page with a short bio and areas of interest.
- **Host long-form writing.** A blog for technical notes, reflections, and professional updates.
- **Be bilingual.** Content is authored in Spanish (primary) and English, and each post links to its translation.
- **Stay low-maintenance.** No server, no database, no auth. Everything is a Markdown file in git.
- **Load fast and look good.** Static HTML, self-hosted fonts and icons, dark mode, responsive layout.

## Primary features

| Feature           | Where it lives                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Landing page      | `src/pages/{es,en}/index.astro`                                                                                  |
| Blog index        | `src/pages/{es,en}/blog.astro`                                                                                   |
| Blog post routes  | `src/pages/{es,en}/blog/[slug].astro`                                                                            |
| Post content      | `src/content/blog/{es,en}/*.md`                                                                                  |
| i18n routing      | `astro.config.mjs` (`i18n`) + `src/i18n/`                                                                        |
| Translation links | `getPostTranslations()` in `src/i18n/utils.ts`                                                                   |
| Dark mode         | `src/components/DarkModeToggle.astro` + `@variant dark (.dark &)` in `src/styles/global.css`                     |
| SEO metadata      | `canonical`, `hreflang`, Open Graph, Twitter Card in `Layout.astro`; `BlogPosting` JSON-LD in `PostLayout.astro` |
| Sitemap / robots  | `@astrojs/sitemap` + `public/robots.txt`                                                                         |
| 404 page          | `src/pages/404.astro`                                                                                            |
| Scheduled posts   | `pubDateLogical` field, filtered via `filterFuturePosts()` in `src/i18n/utils.ts`                                |

## Non-goals

- No CMS. Posts are plain Markdown committed to git.
- No comments, analytics, or tracking.
- No server-side rendering; the whole site is prerendered at build time (`output: "static"`).
