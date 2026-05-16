import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

const LocalsMap = {
  ar: 'Ar',
  en: 'En',
};
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as 'ar' | 'en')) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    timeZone: 'UTC',
    messages: (await import(`../../messages/${LocalsMap[locale]}.json`)).default,
  };
});
