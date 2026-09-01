'use client';

import { useState, useMemo } from 'react';
import articlesData from '@/data/articles.json';
import type { Article, ArticleCategory } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';

const articles = articlesData as Article[];

const CATEGORIES: ArticleCategory[] = [
  'Agent Patterns',
  'Context Engineering',
  'RAG',
  'Code Generation',
  'Infrastructure',
  'Security',
  'Workspace',
  'Releases',
];

export default function ArticlesPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | null>(null);

  const filtered = useMemo(() => {
    return articles
      .filter((a) => {
        const matchesCategory = activeCategory === null || a.category === activeCategory;
        const q = search.toLowerCase();
        const matchesSearch =
          q === '' ||
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [search, activeCategory]);

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Articles</h1>
        <p className="text-muted-foreground mb-8">
          {articles.length} articles on agent patterns, context engineering, and AI infrastructure.
        </p>

        {/* Search */}
        <div className="relative mb-6">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-input/60 bg-card/60 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-secure/60 focus:outline-none focus:ring-1 focus:ring-secure/40"
            aria-label="Search articles"
          />
        </div>

        {/* Category filter */}
        {/* The selected chip pairs bg-primary with text-primary-foreground, not
            text-foreground. The 2026-04-19 theme-blind sweep rewrote the old
            `text-white` to `text-foreground` uniformly, which is right on the
            page ground but wrong on a filled one: under the dcyfr.tech identity
            --primary is deep indigo and --foreground is near-black, so the
            selected chip measured 1.40:1. Every fill token has its own
            *-foreground partner for exactly this. */}
        <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === null
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input/60 bg-muted/40 text-muted-foreground hover:border-secure/40 hover:text-foreground'
            }`}
          >
            All
          </button>
          {CATEGORIES.filter((c) => articles.some((a) => a.category === c)).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input/60 bg-muted/40 text-muted-foreground hover:border-secure/40 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border/40 bg-card/40 p-10 text-center">
            <p className="text-muted-foreground">No articles match your search.</p>
            <button
              type="button"
              onClick={() => { setSearch(''); setActiveCategory(null); }}
              className="mt-3 text-sm text-accent-600 hover:text-foreground transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-4" aria-live="polite" aria-atomic="true">{filtered.length} article{filtered.length !== 1 ? 's' : ''}</p>
            {filtered.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
