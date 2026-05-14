'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUp } from '@/lib/auth-client';
import { Mail, Lock, User, Zap } from 'lucide-react';

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
      const result = await signUp.email({
        email,
        password,
        name,
      });

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
    } catch (err) {
      setApiError(tErr('generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 end-10 text-6xl opacity-20 animate-float">🎉</div>
        <div className="absolute top-1/3 start-20 text-5xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>🌟</div>
        <div className="absolute bottom-20 end-1/4 text-4xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>🏆</div>
        <div className="absolute top-2/3 start-1/3 text-5xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🎓</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-amber-100 border border-amber-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-8 text-center text-white">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap size={20} className="text-white" fill="white" />
              </div>
              <span className="text-xl font-black">ذكاوي</span>
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
                className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm font-medium"
              >
                ⚠️ {apiError}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">{t('name')}</label>
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
              <label className="block text-sm font-bold text-gray-700 mb-2">{t('email')}</label>
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
              <label className="block text-sm font-bold text-gray-700 mb-2">{t('password')}</label>
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

            <p className="text-center text-xs text-gray-400">
              {t('terms')}
            </p>

            <p className="text-center text-sm text-gray-500">
              {t('hasAccount')}{' '}
              <Link href="/login" className="text-purple-600 font-bold hover:text-purple-800">
                {t('login')}
              </Link>
            </p>
          </form>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-sm text-gray-400"
        >
          🎁 مجاني 100% - مش محتاج بطاقة بنكية
        </motion.div>
      </motion.div>
    </div>
  );
}
