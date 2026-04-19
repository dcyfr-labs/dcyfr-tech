import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import articles from '@/data/articles.json';
import type { Article } from '@/lib/types';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { DcyfrBadge } from '@/components/ui/dcyfr-badge';
import { DcyfrButton } from '@/components/ui/dcyfr-button';
import { DcyfrSeparator } from '@/components/ui/dcyfr-separator';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (articles as Article[]).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = (articles as Article[]).find((a) => a.slug === slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://dcyfr.tech/articles/${article.slug}`,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author],
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function ArticlePage({ params }: Readonly<Props>) {
  const { slug } = await params;
  const article = (articles as Article[]).find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.description,
            author: { '@type': 'Organization', name: article.author },
            datePublished: article.publishedAt,
            publisher: { '@type': 'Organization', name: 'DCYFR', url: 'https://dcyfr.tech' },
            url: `https://dcyfr.tech/articles/${article.slug}`,
          }),
        }}
      />

      <article className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-prose">
          {/* Breadcrumb */}
          <nav
            className="mb-8 flex items-center gap-2 text-sm text-muted-foreground"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-white transition-colors">
              dcyfr.tech
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/articles" className="hover:text-white transition-colors">
              Articles
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-muted-foreground truncate" aria-current="page">
              {article.title}
            </span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <DcyfrBadge
                variant="outline"
                size="sm"
                className="border-dcyfr-accent/30 bg-dcyfr-accent/10 text-accent"
              >
                {article.category}
              </DcyfrBadge>
              <DcyfrBadge
                variant="ghostly"
                size="sm"
                className="border-0 bg-transparent text-muted-foreground"
              >
                {article.readingTime} min read
              </DcyfrBadge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
              {article.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {article.description}
            </p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{article.author}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            </div>
            <DcyfrSeparator className="mt-6 bg-muted/60" />
          </header>

          {/* Content — serif headings wired via .theme-dcyfr-tech in globals.css */}
          <div className="prose-dcyfr">
            <MarkdownRenderer content={article.content} />
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <footer className="mt-10">
              <DcyfrSeparator className="bg-muted/60" />
              <div className="pt-6">
                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <DcyfrBadge
                      key={tag}
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-input/60 bg-muted/60 text-muted-foreground hover:border-dcyfr-accent/40 hover:text-white transition-colors"
                    >
                      <Link href={`/search?q=${encodeURIComponent(tag)}`}>{tag}</Link>
                    </DcyfrBadge>
                  ))}
                </div>
              </div>
            </footer>
          )}

          {/* Back link */}
          <div className="mt-10">
            <DcyfrButton asChild variant="ghostly" size="sm">
              <Link href="/articles" className="text-muted-foreground">
                <ArrowLeftIcon className="size-4" aria-hidden="true" />
                All articles
              </Link>
            </DcyfrButton>
          </div>
        </div>
      </article>
    </>
  );
}
