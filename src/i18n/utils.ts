import { ui, defaultLang, type Lang, type UIKey } from "./ui";
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export interface FormattedPost {
  url: string;
  frontmatter: CollectionEntry<"blog">["data"];
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
    translations[lang] = lang === "en" ? `/blog/${slug}` : `/${lang}/blog/${slug}`;
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

export function filterFuturePosts(
  posts: CollectionEntry<"blog">[],
): CollectionEntry<"blog">[] {
  const today = new Date().toISOString().slice(0, 10);
  return posts.filter((post) => post.data.pubDateLogical <= today);
}

function formatPostsForList(
  posts: CollectionEntry<"blog">[],
  lang: Lang,
): FormattedPost[] {
  return posts.map((entry) => {
    const slug = entry.id.replace(`${lang}/`, "");
    const url = lang === "en" ? `/blog/${slug}` : `/${lang}/blog/${slug}`;
    return { url, frontmatter: entry.data };
  });
}

export async function getFormattedPosts(lang: Lang): Promise<FormattedPost[]> {
  const entries = await getBlogEntriesByLang(lang);
  const sorted = sortPostsByIdx(entries);
  const filtered = filterFuturePosts(sorted);
  return formatPostsForList(filtered, lang);
}

export async function getBlogStaticPaths(lang: Lang) {
  const entries = await getBlogEntriesByLang(lang);
  return entries.map((entry) => {
    const slug = entry.id.replace(`${lang}/`, "");
    return { params: { slug }, props: { entry } };
  });
}
