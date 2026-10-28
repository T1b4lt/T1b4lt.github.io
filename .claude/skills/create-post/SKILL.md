---
name: create-post
description: Create a new bilingual (ES/EN) blog post from a topic given by the user. Researches the topic, proposes an angle, plans visuals, links related talks, writes both language versions in the author's voice (voice.md), and verifies the build. Use when the user wants to write, draft, or publish a new blog post.
argument-hint: "[topic]"
---

# create-post

Turn a topic into a published-ready blog post in Spanish and English, written in the author's voice. The process is collaborative: at every checkpoint, show what you found, give a recommendation, and wait for the user to accept or adjust before moving on. Never skip a checkpoint silently.

Talk to the user in Spanish. Code, file names, and SVG internals stay in English.

## References

- `voice.md` (next to this file): tone, positions, vocabulary, and off-limits topics. **Read it before writing anything and apply it to both languages.**
- `docs/4-content-authoring.md`: frontmatter, slugs, `idx`, scheduling, images.
- `src/content.config.ts`: the authoritative frontmatter schema.
- The most recent posts in `src/content/blog/{es,en}/`: the real reference for structure, length, and tone.

## Workflow

### 1. Load context

Before talking to the user, gather silently:

- Read `voice.md` and the two most recent posts (by `idx`) in both languages.
- List existing posts: `idx`, title, tags, `pubDateLogical`. Compute the next `idx` (highest + 1).
- List the existing tag vocabulary per language, to reuse tags instead of inventing near-duplicates.
- List the talks in `src/content/talks/*.md` (title, description, tags) and their decks in `public/talks/<slug>/`.

### 2. Topic intake — checkpoint

If the topic was passed as an argument, use it; otherwise ask for it. Then confirm with the user (one `AskUserQuestion` call, only for what is unclear):

- **Type of post:** explainer / "101" (technical concept for non-technical readers), analysis or opinion (impact on society, economy, geopolitics), news commentary, or written version of a talk.
- **Depth and length:** short (~800 words), medium (~1,500), long (~2,500+). Recent "101" posts run long.
- **Source material** the user already has: links, notes, papers, a talk.
- **Publication date:** always ask which date the user wants the post published on (offer today as the default, or a future date to schedule it). Never assume it. It is confirmed again in step 7.

Check `voice.md → Off limits`. If the topic touches anything listed there, stop and raise it.

### 3. Related content — checkpoint

Look for overlap with existing material and report it with a recommendation:

- **Talks:** match the topic against talk titles, descriptions, tags, and the deck content in `public/talks/<slug>/index.html`. If one is related, propose one of:
  - Making the post "the written version of the talk" (as in `modelos-de-decision-101.md`): mention it in the intro and in "Para seguir leyendo".
  - Just linking to it where relevant.
  - Reusing images from the deck (`/talks/<slug>/assets/img/...`).
  - Talks are Spanish-only: in the EN post add "(slides in Spanish)" after the link.
- **Previous posts:** propose internal links (`/es/blog/<slug>` and `/blog/<slug>`) where they add context. If a previous post already covers the topic, say so and ask whether the new post should be a follow-up, a deeper dive, or a different angle.

### 4. Research

Build an evidence base. The voice relies on data and evidence, so this step is not optional.

- If a related talk exists, extract its content from the deck HTML first: it is the author's own framing.
- Use `WebSearch` (send several queries in one turn) and `WebFetch` for primary sources: official docs, papers, announcements, official statistics, reputable press. Prefer primary over secondary sources.
- For each key claim keep: the fact, the figure, the date, and the source URL. Flag claims that come only from the interested party (e.g. a vendor's own benchmarks) or that you could not verify.
- Note the dates: the post must be accurate as of today, so look for the latest state of the topic.
- Look for the angles that connect with `voice.md → My positions` (geopolitics, society, economy, regulation).

Keep the research notes in the scratchpad directory, not in the repo.

### 5. Research summary and angle — checkpoint

Present to the user:

- A short summary of the key findings (bullets, each with its source).
- Gaps or contradictions in the sources, and any unverified claims.
- **2–3 possible angles** for the post, each with a one-line thesis and which `voice.md` position it connects to. Mark your recommendation.
- 2–3 candidate titles per angle (Spanish), in the style of previous posts (e.g. `"Concepto: subtítulo explicativo"`).

Wait for the user to pick the angle and title (or propose their own).

### 6. Outline and visuals plan — checkpoint

Propose the structure, modeled on recent posts:

- Hook: a concrete example or situation that makes the problem tangible.
- What the post covers (and the talk link, if any).
- Body sections (`##` headings), each with its key idea and supporting data.
- `## Conclusión` with the 2–3 ideas to remember, and the author's own take.
- Optionally `## Para seguir leyendo` / `## Further reading` with recommended extra material.
- **Always last:** `## Referencias` / `## References`, listing every source used to write the post (see step 8).

For each section, recommend the supporting elements and let the user accept or discard each one:

- **SVG diagrams** for mechanisms, architectures, comparisons, or trade-offs (see conventions below).
- **Tables** for timelines or comparisons of several items.
- **Code blocks** when the audience benefits from seeing an API or an example.
- **Images** reused from a talk deck, or provided by the user (ask for them; do not use third-party images without a clear license).
- **`<mark>`** to highlight a single key sentence, sparingly.

Also ask whether the user wants visuals at all; some opinion posts work better as text only.

### 7. Metadata — checkpoint

Propose and confirm:

- `idx`: the next value from step 1 (same in both languages).
- Slugs: Spanish slug for ES, English slug for EN. Short, kebab-case, no accents, usually different between languages.
- `tags`: 3–5, reusing the existing vocabulary, localized per language (`IA` / `AI`).
- `author`: `"Guillermo Segovia"` (the name in `voice.md`, same as every existing post).
- Publication date: the one the user gave in step 2 (confirm it). If it is in the future, remind the user that the post appears in listings on that date without a rebuild, but its page is reachable by direct URL from the moment it is deployed (see `docs/4-content-authoring.md → Scheduling`).
  - `pubDate` ES: `"28 de octubre de 2026"`. EN: `"October 28th, 2026"`.
  - `pubDateLogical`: `"2026-10-28"` in both.

### 8. Write the Spanish version

Write `src/content/blog/es/<spanish-slug>.md` following the approved outline and `voice.md`:

- Divulgative, never condescending. Explain technical concepts so a non-technical reader can follow, and give enough context to ground every opinion.
- Back every claim with data and its source. Present opinions as the author's own observation.
- No emoji, no slang, no sensationalism. Correct Spanish spelling with all accents.
- Keep technical terms in English in italics when there is no established Spanish term (_embeddings_, _head_).
- Image alt text must describe what the image shows, in the post's language.
- End the post with a mandatory `## Referencias` section, always the last section. It lists every source consulted and used in the post (from the step 4 notes), one bullet each as `- [Source · Title](url)`, including the related talk if one was used. No source cited in the text may be missing from it.

Then show the user a short summary (structure, word count, the main thesis) and ask for review before translating. Apply their feedback.

### 9. Write the English version

Write `src/content/blog/en/<english-slug>.md` as an **adaptation, not a literal translation**: same structure, sections, images, and links, but natural English. Adapt idioms and examples where the Spanish one does not travel. Use the English internal links (`/blog/<slug>`), and the same SVGs (they are shared between languages). The last section is `## References`, with the same sources as the Spanish `## Referencias`.

### 10. Create the visuals

For each approved SVG, write `public/images/blog/<topic>-<what-it-shows>.svg`, following the existing ones (open one in `public/images/blog/` before starting):

- Hand-written SVG with a `viewBox` (around 900 wide), no external fonts or scripts.
- Dark background `#1a1a2e` with `rx="16"`, title in `#e2e8f0`, secondary text in `#94a3b8`, grid in `#334155`, `font-family="system-ui, -apple-system, sans-serif"`.
- Text labels in English (the SVG is shared by both posts); keep text minimal so it works for both audiences.
- One idea per diagram. If the data comes from a source, the numbers must match it.

Reference them from both posts as `![alt text](/images/blog/<file>.svg)`.

### 11. Self-review

Before showing the result, check both files:

- [ ] Frontmatter matches the schema, same `idx` in both, valid `pubDateLogical`.
- [ ] Tone follows `voice.md`: no emoji, no slang, no forbidden topics, positions argued with data.
- [ ] Every figure and date has a source; nothing invented. Unverified claims are flagged as such in the text.
- [ ] `## Referencias` / `## References` is the last section in both versions and lists every source used.
- [ ] `pubDate` and `pubDateLogical` match the publication date the user chose.
- [ ] Both versions have the same sections, images, and links.
- [ ] Internal links point to existing routes (`/talks/<slug>/`, `/blog/<slug>`, `/es/blog/<slug>`).
- [ ] Every image path exists under `public/`.
- [ ] Spanish spelling and accents are correct.

### 12. Verify

Run the CI gate (see `AGENTS.md`):

```bash
npm run format && npm run lint && npm run format:check && npx astro check && npm run build
```

Fix any failure and rerun. Offer to start `npm run dev` so the user can review `/es/blog/<spanish-slug>` and `/blog/<english-slug>` in the browser.

### 13. Wrap up — checkpoint

Report the created files, the publication date (and whether it is scheduled), and the sources used. Then offer, without doing them unasked:

- Committing on a new branch (`feat: add <topic> blog post`) and opening a PR.
- A short teaser in Spanish and English to share the post on social media (LinkedIn style, same voice, no emoji), with the post URLs: `https://t1b4lt.github.io/es/blog/<spanish-slug>` and `https://t1b4lt.github.io/blog/<english-slug>`.
- Turning the post into a talk later, if it has no deck yet.
