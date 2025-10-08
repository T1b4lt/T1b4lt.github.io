import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    idx: z.number(),
    title: z.string(),
    author: z.string(),
    pubDate: z.string(),
    pubDateLogical: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = {
  blog: blogCollection,
};
