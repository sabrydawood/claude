'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/lib/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, Home, User, Globe, Trophy, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { signOut, useSession } from '@/lib/auth-client';
import { getInitials } from '@/lib/utils';

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const switchLocale = () => {
    router.push(pathname, { locale: locale === 'ar' ? 'en' : 'ar' });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const navLinks = session
    ? [
        { href: '/dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard size={16} /> },
        { href: '/leaderboard', label: t('nav.leaderboard'), icon: <Trophy size={16} /> },
        { href: '/sandbox', label: t('nav.sandbox'), icon: <MessageSquare size={16} /> },
      ]
    : [{ href: '/', label: t('nav.home'), icon: <Home size={16} /> }];

  return (
    <header className="
      sticky top-0 z-50 backdrop-blur-md border-b
      bg-[var(--header-bg)] border-[var(--border)]
      transition-colors duration-300
    ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="group hover:opacity-90 transition-opacity">
            <Logo size={40} showText textClassName="text-xl" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="
                  flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                  text-[var(--text-muted)] hover:text-[var(--zkawi-purple)]
                  hover:bg-[var(--bg-secondary)] transition-all
                "
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Switcher */}
            <button
              onClick={switchLocale}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold
                text-[var(--zkawi-purple)] border border-[var(--border)]
                hover:bg-[var(--bg-secondary)] hover:border-[var(--zkawi-purple-light)]
                transition-all hover:scale-105
              "
            >
              <Globe size={14} />
              {t('nav.language')}
            </button>

            {/* User menu or auth buttons */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--bg-secondary)] transition-all"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-[var(--zkawi-purple)] text-white">
                      {getInitials(session.user?.name ?? 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-semibold text-[var(--text)] max-w-24 truncate">
                    {session.user?.name}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="
                          absolute end-0 mt-2 w-48 rounded-2xl shadow-xl z-20 py-2
                          bg-[var(--surface)] border border-[var(--border)]
                        "
                        style={{ boxShadow: 'var(--card-shadow)' }}
                      >
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--bg-secondary)] hover:text-[var(--zkawi-purple)] transition-colors"
                        >
                          <LayoutDashboard size={16} />
                          {t('nav.dashboard')}
                        </Link>
                        <hr className="my-1 border-[var(--border)]" />
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={16} />
                          {t('nav.logout')}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">{t('nav.login')}</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">{t('nav.register')} 🚀</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-muted)]"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[var(--border)] py-3 space-y-1"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--zkawi-purple)] hover:bg-[var(--bg-secondary)] transition-all"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              {!session && (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <div className="px-4 py-3 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] flex items-center gap-2">
                      <User size={16} />{t('nav.login')}
                    </div>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <div className="mx-2 px-4 py-3 rounded-xl text-sm font-bold bg-[var(--zkawi-purple)] text-white text-center hover:opacity-90 transition-all">
                      {t('nav.register')} 🚀
                    </div>
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
