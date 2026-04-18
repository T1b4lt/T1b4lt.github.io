# ESLint + Prettier + TypeScript Strict Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add automated code quality tooling (ESLint, Prettier, TypeScript strict mode) and a CI lint gate to the Astro blog.

**Architecture:** Install ESLint with the Astro plugin and TypeScript support via `typescript-eslint`. Install Prettier with the Astro plugin. Enable TypeScript strict mode and fix any resulting errors. Add a lint job to the GitHub Actions workflow that runs before the existing build+deploy jobs. All config uses flat config format (ESLint v9+).

**Tech Stack:** ESLint v9+ (flat config), eslint-plugin-astro, typescript-eslint, Prettier, prettier-plugin-astro, TypeScript strict mode.

---

### Task 1: Install ESLint with Astro and TypeScript support

**Files:**

- Modify: `package.json`
- Create: `eslint.config.mjs`

- [ ] **Step 1: Install ESLint dependencies**

Run:

```bash
npm install -D eslint @eslint/js eslint-plugin-astro typescript-eslint
```

Expected: packages added to `devDependencies` in `package.json`.

- [ ] **Step 2: Create ESLint flat config**

Create `eslint.config.mjs`:

```javascript
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    ignores: ["dist/", ".astro/", "node_modules/"],
  },
];
```

- [ ] **Step 3: Add lint script to package.json**

Add to `"scripts"`:

```json
"lint": "eslint ."
```

- [ ] **Step 4: Run ESLint and fix any errors**

Run:

```bash
npm run lint
```

Expected: either clean output or a list of warnings/errors. Fix any real errors. Common expected issues:

- `no-unused-vars` on underscore-prefixed params (e.g., `_currentLang` in `src/i18n/utils.ts:46`) — these are already handled by `typescript-eslint` which ignores `_`-prefixed vars by default.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json eslint.config.mjs
git commit -m "feat: add ESLint with Astro and TypeScript support"
```

---

### Task 2: Install Prettier with Astro support

**Files:**

- Modify: `package.json`
- Create: `.prettierrc.mjs`
- Create: `.prettierignore`

- [ ] **Step 1: Install Prettier dependencies**

Run:

```bash
npm install -D prettier prettier-plugin-astro
```

- [ ] **Step 2: Create Prettier config**

Create `.prettierrc.mjs`:

```javascript
export default {
  plugins: ["prettier-plugin-astro"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
```

- [ ] **Step 3: Create .prettierignore**

Create `.prettierignore`:

```
dist/
.astro/
node_modules/
package-lock.json
```

- [ ] **Step 4: Add format scripts to package.json**

Add to `"scripts"`:

```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

- [ ] **Step 5: Run format check to see current state**

Run:

```bash
npm run format:check
```

Expected: some files will likely not match Prettier's formatting. This is expected — we will format them in the next step.

- [ ] **Step 6: Run formatter on entire codebase**

Run:

```bash
npm run format
```

Expected: files reformatted. Review the diff with `git diff` to ensure no unintended changes.

- [ ] **Step 7: Install eslint-config-prettier to avoid ESLint/Prettier conflicts**

Run:

```bash
npm install -D eslint-config-prettier
```

Then update `eslint.config.mjs` to add it as the last config entry:

```javascript
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  prettier,
  {
    ignores: ["dist/", ".astro/", "node_modules/"],
  },
];
```

- [ ] **Step 8: Verify lint still passes after Prettier integration**

Run:

```bash
npm run lint
```

Expected: clean output (no ESLint rules conflicting with Prettier formatting).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json .prettierrc.mjs .prettierignore eslint.config.mjs src/ astro.config.mjs
git commit -m "feat: add Prettier with Astro plugin and format codebase"
```

---

### Task 3: Enable TypeScript strict mode and fix errors

**Files:**

- Modify: `tsconfig.json`
- Possibly modify: `src/i18n/utils.ts`, `src/pages/404.astro`, `src/layouts/PostLayout.astro`, other `.astro` files

- [ ] **Step 1: Enable strict mode in tsconfig.json**

Change `tsconfig.json` to:

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

This switches from `astro/tsconfigs/base` to `astro/tsconfigs/strict`, which enables `strict: true` and related TypeScript options. This is the Astro-recommended way to enable strict mode.

- [ ] **Step 2: Run type checking to find errors**

Run:

```bash
npx astro check
```

Expected: this will report TypeScript errors across `.astro` and `.ts` files. Common expected issues:

1. **`src/layouts/PostLayout.astro`** — `Astro.props` is untyped (no `Props` interface). `frontmatter` and `translations` will be `any`. Fix by adding a `Props` interface.
2. **`src/pages/404.astro`** — importing from `../../public/images/lost.gif` may need type attention.
3. **Possible `string | undefined` issues** in various places where strict null checks are now enforced.

- [ ] **Step 3: Fix PostLayout.astro — add Props interface**

In `src/layouts/PostLayout.astro`, the frontmatter section currently has:

```typescript
const { frontmatter, translations } = Astro.props;
```

Add a `Props` interface before this line:

```typescript
import type { CollectionEntry } from "astro:content";

interface Props {
  frontmatter: CollectionEntry<"blog">["data"];
  translations?: Record<string, string>;
}
```

- [ ] **Step 4: Fix any remaining type errors found by astro check**

Run `npx astro check` again and fix each error. For each fix:

- Prefer adding type annotations over using `as` casts.
- Prefer narrowing (null checks, type guards) over `!` assertions.

- [ ] **Step 5: Run full verification**

Run:

```bash
npx astro check && npm run lint && npm run build
```

Expected: all three commands pass cleanly.

- [ ] **Step 6: Commit**

```bash
git add tsconfig.json src/
git commit -m "feat: enable TypeScript strict mode and fix type errors"
```

---

### Task 4: Add CI lint gate to GitHub Actions

**Files:**

- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Add a lint job that runs before build**

Modify `.github/workflows/deploy.yml` to add a `lint` job before the `build` job. The `build` job should depend on `lint` passing.

Replace the full file content with:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v6
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Check formatting
        run: npm run format:check
      - name: Lint
        run: npm run lint
      - name: Type check
        run: npx astro check

  build:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v6
      - name: Install, build, and upload your site
        uses: withastro/action@v6

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Install @astrojs/check for CI type checking**

The `astro check` command requires `@astrojs/check`:

Run:

```bash
npm install -D @astrojs/check
```

- [ ] **Step 3: Verify all scripts work locally**

Run:

```bash
npm run format:check && npm run lint && npx astro check && npm run build
```

Expected: all four pass cleanly. This mirrors what CI will run.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml package.json package-lock.json
git commit -m "feat: add CI lint gate with format check, ESLint, and type checking"
```

---

### Task 5: Final verification and cleanup

- [ ] **Step 1: Run the full CI-equivalent pipeline locally**

Run:

```bash
npm run format:check && npm run lint && npx astro check && npm run build
```

Expected: all pass cleanly.

- [ ] **Step 2: Verify the dev server starts correctly**

Run:

```bash
npm run dev
```

Expected: dev server starts at `localhost:4321` without errors. Visit the site and verify pages load correctly.

- [ ] **Step 3: Review all scripts in package.json**

Final `scripts` section should be:

```json
{
  "dev": "astro dev",
  "start": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "lint": "eslint .",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```
