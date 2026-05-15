'use client';

import React, { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render error fallback UI with translations
      return <ErrorFallback
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        showDetails={this.state.showDetails}
        onReset={this.handleReset}
        onToggleDetails={this.toggleDetails}
      />;
    }

    return this.props.children;
  }
}

// Functional component to use hooks for translations
function ErrorFallback({
  error,
  errorInfo,
  showDetails,
  onReset,
  onToggleDetails,
}: {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
  onReset: () => void;
  onToggleDetails: () => void;
}) {
  const t = useTranslations('error');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
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
                onClick={onReset}
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
            {(error || errorInfo) && (
              <div className="mt-6">
                <Button
                  onClick={onToggleDetails}
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
                    {error && (
                      <div className="mb-4">
                        <p className="text-sm font-bold text-[var(--text)] mb-2">
                          {t('unexpectedError')}:
                        </p>
                        <pre className="text-xs text-[var(--text-muted)] overflow-x-auto p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                          {error.toString()}
                        </pre>
                      </div>
                    )}
                    {errorInfo?.componentStack && (
                      <div>
                        <p className="text-sm font-bold text-[var(--text)] mb-2">
                          Component Stack:
                        </p>
                        <pre className="text-xs text-[var(--text-muted)] overflow-x-auto p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)] max-h-60 overflow-y-auto">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
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
    </div>
  );
}

export default ErrorBoundary;
export { ErrorBoundary };
