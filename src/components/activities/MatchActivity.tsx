'use client';
import { useState } from 'react';

export interface MatchItem {
  id: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

interface MatchActivityProps {
  items: MatchItem[];
  locale: string;
  onComplete: (score: number) => void;
}

export default function MatchActivity({ items, locale, onComplete }: MatchActivityProps) {
  const isRtl = locale === 'ar';
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [score, setScore] = useState(100);

  const questions = items.map(i => ({ id: `q-${i.id}`, text: isRtl ? i.questionAr : i.questionEn, matchId: i.id }));
  const answers = [...items].sort(() => Math.random() - 0.5)
    .map(i => ({ id: `a-${i.id}`, text: isRtl ? i.answerAr : i.answerEn, matchId: i.id }));

  function handleSelect(id: string, matchId: string, type: 'q' | 'a') {
    if (matched.has(matchId)) return;
    if (!selected) { setSelected(id); return; }

    const selectedMatchId = selected.replace(/^[qa]-/, '');
    if (selectedMatchId === matchId) {
      setMatched(prev => new Set([...prev, matchId]));
      setSelected(null);
      if (matched.size + 1 === items.length) {
        onComplete(score);
      }
    } else {
      setWrong(id);
      setScore(s => Math.max(0, s - 10));
      setTimeout(() => { setWrong(null); setSelected(null); }, 600);
    }
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-4">
      <p className="text-sm text-gray-500 text-center">
        {isRtl ? 'صل كل سؤال بالإجابة الصحيحة' : 'Match each question with its correct answer'}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {questions.map(q => (
            <button
              key={q.id}
              type="button"
              onClick={() => handleSelect(q.id, q.matchId, 'q')}
              disabled={matched.has(q.matchId)}
              className={[
                'w-full text-start px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all min-h-[48px]',
                matched.has(q.matchId) ? 'bg-green-50 border-green-300 text-green-700' :
                selected === q.id ? 'bg-blue-50 border-blue-400 text-blue-800 scale-105' :
                wrong === q.id ? 'bg-red-50 border-red-300 animate-pulse' :
                'bg-white border-gray-200 hover:border-blue-300',
              ].join(' ')}
            >
              {q.text}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {answers.map(a => (
            <button
              key={a.id}
              type="button"
              onClick={() => handleSelect(a.id, a.matchId, 'a')}
              disabled={matched.has(a.matchId)}
              className={[
                'w-full text-start px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all min-h-[48px]',
                matched.has(a.matchId) ? 'bg-green-50 border-green-300 text-green-700' :
                selected === a.id ? 'bg-purple-50 border-purple-400 text-purple-800 scale-105' :
                wrong === a.id ? 'bg-red-50 border-red-300 animate-pulse' :
                'bg-white border-gray-200 hover:border-purple-300',
              ].join(' ')}
            >
              {a.text}
            </button>
          ))}
        </div>
      </div>
      <div className="text-center text-xs text-gray-400">
        {matched.size}/{items.length} {isRtl ? 'مكتملة' : 'matched'}
      </div>
    </div>
  );
}
