import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

const ideas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/ideas' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // seedling = rough thought, growing = being explored, mature = well-developed
    status: z.enum(['seedling', 'growing', 'mature']).default('seedling'),
    tags: z.array(z.string()).default([]),
  }),
});

// Art pieces are YAML files pointing to images in public/art/
const art = defineCollection({
  loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/art' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    medium: z.string().optional(),
    image: z.string(), // relative to public/, e.g. "art/piece.jpg"
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, ideas, art };
