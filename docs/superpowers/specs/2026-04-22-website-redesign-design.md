# Website Redesign — Design Spec

## Overview

Total redesign of T1b4lt.github.io (personal blog/portfolio for Guillermo Segovia). Moving from a minimalist cool-gray Roboto design to a warm editorial identity inspired by DESIGN.md but with its own personality. The site should project technical competence, seriousness, and approachability.

**Approach:** Single-Column Editorial — serif titles, warm parchment palette, generous whitespace, single centered column as the main axis. Professional but personal, not a corporate landing page.

**Tech stack:** Unchanged — Astro 6, Tailwind CSS 4, TypeScript strict, existing i18n system (EN/ES).

---

## 1. Visual System

### Typography

| Role | Font | Weight | Size (desktop) | Line Height |
|------|------|--------|-----------------|-------------|
| Display/Hero | Georgia (serif) | 700 | 48-64px | 1.10 |
| Section Heading | Georgia (serif) | 500-700 | 36px | 1.20 |
| Sub-heading | Georgia (serif) | 500 | 25-32px | 1.20-1.30 |
| Body | Inter / system-ui (sans) | 400 | 16-17px | 1.60 |
| Body Large | Inter / system-ui (sans) | 400 | 20px | 1.60 |
| Caption/Meta | Inter / system-ui (sans) | 400 | 14px | 1.43 |
| Label/Tag | Inter / system-ui (sans) | 500 | 12px | 1.25 |
| Code | JetBrains Mono / monospace | 400 | 15px | 1.60 |

**Principles:**
- Serif for content headings (authority), sans for UI and body (utility)
- Generous body line-height (1.60) for editorial reading experience
- Tight heading line-heights (1.10-1.30)
- No bold on serif above weight 700

### Color Palette

**Light mode:**

| Role | Color | Hex |
|------|-------|-----|
| Page background | Parchment | `#f5f4ed` |
| Card surface | Ivory | `#faf9f5` |
| Primary text | Near Black | `#141413` |
| Secondary text | Olive Gray | `#5e5d59` |
| Tertiary text | Stone Gray | `#87867f` |
| Accent / CTA | Terracotta | `#c96442` |
| Borders | Border Cream | `#f0eee6` |
| Prominent borders | Border Warm | `#e8e6dc` |
| Button surface | Warm Sand | `#e8e6dc` |
| Button text | Charcoal Warm | `#4d4c48` |
| Ring shadow | Ring Warm | `#d1cfc5` |
| Focus ring | Focus Blue | `#3898ec` |

**Dark mode:**

| Role | Color | Hex |
|------|-------|-----|
| Page background | Deep Dark | `#141413` |
| Card surface | Dark Surface | `#30302e` |
| Primary text | Ivory | `#faf9f5` |
| Secondary text | Warm Silver | `#b0aea5` |
| Accent / CTA | Coral | `#d97757` |
| Borders | Dark Border | `#30302e` |

**Rules:**
- No cool blue-grays anywhere — all neutrals have warm yellow-brown undertone
- Focus Blue (`#3898ec`) is the only cool color, used solely for accessibility focus rings
- Terracotta/Coral is reserved for primary CTAs and high-signal brand moments

### Depth & Shadows

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | No shadow, no border | Page background, inline text |
| Contained | `1px solid #f0eee6` (light) / `1px solid #30302e` (dark) | Cards, sections |
| Ring | `0px 0px 0px 1px` warm ring shadow | Interactive states, buttons |
| Whisper | `rgba(0,0,0,0.05) 0px 4px 24px` | Elevated cards, featured content |

### Border Radius Scale

- Subtle: 6px — small inline elements
- Comfortable: 8px — standard buttons, cards
- Generous: 12px — primary buttons, inputs
- Featured: 16px — featured containers, images

### Spacing

- Base unit: 8px
- Section vertical spacing: 80-120px between major sections
- Card internal padding: 24-32px
- Max content width: ~720px for text, ~1200px for grids

---

## 2. Navigation & Global Controls

### Mobile (base design)

- **Top row:** Language picker (EN/ES pill buttons) left + dark mode toggle (sun/moon icon) right — always visible, never hidden in a menu
- **Bottom row:** Nav links centered horizontally — Home, Blog, Projects, About — with animated underline in terracotta for active state

### Desktop (lg+)

- **Single row:** Wordmark "Guillermo Segovia" left (serif, links to home) → nav links center → language picker + dark mode toggle right
- Sticky with subtle backdrop-blur on Parchment/Deep Dark

### Footer

- Background: Dark Surface `#30302e` (light) / slightly darker in dark mode
- Content: name, brief description line, social icons (GitHub, LinkedIn), copyright
- Tone: understated, doesn't compete with content

---

## 3. Pages

### Home

**Hero:**
- Name "Guillermo Segovia" in large serif (48-64px desktop, ~32px mobile)
- Role: "Product & AI Prototyper @ Telefónica" in sans, secondary text color
- Personal tagline — one line, essence of professional identity
- Terracotta CTA button linking to About Me

**Featured Projects:**
- Section title "Featured Projects" in serif
- 2-3 project cards (projects with `featured: true` in frontmatter)
- Each card: title, short description, tech tags, GitHub/web links
- "View all projects →" link in terracotta at end

**Latest Blog Post:**
- Section title "Latest from the blog" in serif
- 1-2 most recent posts in compact format: title, date, tags
- "Read more posts →" link in terracotta

**Layout:** Hero → Featured Projects → Latest Post → Footer. Single column centered, max-width ~720px.

### Projects

**Section 1 — "My Projects":**
- Grid of cards: 1 column mobile, 2 columns desktop
- Each card defined by markdown file with frontmatter:
  ```yaml
  title: "Project Name"
  description: "One-liner description"
  tags: ["Python", "LLM", "Azure"]
  github: "https://github.com/..."
  web: "https://..."        # optional
  featured: true             # appears on home
  order: 1                   # sort order
  ```
- Card visual: title in serif, description in sans, tech tags as pills (Warm Sand), GitHub/web icon links
- Ordered by `order` field

**Section 2 — "Open Source Contributions":**
- Visually separated with serif heading + subtle divider (Border Cream)
- Compact list format — each entry is a row:
  - Project name (link to repo)
  - Brief description of contribution
  - Small tech tags
- Defined by markdown files with frontmatter:
  ```yaml
  project: "Project Name"
  description: "What I contributed"
  tags: ["Python", "NLP"]
  repo: "https://github.com/..."
  ```
- Visually subordinate to personal projects — no prominent cards

**Template content:** 3 placeholder projects (project-1, project-2, project-3) + 2 placeholder OS contributions (oss-1, oss-2) with realistic dummy data.

### About Me

Built as Astro component (not markdown) — content changes infrequently and benefits from custom layout per section.

**Sections in order:**

1. **Hero:** Name in serif large + role + 2-3 sentence intro (condensed from current home)
2. **Experience:** Vertical timeline (subtle Border Cream line, terracotta dots)
   - Telefónica — Product & AI Prototyper (Jul 2022–present)
   - Telefónica — Beca Talentum AI & Full Stack (Jul 2021–Jul 2022)
   - Accenture — Big Data Intern (Sep 2019–May 2020)
3. **Skills:** Grid of pills/badges grouped by category (AI/ML, Backend, Frontend, Data, Cloud) — Warm Sand pills with Charcoal text
4. **Education:**
   - UC3M — Master CS (2020-2022)
   - UAM — Grado Ingeniería Informática (2015-2020)
5. **Awards:** Compact list — Beca excelencia CAM, premio primer año, hackathon winners, SEDEA ranking 2021
6. **Areas of Interest:** ML, Software Development, Data Analysis — 3 short blocks, condensed from current home content

### Blog Index

- Page title "Blog" in serif large
- Post list, single column, each post is a row:
  - Title in serif (link, hover to terracotta)
  - Date + tags below in tertiary text (Stone Gray)
  - No excerpts — clean and scannable
- Subtle separator (Border Cream) between posts
- Existing mechanics unchanged: markdown, bilingual, idx linking

### Blog Post

- Title in serif large (36-48px)
- Meta: author, date, tags in Stone Gray
- Content in centered column (~720px), body in sans, line-height 1.6
- Links in terracotta with underline
- Code blocks: Dark Surface background, light text, 8px border-radius
- Blockquotes: left border in terracotta
- Images: 12px border-radius
- Existing mechanics unchanged

### 404

- Centered, minimal
- "404" in serif display size
- Message below in sans, secondary text
- Terracotta button to return home
- Bilingual
- No GIF — matches professional tone

---

## 4. Responsive Behavior

**Mobile-first approach.** Base styles target mobile; desktop adapts via `lg:` breakpoint.

| Element | Mobile | Desktop (lg+) |
|---------|--------|----------------|
| Header | Two rows: controls top, nav bottom | Single row: wordmark + nav + controls |
| Hero text | ~32px | 48-64px |
| Content width | Full width with padding | Max ~720px centered |
| Project grid | 1 column | 2 columns |
| Featured projects on home | 1 column stacked | 2-3 column cards |
| Nav links | Horizontal, compact text | Horizontal with more spacing |
| Section spacing | 48-64px | 80-120px |

**Touch targets:** Minimum 44x44px for all interactive elements.

**Language picker + dark mode toggle:** Always visible in header on all screen sizes — never hidden behind hamburger or collapsed.

---

## 5. Content Collections (Astro)

### Existing (unchanged)
- `src/content/blog/{en,es}/*.md` — blog posts with idx, title, author, pubDate, pubDateLogical, tags

### New
- `src/content/projects/*.md` — personal projects with title, description, tags, github, web (optional), featured, order
- `src/content/oss/*.md` — open source contributions with project, description, tags, repo

---

## 6. Structural Changes Summary

| Current | Redesigned |
|---------|------------|
| Pages: Home, Blog, Blog/[slug], 404 | Pages: Home, Blog, Blog/[slug], Projects, About, 404 |
| Home: long about-me text | Home: hero + featured projects + latest post |
| About: doesn't exist | About: CV-integrated page (Astro component) |
| Projects: doesn't exist | Projects: cards from markdown + OS contributions list |
| Font: Roboto (sans only) | Fonts: Georgia (serif headlines) + Inter/system-ui (sans body) |
| Colors: slate/zinc cool grays, blue accent | Colors: warm parchment palette, terracotta accent |
| Nav: Home, Blog | Nav: Home, Blog, Projects, About |
| Footer: zinc-700 | Footer: Dark Surface #30302e with warm tones |
| 404: astronaut GIF + gradient button | 404: minimal serif + terracotta button |

---

## 7. Internationalization

All new pages (Projects, About) follow the same i18n pattern as existing pages:
- English at root (`/projects`, `/about`)
- Spanish at `/es/projects`, `/es/about`
- Nav labels added to `src/i18n/ui.ts` for both languages
- Project and OSS markdown content collections are bilingual: `src/content/projects/{en,es}/*.md`, `src/content/oss/{en,es}/*.md`
- About Me page content hardcoded per language variant (separate Astro pages for EN and ES, like current home)

---

## 8. Out of Scope

- No contact form (social links in footer are sufficient)
- No RSS feed (can be added later)
- No search functionality
- No analytics integration
- No changes to deployment pipeline (GitHub Actions stays as-is)
- No changes to i18n mechanics (same routing, same translation system)
