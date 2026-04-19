'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SearchIcon } from 'lucide-react';
import articlesData from '@/data/articles.json';
import type { Article } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { DcyfrInput } from '@/components/ui/dcyfr-input';
import { DcyfrAlert, DcyfrAlertTitle, DcyfrAlertDescription } from '@/components/ui/dcyfr-alert';
import { DcyfrSkeleton } from '@/components/ui/dcyfr-skeleton';

const articles = articlesData as Article[];

const DEBOUNCE_MS = 300;

function SearchResults() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [isPending, setIsPending] = useState(false);

  // Debounce: isPending true while typing, settles 300ms after last keystroke
  useEffect(() => {
    if (query === debouncedQuery) return;
    setIsPending(true);
    const handle = setTimeout(() => {
      setDebouncedQuery(query);
      setIsPending(false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query, debouncedQuery]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return articles
      .filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.content.toLowerCase().includes(q)
      )
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  }, [debouncedQuery]);

  return (
    <div>
      <div className="relative mb-8">
        <SearchIcon
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10"
        />
        <DcyfrInput
          type="search"
          autoFocus
          placeholder="Search articles, topics, tags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search articles"
          className="pl-10 h-11 border-input/60 bg-card/60 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {debouncedQuery.trim() === '' && !isPending ? (
        <DcyfrAlert variant="info" className="text-muted-foreground">
          <SearchIcon aria-hidden="true" />
          <DcyfrAlertTitle>Start searching</DcyfrAlertTitle>
          <DcyfrAlertDescription>
            Enter a term to find articles, categories, or tags.
          </DcyfrAlertDescription>
        </DcyfrAlert>
      ) : isPending ? (
        <div className="space-y-3" aria-busy="true" aria-live="polite">
          {[0, 1, 2].map((i) => (
            <DcyfrSkeleton
              key={i}
              variant="shimmer"
              className="h-24 w-full bg-muted/40"
            />
          ))}
        </div>
      ) : results.length === 0 ? (
        <DcyfrAlert variant="info" className="text-muted-foreground">
          <DcyfrAlertTitle>No results for &quot;{debouncedQuery}&quot;</DcyfrAlertTitle>
          <DcyfrAlertDescription>
            Try a different keyword or browse by{' '}
            <Link
              href="/articles"
              className="text-accent hover:text-foreground transition-colors underline underline-offset-2"
            >
              category
            </Link>
            .
          </DcyfrAlertDescription>
        </DcyfrAlert>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-4" aria-live="polite">
            {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{debouncedQuery}&quot;
          </p>
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} variant="compact" />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Search</h1>
        <p className="text-muted-foreground mb-8">
          Search across all articles, categories, and tags.
        </p>
        <Suspense>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
