import type { Article } from '@/lib/types';
import { clsx } from 'clsx';

interface ArticleCardProps {
  article: Article;
  variant?: 'featured' | 'compact' | 'full';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ArticleCard({ article, variant = 'full' }: Readonly<ArticleCardProps>) {
  if (variant === 'compact') {
    return (
      <a
        href={`/articles/${article.slug}`}
        className="group flex items-start gap-4 rounded-xl border border-border/40 bg-card/40 p-4 hover:border-secure/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground group-hover:text-accent-600 transition-colors line-clamp-1">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{article.description}</p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-xs text-muted-foreground">{formatDate(article.publishedAt)}</span>
          <p className="text-xs text-muted-foreground">{article.readingTime} min</p>
        </div>
      </a>
    );
  }

  const categoryColors: Record<string, string> = {
    // The two `secure` rows were the only ones not following this map's own
    // `border-X/30 bg-X/10 text-X` shape: they wore the accent ramp over a
    // secure-tinted fill, at 4.42:1 light / 4.16:1 dark against AA's 4.5, and
    // `Context Engineering` additionally carried a /70 alpha that dropped it
    // further. `text-secure` is 5.69:1 / 5.91:1 and matches the `secure`
    // variant in components/ui/dcyfr-badge.tsx.
    'Agent Patterns': 'border-secure/30 bg-secure/10 text-secure',
    'Context Engineering': 'border-secure/30 bg-secure/10 text-secure',
    'RAG': 'border-dcyfr-success/30 bg-dcyfr-success/10 text-dcyfr-success',
    'Code Generation': 'border-dcyfr-warning/30 bg-dcyfr-warning/10 text-dcyfr-warning',
    'Infrastructure': 'border-dcyfr-warning/30 bg-dcyfr-warning/10 text-dcyfr-warning',
    'Security': 'border-dcyfr-error/30 bg-dcyfr-error/10 text-dcyfr-error',
    'Workspace': 'border-input/30 bg-muted/10 text-muted-foreground',
    'Releases': 'border-input/30 bg-muted/10 text-muted-foreground',
  };

  return (
    <a
      href={`/articles/${article.slug}`}
      className="group flex flex-col rounded-xl border border-input/60 bg-card/60 p-5 hover:border-secure/40 transition-colors"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={clsx('rounded-full border px-2.5 py-0.5 text-xs font-medium', categoryColors[article.category] ?? 'border-input/40 bg-muted/60 text-muted-foreground')}>
          {article.category}
        </span>
        <span className="text-xs text-muted-foreground">{article.readingTime} min read</span>
      </div>

      <h3 className={clsx(
        'font-semibold text-foreground group-hover:text-accent-600 transition-colors leading-snug',
        variant === 'featured' ? 'text-lg' : 'text-base',
      )}>
        {article.title}
      </h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2 flex-1">
        {article.description}
      </p>

      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span>{article.author}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
      </div>
    </a>
  );
}
