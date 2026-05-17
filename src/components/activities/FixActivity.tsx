'use client';
import { useState } from 'react';
import { Search, XCircle, CheckCircle2 } from 'lucide-react';

export interface FixItem {
  id: string;
  wrongCodeAr: string;
  wrongCodeEn: string;
  correctCodeAr: string;
  correctCodeEn: string;
  explanationAr: string;
  explanationEn: string;
}

interface FixActivityProps {
  item: FixItem;
  locale: string;
  onAnswer: (correct: boolean) => void;
}

export default function FixActivity({ item, locale, onAnswer }: FixActivityProps) {
  const isRtl = locale === 'ar';
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const wrongCode = isRtl ? item.wrongCodeAr : item.wrongCodeEn;
  const correctCode = isRtl ? item.correctCodeAr : item.correctCodeEn;
  const explanation = isRtl ? item.explanationAr : item.explanationEn;

  function handleSubmit() {
    const correct = userAnswer.trim().toLowerCase().replace(/\s+/g, ' ') ===
      correctCode.trim().toLowerCase().replace(/\s+/g, ' ');
    setIsCorrect(correct);
    setSubmitted(true);
    setTimeout(() => onAnswer(correct), 1000);
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-4">
      <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
        <Search size={16} />
        {isRtl ? 'ما الخطأ في هذا الكود؟ صحّحه:' : "What's wrong? Fix it:"}
      </p>

      {/* Wrong code (highlighted) */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 font-mono text-sm">
        <p className="text-xs text-red-400 mb-2 flex items-center gap-1">
          <XCircle size={14} />
          {isRtl ? 'كود خاطئ' : 'Wrong code'}
        </p>
        <code className="text-red-700 whitespace-pre-wrap">{wrongCode}</code>
      </div>

      {/* User input */}
      {!submitted && (
        <div>
          <textarea
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            placeholder={isRtl ? 'اكتب الكود المصحَّح هنا...' : 'Write the corrected code here...'}
            className="w-full border-2 border-gray-200 rounded-2xl p-3 font-mono text-sm focus:border-blue-400 focus:outline-none resize-none min-h-[80px]"
            rows={3}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
            className="w-full mt-2 bg-blue-500 text-white py-3 rounded-2xl font-semibold disabled:opacity-40 hover:bg-blue-600 min-h-[48px]"
          >
            {isRtl ? 'تحقق من الإجابة ←' : '→ Check Answer'}
          </button>
        </div>
      )}

      {/* Result */}
      {submitted && (
        <div className={`rounded-2xl p-4 ${isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
          <p className="font-bold mb-2 flex items-center gap-1">
            {isCorrect
              ? <><CheckCircle2 size={18} className="text-green-600" />{isRtl ? 'ممتاز!' : 'Excellent!'}</>
              : <><XCircle size={18} className="text-red-600" />{isRtl ? 'ليس تماماً' : 'Not quite'}</>}
          </p>
          <p className="text-sm text-gray-600 mb-2">{explanation}</p>
          {!isCorrect && (
            <div className="bg-green-50 rounded-xl p-3 mt-2">
              <p className="text-xs text-green-600 mb-1">{isRtl ? 'الإجابة الصحيحة:' : 'Correct answer:'}</p>
              <code className="text-green-700 font-mono text-sm whitespace-pre-wrap">{correctCode}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
