import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import HomeHero from '@/components/home/hero';
import HomeFeatures from '@/components/home/features';
import HomeAgents from '@/components/home/agents';
import HomeHowItWorks from '@/components/home/how-it-works';
import HomeStats from '@/components/home/stats';
import HomeCta from '@/components/home/cta';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HomeHero locale={locale} />
        <HomeStats locale={locale} />
        <HomeHowItWorks locale={locale} />
        <HomeAgents locale={locale} />
        <HomeFeatures locale={locale} />
        <HomeCta locale={locale} />
      </main>
      <Footer />
    </div>
  );
}
