import { ui, defaultLang, type Lang, type UIKey } from "./ui";
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export interface FormattedPost {
  url: string;
  frontmatter: CollectionEntry<"blog">["data"];
  // Initial visibility as of build time; ScheduledPosts.astro re-evaluates it in the browser
  hidden: boolean;
}

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function getAlternatePath(
  pathname: string,
  targetLang: Lang,
  translations?: Record<string, string>,
): string {
  if (translations?.[targetLang]) return translations[targetLang];
  const stripped = pathname.startsWith("/es/")
    ? pathname.slice(3)
    : pathname === "/es"
      ? "/"
      : pathname;
  return targetLang === "en"
    ? stripped
    : `/es${stripped === "/" ? "/" : stripped}`;
}

export function getRouteFromUrl(url: string): string | undefined {
  const pathname = new URL(url).pathname;
  const parts = pathname?.split("/");
  const path = parts.pop() || parts.pop();
  if (path === undefined) return undefined;
  return path ? path : "/";
}

export async function getPostTranslations(
  idx: number,
  _currentLang?: Lang,
): Promise<Record<string, string>> {
  const allPosts = await getCollection("blog");
  const translations: Record<string, string> = {};
  const relatedPosts = allPosts.filter((post) => post.data.idx === idx);

  for (const post of relatedPosts) {
    const [lang, ...slugParts] = post.id.split("/");
    const slug = slugParts.join("/");
    translations[lang] =
      lang === "en" ? `/blog/${slug}` : `/${lang}/blog/${slug}`;
  }

  return translations;
}

export async function getBlogEntriesByLang(
  lang: Lang,
): Promise<CollectionEntry<"blog">[]> {
  return getCollection("blog", ({ id }) => id.startsWith(`${lang}/`));
}

export function sortPostsByIdx(
  posts: CollectionEntry<"blog">[],
): CollectionEntry<"blog">[] {
  return [...posts].sort((a, b) => b.data.idx - a.data.idx);
}

// Future posts are rendered but hidden, so the browser can reveal them on their
// pubDateLogical without a rebuild. `limit` caps how many posts are visible.
function formatPostsForList(
  posts: CollectionEntry<"blog">[],
  lang: Lang,
  limit: number,
): FormattedPost[] {
  const today = new Date().toISOString().slice(0, 10);
  let shown = 0;
  return posts.map((entry) => {
    const slug = entry.id.replace(`${lang}/`, "");
    const url = lang === "en" ? `/blog/${slug}` : `/${lang}/blog/${slug}`;
    const visible = entry.data.pubDateLogical <= today && shown < limit;
    if (visible) shown++;
    return { url, frontmatter: entry.data, hidden: !visible };
  });
}

export async function getFormattedPosts(
  lang: Lang,
  limit = Infinity,
): Promise<FormattedPost[]> {
  const entries = await getBlogEntriesByLang(lang);
  return formatPostsForList(sortPostsByIdx(entries), lang, limit);
}

export async function getBlogStaticPaths(lang: Lang) {
  const entries = await getBlogEntriesByLang(lang);
  return entries.map((entry) => {
    const slug = entry.id.replace(`${lang}/`, "");
    return { params: { slug }, props: { entry } };
  });
}

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

export async function getTalks() {
  const talks = await getCollection("talks");
  return talks.sort((a, b) => a.data.order - b.data.order);
}
