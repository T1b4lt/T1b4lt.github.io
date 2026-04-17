# T1b4lt.github.io

Personal portfolio and blog for Guillermo Segovia, built with [Astro](https://astro.build/) and [Tailwind CSS](https://tailwindcss.com/), deployed to GitHub Pages at [t1b4lt.github.io](https://t1b4lt.github.io).

The site is a static, content-driven blog with a landing page, bilingual content (Spanish and English), dark mode, and a typed Markdown content collection for posts.

## Tech Stack

- **Astro 6** — static site generator, content collections, built-in i18n routing.
- **Tailwind CSS 4** — utility-first styling via the Vite plugin (`@tailwindcss/vite`).
- **TypeScript** — used in content schema and component props.
- **GitHub Actions + GitHub Pages** — automated build and deploy on push to `main`.

## Setup

### Prerequisites

- Node.js `>= 22` (Astro 6 requirement).
- npm (ships with Node).

### Install and run locally

```bash
npm install          # install dependencies
npm run dev          # start the dev server at http://localhost:4321
npm run build        # produce a production build in ./dist
npm run preview      # serve the production build locally
```

### Deploy

Deployment is fully automated. On every push to `main`, the workflow at `.github/workflows/deploy.yml` builds the site with `withastro/action@v2` and publishes the `dist/` output to GitHub Pages.

## Project Structure

```
.
├── .github/workflows/        # GitHub Actions (Pages deploy)
├── astro.config.mjs          # Astro config (i18n, Tailwind plugin)
├── docs/                     # Project documentation (see docs/README.md)
├── public/                   # Static assets served as-is
│   ├── favicon.svg
│   ├── fonts/                # Roboto font files (self-hosted)
│   ├── fontawesome/          # FontAwesome CSS + webfonts (self-hosted)
│   └── images/
├── src/
│   ├── components/           # Reusable .astro components
│   │   ├── DarkModeToggle.astro
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── LanguagePicker.astro
│   │   ├── NavBar.astro
│   │   └── PostList.astro
│   ├── content/
│   │   └── blog/
│   │       ├── en/           # English posts (Markdown)
│   │       └── es/           # Spanish posts (Markdown)
│   ├── content.config.ts     # Content collection schema (glob loader)
│   ├── i18n/
│   │   ├── ui.js             # Translation strings
│   │   └── utils.js          # lang helpers + post translation lookup
│   ├── layouts/
│   │   ├── Layout.astro      # Base layout (head + Header + Footer)
│   │   └── PostLayout.astro  # Post-specific layout
│   ├── pages/
│   │   ├── 404.astro
│   │   ├── index.astro       # Placeholder; Astro redirects / → /es/
│   │   ├── en/               # English routes
│   │   │   ├── index.astro
│   │   │   ├── blog.astro
│   │   │   └── blog/[slug].astro
│   │   └── es/               # Spanish routes (default locale)
│   │       ├── index.astro
│   │       ├── blog.astro
│   │       └── blog/[slug].astro
│   ├── styles/global.css     # Tailwind entry + @font-face declarations
│   └── env.d.ts
├── package.json
└── tsconfig.json
```

### How blog posts work

Posts live under `src/content/blog/<lang>/<slug>.md`. The filename slug is the identifier: it becomes the URL (`/<lang>/blog/<slug>`). Each post declares the following frontmatter (validated by `src/content.config.ts`):

```yaml
idx: 1                        # Sort key (higher = shown first) and translation-link key
title: "..."
author: "..."
pubDate: "..."                # Display date
pubDateLogical: "YYYY-MM-DD"  # Used to hide future-dated posts
tags: ["tag1", "tag2"]
```

Two posts in different languages with the same `idx` are treated as translations of each other; see `src/i18n/utils.js` (`getPostTranslations`). The slugs themselves are independent per language.

## Documentation

In-depth documentation of design decisions, architecture, and the content pipeline lives in [`docs/`](./docs/README.md).

For AI coding agents and future maintainers, a navigation guide is available in [`AGENTS.md`](./AGENTS.md).
