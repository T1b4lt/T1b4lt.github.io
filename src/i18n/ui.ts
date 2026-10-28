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
    "nav.talks": "Talks",
    "nav.about": "About",
    "404.title": "You are lost",
    "404.button": "Go back home",
    "blog.title": "Blog",
    "post.by": "Written by",
    "post.on": "on",
    "post.readingTime": "min read",
    "projects.title": "Projects",
    "projects.oss": "Open Source Contributions",
    "projects.viewAll": "View all projects",
    "projects.latest": "Featured Projects",
    "talks.title": "Talks",
    "talks.subtitle":
      "Interactive slide decks from talks I have given. Use the arrow keys to navigate.",
    "talks.lang.es": "Spanish only",
    "talks.lang.en": "English",
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
    "nav.talks": "Charlas",
    "nav.about": "Sobre mí",
    "404.title": "Te has perdido",
    "404.button": "Vuelve a casa",
    "blog.title": "Blog",
    "post.by": "Escrito por",
    "post.on": "el",
    "post.readingTime": "min de lectura",
    "projects.title": "Proyectos",
    "projects.oss": "Contribuciones Open Source",
    "projects.viewAll": "Ver todos los proyectos",
    "projects.latest": "Proyectos Destacados",
    "talks.title": "Charlas",
    "talks.subtitle":
      "Presentaciones interactivas de charlas que he dado. Usa las flechas del teclado para navegar.",
    "talks.lang.es": "Español",
    "talks.lang.en": "Solo en inglés",
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
