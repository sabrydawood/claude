import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Logo } from "@/components/ui/logo";
import { Heart } from "lucide-react";

export default function Footer() {
  const t = useTranslations("common");

  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/">
              <Logo size={32} showText textClassName="text-lg" />
            </Link>
            <p className="text-sm text-[var(--text-muted)] text-center md:text-start">
              {t("tagline")}
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
            <Link
              href="/"
              className="hover:text-[var(--zkawi-pink)] transition-colors font-medium"
            >
              الرئيسية
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-[var(--zkawi-pink)] transition-colors font-medium"
            >
              لوحتي
            </Link>
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
            <span>صُنع بـ</span>
            <Heart size={14} className="text-red-400 fill-red-400" />
            <span>لمحبي التعلم</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
          © 2025 ذكاوي. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
