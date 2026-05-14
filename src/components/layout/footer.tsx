import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { Zap, Heart } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="bg-white border-t border-purple-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span className="text-lg font-black text-purple-700">{t('appName')}</span>
            </Link>
            <p className="text-sm text-gray-500 text-center md:text-start">
              {t('tagline')}
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-purple-600 transition-colors font-medium">
              الرئيسية
            </Link>
            <Link href="/dashboard" className="hover:text-purple-600 transition-colors font-medium">
              لوحتي
            </Link>
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <span>صُنع بـ</span>
            <Heart size={14} className="text-red-400 fill-red-400" />
            <span>لمحبي التعلم</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          © 2025 ذكاوي. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
