import { ui, defaultLang } from "./ui";
import { getCollection } from "astro:content";

export function getLangFromUrl(url) {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang;
  return defaultLang;
}

export function useTranslations(lang) {
  return function t(key) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function getRouteFromUrl(url) {
  const pathname = new URL(url).pathname;
  const parts = pathname?.split("/");
  const path = parts.pop() || parts.pop();

  if (path === undefined) {
    return undefined;
  }

  return path ? path : "/";
}

/**
 * Obtiene las URLs de las traducciones de un post dado basándose en el idx
 * @param {number} idx - El índice del post actual
 * @param {string} currentLang - El idioma actual (opcional, para excluirlo si es necesario)
 * @returns {Promise<Object>} Objeto con las URLs por idioma
 */
export async function getPostTranslations(idx, currentLang) {
  const allPosts = await getCollection("blog");
  const translations = {};

  // Buscar posts con el mismo idx en todos los idiomas
  const relatedPosts = allPosts.filter((post) => post.data.idx === idx);

  for (const post of relatedPosts) {
    // Extraer el idioma y slug del id
    const [lang, ...slugParts] = post.id.split("/");
    const slug = slugParts.join("/").replace(".md", "");

    translations[lang] = `/${lang}/blog/${slug}`;
  }

  return translations;
}
