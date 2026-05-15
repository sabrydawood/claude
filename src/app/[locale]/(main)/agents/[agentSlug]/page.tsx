import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { getAgentBySlug, getLessonsByAgent } from '@/lib/db/queries/content';
import type { AgentRow, LessonRow } from '@/lib/db/queries/content';
import AgentPageClient from './agent-page-client';

export default async function AgentPage({ params }: { params: Promise<{ locale: string; agentSlug: string }> }) {
  const { locale, agentSlug } = await params;

  const [agent, lessons] = await Promise.all([
    getAgentBySlug(agentSlug, locale),
    getLessonsByAgent(agentSlug, locale),
  ]);

  if (!agent) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />
      <AgentPageClient agent={agent} lessons={lessons} locale={locale} agentSlug={agentSlug} />
      <Footer />
    </div>
  );
}
