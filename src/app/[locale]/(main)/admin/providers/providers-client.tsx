'use client';
import { useEffect, useState } from 'react';

interface Provider {
  Id: string;
  Name: string;
  Description: string | null;
  BaseUrl: string;
  IsActive: boolean;
  CreatedAt: string;
}

interface RoutingRule {
  Id: string;
  TaskType: string;
  Priority: number;
  IsActive: boolean;
  ModelName: string;
  ProviderName: string;
  ModelId: string;
}

export default function ProvidersClient({ locale }: { locale: string }) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const isRtl = locale === 'ar';

  useEffect(() => {
    async function load() {
      const [p, r] = await Promise.all([
        fetch('/api/v1/admin/providers').then(r => r.json()),
        fetch('/api/v1/admin/routing-rules').then(r => r.json()),
      ]);
      setProviders(p.Data ?? []);
      setRules(r.Data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function toggleProvider(id: string, current: boolean) {
    await fetch(`/api/v1/admin/providers/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ IsActive: !current }),
    });
    setProviders(prev => prev.map(p => p.Id === id ? { ...p, IsActive: !current } : p));
  }

  if (loading) return <div className="p-8 text-center">جارٍ التحميل...</div>;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">إدارة موفّري الذكاء الاصطناعي</h1>

      {/* Providers Table */}
      <section>
        <h2 className="text-xl font-semibold mb-4">الموفّرون</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-start">الاسم</th>
                <th className="px-4 py-3 text-start">الرابط</th>
                <th className="px-4 py-3 text-start">الحالة</th>
                <th className="px-4 py-3 text-start">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {providers.map(p => (
                <tr key={p.Id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{p.Name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.BaseUrl}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${p.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.IsActive ? 'نشط' : 'معطّل'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleProvider(p.Id, p.IsActive)}
                      className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                    >
                      {p.IsActive ? 'تعطيل' : 'تفعيل'}
                    </button>
                  </td>
                </tr>
              ))}
              {providers.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">لا يوجد موفّرون بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Routing Rules Table */}
      <section>
        <h2 className="text-xl font-semibold mb-4">قواعد التوجيه</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-start">نوع المهمة</th>
                <th className="px-4 py-3 text-start">النموذج</th>
                <th className="px-4 py-3 text-start">الموفّر</th>
                <th className="px-4 py-3 text-start">الأولوية</th>
                <th className="px-4 py-3 text-start">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.Id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-mono text-xs">{r.TaskType}</td>
                  <td className="px-4 py-3">{r.ModelName}</td>
                  <td className="px-4 py-3 text-gray-500">{r.ProviderName}</td>
                  <td className="px-4 py-3 text-center">{r.Priority}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${r.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.IsActive ? 'نشط' : 'معطّل'}
                    </span>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">لا توجد قواعد توجيه بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
