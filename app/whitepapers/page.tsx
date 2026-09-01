import type { Metadata } from 'next';
import whitepapers from '@/data/whitepapers.json';
import type { Whitepaper } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Whitepapers',
  description: 'Technical specifications, design documents, and in-depth research from the DCYFR team.',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function WhitepapersPage() {
  const typed = whitepapers as Whitepaper[];

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Whitepapers</h1>
        <p className="text-muted-foreground mb-10">
          Technical specifications and in-depth research documents from the DCYFR team.
        </p>

        {typed.length === 0 ? (
          <div className="rounded-xl border border-border/40 bg-card/40 p-10 text-center">
            <p className="text-muted-foreground">No whitepapers published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {typed.map((wp) => (
              <div
                key={wp.id}
                className="rounded-xl border border-input/60 bg-card/60 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="rounded-full border border-secure/30 bg-secure/10 text-accent-600 px-2.5 py-0.5 text-xs font-medium">
                        {wp.category}
                      </span>
                      {wp.pages && (
                        <span className="text-xs text-muted-foreground">{wp.pages} pages</span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">{wp.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{wp.abstract}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{wp.author}</span>
                      <span aria-hidden="true">·</span>
                      <time dateTime={wp.publishedAt}>{formatDate(wp.publishedAt)}</time>
                    </div>
                  </div>
                  <a
                    href={wp.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 rounded-lg border border-input/60 px-3 py-2 text-sm font-medium text-muted-foreground hover:border-secure/40 hover:text-foreground transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
