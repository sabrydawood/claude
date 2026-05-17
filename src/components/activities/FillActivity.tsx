'use client';
import { useState } from 'react';
import { Lightbulb } from 'lucide-react';

export interface FillItem {
  id: string;
  textAr: string;   // e.g. "الـ ___ تُستخدم لتكرار الكود"
  textEn: string;
  answerAr: string;
  answerEn: string;
  wordBankAr: string[];
  wordBankEn: string[];
  hintAr?: string;
  hintEn?: string;
}

interface FillActivityProps {
  item: FillItem;
  locale: string;
  onAnswer: (correct: boolean, hintsUsed: number) => void;
}

export default function FillActivity({ item, locale, onAnswer }: FillActivityProps) {
  const isRtl = locale === 'ar';
  const [selected, setSelected] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [answered, setAnswered] = useState(false);

  const text = isRtl ? item.textAr : item.textEn;
  const answer = isRtl ? item.answerAr : item.answerEn;
  const wordBank = isRtl ? item.wordBankAr : item.wordBankEn;
  const hint = isRtl ? item.hintAr : item.hintEn;

  const [before, after] = text.split('___');

  function handleSelect(word: string) {
    if (answered) return;
    setSelected(word);
    const correct = word.trim().toLowerCase() === answer.trim().toLowerCase();
    setAnswered(true);
    setTimeout(() => onAnswer(correct, hintsUsed), 800);
  }

  const xpPercent = hintsUsed === 0 ? 100 : hintsUsed === 1 ? 80 : 50;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-5">
      {/* Sentence with blank */}
      <div className="bg-blue-50 rounded-2xl p-4 text-center text-lg">
        <span>{before}</span>
        <span className={`inline-block min-w-[80px] mx-2 px-3 py-0.5 rounded-lg border-2 font-bold ${
          !selected ? 'border-dashed border-blue-300 text-blue-300' :
          selected === answer ? 'border-green-400 bg-green-100 text-green-700' :
          'border-red-400 bg-red-100 text-red-700'
        }`}>
          {selected ?? '___'}
        </span>
        <span>{after}</span>
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2 justify-center">
        {wordBank.map(word => (
          <button
            key={word}
            type="button"
            onClick={() => handleSelect(word)}
            disabled={answered}
            className="px-4 py-2 rounded-full border-2 border-blue-200 bg-white text-blue-700 font-medium text-sm hover:bg-blue-50 hover:border-blue-400 transition-all disabled:opacity-50 min-h-[44px]"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Hint */}
      {hint && !answered && (
        <div className="text-center">
          {!showHint ? (
            <button
              type="button"
              onClick={() => { setShowHint(true); setHintsUsed(h => h + 1); }}
              className="text-xs text-gray-400 underline inline-flex items-center gap-1"
            >
              <Lightbulb size={14} />
              {isRtl ? `تلميح (${xpPercent}% XP)` : `Hint (${xpPercent}% XP)`}
            </button>
          ) : (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
}
