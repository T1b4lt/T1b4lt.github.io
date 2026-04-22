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
    pubDateLogical: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    tags: z.array(z.string()),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    github: z.string().url(),
    web: z.string().url().optional(),
    featured: z.boolean().default(false),
    order: z.number(),
  }),
});

const oss = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/oss" }),
  schema: z.object({
    project: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    repo: z.string().url(),
    order: z.number().default(0),
  }),
});

export const collections = { blog, projects, oss };
