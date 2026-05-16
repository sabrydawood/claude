'use client';
import { useEffect, useState } from 'react';

interface DailyData {
  totalActivities: number;
  correctAnswers: number;
}

interface WeeklyData {
  conceptsStudied: number;
  averageMastery: number;
}

interface DashboardData {
  daily: DailyData;
  weekly: WeeklyData;
  totalConcepts: number;
  masteryAvg: number;
}

export default function ParentDashboardClient({
  locale,
  userId,
}: {
  locale: string;
  userId: string;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const isRtl = locale === 'ar';

  useEffect(() => {
    fetch(`/api/v1/parent/dashboard?childId=${userId}`)
      .then(r => r.json())
      .then((r: { Data: DashboardData }) => {
        setData(r.Data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="p-8 text-center">
        جارٍ التحميل...
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">
        {isRtl ? 'لوحة تحكم الوالد' : 'Parent Dashboard'}
      </h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-700">
            {data?.daily?.totalActivities ?? 0}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            {isRtl ? 'نشاط اليوم' : "Today's Activities"}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-green-700">
            {data?.weekly?.averageMastery ?? 0}%
          </p>
          <p className="text-sm text-green-600 mt-1">
            {isRtl ? 'متوسط الإتقان' : 'Avg Mastery'}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-700">
            {data?.weekly?.conceptsStudied ?? 0}
          </p>
          <p className="text-sm text-purple-600 mt-1">
            {isRtl ? 'مفاهيم هذا الأسبوع' : 'Concepts this week'}
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-orange-700">
            {data?.totalConcepts ?? 0}
          </p>
          <p className="text-sm text-orange-600 mt-1">
            {isRtl ? 'إجمالي المفاهيم' : 'Total Concepts'}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 border">
        <h2 className="font-semibold mb-2">
          {isRtl ? '📊 ملخص الأسبوع' : '📊 Weekly Summary'}
        </h2>
        <p className="text-sm text-gray-600">
          {isRtl
            ? `تعلّم طفلك ${data?.weekly?.conceptsStudied ?? 0} مفهوماً هذا الأسبوع بمتوسط إتقان ${data?.weekly?.averageMastery ?? 0}%.`
            : `Your child studied ${data?.weekly?.conceptsStudied ?? 0} concepts this week with ${data?.weekly?.averageMastery ?? 0}% average mastery.`}
        </p>
      </div>
    </div>
  );
}
