'use client';

import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Global Error Boundary for Next.js 16
 *
 * This component catches errors in the root layout and replaces the entire page.
 * It must include <html> and <body> tags since it bypasses the normal layout.
 *
 * Only active in production builds for unrecoverable root errors.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log error to Sentry with global error context
    Sentry.captureException(error, {
      contexts: {
        errorBoundary: {
          type: 'global',
          digest: error.digest,
        },
      },
      tags: {
        errorType: 'global-error',
      },
    });
  }, [error]);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
        <Card variant="glass" className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-[var(--zkawi-red)]/10 p-4">
                <AlertTriangle className="h-12 w-12 text-[var(--zkawi-red)]" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
            <CardDescription className="text-base mt-2">
              {t('description')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={reset}
                  variant="default"
                  size="lg"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('retry')}
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  {t('goHome')}
                </Button>
              </div>

              {/* Technical Details Toggle */}
              {error && (
                <div className="mt-6">
                  <Button
                    onClick={toggleDetails}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                  >
                    <span>{t('technicalDetails')}</span>
                    {showDetails ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {showDetails && (
                    <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
                      <div className="mb-4">
                        <p className="text-sm font-bold text-[var(--text)] mb-2">
                          {t('unexpectedError')}:
                        </p>
                        <pre className="text-xs text-[var(--text-muted)] overflow-x-auto p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                          {error.toString()}
                        </pre>
                      </div>
                      {error.digest && (
                        <div>
                          <p className="text-sm font-bold text-[var(--text)] mb-2">
                            Error Digest:
                          </p>
                          <pre className="text-xs text-[var(--text-muted)] overflow-x-auto p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                            {error.digest}
                          </pre>
                        </div>
                      )}
                      <div className="mt-4">
                        <p className="text-xs text-[var(--text-muted)]">
                          This is a global error that occurred in the root layout.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-xs text-[var(--text-muted)] text-center">
              {t('tryAgainLater')}
            </p>
          </CardFooter>
        </Card>
      </body>
    </html>
  );
}
