const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur', 'yi', 'ps', 'sd', 'ug', 'dv', 'ks']);

export function getDir(locale: string): 'rtl' | 'ltr' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}

export function isRTL(locale: string): boolean {
  return RTL_LOCALES.has(locale);
}
