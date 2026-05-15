'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { useRouter } from '@/lib/i18n/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, BookOpen, Loader2, AlertCircle, Check } from 'lucide-react';

interface LessonRow {
  id: number;
  agentSlug: string;
  order: number;
  xpReward: number;
  estimatedMinutes: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

const EMPTY_FORM = { agentId: '', order: '', xpReward: '50', estimatedMinutes: '5', titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '' };

export default function AdminPage() {
  const locale = useLocale();
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.push('/login');
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    fetch('/api/admin/lessons')
      .then(async r => {
        if (r.status === 403) { setForbidden(true); return; }
        const data = await r.json();
        setLessons(data.lessons ?? []);
      })
      .finally(() => setLoading(false));
  }, [session]);

  async function createLesson() {
    setSaveError('');
    setSaving(true);
    setSaveOk(false);
    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: parseInt(form.agentId),
          order: parseInt(form.order) || 0,
          xpReward: parseInt(form.xpReward) || 50,
          estimatedMinutes: parseInt(form.estimatedMinutes) || 5,
          titleAr: form.titleAr,
          titleEn: form.titleEn,
          descriptionAr: form.descriptionAr || undefined,
          descriptionEn: form.descriptionEn || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.error ?? 'خطأ'); return; }
      setSaveOk(true);
      setForm(EMPTY_FORM);
      setShowForm(false);
      // Refresh list
      const listRes = await fetch('/api/admin/lessons');
      const listData = await listRes.json();
      setLessons(listData.lessons ?? []);
    } finally {
      setSaving(false);
    }
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Loader2 className="animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-3">
          <AlertCircle size={40} className="text-red-500" />
          <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            {locale === 'ar' ? 'غير مصرح لك بالدخول' : 'Access Denied'}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {locale === 'ar' ? 'هذه الصفحة للمدراء فقط' : 'This page is for admins only'}
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {locale === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {lessons.length} {locale === 'ar' ? 'درس' : 'lessons'}
            </p>
          </div>
          <Button onClick={() => { setShowForm(true); setSaveOk(false); }} style={{ background: 'var(--zkawi-purple)', color: '#fff' }}>
            <Plus size={14} className="me-1" />
            {locale === 'ar' ? 'درس جديد' : 'New Lesson'}
          </Button>
        </div>

        {saveOk && (
          <div className="flex items-center gap-2 text-sm text-green-600 px-3 py-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)' }}>
            <Check size={14} />
            {locale === 'ar' ? 'تم إنشاء الدرس بنجاح' : 'Lesson created successfully'}
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-5 flex flex-col gap-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                {locale === 'ar' ? 'إنشاء درس جديد' : 'Create New Lesson'}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'agentId', label: locale === 'ar' ? 'ID الوكيل' : 'Agent ID', type: 'number', placeholder: '1' },
                  { key: 'order', label: locale === 'ar' ? 'الترتيب' : 'Order', type: 'number', placeholder: '0' },
                  { key: 'xpReward', label: 'XP', type: 'number', placeholder: '50' },
                  { key: 'estimatedMinutes', label: locale === 'ar' ? 'الدقائق' : 'Minutes', type: 'number', placeholder: '5' },
                  { key: 'titleAr', label: locale === 'ar' ? 'العنوان (عربي)' : 'Title (AR)', type: 'text', placeholder: 'ما هو الذكاء الاصطناعي؟' },
                  { key: 'titleEn', label: locale === 'ar' ? 'العنوان (إنجليزي)' : 'Title (EN)', type: 'text', placeholder: 'What is AI?' },
                  { key: 'descriptionAr', label: locale === 'ar' ? 'الوصف (عربي)' : 'Description (AR)', type: 'text', placeholder: '...' },
                  { key: 'descriptionEn', label: locale === 'ar' ? 'الوصف (إنجليزي)' : 'Description (EN)', type: 'text', placeholder: '...' },
                ].map(field => (
                  <div key={field.key} className="flex flex-col gap-1">
                    <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="rounded-lg px-3 py-2 text-sm outline-none"
                      style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
                    />
                  </div>
                ))}
              </div>
              {saveError && <p className="text-xs text-red-500">{saveError}</p>}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setSaveError(''); }}>
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button size="sm" onClick={createLesson} disabled={saving} style={{ background: 'var(--zkawi-purple)', color: '#fff' }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : (locale === 'ar' ? 'إنشاء' : 'Create')}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Lessons table */}
        <Card style={{ background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['ID', locale === 'ar' ? 'الوكيل' : 'Agent', locale === 'ar' ? 'العنوان (AR)' : 'Title (AR)', locale === 'ar' ? 'العنوان (EN)' : 'Title (EN)', 'XP', locale === 'ar' ? 'الترتيب' : 'Order'].map(h => (
                    <th key={h} className="text-start px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lessons.map((l, i) => (
                  <motion.tr
                    key={l.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{l.id}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text)' }}>
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={12} style={{ color: 'var(--zkawi-purple)' }} />
                        {l.agentSlug}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{l.titleAr || '—'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text)' }}>{l.titleEn || '—'}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--zkawi-purple)' }}>{l.xpReward}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{l.order}</td>
                  </motion.tr>
                ))}
                {lessons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      {locale === 'ar' ? 'لا توجد دروس بعد' : 'No lessons yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
