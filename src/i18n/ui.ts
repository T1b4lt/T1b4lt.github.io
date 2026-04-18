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
    "404.title": "You are lost",
    "404.button": "Go back home",
    "blog.title": "Posts",
    "post.by": "Written by",
    "post.on": "on",
    "footer.title": "Stay in touch!",
    "footer.subtitle": "Follow me on social media for updates and news.",
  },
  es: {
    "nav.home": "Inicio",
    "nav.blog": "Blog",
    "404.title": "Te has perdido",
    "404.button": "Vuelve a casa",
    "blog.title": "Publicaciones",
    "post.by": "Escrito por",
    "post.on": "el",
    "footer.title": "¡Mantente en contacto!",
    "footer.subtitle":
      "Sígueme en redes sociales para estar al tanto de las novedades.",
  },
} as const;

export type UIKey = keyof (typeof ui)[typeof defaultLang];
