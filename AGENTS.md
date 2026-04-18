# AGENTS.md

Orientation guide for AI coding agents (and humans in a hurry) working on this repository.

This file is a **table of contents**. It points you at the authoritative documents rather than duplicating them.

## What this project is (in one sentence)

A bilingual (ES/EN) personal portfolio and blog, built with **Astro 6** + **Tailwind CSS 4**, fully prerendered and deployed to **GitHub Pages** on every push to `main`.

## Where to look for what

| If you need to…                                           | Read                                                           |
| --------------------------------------------------------- | -------------------------------------------------------------- |
| Run / build / deploy the site                             | [README.md → Setup](./README.md#setup)                         |
| Understand the directory layout                           | [README.md → Project Structure](./README.md#project-structure) |
| Get the project's goals and feature list                  | [docs/0-overview.md](./docs/0-overview.md)                     |
| Know the dependency versions and why they were picked     | [docs/1-tech-stack.md](./docs/1-tech-stack.md)                 |
| Understand routing, content pipeline, i18n, build, deploy | [docs/2-architecture.md](./docs/2-architecture.md)             |
| Check why a non-obvious choice was made                   | [docs/3-design-decisions.md](./docs/3-design-decisions.md)     |
| Add, translate, or schedule a blog post                   | [docs/4-content-authoring.md](./docs/4-content-authoring.md)   |

## Rules of engagement for agents

1. **English in code and docs, Spanish in conversation.** User preference (see global `CLAUDE.md`).
2. **Do not invent CMS-like abstractions.** Posts are Markdown files validated by a Zod schema in `src/content.config.ts`. If you need a new field, add it there.
3. **Slug is the identifier; `idx` is only a sort/translation-link key.** The filename becomes the URL (`/<lang>/blog/<slug>`). `idx` is a frontmatter number used to order listings and to pair translations across languages — it never appears in URLs. See [3-design-decisions.md](./docs/3-design-decisions.md).
4. **Don't fight Astro's i18n.** `/` is an auto-generated redirect to `/es/`. The empty `src/pages/index.astro` only exists to satisfy Astro's requirement that a file sit at `/` — don't add content to it.
5. **Verify before claiming done.** Run `npm run build` after any change. Schema violations and broken references fail the build.
6. **No tracking, no analytics, no comments.** Keep the site lean and static.

## Quick commands

```bash
npm install      # prerequisites
npm run dev      # local dev server on http://localhost:4321
npm run build    # produces ./dist (what gets deployed)
npm run preview  # serve ./dist locally
```

## Quick map

```
astro.config.mjs           # i18n + Tailwind plugin
src/content.config.ts      # Blog schema + glob loader
src/content/blog/{es,en}/  # Markdown posts (one folder per language)
src/pages/{es,en}/         # Per-language routes
src/i18n/                  # Translation strings and helpers
src/components/            # Layout pieces (Header, Footer, NavBar, …)
src/layouts/               # Page and Post layouts
src/styles/global.css      # Tailwind entry + @font-face
public/                    # Static assets (fonts, icons, images)
.github/workflows/         # Pages deploy
docs/                      # In-depth documentation (start at docs/README.md)
```
