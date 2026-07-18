import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import type { Loader, LoaderContext } from 'astro/loaders';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parsePostBody } from './lib/parse-post';

const POSTS_DIR = './src/content/posts';

/** Strips a leading `---\n...\n---` YAML frontmatter block, returning the body. */
function stripFrontmatter(raw: string): string {
  const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? raw.slice(match[0].length) : raw;
}

function postFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => join(dir, f));
}

/** Post id from filename, e.g. `2026-07-17.md` -> `2026-07-17`. */
function postId(file: string): string {
  return file.replace(/^.*\//, '').replace(/\.(md|mdx)$/, '');
}

/**
 * Loads the general intro portion of each post file into the `posts`
 * collection. The track-scoped updates are loaded separately by the
 * `updates` loader below, reading the same files.
 */
function postsLoader(): Loader {
  return {
    name: 'posts-loader',
    async load({ store, renderMarkdown, parseData, generateDigest, watcher }: LoaderContext) {
      store.clear();
      for (const file of postFiles(POSTS_DIR)) {
        const raw = readFileSync(file, 'utf-8');
        const id = postId(file);
        // renderMarkdown parses frontmatter for us (no YAML dep needed).
        const meta = await renderMarkdown(raw);
        const frontmatter = meta.metadata?.frontmatter ?? {};
        const { intro } = parsePostBody(stripFrontmatter(raw));
        const data = await parseData({ id, data: frontmatter });
        const rendered = await renderMarkdown(intro);
        store.set({
          id,
          data,
          body: intro,
          digest: generateDigest(raw),
          rendered,
        });
      }
      watcher?.add(resolve(POSTS_DIR));
    },
    schema: z.object({
      title: z.string(),
      date: z.coerce.date(),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
    }),
  };
}

/**
 * Loads each `## [track] Title` section of every post as its own `updates`
 * entry, carrying a reference to its parent post and track plus the post's
 * date (denormalized so track timelines can sort without a join).
 */
function updatesLoader(): Loader {
  return {
    name: 'updates-loader',
    async load({ store, renderMarkdown, parseData, generateDigest, watcher }: LoaderContext) {
      store.clear();
      for (const file of postFiles(POSTS_DIR)) {
        const raw = readFileSync(file, 'utf-8');
        const post = postId(file);
        const meta = await renderMarkdown(raw);
        const frontmatter = meta.metadata?.frontmatter ?? {};
        const { updates } = parsePostBody(stripFrontmatter(raw));
        for (const update of updates) {
          const id = `${post}__${String(update.order).padStart(2, '0')}-${update.track}`;
          const data = await parseData({
            id,
            data: {
              track: update.track,
              title: update.title,
              post,
              date: frontmatter.date,
              order: update.order,
            },
          });
          const rendered = await renderMarkdown(update.body);
          store.set({
            id,
            data,
            body: update.body,
            digest: generateDigest(update.body),
            rendered,
          });
        }
      }
      watcher?.add(resolve(POSTS_DIR));
    },
    schema: z.object({
      track: z.string(),
      title: z.string(),
      post: z.string(),
      date: z.coerce.date(),
      order: z.number(),
    }),
  };
}

const posts = defineCollection({ loader: postsLoader() });
const updates = defineCollection({ loader: updatesLoader() });

/**
 * Tracks are ongoing projects / themes. An "idea" is just a track with
 * `status: idea` — if it goes somewhere it graduates to active, no new
 * concept required.
 */
const tracks = defineCollection({
  loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/tracks' }),
  schema: z.object({
    name: z.string(),
    blurb: z.string().optional(),
    status: z.enum(['idea', 'active', 'paused', 'complete']).default('idea'),
    started: z.coerce.date().optional(),
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
    image: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { posts, updates, tracks, art };
