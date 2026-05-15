'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Check, Loader2, Settings, Lock } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';

interface SettingsClientProps {
  initialName: string;
  userEmail: string;
}

export default function SettingsClient({ initialName, userEmail }: SettingsClientProps) {
  const t = useTranslations('settings');

  // Profile state
  const [name, setName] = useState(initialName);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setProfileSaving(true);
    try {
      const result = await authClient.updateUser({ name: name.trim() });
      if (result.error) {
        setProfileError(t('profile.saveError'));
      } else {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch {
      setProfileError(t('profile.saveError'));
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError(t('password.minLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('password.mismatch'));
      return;
    }

    setPasswordSaving(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      if (result.error) {
        setPasswordError(t('password.saveError'));
      } else {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch {
      setPasswordError(t('password.saveError'));
    } finally {
      setPasswordSaving(false);
    }
  }

  const inputClass =
    'w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--zkawi-purple)]';
  const inputStyle = {
    background: 'var(--bg)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl flex flex-col gap-6">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {t('title')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('subtitle')}
          </p>
        </div>

        {/* Profile section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Card
            className="p-5 flex flex-col gap-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <Settings size={18} style={{ color: 'var(--zkawi-purple)' }} />
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                {t('profile.title')}
              </h2>
            </div>

            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {userEmail}
            </p>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {t('profile.name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('profile.namePlaceholder')}
                  className={inputClass}
                  style={inputStyle}
                  required
                />
              </div>

              {profileError && <p className="text-xs text-red-500">{profileError}</p>}
              {profileSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-green-600">
                  <Check size={12} />
                  {t('profile.saveSuccess')}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={profileSaving}
                  style={{ background: 'var(--zkawi-purple)', color: '#fff' }}
                >
                  {profileSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    t('profile.saveProfile')
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Password section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <Card
            className="p-5 flex flex-col gap-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <Lock size={18} style={{ color: 'var(--zkawi-purple)' }} />
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                {t('password.title')}
              </h2>
            </div>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {t('password.current')}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {t('password.new')}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {t('password.confirm')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                  required
                />
              </div>

              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
              {passwordSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-green-600">
                  <Check size={12} />
                  {t('password.saveSuccess')}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={passwordSaving}
                  style={{ background: 'var(--zkawi-purple)', color: '#fff' }}
                >
                  {passwordSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    t('password.save')
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
