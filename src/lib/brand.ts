import { APP_URL } from './utils';

export const brand = {
  name: 'ذكاوي',
  nameEn: 'Zkawi',
  taglineAr: 'تعلم الذكاء الاصطناعي بطريقة سهلة ومرحة',
  taglineEn: 'Learn AI the easy and fun way',
  url: APP_URL,
  colors: {
    primary: '#7C3AED',
    primaryLight: '#A855F7',
    primaryDark: '#5B21B6',
    primaryFaint: '#F5F3FF',
    accent: '#F59E0B',
    accentLight: '#FCD34D',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    bg: '#FFF9F0',
    surface: '#FFFFFF',
    textDark: '#1F2937',
    textMuted: '#6B7280',
  },

  fonts: {
    arabic: 'Cairo',
    latin: 'Inter',
  },

  social: {
    twitter: '@zkawi_app',
  },
} as const;

export type BrandColors = typeof brand.colors;
