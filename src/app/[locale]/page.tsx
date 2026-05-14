import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import HomeHero from '@/components/home/hero';
import HomeFeatures from '@/components/home/features';
import HomeAgents from '@/components/home/agents';
import HomeHowItWorks from '@/components/home/how-it-works';
import HomeStats from '@/components/home/stats';
import HomeCta from '@/components/home/cta';
import { WebSiteSchema, OrganizationSchema } from '@/components/seo/json-ld';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <WebSiteSchema locale={locale} />
      <OrganizationSchema locale={locale} />
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
