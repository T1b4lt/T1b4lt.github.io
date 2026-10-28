import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import { readdirSync } from "node:fs";

const site = "https://t1b4lt.github.io";

// Talks are static decks in public/talks/<slug>/, invisible to the sitemap
// integration because they are not Astro routes.
const talkPages = readdirSync("./public/talks", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => `${site}/talks/${entry.name}/`);

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [
    icon(),
    sitemap({
      i18n: { defaultLocale: "en", locales: { en: "en", es: "es" } },
      customPages: talkPages,
    }),
  ],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
