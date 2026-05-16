export default async function AITrackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = locale === 'ar';

  const stages = [
    { id: 'curious', ageRange: '8-10', titleAr: 'فضولي', titleEn: 'Curious', descAr: 'ما هو الذكاء الاصطناعي؟', descEn: 'What is AI?', emoji: '🤔', unlocked: true },
    { id: 'thinker', ageRange: '10-12', titleAr: 'مفكّر', titleEn: 'Thinker', descAr: 'كيف يتعلم الكمبيوتر؟', descEn: 'How does AI learn?', emoji: '🧠', unlocked: true },
    { id: 'builder', ageRange: '12-14', titleAr: 'بانٍ', titleEn: 'Builder', descAr: 'Prompt Engineering', descEn: 'Prompt Engineering', emoji: '⚙️', unlocked: true },
    { id: 'creator', ageRange: '14-16', titleAr: 'مبتكر', titleEn: 'Creator', descAr: 'Python + ML', descEn: 'Python + ML', emoji: '🚀', unlocked: false },
  ];

  const tools = [
    { id: 'chatgpt', name: 'ChatGPT', emoji: '💬', descAr: 'مساعد OpenAI', descEn: 'OpenAI Assistant' },
    { id: 'claude', name: 'Claude', emoji: '🎯', descAr: 'مساعد Anthropic', descEn: 'Anthropic Assistant' },
    { id: 'gemini', name: 'Gemini', emoji: '♊', descAr: 'مساعد Google', descEn: 'Google Assistant' },
  ];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{isRtl ? '🤖 مسار الذكاء الاصطناعي' : '🤖 AI Track'}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {isRtl ? 'من المفاهيم إلى البناء الحقيقي' : 'From concepts to real building'}
        </p>
      </div>

      {/* Stages */}
      <section>
        <h2 className="font-semibold text-gray-700 mb-3">{isRtl ? 'المراحل' : 'Stages'}</h2>
        <div className="space-y-3">
          {stages.map((stage, i) => (
            <div
              key={stage.id}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${
                stage.unlocked ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              <span className="text-3xl">{stage.emoji}</span>
              <div className="flex-1">
                <p className="font-bold">{isRtl ? stage.titleAr : stage.titleEn}</p>
                <p className="text-sm text-gray-500">{isRtl ? stage.descAr : stage.descEn}</p>
              </div>
              <span className="text-xs text-gray-400">{stage.ageRange}{isRtl ? ' سنة' : ' yrs'}</span>
              {!stage.unlocked && <span>🔒</span>}
            </div>
          ))}
        </div>
      </section>

      {/* AI Tools */}
      <section>
        <h2 className="font-semibold text-gray-700 mb-3">{isRtl ? 'أدوات الذكاء الاصطناعي' : 'AI Tools'}</h2>
        <div className="grid grid-cols-3 gap-3">
          {tools.map(tool => (
            <div key={tool.id} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border-2 border-gray-200 text-center">
              <span className="text-3xl">{tool.emoji}</span>
              <p className="font-bold text-sm">{tool.name}</p>
              <p className="text-xs text-gray-500">{isRtl ? tool.descAr : tool.descEn}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
