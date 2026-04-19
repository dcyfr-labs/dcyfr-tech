import type { Metadata } from 'next';
import Link from 'next/link';
import articles from '@/data/articles.json';
import type { Article, ArticleCategory } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { DcyfrButton } from '@/components/ui/dcyfr-button';

export const metadata: Metadata = {
  title: 'DCYFR Research — Agent patterns, context engineering, and AI infrastructure',
};

const CATEGORY_ORDER: ArticleCategory[] = [
  'Agent Patterns',
  'Context Engineering',
  'RAG',
  'Code Generation',
  'Infrastructure',
  'Security',
  'Workspace',
  'Releases',
];

export default function HomePage() {
  const typedArticles = articles as Article[];
  const featured = typedArticles.filter((a) => a.featured).slice(0, 2);
  const recent = typedArticles
    .filter((a) => !a.featured)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 4);

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    articles: typedArticles.filter((a) => a.category === cat),
  })).filter((g) => g.articles.length > 0);

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            DCYFR Research
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Deep dives into AI agent patterns, context engineering, and production-ready infrastructure.
            Written by the team building the DCYFR ecosystem.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <DcyfrButton asChild variant="ghostly" size="sm">
              <a href="/rss.xml" className="text-muted-foreground">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
                </svg>
                RSS feed
              </a>
            </DcyfrButton>
            <DcyfrButton asChild variant="ghostly" size="sm">
              <Link href="/search" className="text-muted-foreground">
                Search articles →
              </Link>
            </DcyfrButton>
          </div>
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <section className="mb-12" aria-label="Featured articles">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Featured</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {featured.map((article) => (
                <ArticleCard key={article.id} article={article} variant="featured" />
              ))}
            </div>
          </section>
        )}

        {/* Recent */}
        {recent.length > 0 && (
          <section className="mb-12" aria-label="Recent articles">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent</h2>
              <DcyfrButton asChild variant="ghostly" size="sm">
                <Link href="/articles" className="text-muted-foreground">
                  All articles →
                </Link>
              </DcyfrButton>
            </div>
            <div className="space-y-3">
              {recent.map((article) => (
                <ArticleCard key={article.id} article={article} variant="compact" />
              ))}
            </div>
          </section>
        )}

        {/* By category */}
        <section aria-label="Articles by category">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Browse by Topic</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {byCategory.map(({ category, articles: cats }) => (
              <Link
                key={category}
                href={`/articles?category=${encodeURIComponent(category)}`}
                className="group rounded-xl border border-input/60 bg-card/60 p-4 hover:border-dcyfr-accent/40 transition-colors"
              >
                <p className="font-medium text-white group-hover:text-accent transition-colors">
                  {category}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cats.length} {cats.length === 1 ? 'article' : 'articles'}
                </p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
