#!/usr/bin/env node
/**
 * export-nexus-content.mjs — Nexus → dcyfr.tech article pipeline
 *
 * Reads markdown files from the dcyfr-workspace Nexus (polaris/, patterns/)
 * and outputs publishable articles to data/articles.json.
 *
 * TLP Policy:
 *   TLP:RED   — skipped (never exported)
 *   TLP:AMBER — skipped (internal only)
 *   TLP:GREEN — exported if explicit `publish: true` frontmatter
 *   TLP:WHITE — exported automatically
 *
 * Usage:
 *   node scripts/export-nexus-content.mjs
 *   node scripts/export-nexus-content.mjs --nexus-root /path/to/dcyfr-workspace/nexus
 *   node scripts/export-nexus-content.mjs --dry-run
 *
 * Frontmatter format (YAML block at top of file):
 *   ---
 *   title: Article Title
 *   description: One-line description
 *   author: Author Name
 *   publishedAt: 2026-03-15
 *   category: Agent Patterns
 *   tags: [delegation, agents]
 *   tlp: WHITE
 *   publish: true
 *   readingTime: 8
 *   featured: false
 *   ---
 */

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const nexusRootFlag = args.indexOf('--nexus-root');
const nexusRoot = nexusRootFlag >= 0
  ? args[nexusRootFlag + 1]
  : path.resolve(import.meta.dirname, '../../../../nexus');

const outputPath = path.resolve(import.meta.dirname, '../data/articles.json');

const EXPORT_DIRS = ['polaris', 'patterns', 'context'];
const BLOCKED_TLP = new Set(['RED', 'AMBER']);

/**
 * Parse minimal YAML frontmatter (key: value pairs only — no nesting).
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx < 0) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // Parse array: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((v) => v.trim().replace(/^['"]|['"]$/g, ''));
    } else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (/^\d+$/.test(value)) {
      value = parseInt(value, 10);
    } else {
      value = value.replace(/^['"]|['"]$/g, '');
    }
    meta[key] = value;
  }
  return { meta, body: match[2] };
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function estimateReadingTime(text) {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Check if a file should be exported based on TLP and publish flag.
 */
function isPublishable(meta, fileContent) {
  // Check inline TLP comment
  const tlpMatch = fileContent.match(/<!--\s*TLP:(\w+)/);
  const fileTlp = tlpMatch ? tlpMatch[1].toUpperCase() : null;
  const metaTlp = (meta.tlp ?? '').toUpperCase();
  const effectiveTlp = metaTlp || fileTlp;

  if (effectiveTlp && BLOCKED_TLP.has(effectiveTlp)) return false;
  if (effectiveTlp === 'GREEN' && meta.publish !== true) return false;
  if (!effectiveTlp && meta.publish !== true) return false;

  return true;
}

function scanDirectory(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanDirectory(fullPath));
    } else if (entry.name.endsWith('.md') && entry.name !== 'README.md') {
      results.push(fullPath);
    }
  }
  return results;
}

// Load existing articles to preserve manually written ones
let existingArticles = [];
try {
  existingArticles = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
} catch {
  // No existing file — start fresh
}

const manualIds = new Set(
  existingArticles.filter((a) => !a.sourceFile).map((a) => a.id),
);

const nexusArticles = [];
let exported = 0;
let skipped = 0;

for (const exportDir of EXPORT_DIRS) {
  const dirPath = path.join(nexusRoot, exportDir);
  const files = scanDirectory(dirPath);

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    const { meta, body } = parseFrontmatter(content);

    if (!isPublishable(meta, content)) {
      skipped++;
      continue;
    }

    const title = meta.title ?? path.basename(filePath, '.md').replace(/-/g, ' ');
    const slug = meta.slug ?? slugify(title);
    const id = slug;

    nexusArticles.push({
      id,
      slug,
      title,
      description: meta.description ?? '',
      author: meta.author ?? 'DCYFR Labs',
      publishedAt: meta.publishedAt
        ? new Date(meta.publishedAt).toISOString()
        : new Date().toISOString(),
      readingTime: meta.readingTime ?? estimateReadingTime(body),
      category: meta.category ?? 'Workspace',
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      featured: meta.featured ?? false,
      content: body.trim(),
      sourceFile: path.relative(path.dirname(nexusRoot), filePath),
    });
    exported++;
  }
}

// Merge: manual articles preserved, nexus articles added/updated by id
const nexusIds = new Set(nexusArticles.map((a) => a.id));
const merged = [
  ...existingArticles.filter((a) => manualIds.has(a.id) || !nexusIds.has(a.id)),
  ...nexusArticles,
].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

if (dryRun) {
  console.log(`[dry-run] Would export ${exported} articles, skip ${skipped} (TLP blocked or unpublished)`);
  console.log('[dry-run] Output:', outputPath);
  console.log('[dry-run] Merged total:', merged.length);
} else {
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2) + '\n');
  console.log(`Exported ${exported} articles from Nexus → ${outputPath}`);
  console.log(`Skipped ${skipped} files (TLP:RED/AMBER or missing publish:true)`);
  console.log(`Total articles: ${merged.length}`);
}
