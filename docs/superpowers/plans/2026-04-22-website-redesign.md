# Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign T1b4lt.github.io from a cool-gray minimalist blog into a warm editorial portfolio with new pages (Projects, About), updated visual system, and mobile-first layout.

**Architecture:** Incremental transformation of the existing Astro 6 + Tailwind CSS 4 codebase. Each task produces a working build. Foundation (fonts, colors, theme) first, then shared components (nav, footer, layout), then pages one by one, then cleanup.

**Tech Stack:** Astro 6, Tailwind CSS 4 (via Vite plugin, CSS `@theme`), TypeScript strict, Georgia serif + Inter sans, astro-icon, existing i18n system.

---

## File Map

### Modified files

- `src/styles/global.css` — Replace Roboto with Georgia + Inter, new color palette in `@theme`
- `src/styles/post.css` — Update to warm palette, serif headings, terracotta accents
- `src/content.config.ts` — Add `projects` and `oss` collections
- `src/i18n/ui.ts` — Add translation keys for new nav items, pages, sections
- `src/i18n/utils.ts` — Add helper functions for projects and OSS collections
- `src/layouts/Layout.astro` — New body colors, updated meta defaults
- `src/layouts/PostLayout.astro` — Restyle with warm palette and serif title
- `src/components/Header.astro` — Restructured: mobile two-row, desktop single-row with wordmark
- `src/components/NavBar.astro` — Add Projects and About links, terracotta active state
- `src/components/LanguagePicker.astro` — Restyle with warm palette
- `src/components/DarkModeToggle.astro` — Update icon colors to warm palette
- `src/components/Footer.astro` — Dark Surface background, warm tones
- `src/components/PostList.astro` — Restyle with serif titles, warm palette, terracotta hover
- `src/pages/index.astro` — Complete rewrite: hero + featured projects + latest post
- `src/pages/es/index.astro` — Spanish version of new home
- `src/pages/blog.astro` — Minor: uses restyled PostList
- `src/pages/es/blog.astro` — Minor: uses restyled PostList
- `src/pages/404.astro` — Minimal serif redesign, remove GIF
- `package.json` — Add `@fontsource/inter` dependency

### New files

- `src/pages/projects.astro` — English projects page
- `src/pages/es/projects.astro` — Spanish projects page
- `src/pages/about.astro` — English about page
- `src/pages/es/about.astro` — Spanish about page
- `src/components/ProjectCard.astro` — Reusable project card component
- `src/components/OSSList.astro` — Open source contributions list component
- `src/content/projects/en/project-1.md` — Template project 1
- `src/content/projects/en/project-2.md` — Template project 2
- `src/content/projects/en/project-3.md` — Template project 3
- `src/content/projects/es/project-1.md` — Template project 1 (ES)
- `src/content/projects/es/project-2.md` — Template project 2 (ES)
- `src/content/projects/es/project-3.md` — Template project 3 (ES)
- `src/content/oss/en/oss-1.md` — Template OSS contribution 1
- `src/content/oss/en/oss-2.md` — Template OSS contribution 2
- `src/content/oss/es/oss-1.md` — Template OSS contribution 1 (ES)
- `src/content/oss/es/oss-2.md` — Template OSS contribution 2 (ES)

---

## Task 1: Install fonts and set up design tokens

**Files:**

- Modify: `package.json` — add `@fontsource/inter`
- Modify: `src/styles/global.css` — replace Roboto imports, new `@theme` palette, font-family

- [ ] **Step 1: Install Inter font**

Run:

```bash
npm install @fontsource/inter
```

- [ ] **Step 2: Replace global.css with new design tokens**

Replace the entire contents of `src/styles/global.css` with:

```css
@import "tailwindcss";

@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/700.css";

@variant dark (.dark &);

@theme {
  /* Brand */
  --color-terracotta: #c96442;
  --color-coral: #d97757;

  /* Surfaces - Light */
  --color-parchment: #f5f4ed;
  --color-ivory: #faf9f5;
  --color-warm-sand: #e8e6dc;

  /* Surfaces - Dark */
  --color-deep-dark: #141413;
  --color-dark-surface: #30302e;

  /* Text */
  --color-near-black: #141413;
  --color-olive-gray: #5e5d59;
  --color-stone-gray: #87867f;
  --color-charcoal-warm: #4d4c48;
  --color-dark-warm: #3d3d3a;
  --color-warm-silver: #b0aea5;

  /* Borders */
  --color-border-cream: #f0eee6;
  --color-border-warm: #e8e6dc;
  --color-border-dark: #30302e;

  /* Shadows / Rings */
  --color-ring-warm: #d1cfc5;
  --color-ring-deep: #c2c0b6;

  /* Semantic */
  --color-focus-blue: #3898ec;
  --color-error-crimson: #b53333;

  /* Legacy alias for any remaining references */
  --color-primary: #c96442;
  --color-highlight: #c96442;

  /* Font families */
  --font-serif: Georgia, "Times New Roman", serif;
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, "Cascadia Code", "JetBrains Mono", monospace;
}

body {
  font-family: var(--font-sans);
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-serif);
}
```

- [ ] **Step 3: Verify the build compiles**

Run:

```bash
npm run build
```

Expected: Build succeeds. The site will look broken (old Tailwind classes reference removed colors) — that's expected, we fix components in subsequent tasks.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/styles/global.css
git commit -m "feat: replace Roboto with Inter + Georgia, add warm color palette tokens"
```

---

## Task 2: Update base Layout and body theming

**Files:**

- Modify: `src/layouts/Layout.astro:121` — body class colors

- [ ] **Step 1: Update body classes in Layout.astro**

In `src/layouts/Layout.astro`, replace:

```html
<body
  class="bg-slate-200 dark:bg-zinc-900 text-zinc-900 dark:text-slate-200"
></body>
```

with:

```html
<body
  class="bg-parchment dark:bg-deep-dark text-near-black dark:text-ivory"
></body>
```

- [ ] **Step 2: Verify build compiles**

Run:

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: update body to warm parchment/deep-dark background"
```

---

## Task 3: Restyle Header — mobile two-row + desktop single-row

**Files:**

- Modify: `src/components/Header.astro` — restructure layout
- Modify: `src/components/LanguagePicker.astro` — warm palette pills
- Modify: `src/components/DarkModeToggle.astro` — warm icon colors
- Modify: `src/components/NavBar.astro` — add Projects/About, terracotta underline, wordmark on desktop

- [ ] **Step 1: Update LanguagePicker.astro**

Replace the entire contents of `src/components/LanguagePicker.astro` with:

```astro
---
import { languages, type Lang } from "../i18n/ui";
import { getLangFromUrl, getAlternatePath } from "../i18n/utils";

interface Props {
  translations?: Record<string, string>;
}

const { translations } = Astro.props;
const currentLang = getLangFromUrl(Astro.url);
---

<ul class="flex space-x-2">
  {
    (Object.keys(languages) as Lang[]).map((lang) => (
      <li>
        <a
          href={getAlternatePath(Astro.url.pathname, lang, translations)}
          data-lang={lang}
          onclick="try { localStorage.setItem('lang', this.dataset.lang) } catch (_) {}"
          class={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            lang === currentLang
              ? "bg-near-black text-ivory dark:bg-ivory dark:text-near-black"
              : "text-olive-gray hover:bg-warm-sand dark:text-warm-silver dark:hover:bg-dark-surface"
          }`}
        >
          {languages[lang]}
        </a>
      </li>
    ))
  }
</ul>
```

- [ ] **Step 2: Update DarkModeToggle.astro**

In `src/components/DarkModeToggle.astro`, replace the `<style>` block:

```html
<style>
  #themeToggle {
    border: 0;
    background: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background-color 0.2s;
  }
  #themeToggle:hover {
    background-color: var(--color-warm-sand);
  }
  :global(.dark) #themeToggle:hover {
    background-color: var(--color-dark-surface);
  }
  .sun {
    fill: var(--color-near-black);
  }
  .moon {
    fill: transparent;
  }
  :global(.dark) .sun {
    fill: transparent;
  }
  :global(.dark) .moon {
    fill: var(--color-ivory);
  }
</style>
```

- [ ] **Step 3: Update NavBar.astro with new links and terracotta underlines**

Replace the entire contents of `src/components/NavBar.astro` with:

```astro
---
import { getLangFromUrl, useTranslations } from "../i18n/utils";
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);

const pathname = Astro.url.pathname;
const isHome = pathname === "/" || pathname === "/es" || pathname === "/es/";
const isBlog = pathname.includes("/blog");
const isProjects = pathname.includes("/projects");
const isAbout = pathname.includes("/about");

const prefix = lang === "en" ? "" : `/${lang}`;

const links = [
  { href: prefix || "/", label: t("nav.home"), active: isHome },
  { href: `${prefix}/blog`, label: t("nav.blog"), active: isBlog },
  { href: `${prefix}/projects`, label: t("nav.projects"), active: isProjects },
  { href: `${prefix}/about`, label: t("nav.about"), active: isAbout },
];
---

<nav>
  <div class="flex justify-center">
    <div class="flex flex-row space-x-6 lg:space-x-10 font-medium">
      {
        links.map((link) => (
          <a
            href={link.href}
            class="group text-near-black dark:text-ivory"
            aria-current={link.active ? "page" : undefined}
          >
            {link.label}
            <span
              class={
                link.active
                  ? "block max-w-full h-0.5 bg-terracotta"
                  : "block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-terracotta"
              }
            />
          </a>
        ))
      }
    </div>
  </div>
</nav>
```

- [ ] **Step 4: Restructure Header.astro — mobile two-row, desktop one-row**

Replace the entire contents of `src/components/Header.astro` with:

```astro
---
import LanguagePicker from "./LanguagePicker.astro";
import DarkModeToggle from "./DarkModeToggle.astro";
import NavBar from "./NavBar.astro";
import { getLangFromUrl } from "../i18n/utils";

interface Props {
  translations?: Record<string, string>;
}

const { translations } = Astro.props;
const lang = getLangFromUrl(Astro.url);
const homeHref = lang === "en" ? "/" : `/${lang}`;
---

<header
  class="sticky top-0 z-50 bg-parchment/95 dark:bg-deep-dark/95 backdrop-blur-sm border-b border-border-cream dark:border-border-dark"
>
  {/* Mobile layout: two rows */}
  <div class="lg:hidden">
    <div class="flex flex-row justify-between items-center px-5 pt-4 pb-2">
      <LanguagePicker translations={translations} />
      <DarkModeToggle />
    </div>
    <div class="pb-4">
      <NavBar />
    </div>
  </div>

  {/* Desktop layout: single row */}
  <div
    class="hidden lg:flex flex-row justify-between items-center px-8 py-4 max-w-5xl mx-auto"
  >
    <a
      href={homeHref}
      class="font-serif text-xl text-near-black dark:text-ivory hover:text-terracotta dark:hover:text-coral transition-colors"
      style="font-family: var(--font-serif);"
    >
      Guillermo Segovia
    </a>
    <NavBar />
    <div class="flex items-center space-x-4">
      <LanguagePicker translations={translations} />
      <DarkModeToggle />
    </div>
  </div>
</header>
```

- [ ] **Step 5: Verify build compiles and check dev server**

Run:

```bash
npm run build
```

Expected: Build succeeds.

Run:

```bash
npm run dev
```

Visually verify: sticky header, warm colors, language picker and dark mode toggle work, nav shows Home/Blog/Projects/About (Projects and About will 404 for now — that's expected).

- [ ] **Step 6: Commit**

```bash
git add src/components/Header.astro src/components/NavBar.astro src/components/LanguagePicker.astro src/components/DarkModeToggle.astro
git commit -m "feat: redesign header with warm palette, sticky nav, wordmark on desktop"
```

---

## Task 4: Restyle Footer

**Files:**

- Modify: `src/components/Footer.astro` — warm dark surface, updated typography

- [ ] **Step 1: Replace Footer.astro**

Replace the entire contents of `src/components/Footer.astro` with:

```astro
---
import { getLangFromUrl, useTranslations } from "../i18n/utils";
import { Icon } from "astro-icon/components";

const actualYear = new Date().getFullYear();

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
---

<footer class="bg-dark-surface dark:bg-near-black">
  <div class="max-w-5xl mx-auto px-6 py-12">
    <div class="max-w-2xl">
      <h4 class="text-2xl text-ivory" style="font-family: var(--font-serif);">
        {t("footer.title")}
      </h4>
      <p class="text-warm-silver mt-2">
        {t("footer.subtitle")}
      </p>
      <div class="flex flex-row space-x-6 mt-6">
        <a
          href="https://www.github.com/T1b4lt"
          target="_blank"
          rel="noopener noreferrer"
          class="text-warm-silver hover:text-ivory transition-colors"
        >
          <Icon name="fa6-brands:github" aria-label="GitHub" />
        </a>
        <a
          href="https://www.linkedin.com/in/guillermo-segovia-fernandez/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-warm-silver hover:text-ivory transition-colors"
        >
          <Icon name="fa6-brands:linkedin-in" aria-label="LinkedIn" />
        </a>
      </div>
    </div>
    <hr class="my-8 border-border-dark" />
    <div class="text-center text-sm text-warm-silver">
      Guillermo Segovia &middot; {actualYear}
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Verify build**

Run:

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: redesign footer with warm dark surface palette"
```

---

## Task 5: Add i18n keys for new pages

**Files:**

- Modify: `src/i18n/ui.ts` — add nav.projects, nav.about, projects._, about._ keys

- [ ] **Step 1: Update ui.ts with all new translation keys**

Replace the entire contents of `src/i18n/ui.ts` with:

```typescript
export const languages = {
  es: "Español",
  en: "English",
} as const;

export const defaultLang = "en" as const;

export type Lang = keyof typeof languages;

export const ui = {
  en: {
    "nav.home": "Home",
    "nav.blog": "Blog",
    "nav.projects": "Projects",
    "nav.about": "About",
    "404.title": "You are lost",
    "404.button": "Go back home",
    "blog.title": "Blog",
    "post.by": "Written by",
    "post.on": "on",
    "projects.title": "Projects",
    "projects.oss": "Open Source Contributions",
    "projects.viewAll": "View all projects",
    "projects.latest": "Featured Projects",
    "about.title": "About Me",
    "about.experience": "Experience",
    "about.skills": "Skills",
    "about.education": "Education",
    "about.awards": "Awards",
    "about.interests": "Areas of Interest",
    "home.tagline":
      "Building AI prototypes that bridge innovation and product at Telefónica.",
    "home.cta": "About me",
    "home.latestPosts": "Latest from the blog",
    "home.morePosts": "Read more posts",
    "home.moreProjects": "View all projects",
    "footer.title": "Stay in touch!",
    "footer.subtitle": "Follow me on social media for updates and news.",
  },
  es: {
    "nav.home": "Inicio",
    "nav.blog": "Blog",
    "nav.projects": "Proyectos",
    "nav.about": "Sobre mí",
    "404.title": "Te has perdido",
    "404.button": "Vuelve a casa",
    "blog.title": "Blog",
    "post.by": "Escrito por",
    "post.on": "el",
    "projects.title": "Proyectos",
    "projects.oss": "Contribuciones Open Source",
    "projects.viewAll": "Ver todos los proyectos",
    "projects.latest": "Proyectos Destacados",
    "about.title": "Sobre mí",
    "about.experience": "Experiencia",
    "about.skills": "Habilidades",
    "about.education": "Formación",
    "about.awards": "Reconocimientos",
    "about.interests": "Áreas de Interés",
    "home.tagline":
      "Creando prototipos de IA que conectan innovación y producto en Telefónica.",
    "home.cta": "Sobre mí",
    "home.latestPosts": "Últimas publicaciones",
    "home.morePosts": "Leer más publicaciones",
    "home.moreProjects": "Ver todos los proyectos",
    "footer.title": "¡Mantente en contacto!",
    "footer.subtitle":
      "Sígueme en redes sociales para estar al tanto de las novedades.",
  },
} as const;

export type UIKey = keyof (typeof ui)[typeof defaultLang];
```

- [ ] **Step 2: Verify build**

Run:

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/ui.ts
git commit -m "feat: add i18n keys for projects, about, and home sections"
```

---

## Task 6: Add content collections for projects and OSS

**Files:**

- Modify: `src/content.config.ts` — add projects and oss collections
- Create: `src/content/projects/en/project-1.md`
- Create: `src/content/projects/en/project-2.md`
- Create: `src/content/projects/en/project-3.md`
- Create: `src/content/projects/es/project-1.md`
- Create: `src/content/projects/es/project-2.md`
- Create: `src/content/projects/es/project-3.md`
- Create: `src/content/oss/en/oss-1.md`
- Create: `src/content/oss/en/oss-2.md`
- Create: `src/content/oss/es/oss-1.md`
- Create: `src/content/oss/es/oss-2.md`

- [ ] **Step 1: Update content.config.ts**

Replace the entire contents of `src/content.config.ts` with:

```typescript
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    idx: z.number(),
    title: z.string(),
    author: z.string(),
    pubDate: z.string(),
    pubDateLogical: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    tags: z.array(z.string()),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    github: z.string().url(),
    web: z.string().url().optional(),
    featured: z.boolean().default(false),
    order: z.number(),
  }),
});

const oss = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/oss" }),
  schema: z.object({
    project: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    repo: z.string().url(),
    order: z.number().default(0),
  }),
});

export const collections = { blog, projects, oss };
```

- [ ] **Step 2: Create English project templates**

Create `src/content/projects/en/project-1.md`:

```markdown
---
title: "AI-Powered Document Analyzer"
description: "End-to-end prototype that extracts insights from unstructured documents using LLMs and presents them in a searchable interface."
tags: ["Python", "LLM", "Azure", "React"]
github: "https://github.com/T1b4lt/project-1"
web: "https://project-1.example.com"
featured: true
order: 1
---
```

Create `src/content/projects/en/project-2.md`:

```markdown
---
title: "Real-Time Voice Activity Detection"
description: "ML pipeline for detecting speech segments in audio streams, built for integration with conversational AI systems."
tags: ["Python", "PyTorch", "ML", "SpeechBrain"]
github: "https://github.com/T1b4lt/project-2"
featured: true
order: 2
---
```

Create `src/content/projects/en/project-3.md`:

```markdown
---
title: "Smart Home Automation Hub"
description: "Mobile-first dashboard for controlling IoT devices with real-time data visualization and automated routines."
tags: ["Kotlin", "Android", "MQTT", "Firebase"]
github: "https://github.com/T1b4lt/project-3"
web: "https://project-3.example.com"
featured: true
order: 3
---
```

- [ ] **Step 3: Create Spanish project templates**

Create `src/content/projects/es/project-1.md`:

```markdown
---
title: "Analizador de Documentos con IA"
description: "Prototipo end-to-end que extrae insights de documentos no estructurados usando LLMs y los presenta en una interfaz de búsqueda."
tags: ["Python", "LLM", "Azure", "React"]
github: "https://github.com/T1b4lt/project-1"
web: "https://project-1.example.com"
featured: true
order: 1
---
```

Create `src/content/projects/es/project-2.md`:

```markdown
---
title: "Detección de Actividad de Voz en Tiempo Real"
description: "Pipeline de ML para detectar segmentos de habla en flujos de audio, diseñado para integración con sistemas de IA conversacional."
tags: ["Python", "PyTorch", "ML", "SpeechBrain"]
github: "https://github.com/T1b4lt/project-2"
featured: true
order: 2
---
```

Create `src/content/projects/es/project-3.md`:

```markdown
---
title: "Hub de Automatización del Hogar"
description: "Dashboard mobile-first para controlar dispositivos IoT con visualización de datos en tiempo real y rutinas automatizadas."
tags: ["Kotlin", "Android", "MQTT", "Firebase"]
github: "https://github.com/T1b4lt/project-3"
web: "https://project-3.example.com"
featured: true
order: 3
---
```

- [ ] **Step 4: Create English OSS templates**

Create `src/content/oss/en/oss-1.md`:

```markdown
---
project: "Open Source Project Alpha"
description: "Contributed a new NLP preprocessing pipeline that improved tokenization accuracy for Spanish-language documents."
tags: ["Python", "NLP", "Open Source"]
repo: "https://github.com/example/project-alpha"
order: 1
---
```

Create `src/content/oss/en/oss-2.md`:

```markdown
---
project: "Open Source Project Beta"
description: "Fixed a critical bug in the WebSocket reconnection logic and added comprehensive retry tests."
tags: ["TypeScript", "WebSocket", "Testing"]
repo: "https://github.com/example/project-beta"
order: 2
---
```

- [ ] **Step 5: Create Spanish OSS templates**

Create `src/content/oss/es/oss-1.md`:

```markdown
---
project: "Open Source Project Alpha"
description: "Contribuí un nuevo pipeline de preprocesamiento NLP que mejoró la precisión de tokenización para documentos en español."
tags: ["Python", "NLP", "Open Source"]
repo: "https://github.com/example/project-alpha"
order: 1
---
```

Create `src/content/oss/es/oss-2.md`:

```markdown
---
project: "Open Source Project Beta"
description: "Corregí un bug crítico en la lógica de reconexión de WebSocket y añadí tests exhaustivos de reintento."
tags: ["TypeScript", "WebSocket", "Testing"]
repo: "https://github.com/example/project-beta"
order: 2
---
```

- [ ] **Step 6: Verify build**

Run:

```bash
npm run build
```

Expected: Build succeeds. Collections are registered and templates are loaded.

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/content/projects/ src/content/oss/
git commit -m "feat: add projects and OSS content collections with templates"
```

---

## Task 7: Add utility functions for projects and OSS

**Files:**

- Modify: `src/i18n/utils.ts` — add functions for fetching/sorting projects and OSS entries

- [ ] **Step 1: Add project and OSS utility functions to utils.ts**

Add the following at the end of `src/i18n/utils.ts`, after the existing `getBlogStaticPaths` function:

```typescript
export async function getProjectsByLang(lang: Lang) {
  const allProjects = await getCollection("projects");
  return allProjects
    .filter(({ id }) => id.startsWith(`${lang}/`))
    .sort((a, b) => a.data.order - b.data.order);
}

export async function getFeaturedProjects(lang: Lang) {
  const projects = await getProjectsByLang(lang);
  return projects.filter((p) => p.data.featured);
}

export async function getOSSByLang(lang: Lang) {
  const allOSS = await getCollection("oss");
  return allOSS
    .filter(({ id }) => id.startsWith(`${lang}/`))
    .sort((a, b) => a.data.order - b.data.order);
}
```

Also update the `CollectionEntry` import at the top of the file. The existing import:

```typescript
import type { CollectionEntry } from "astro:content";
```

stays unchanged — Astro infers collection types from the config.

- [ ] **Step 2: Verify build**

Run:

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/utils.ts
git commit -m "feat: add utility functions for projects and OSS collections"
```

---

## Task 8: Create ProjectCard and OSSList components

**Files:**

- Create: `src/components/ProjectCard.astro`
- Create: `src/components/OSSList.astro`

- [ ] **Step 1: Create ProjectCard.astro**

Create `src/components/ProjectCard.astro`:

```astro
---
import { Icon } from "astro-icon/components";

interface Props {
  title: string;
  description: string;
  tags: string[];
  github: string;
  web?: string;
}

const { title, description, tags, github, web } = Astro.props;
---

<article
  class="bg-ivory dark:bg-dark-surface border border-border-cream dark:border-border-dark rounded-xl p-6 shadow-[rgba(0,0,0,0.05)_0px_4px_24px]"
>
  <h3
    class="text-xl text-near-black dark:text-ivory"
    style="font-family: var(--font-serif);"
  >
    {title}
  </h3>
  <p class="text-olive-gray dark:text-warm-silver mt-2 text-sm leading-relaxed">
    {description}
  </p>
  <div class="flex flex-wrap gap-2 mt-4">
    {
      tags.map((tag) => (
        <span class="text-xs font-medium text-charcoal-warm dark:text-warm-silver bg-warm-sand dark:bg-near-black px-2.5 py-1 rounded-lg">
          {tag}
        </span>
      ))
    }
  </div>
  <div class="flex space-x-4 mt-4">
    <a
      href={github}
      target="_blank"
      rel="noopener noreferrer"
      class="text-olive-gray dark:text-warm-silver hover:text-terracotta dark:hover:text-coral transition-colors"
    >
      <Icon name="fa6-brands:github" class="w-5 h-5" aria-label="GitHub" />
    </a>
    {
      web && (
        <a
          href={web}
          target="_blank"
          rel="noopener noreferrer"
          class="text-olive-gray dark:text-warm-silver hover:text-terracotta dark:hover:text-coral transition-colors"
        >
          <Icon
            name="fa6-solid:arrow-up-right-from-square"
            class="w-5 h-5"
            aria-label="Website"
          />
        </a>
      )
    }
  </div>
</article>
```

- [ ] **Step 2: Create OSSList.astro**

Create `src/components/OSSList.astro`:

```astro
---
import type { CollectionEntry } from "astro:content";

interface Props {
  entries: CollectionEntry<"oss">[];
}

const { entries } = Astro.props;
---

<ul class="space-y-4">
  {
    entries.map((entry) => (
      <li class="flex flex-col sm:flex-row sm:items-start gap-2 py-3 border-b border-border-cream dark:border-border-dark last:border-0">
        <div class="flex-1">
          <a
            href={entry.data.repo}
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-near-black dark:text-ivory hover:text-terracotta dark:hover:text-coral transition-colors"
          >
            {entry.data.project}
          </a>
          <p class="text-sm text-olive-gray dark:text-warm-silver mt-1">
            {entry.data.description}
          </p>
        </div>
        <div class="flex flex-wrap gap-1.5 sm:mt-0">
          {entry.data.tags.map((tag) => (
            <span class="text-xs text-stone-gray dark:text-warm-silver bg-warm-sand dark:bg-near-black px-2 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      </li>
    ))
  }
</ul>
```

- [ ] **Step 3: Verify build**

Run:

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProjectCard.astro src/components/OSSList.astro
git commit -m "feat: add ProjectCard and OSSList components"
```

---

## Task 9: Create Projects page (EN + ES)

**Files:**

- Create: `src/pages/projects.astro`
- Create: `src/pages/es/projects.astro`

- [ ] **Step 1: Create English projects page**

Create `src/pages/projects.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
import ProjectCard from "../components/ProjectCard.astro";
import OSSList from "../components/OSSList.astro";
import { useTranslations } from "../i18n/utils";
import { getProjectsByLang, getOSSByLang } from "../i18n/utils";

const lang = "en";
const t = useTranslations(lang);
const projects = await getProjectsByLang(lang);
const ossEntries = await getOSSByLang(lang);
---

<Layout title={`${t("projects.title")} | Guillermo Segovia`}>
  <div class="max-w-5xl mx-auto px-5 py-16">
    <h1
      class="text-4xl lg:text-5xl text-near-black dark:text-ivory"
      style="font-family: var(--font-serif);"
    >
      {t("projects.title")}
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
      {
        projects.map((project) => (
          <ProjectCard
            title={project.data.title}
            description={project.data.description}
            tags={project.data.tags}
            github={project.data.github}
            web={project.data.web}
          />
        ))
      }
    </div>

    {
      ossEntries.length > 0 && (
        <section class="mt-20">
          <h2
            class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
            style="font-family: var(--font-serif);"
          >
            {t("projects.oss")}
          </h2>
          <div class="mt-8">
            <OSSList entries={ossEntries} />
          </div>
        </section>
      )
    }
  </div>
</Layout>
```

- [ ] **Step 2: Create Spanish projects page**

Create `src/pages/es/projects.astro`:

```astro
---
import Layout from "../../layouts/Layout.astro";
import ProjectCard from "../../components/ProjectCard.astro";
import OSSList from "../../components/OSSList.astro";
import { useTranslations } from "../../i18n/utils";
import { getProjectsByLang, getOSSByLang } from "../../i18n/utils";

const lang = "es";
const t = useTranslations(lang);
const projects = await getProjectsByLang(lang);
const ossEntries = await getOSSByLang(lang);
---

<Layout title={`${t("projects.title")} | Guillermo Segovia`}>
  <div class="max-w-5xl mx-auto px-5 py-16">
    <h1
      class="text-4xl lg:text-5xl text-near-black dark:text-ivory"
      style="font-family: var(--font-serif);"
    >
      {t("projects.title")}
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
      {
        projects.map((project) => (
          <ProjectCard
            title={project.data.title}
            description={project.data.description}
            tags={project.data.tags}
            github={project.data.github}
            web={project.data.web}
          />
        ))
      }
    </div>

    {
      ossEntries.length > 0 && (
        <section class="mt-20">
          <h2
            class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
            style="font-family: var(--font-serif);"
          >
            {t("projects.oss")}
          </h2>
          <div class="mt-8">
            <OSSList entries={ossEntries} />
          </div>
        </section>
      )
    }
  </div>
</Layout>
```

- [ ] **Step 3: Verify build and test navigation**

Run:

```bash
npm run build
```

Expected: Build succeeds. `/projects` and `/es/projects` render with 3 project cards and 2 OSS entries each.

- [ ] **Step 4: Commit**

```bash
git add src/pages/projects.astro src/pages/es/projects.astro
git commit -m "feat: add projects page with cards and OSS list (EN + ES)"
```

---

## Task 10: Create About page (EN + ES)

**Files:**

- Create: `src/pages/about.astro`
- Create: `src/pages/es/about.astro`

- [ ] **Step 1: Create English about page**

Create `src/pages/about.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
import { useTranslations } from "../i18n/utils";

const t = useTranslations("en");
---

<Layout title={`${t("about.title")} | Guillermo Segovia`}>
  <div class="max-w-3xl mx-auto px-5 py-16">
    {/* Hero */}
    <section>
      <h1
        class="text-4xl lg:text-5xl text-near-black dark:text-ivory"
        style="font-family: var(--font-serif);"
      >
        Guillermo Segovia
      </h1>
      <p class="text-xl text-olive-gray dark:text-warm-silver mt-3">
        Product & AI Prototyper @ Telefónica
      </p>
      <p class="text-near-black dark:text-ivory mt-6 leading-relaxed">
        IT professional focused on innovation and digital development. I build
        end-to-end prototypes applying emerging technologies — from generative
        AI and LLMs to mobile and web applications — to improve existing
        products and create new ones.
      </p>
    </section>

    {/* Experience */}
    <section class="mt-16">
      <h2
        class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
        style="font-family: var(--font-serif);"
      >
        {t("about.experience")}
      </h2>
      <div
        class="mt-8 relative border-l-2 border-border-warm dark:border-border-dark pl-8 space-y-10"
      >
        <div class="relative">
          <span
            class="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full bg-terracotta dark:bg-coral border-4 border-parchment dark:border-deep-dark"
          ></span>
          <h3 class="font-medium text-near-black dark:text-ivory">
            Product & AI Prototyper
          </h3>
          <p class="text-sm text-olive-gray dark:text-warm-silver">
            Telefónica Innovación Digital &middot; Jul 2022 – Present
          </p>
          <p
            class="text-sm text-olive-gray dark:text-warm-silver mt-2 leading-relaxed"
          >
            End-to-end prototyping in the Future AI Lab team. Building and
            presenting prototypes to business units for evaluation and potential
            production rollout. Azure, Android, Web, AI, LLMs, Python.
          </p>
        </div>
        <div class="relative">
          <span
            class="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full bg-terracotta dark:bg-coral border-4 border-parchment dark:border-deep-dark"
          ></span>
          <h3 class="font-medium text-near-black dark:text-ivory">
            Beca Talentum AI & Full Stack
          </h3>
          <p class="text-sm text-olive-gray dark:text-warm-silver">
            Telefónica Innovación Digital &middot; Jul 2021 – Jul 2022
          </p>
          <p
            class="text-sm text-olive-gray dark:text-warm-silver mt-2 leading-relaxed"
          >
            NLP document processing with Apache Solr, conversational bot
            integration, ML research for Voice Activity Detection, and frontend
            development in React and Kotlin.
          </p>
        </div>
        <div class="relative">
          <span
            class="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full bg-terracotta dark:bg-coral border-4 border-parchment dark:border-deep-dark"
          ></span>
          <h3 class="font-medium text-near-black dark:text-ivory">
            Big Data Software Developer Intern
          </h3>
          <p class="text-sm text-olive-gray dark:text-warm-silver">
            Accenture &middot; Sep 2019 – May 2020
          </p>
          <p
            class="text-sm text-olive-gray dark:text-warm-silver mt-2 leading-relaxed"
          >
            Big Data project for a major telco. Kafka, Flink, Flume, Quarkus,
            GraalVM, Redis.
          </p>
        </div>
      </div>
    </section>

    {/* Skills */}
    <section class="mt-16">
      <h2
        class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
        style="font-family: var(--font-serif);"
      >
        {t("about.skills")}
      </h2>
      <div class="mt-8 space-y-4">
        <div>
          <h3
            class="text-sm font-medium text-stone-gray dark:text-warm-silver uppercase tracking-wide"
          >
            AI / ML
          </h3>
          <div class="flex flex-wrap gap-2 mt-2">
            {
              [
                "Generative AI",
                "PyTorch",
                "Langchain",
                "Agno",
                "Hugginface",
                "Finetuning",
              ].map((s) => (
                <span class="text-sm text-charcoal-warm dark:text-warm-silver bg-warm-sand dark:bg-dark-surface px-3 py-1 rounded-lg">
                  {s}
                </span>
              ))
            }
          </div>
        </div>
        <div>
          <h3
            class="text-sm font-medium text-stone-gray dark:text-warm-silver uppercase tracking-wide"
          >
            Backend
          </h3>
          <div class="flex flex-wrap gap-2 mt-2">
            {
              [
                "Python",
                "Node.js",
                "FastAPI",
                "Nginx",
                "Sqlite",
                "Websocket",
                "Redis",
              ].map((s) => (
                <span class="text-sm text-charcoal-warm dark:text-warm-silver bg-warm-sand dark:bg-dark-surface px-3 py-1 rounded-lg">
                  {s}
                </span>
              ))
            }
          </div>
        </div>
        <div>
          <h3
            class="text-sm font-medium text-stone-gray dark:text-warm-silver uppercase tracking-wide"
          >
            Frontend & Mobile
          </h3>
          <div class="flex flex-wrap gap-2 mt-2">
            {
              [
                "React",
                "Astro",
                "Tailwind CSS",
                "TypeScript",
                "Kotlin",
                "Android",
              ].map((s) => (
                <span class="text-sm text-charcoal-warm dark:text-warm-silver bg-warm-sand dark:bg-dark-surface px-3 py-1 rounded-lg">
                  {s}
                </span>
              ))
            }
          </div>
        </div>
        <div>
          <h3
            class="text-sm font-medium text-stone-gray dark:text-warm-silver uppercase tracking-wide"
          >
            Cloud & Data
          </h3>
          <div class="flex flex-wrap gap-2 mt-2">
            {
              [
                "Azure",
                "Firebase",
                "Supabase",
                "SQL",
                "Big Data",
                "Data Analysis",
              ].map((s) => (
                <span class="text-sm text-charcoal-warm dark:text-warm-silver bg-warm-sand dark:bg-dark-surface px-3 py-1 rounded-lg">
                  {s}
                </span>
              ))
            }
          </div>
        </div>
      </div>
    </section>

    {/* Education */}
    <section class="mt-16">
      <h2
        class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
        style="font-family: var(--font-serif);"
      >
        {t("about.education")}
      </h2>
      <div class="mt-8 space-y-6">
        <div>
          <h3 class="font-medium text-near-black dark:text-ivory">
            Master of Science — Computer Engineering
          </h3>
          <p class="text-sm text-olive-gray dark:text-warm-silver">
            Universidad Carlos III de Madrid &middot; 2020 – 2022
          </p>
        </div>
        <div>
          <h3 class="font-medium text-near-black dark:text-ivory">
            Bachelor's Degree — Computer Engineering
          </h3>
          <p class="text-sm text-olive-gray dark:text-warm-silver">
            Universidad Autónoma de Madrid &middot; 2015 – 2020
          </p>
        </div>
      </div>
    </section>

    {/* Awards */}
    <section class="mt-16">
      <h2
        class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
        style="font-family: var(--font-serif);"
      >
        {t("about.awards")}
      </h2>
      <ul class="mt-8 space-y-3">
        <li class="text-olive-gray dark:text-warm-silver">
          Excellence Scholarship — Comunidad de Madrid
        </li>
        <li class="text-olive-gray dark:text-warm-silver">
          First Year Academic Award
        </li>
        <li class="text-olive-gray dark:text-warm-silver">Hackathon Winners</li>
        <li class="text-olive-gray dark:text-warm-silver">
          SEDEA National Ranking 2021 — Computer Engineering Graduates
        </li>
        <li class="text-olive-gray dark:text-warm-silver">
          Master's Study Scholarship
        </li>
      </ul>
    </section>

    {/* Areas of Interest */}
    <section class="mt-16 mb-8">
      <h2
        class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
        style="font-family: var(--font-serif);"
      >
        {t("about.interests")}
      </h2>
      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3
            class="font-medium text-near-black dark:text-ivory"
            style="font-family: var(--font-serif);"
          >
            Machine Learning
          </h3>
          <p
            class="text-sm text-olive-gray dark:text-warm-silver mt-2 leading-relaxed"
          >
            From classification algorithms and neural networks to generative AI
            — always exploring how ML can transform the way we interact with
            technology.
          </p>
        </div>
        <div>
          <h3
            class="font-medium text-near-black dark:text-ivory"
            style="font-family: var(--font-serif);"
          >
            Software Development
          </h3>
          <p
            class="text-sm text-olive-gray dark:text-warm-silver mt-2 leading-relaxed"
          >
            Building solutions from scratch — web, mobile, backend, or all at
            once. Creativity and problem-solving are the driving force.
          </p>
        </div>
        <div>
          <h3
            class="font-medium text-near-black dark:text-ivory"
            style="font-family: var(--font-serif);"
          >
            Data Analysis
          </h3>
          <p
            class="text-sm text-olive-gray dark:text-warm-silver mt-2 leading-relaxed"
          >
            Exploring datasets, extracting insights, making evidence-based
            decisions. From SQL to visualization tools.
          </p>
        </div>
      </div>
    </section>
  </div>
</Layout>
```

- [ ] **Step 2: Create Spanish about page**

Create `src/pages/es/about.astro`:

```astro
---
import Layout from "../../layouts/Layout.astro";
import { useTranslations } from "../../i18n/utils";

const t = useTranslations("es");
---

<Layout title={`${t("about.title")} | Guillermo Segovia`}>
  <div class="max-w-3xl mx-auto px-5 py-16">
    {/* Hero */}
    <section>
      <h1
        class="text-4xl lg:text-5xl text-near-black dark:text-ivory"
        style="font-family: var(--font-serif);"
      >
        Guillermo Segovia
      </h1>
      <p class="text-xl text-olive-gray dark:text-warm-silver mt-3">
        Product & AI Prototyper @ Telefónica
      </p>
      <p class="text-near-black dark:text-ivory mt-6 leading-relaxed">
        Profesional IT enfocado en innovación y desarrollo digital. Construyo
        prototipos end-to-end aplicando tecnologías emergentes — desde IA
        generativa y LLMs hasta aplicaciones móviles y web — para mejorar
        productos existentes y crear nuevos.
      </p>
    </section>

    {/* Experiencia */}
    <section class="mt-16">
      <h2
        class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
        style="font-family: var(--font-serif);"
      >
        {t("about.experience")}
      </h2>
      <div
        class="mt-8 relative border-l-2 border-border-warm dark:border-border-dark pl-8 space-y-10"
      >
        <div class="relative">
          <span
            class="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full bg-terracotta dark:bg-coral border-4 border-parchment dark:border-deep-dark"
          ></span>
          <h3 class="font-medium text-near-black dark:text-ivory">
            Product & AI Prototyper
          </h3>
          <p class="text-sm text-olive-gray dark:text-warm-silver">
            Telefónica Innovación Digital &middot; Jul 2022 – Presente
          </p>
          <p
            class="text-sm text-olive-gray dark:text-warm-silver mt-2 leading-relaxed"
          >
            Prototipado end-to-end en el equipo de Future AI Lab. Construcción y
            presentación de prototipos a unidades de negocio para evaluación y
            posible paso a producción. Azure, Android, Web, IA, LLMs, Python.
          </p>
        </div>
        <div class="relative">
          <span
            class="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full bg-terracotta dark:bg-coral border-4 border-parchment dark:border-deep-dark"
          ></span>
          <h3 class="font-medium text-near-black dark:text-ivory">
            Beca Talentum AI & Full Stack
          </h3>
          <p class="text-sm text-olive-gray dark:text-warm-silver">
            Telefónica Innovación Digital &middot; Jul 2021 – Jul 2022
          </p>
          <p
            class="text-sm text-olive-gray dark:text-warm-silver mt-2 leading-relaxed"
          >
            Procesamiento NLP de documentos con Apache Solr, integración de bots
            conversacionales, investigación ML para detección de actividad de
            voz, y desarrollo frontend en React y Kotlin.
          </p>
        </div>
        <div class="relative">
          <span
            class="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full bg-terracotta dark:bg-coral border-4 border-parchment dark:border-deep-dark"
          ></span>
          <h3 class="font-medium text-near-black dark:text-ivory">
            Big Data Software Developer Intern
          </h3>
          <p class="text-sm text-olive-gray dark:text-warm-silver">
            Accenture &middot; Sep 2019 – May 2020
          </p>
          <p
            class="text-sm text-olive-gray dark:text-warm-silver mt-2 leading-relaxed"
          >
            Proyecto Big Data para una gran telco. Kafka, Flink, Flume, Quarkus,
            GraalVM, Redis.
          </p>
        </div>
      </div>
    </section>

    {/* Skills */}
    <section class="mt-16">
      <h2
        class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
        style="font-family: var(--font-serif);"
      >
        {t("about.skills")}
      </h2>
      <div class="mt-8 space-y-4">
        <div>
          <h3
            class="text-sm font-medium text-stone-gray dark:text-warm-silver uppercase tracking-wide"
          >
            AI / ML
          </h3>
          <div class="flex flex-wrap gap-2 mt-2">
            {
              [
                "Generative AI",
                "PyTorch",
                "Langchain",
                "Agno",
                "Hugginface",
                "Finetuning",
              ].map((s) => (
                <span class="text-sm text-charcoal-warm dark:text-warm-silver bg-warm-sand dark:bg-dark-surface px-3 py-1 rounded-lg">
                  {s}
                </span>
              ))
            }
          </div>
        </div>
        <div>
          <h3
            class="text-sm font-medium text-stone-gray dark:text-warm-silver uppercase tracking-wide"
          >
            Backend
          </h3>
          <div class="flex flex-wrap gap-2 mt-2">
            {
              [
                "Python",
                "Node.js",
                "FastAPI",
                "Nginx",
                "Sqlite",
                "Websocket",
                "Redis",
              ].map((s) => (
                <span class="text-sm text-charcoal-warm dark:text-warm-silver bg-warm-sand dark:bg-dark-surface px-3 py-1 rounded-lg">
                  {s}
                </span>
              ))
            }
          </div>
        </div>
        <div>
          <h3
            class="text-sm font-medium text-stone-gray dark:text-warm-silver uppercase tracking-wide"
          >
            Frontend & Mobile
          </h3>
          <div class="flex flex-wrap gap-2 mt-2">
            {
              [
                "React",
                "Astro",
                "Tailwind CSS",
                "TypeScript",
                "Kotlin",
                "Android",
              ].map((s) => (
                <span class="text-sm text-charcoal-warm dark:text-warm-silver bg-warm-sand dark:bg-dark-surface px-3 py-1 rounded-lg">
                  {s}
                </span>
              ))
            }
          </div>
        </div>
        <div>
          <h3
            class="text-sm font-medium text-stone-gray dark:text-warm-silver uppercase tracking-wide"
          >
            Cloud & Datos
          </h3>
          <div class="flex flex-wrap gap-2 mt-2">
            {
              [
                "Azure",
                "Firebase",
                "Supabase",
                "SQL",
                "Big Data",
                "Análisis de Datos",
              ].map((s) => (
                <span class="text-sm text-charcoal-warm dark:text-warm-silver bg-warm-sand dark:bg-dark-surface px-3 py-1 rounded-lg">
                  {s}
                </span>
              ))
            }
          </div>
        </div>
      </div>
    </section>

    {/* Formación */}
    <section class="mt-16">
      <h2
        class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
        style="font-family: var(--font-serif);"
      >
        {t("about.education")}
      </h2>
      <div class="mt-8 space-y-6">
        <div>
          <h3 class="font-medium text-near-black dark:text-ivory">
            Máster en Ingeniería Informática
          </h3>
          <p class="text-sm text-olive-gray dark:text-warm-silver">
            Universidad Carlos III de Madrid &middot; 2020 – 2022
          </p>
        </div>
        <div>
          <h3 class="font-medium text-near-black dark:text-ivory">
            Grado en Ingeniería Informática
          </h3>
          <p class="text-sm text-olive-gray dark:text-warm-silver">
            Universidad Autónoma de Madrid &middot; 2015 – 2020
          </p>
        </div>
      </div>
    </section>

    {/* Reconocimientos */}
    <section class="mt-16">
      <h2
        class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
        style="font-family: var(--font-serif);"
      >
        {t("about.awards")}
      </h2>
      <ul class="mt-8 space-y-3">
        <li class="text-olive-gray dark:text-warm-silver">
          Beca de Excelencia — Comunidad de Madrid
        </li>
        <li class="text-olive-gray dark:text-warm-silver">
          Premio por notas en primer año de carrera
        </li>
        <li class="text-olive-gray dark:text-warm-silver">
          Ganadores de Hackathon
        </li>
        <li class="text-olive-gray dark:text-warm-silver">
          Ranking Nacional SEDEA 2021 — Graduados en Ingeniería Informática
        </li>
        <li class="text-olive-gray dark:text-warm-silver">
          Plan de Becas de Estudio: Máster
        </li>
      </ul>
    </section>

    {/* Áreas de Interés */}
    <section class="mt-16 mb-8">
      <h2
        class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
        style="font-family: var(--font-serif);"
      >
        {t("about.interests")}
      </h2>
      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3
            class="font-medium text-near-black dark:text-ivory"
            style="font-family: var(--font-serif);"
          >
            Machine Learning
          </h3>
          <p
            class="text-sm text-olive-gray dark:text-warm-silver mt-2 leading-relaxed"
          >
            Desde algoritmos de clasificación y redes neuronales hasta IA
            generativa — siempre explorando cómo el ML puede transformar nuestra
            interacción con la tecnología.
          </p>
        </div>
        <div>
          <h3
            class="font-medium text-near-black dark:text-ivory"
            style="font-family: var(--font-serif);"
          >
            Desarrollo de Software
          </h3>
          <p
            class="text-sm text-olive-gray dark:text-warm-silver mt-2 leading-relaxed"
          >
            Construir soluciones desde cero — web, móvil, backend, o todo a la
            vez. La creatividad y la resolución de problemas son el motor.
          </p>
        </div>
        <div>
          <h3
            class="font-medium text-near-black dark:text-ivory"
            style="font-family: var(--font-serif);"
          >
            Análisis de Datos
          </h3>
          <p
            class="text-sm text-olive-gray dark:text-warm-silver mt-2 leading-relaxed"
          >
            Explorar datasets, extraer insights, tomar decisiones basadas en
            evidencia. Desde SQL hasta herramientas de visualización.
          </p>
        </div>
      </div>
    </section>
  </div>
</Layout>
```

- [ ] **Step 3: Verify build**

Run:

```bash
npm run build
```

Expected: Build succeeds. `/about` and `/es/about` render.

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro src/pages/es/about.astro
git commit -m "feat: add about page with CV content (EN + ES)"
```

---

## Task 11: Redesign Home page (EN + ES)

**Files:**

- Modify: `src/pages/index.astro` — complete rewrite with hero + featured projects + latest post
- Modify: `src/pages/es/index.astro` — Spanish version

- [ ] **Step 1: Rewrite English home page**

Replace the entire contents of `src/pages/index.astro` with:

```astro
---
import Layout from "../layouts/Layout.astro";
import ProjectCard from "../components/ProjectCard.astro";
import { useTranslations, getFormattedPosts } from "../i18n/utils";
import { getFeaturedProjects } from "../i18n/utils";

const lang = "en";
const t = useTranslations(lang);
const featuredProjects = await getFeaturedProjects(lang);
const latestPosts = (await getFormattedPosts(lang)).slice(0, 2);
---

<Layout
  title="Guillermo Segovia | Product & AI Prototyper"
  description="Guillermo Segovia - Product & AI Prototyper at Telefónica. Building AI prototypes that bridge innovation and product."
>
  <div class="max-w-3xl mx-auto px-5 py-16">
    {/* Hero */}
    <section>
      <h1
        class="text-4xl lg:text-6xl text-near-black dark:text-ivory leading-tight"
        style="font-family: var(--font-serif);"
      >
        Guillermo Segovia
      </h1>
      <p class="text-xl text-olive-gray dark:text-warm-silver mt-4">
        Product & AI Prototyper @ Telefónica
      </p>
      <p
        class="text-lg text-olive-gray dark:text-warm-silver mt-4 leading-relaxed"
      >
        {t("home.tagline")}
      </p>
      <a
        href="/about"
        class="inline-block mt-6 px-6 py-3 bg-terracotta dark:bg-coral text-ivory rounded-xl font-medium hover:opacity-90 transition-opacity"
      >
        {t("home.cta")}
      </a>
    </section>

    {/* Featured Projects */}
    {
      featuredProjects.length > 0 && (
        <section class="mt-20">
          <h2
            class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
            style="font-family: var(--font-serif);"
          >
            {t("projects.latest")}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {featuredProjects.slice(0, 3).map((project) => (
              <ProjectCard
                title={project.data.title}
                description={project.data.description}
                tags={project.data.tags}
                github={project.data.github}
                web={project.data.web}
              />
            ))}
          </div>
          <a
            href="/projects"
            class="inline-block mt-6 text-terracotta dark:text-coral hover:underline font-medium"
          >
            {t("home.moreProjects")} →
          </a>
        </section>
      )
    }

    {/* Latest Posts */}
    {
      latestPosts.length > 0 && (
        <section class="mt-20 mb-8">
          <h2
            class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
            style="font-family: var(--font-serif);"
          >
            {t("home.latestPosts")}
          </h2>
          <div class="mt-8 space-y-6">
            {latestPosts.map((post) => (
              <a href={post.url} class="block group">
                <article class="py-4 border-b border-border-cream dark:border-border-dark">
                  <h3
                    class="text-lg text-near-black dark:text-ivory group-hover:text-terracotta dark:group-hover:text-coral transition-colors"
                    style="font-family: var(--font-serif);"
                  >
                    {post.frontmatter.title}
                  </h3>
                  <div class="flex items-center gap-3 mt-2">
                    <span class="text-sm text-stone-gray dark:text-warm-silver">
                      {post.frontmatter.pubDate}
                    </span>
                    <div class="flex gap-1.5">
                      {post.frontmatter.tags.map((tag) => (
                        <span class="text-xs text-stone-gray dark:text-warm-silver bg-warm-sand dark:bg-dark-surface px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </a>
            ))}
          </div>
          <a
            href="/blog"
            class="inline-block mt-6 text-terracotta dark:text-coral hover:underline font-medium"
          >
            {t("home.morePosts")} →
          </a>
        </section>
      )
    }
  </div>
</Layout>
```

- [ ] **Step 2: Rewrite Spanish home page**

Replace the entire contents of `src/pages/es/index.astro` with:

```astro
---
import Layout from "../../layouts/Layout.astro";
import ProjectCard from "../../components/ProjectCard.astro";
import { useTranslations, getFormattedPosts } from "../../i18n/utils";
import { getFeaturedProjects } from "../../i18n/utils";

const lang = "es";
const t = useTranslations(lang);
const featuredProjects = await getFeaturedProjects(lang);
const latestPosts = (await getFormattedPosts(lang)).slice(0, 2);
---

<Layout
  title="Guillermo Segovia | Product & AI Prototyper"
  description="Guillermo Segovia - Product & AI Prototyper en Telefónica. Creando prototipos de IA que conectan innovación y producto."
>
  <div class="max-w-3xl mx-auto px-5 py-16">
    {/* Hero */}
    <section>
      <h1
        class="text-4xl lg:text-6xl text-near-black dark:text-ivory leading-tight"
        style="font-family: var(--font-serif);"
      >
        Guillermo Segovia
      </h1>
      <p class="text-xl text-olive-gray dark:text-warm-silver mt-4">
        Product & AI Prototyper @ Telefónica
      </p>
      <p
        class="text-lg text-olive-gray dark:text-warm-silver mt-4 leading-relaxed"
      >
        {t("home.tagline")}
      </p>
      <a
        href="/es/about"
        class="inline-block mt-6 px-6 py-3 bg-terracotta dark:bg-coral text-ivory rounded-xl font-medium hover:opacity-90 transition-opacity"
      >
        {t("home.cta")}
      </a>
    </section>

    {/* Featured Projects */}
    {
      featuredProjects.length > 0 && (
        <section class="mt-20">
          <h2
            class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
            style="font-family: var(--font-serif);"
          >
            {t("projects.latest")}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {featuredProjects.slice(0, 3).map((project) => (
              <ProjectCard
                title={project.data.title}
                description={project.data.description}
                tags={project.data.tags}
                github={project.data.github}
                web={project.data.web}
              />
            ))}
          </div>
          <a
            href="/es/projects"
            class="inline-block mt-6 text-terracotta dark:text-coral hover:underline font-medium"
          >
            {t("home.moreProjects")} →
          </a>
        </section>
      )
    }

    {/* Latest Posts */}
    {
      latestPosts.length > 0 && (
        <section class="mt-20 mb-8">
          <h2
            class="text-2xl lg:text-3xl text-near-black dark:text-ivory"
            style="font-family: var(--font-serif);"
          >
            {t("home.latestPosts")}
          </h2>
          <div class="mt-8 space-y-6">
            {latestPosts.map((post) => (
              <a href={post.url} class="block group">
                <article class="py-4 border-b border-border-cream dark:border-border-dark">
                  <h3
                    class="text-lg text-near-black dark:text-ivory group-hover:text-terracotta dark:group-hover:text-coral transition-colors"
                    style="font-family: var(--font-serif);"
                  >
                    {post.frontmatter.title}
                  </h3>
                  <div class="flex items-center gap-3 mt-2">
                    <span class="text-sm text-stone-gray dark:text-warm-silver">
                      {post.frontmatter.pubDate}
                    </span>
                    <div class="flex gap-1.5">
                      {post.frontmatter.tags.map((tag) => (
                        <span class="text-xs text-stone-gray dark:text-warm-silver bg-warm-sand dark:bg-dark-surface px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </a>
            ))}
          </div>
          <a
            href="/es/blog"
            class="inline-block mt-6 text-terracotta dark:text-coral hover:underline font-medium"
          >
            {t("home.morePosts")} →
          </a>
        </section>
      )
    }
  </div>
</Layout>
```

- [ ] **Step 3: Verify build**

Run:

```bash
npm run build
```

Expected: Build succeeds. Home pages render with hero, featured projects, and latest posts.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/es/index.astro
git commit -m "feat: redesign home with hero, featured projects, and latest posts"
```

---

## Task 12: Restyle Blog — PostList and PostLayout

**Files:**

- Modify: `src/components/PostList.astro` — warm palette, serif titles
- Modify: `src/layouts/PostLayout.astro` — warm palette, serif title, terracotta tags
- Modify: `src/styles/post.css` — update to warm colors, serif headings, terracotta accents

- [ ] **Step 1: Restyle PostList.astro**

Replace the entire contents of `src/components/PostList.astro` with:

```astro
---
import { getLangFromUrl, useTranslations } from "../i18n/utils";
import type { FormattedPost } from "../i18n/utils";
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);

interface Props {
  posts: FormattedPost[];
}

const { posts } = Astro.props;
---

<div class="max-w-3xl mx-auto px-5 py-16">
  <h1
    class="text-4xl lg:text-5xl text-near-black dark:text-ivory"
    style="font-family: var(--font-serif);"
  >
    {t("blog.title")}
  </h1>
  <div class="mt-12 space-y-2">
    {
      posts.map((post) => (
        <a href={post.url} class="block group">
          <article class="py-4 border-b border-border-cream dark:border-border-dark">
            <h2
              class="text-lg text-near-black dark:text-ivory group-hover:text-terracotta dark:group-hover:text-coral transition-colors"
              style="font-family: var(--font-serif);"
            >
              {post.frontmatter.title}
            </h2>
            <div class="flex flex-wrap items-center gap-3 mt-2">
              <span class="text-sm text-stone-gray dark:text-warm-silver">
                {post.frontmatter.pubDate}
              </span>
              <div class="flex flex-wrap gap-1.5">
                {post.frontmatter.tags.map((tag) => (
                  <span class="text-xs text-stone-gray dark:text-warm-silver bg-warm-sand dark:bg-dark-surface px-2 py-0.5 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </a>
      ))
    }
  </div>
</div>
```

- [ ] **Step 2: Restyle PostLayout.astro**

Replace the entire contents of `src/layouts/PostLayout.astro` with:

```astro
---
import Layout from "./Layout.astro";
import "../styles/post.css";
import type { CollectionEntry } from "astro:content";

import {
  getLangFromUrl,
  useTranslations,
  getAlternatePath,
} from "../i18n/utils";

interface Props {
  frontmatter: CollectionEntry<"blog">["data"];
  translations?: Record<string, string>;
}

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);

const { frontmatter, translations } = Astro.props;
const subtitle =
  t("post.by") +
  " " +
  frontmatter.author +
  " " +
  t("post.on") +
  " " +
  frontmatter.pubDate;

const canonicalPath = getAlternatePath(Astro.url.pathname, lang, translations);
const canonicalUrl = new URL(canonicalPath, Astro.site);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: frontmatter.title,
  author: {
    "@type": "Person",
    name: frontmatter.author,
  },
  datePublished: frontmatter.pubDateLogical,
  url: canonicalUrl.href,
  inLanguage: lang,
  keywords: frontmatter.tags,
};
---

<Layout
  title={`${frontmatter.title} | Guillermo Segovia`}
  description={frontmatter.title}
  translations={translations}
  ogType="article"
  article={{
    author: frontmatter.author,
    publishedTime: frontmatter.pubDateLogical,
    tags: frontmatter.tags,
  }}
>
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
  <div class="max-w-3xl mx-auto px-5 py-16">
    <h1
      class="text-3xl lg:text-4xl text-near-black dark:text-ivory leading-tight"
      style="font-family: var(--font-serif);"
    >
      {frontmatter.title}
    </h1>
    <p class="text-sm text-stone-gray dark:text-warm-silver mt-3">{subtitle}</p>
    <div class="flex flex-wrap gap-1.5 mt-4">
      {
        frontmatter.tags.map((tag) => (
          <span class="text-xs text-stone-gray dark:text-warm-silver bg-warm-sand dark:bg-dark-surface px-2.5 py-1 rounded-lg">
            {tag}
          </span>
        ))
      }
    </div>
    <hr class="border-border-warm dark:border-border-dark my-8" />
    <div class="post-content space-y-5">
      <slot />
    </div>
  </div>
</Layout>
```

- [ ] **Step 3: Update post.css with warm palette**

Replace the entire contents of `src/styles/post.css` with:

```css
.post-content h1,
.post-content h2,
.post-content h3,
.post-content h4,
.post-content h5,
.post-content h6 {
  font-family: var(--font-serif);
  font-weight: 700;
}
.post-content h1 {
  font-size: 2.25rem;
  line-height: 1.2;
}
.post-content h2 {
  font-size: 1.875rem;
  line-height: 1.2;
}
.post-content h3 {
  font-size: 1.5rem;
  line-height: 1.3;
}
.post-content h4 {
  font-size: 1.25rem;
  line-height: 1.3;
}
.post-content h5 {
  font-size: 1.125rem;
  line-height: 1.4;
}
.post-content h6 {
  font-size: 1rem;
  line-height: 1.4;
}
.post-content p {
  font-size: 1rem;
  line-height: 1.6;
}
.post-content ul {
  list-style-type: disc;
  list-style-position: inside;
}
.post-content ol {
  list-style-type: decimal;
  list-style-position: inside;
}
.post-content li {
  font-size: 1rem;
  line-height: 1.6;
}
.post-content a {
  text-decoration: underline;
  text-decoration-color: var(--color-terracotta);
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
}
.post-content a:hover {
  color: var(--color-terracotta);
}
:root.dark .post-content a {
  text-decoration-color: var(--color-coral);
}
:root.dark .post-content a:hover {
  color: var(--color-coral);
}
.post-content blockquote {
  border-left-width: 4px;
  border-color: var(--color-terracotta);
  padding-left: 1rem;
}
:root.dark .post-content blockquote {
  border-color: var(--color-coral);
}
.post-content pre {
  overflow-x: auto;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: var(--color-dark-surface);
  color: var(--color-ivory);
}
.post-content code {
  font-family: var(--font-mono);
  font-size: 0.9375rem;
  line-height: 1.6;
}
.post-content table {
  width: 100%;
  border-collapse: collapse;
}
.post-content table th {
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 700;
  border: 1px solid var(--color-border-warm);
  padding: 0.5rem;
}
:root.dark .post-content table th {
  border-color: var(--color-border-dark);
}
.post-content table td {
  font-size: 1rem;
  line-height: 1.5;
  border: 1px solid var(--color-border-warm);
  padding: 0.5rem;
}
:root.dark .post-content table td {
  border-color: var(--color-border-dark);
}
.post-content img {
  margin-left: auto;
  margin-right: auto;
  border-radius: 0.75rem;
}
.post-content hr {
  border-color: var(--color-border-warm);
  margin-top: 1rem;
  margin-bottom: 1rem;
}
:root.dark .post-content hr {
  border-color: var(--color-border-dark);
}
.post-content mark {
  background-color: var(--color-terracotta);
  color: var(--color-ivory);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}
```

- [ ] **Step 4: Verify build**

Run:

```bash
npm run build
```

Expected: Build succeeds. Blog pages render with warm palette.

- [ ] **Step 5: Commit**

```bash
git add src/components/PostList.astro src/layouts/PostLayout.astro src/styles/post.css
git commit -m "feat: restyle blog list and post layout with warm editorial palette"
```

---

## Task 13: Redesign 404 page

**Files:**

- Modify: `src/pages/404.astro` — minimal serif design, remove GIF

- [ ] **Step 1: Replace 404.astro**

Replace the entire contents of `src/pages/404.astro` with:

```astro
---
import Layout from "../layouts/Layout.astro";
import { getLangFromUrl, useTranslations } from "../i18n/utils";

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
---

<Layout title="404">
  <div class="flex flex-col items-center justify-center min-h-[60vh] px-5">
    <h1
      class="text-8xl lg:text-9xl text-near-black dark:text-ivory"
      style="font-family: var(--font-serif);"
    >
      404
    </h1>
    <p class="text-xl text-olive-gray dark:text-warm-silver mt-4">
      {t("404.title")}
    </p>
    <a
      href={lang === "en" ? "/" : `/${lang}`}
      class="mt-8 px-6 py-3 bg-terracotta dark:bg-coral text-ivory rounded-xl font-medium hover:opacity-90 transition-opacity"
    >
      {t("404.button")}
    </a>
  </div>
</Layout>
```

- [ ] **Step 2: Verify build**

Run:

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: redesign 404 with minimal serif layout"
```

---

## Task 14: Clean up unused assets and run linting

**Files:**

- Modify: `package.json` — remove `@fontsource/roboto` dependency
- Delete: `public/images/lost.gif` (if still exists — was used by old 404)

- [ ] **Step 1: Remove Roboto dependency**

Run:

```bash
npm uninstall @fontsource/roboto
```

- [ ] **Step 2: Delete lost.gif if it exists**

Run:

```bash
rm -f public/images/lost.gif
```

- [ ] **Step 3: Run lint and format**

Run:

```bash
npm run lint
npm run format
```

Fix any lint/format errors that appear.

- [ ] **Step 4: Full build verification**

Run:

```bash
npm run build
```

Expected: Clean build, no warnings related to missing fonts or assets.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Roboto font, clean up unused assets, fix lint"
```

---

## Task 15: Visual QA — dev server walkthrough

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev
```

- [ ] **Step 2: Check every page in both languages and both themes**

Verify each page loads and looks correct:

| Page      | EN URL             | ES URL                |
| --------- | ------------------ | --------------------- |
| Home      | `/`                | `/es/`                |
| Blog      | `/blog`            | `/es/blog`            |
| Blog post | `/blog/<any-slug>` | `/es/blog/<any-slug>` |
| Projects  | `/projects`        | `/es/projects`        |
| About     | `/about`           | `/es/about`           |
| 404       | `/nonexistent`     | `/es/nonexistent`     |

For each page check:

- Light mode: Parchment background, warm text colors, terracotta accents
- Dark mode: Deep Dark background, ivory text, coral accents
- Mobile viewport (~375px): two-row header, stacked layouts, readable text
- Desktop viewport (~1200px): single-row header with wordmark, grids render
- Language switcher works between EN/ES
- Dark mode toggle persists on navigation
- Nav underlines show on active page

- [ ] **Step 3: Fix any visual issues found**

Address any issues: color inconsistencies, spacing problems, broken layouts, missing hover states.

- [ ] **Step 4: Final commit if fixes were needed**

```bash
git add -A
git commit -m "fix: visual QA adjustments"
```
