# Dependency Hygiene: Icons and Fonts Migration

## Summary

Migrate manually-copied FontAwesome and Roboto files from `public/` to npm-managed packages (`astro-icon` + Iconify, `@fontsource/roboto`). Remove the Twitter social link from the footer. Update project documentation and remove the completed section from `docs/5-improvements.md`.

## Goals

- Replace hand-copied assets with npm-managed packages for versioning, smaller bundles, and automated updates
- Preserve the self-hosting principle (no CDN requests at runtime)
- Improve accessibility: inline SVG icons with proper `aria-label`/`aria-hidden` attributes
- Reduce bundle size: `.woff2` instead of `.ttf`, tree-shaken icons instead of full CSS+webfont sets
- Remove the Twitter link, keeping only GitHub and LinkedIn in the footer

## Non-goals

- Changing the visual design of icons or fonts
- Adding new icons or font weights beyond what currently exists
- Migrating other sections of `docs/5-improvements.md` (only the Urgent section)

## Architecture

### Icon migration (`astro-icon`)

**New dependencies:** `astro-icon`, `@iconify-json/fa6-brands`, `@iconify-json/fa6-solid`

**Files modified:**

| File                            | Change                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `astro.config.mjs`              | Import and register `icon()` integration                                                                                                                     |
| `src/components/Footer.astro`   | Import `Icon` from `astro-icon/components`. Remove Twitter link block. Replace 2 remaining `<i class="fa-*">` with `<Icon>` components using `aria-label`    |
| `src/components/PostList.astro` | Import `Icon` from `astro-icon/components`. Replace `<span class="fa-solid fa-angles-right">` with `<Icon name="fa6-solid:angles-right" aria-hidden="true">` |
| `src/layouts/Layout.astro`      | Remove the 4 FontAwesome `<link>` tags                                                                                                                       |

**Files deleted:** `public/fontawesome/` (entire directory, ~700 KB)

**Icon mapping:**

| Old                        | New                      | Component      |
| -------------------------- | ------------------------ | -------------- |
| `fa-brands fa-github`      | `fa6-brands:github`      | Footer.astro   |
| `fa-brands fa-linkedin-in` | `fa6-brands:linkedin-in` | Footer.astro   |
| `fa-solid fa-angles-right` | `fa6-solid:angles-right` | PostList.astro |
| `fa-brands fa-twitter`     | _(removed)_              | Footer.astro   |

### Font migration (`@fontsource/roboto`)

**New dependency:** `@fontsource/roboto`

**Files modified:**

| File                    | Change                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/styles/global.css` | Remove 4 `@font-face` blocks. Add `@import "@fontsource/roboto/{300,400,500,700}.css"`. Keep `body { font-family: "Roboto", sans-serif; }` |

**Files deleted:** `public/fonts/` (4 `.ttf` files, ~700 KB)

### Documentation updates

| File                         | Change                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `docs/3-design-decisions.md` | Update "Self-hosted fonts and icons" section: assets now managed via npm. Add note about Twitter link removal |
| `docs/1-tech-stack.md`       | Add new dependencies to Runtime table. Update "Assets (self-hosted)" section to reflect npm management        |
| `docs/5-improvements.md`     | Remove the entire "Urgent (dependency hygiene)" section (lines 6-143)                                         |

## Verification

After migration, the following command must return zero results:

```bash
grep -rn "fa-\|fontawesome\|fonts/Roboto\|/fonts/" src/ public/
```

Additionally:

- `npm run build` must succeed
- `npm run dev` must show icons rendering correctly and fonts loading
- No requests to `/fonts/` or `/fontawesome/` paths in the built output
