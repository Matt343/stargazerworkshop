/**
 * Parses a single post source file into a general intro plus a series of
 * track-scoped updates.
 *
 * Source format:
 *
 *   ---
 *   title: "week 14"
 *   date: 2026-07-17
 *   ---
 *
 *   General intro prose (not project-specific).
 *
 *   ## [track-slug] Update title
 *
 *   Update body, may contain code blocks.
 *
 *   ## [another-track] Another title
 *
 *   ...
 *
 * The `## [track-slug] Title` heading is the seam between updates. Everything
 * before the first such heading is the intro.
 */

export interface ParsedUpdate {
  /** Track slug this update belongs to, from `[track-slug]`. */
  track: string;
  /** Update title, the heading text after the bracket. */
  title: string;
  /** Raw markdown body of the update (below its heading). */
  body: string;
  /** 0-based position of this update within the post. */
  order: number;
}

export interface ParsedPost {
  /** Raw markdown intro (above the first update heading). */
  intro: string;
  updates: ParsedUpdate[];
}

// Matches `## [track-slug] Title`. Only H2 (##) is treated as an update seam,
// so authors can still use ###/#### freely inside update bodies.
const UPDATE_HEADING = /^##\s+\[([a-z0-9][a-z0-9-]*)\]\s*(.*)$/;

export function parsePostBody(body: string): ParsedPost {
  const lines = body.split('\n');
  const introLines: string[] = [];
  const updates: ParsedUpdate[] = [];

  let current: { track: string; title: string; lines: string[] } | null = null;

  const flush = () => {
    if (current) {
      updates.push({
        track: current.track,
        title: current.title.trim(),
        body: current.lines.join('\n').trim(),
        order: updates.length,
      });
    }
  };

  for (const line of lines) {
    const match = line.match(UPDATE_HEADING);
    if (match) {
      flush();
      current = { track: match[1], title: match[2], lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      introLines.push(line);
    }
  }
  flush();

  return {
    intro: introLines.join('\n').trim(),
    updates,
  };
}
