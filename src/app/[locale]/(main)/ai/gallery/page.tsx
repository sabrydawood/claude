import { getTranslations } from 'next-intl/server';

export default async function PromptGalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = locale === 'ar';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{isRtl ? '🎨 معرض الـ Prompts' : '🎨 Prompt Gallery'}</h1>
      <p className="text-gray-500 text-sm mb-6">
        {isRtl ? 'اكتشف prompts من زملائك — جميعها مجهولة ومراجَعة' : 'Discover prompts from peers — all anonymous and reviewed'}
      </p>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['الكل', 'استكشاف', 'تحدٍّ', 'إبداع', 'شرح', 'مشروع'].map(cat => (
          <button
            key={cat}
            type="button"
            className="px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div className="text-center py-16 bg-gray-50 rounded-3xl">
        <div className="text-4xl mb-3">🌱</div>
        <p className="font-semibold text-gray-600">
          {isRtl ? 'المعرض سيُطلق قريباً' : 'Gallery launching soon'}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {isRtl ? 'كن أول من يشارك Prompt!' : 'Be the first to share a Prompt!'}
        </p>
      </div>
    </div>
  );
}
