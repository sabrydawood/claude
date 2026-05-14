'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
import { signUp } from '@/lib/auth-client';
import { Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const tVal = useTranslations('auth.validation');
  const tErr = useTranslations('auth.errors');
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = tVal('nameRequired');
    if (!email) newErrors.email = tVal('emailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = tVal('emailInvalid');
    if (!password) newErrors.password = tVal('passwordRequired');
    else if (password.length < 8) newErrors.password = tVal('passwordMin');
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const result = await signUp.email({ email, password, name });
      if (result.error) {
        if (result.error.message?.includes('already')) {
          setApiError(tErr('emailExists'));
        } else {
          setApiError(tErr('generic'));
        }
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setApiError(tErr('generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 end-10 text-6xl opacity-10 animate-float">🎉</div>
        <div className="absolute top-1/3 start-20 text-5xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>🌟</div>
        <div className="absolute bottom-20 end-1/4 text-4xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>🏆</div>
        <div className="absolute top-2/3 start-1/3 text-5xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>🎓</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-[var(--surface)] rounded-3xl shadow-2xl shadow-amber-500/10 border border-[var(--border)] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-8 text-center text-white">
            <Link href="/" className="inline-block mb-4">
              <Logo size={40} showText textClassName="text-xl text-white" />
            </Link>
            <h1 className="text-2xl font-black mb-1">{t('title')}</h1>
            <p className="text-orange-100 text-sm">{t('subtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {apiError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--zkawi-red)]/10 border border-[var(--zkawi-red)]/30 text-[var(--zkawi-red)] rounded-2xl px-4 py-3 text-sm font-medium"
              >
                ⚠️ {apiError}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-bold text-[var(--text)] mb-2">{t('name')}</label>
              <Input
                type="text"
                placeholder={t('namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                icon={<User size={16} />}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--text)] mb-2">{t('email')}</label>
              <Input
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                icon={<Mail size={16} />}
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--text)] mb-2">{t('password')}</label>
              <Input
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={<Lock size={16} />}
                dir="ltr"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full text-amber-900"
              size="lg"
              loading={loading}
            >
              {loading ? t('loading') : t('submit')} 🎉
            </Button>

            <p className="text-center text-xs text-[var(--text-muted)]">
              {t('terms')}
            </p>

            <p className="text-center text-sm text-[var(--text-muted)]">
              {t('hasAccount')}{' '}
              <Link href="/login" className="text-[var(--zkawi-purple)] font-bold hover:opacity-80">
                {t('login')}
              </Link>
            </p>
          </form>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-sm text-[var(--text-muted)]"
        >
          🎁 مجاني 100% - مش محتاج بطاقة بنكية
        </motion.div>
      </motion.div>
    </div>
  );
}
