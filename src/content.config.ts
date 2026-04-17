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
    pubDateLogical: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = { blog };
