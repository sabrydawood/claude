import OnboardingClient from './onboarding-client';

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <OnboardingClient locale={locale} />;
}
