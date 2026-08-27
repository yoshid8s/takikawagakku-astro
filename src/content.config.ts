import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    wpId: z.number(),
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    modified: z.coerce.date().optional(),
    excerpt: z.string().optional(),
    categories: z
      .array(
        z.object({
          id: z.number(),
          name: z.string(),
          slug: z.string(),
        }),
      )
      .default([]),
    featuredImage: z.string().optional(),
    originalUrl: z.string().url(),
  }),
});

export const collections = { blog };
