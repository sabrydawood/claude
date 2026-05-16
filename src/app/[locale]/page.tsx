import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import HomeHero from '@/components/home/hero';
import HomeFeatures from '@/components/home/features';
import HomeAgents from '@/components/home/agents';
import HomeHowItWorks from '@/components/home/how-it-works';
import HomeStats from '@/components/home/stats';
import HomeCta from '@/components/home/cta';
import OnboardingWizard from '@/components/home/onboarding-wizard';
import { WebSiteSchema, OrganizationSchema } from '@/components/seo/json-ld';
import { getAgents, getSubjects } from '@/lib/db/queries/content';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [agents, subjects] = await Promise.all([
    getAgents(locale),
    getSubjects(locale),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <WebSiteSchema locale={locale} />
      <OrganizationSchema locale={locale} />
      <Header />
      <OnboardingWizard locale={locale} />
      <main className="flex-1">
        <HomeHero locale={locale} />
        <HomeStats locale={locale} />
        <HomeHowItWorks locale={locale} />
        <HomeAgents locale={locale} agents={agents} subjects={subjects} />
        <HomeFeatures locale={locale} />
        <HomeCta locale={locale} />
      </main>
      <Footer />
    </div>
  );
}
