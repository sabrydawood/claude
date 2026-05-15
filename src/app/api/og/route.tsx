import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';
import { getDir } from '@/lib/i18n/locale-utils';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';

type Messages = typeof en;
const MESSAGES: Record<string, Messages> = { en, ar };

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get('title') ?? 'ذكاوي';
  const agent = searchParams.get('agent') ?? 'Claude';
  const locale = searchParams.get('locale') ?? 'ar';
  const type = searchParams.get('type') ?? 'lesson'; // 'lesson' | 'agent' | 'home' | 'achievement'
  const emoji = searchParams.get('emoji') ?? '🏆';
  const xp = searchParams.get('xp') ?? '';
  const lessons = searchParams.get('lessons') ?? '';

  const dir = getDir(locale);
  const ogMsgs = (MESSAGES[locale] ?? MESSAGES.ar).og;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #3B0764 0%, #4C1D95 50%, #1E1B4B 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Background circles */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
          background: 'rgba(124,58,237,0.15)', left: '-100px', top: '-100px', display: 'flex',
        }} />
        <div style={{
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
          background: 'rgba(168,85,247,0.1)', right: '-50px', bottom: '-100px', display: 'flex',
        }} />

        {/* Dot grid decorations */}
        {[0,1,2,3].map((i) => (
          <div key={i} style={{
            position: 'absolute', width: '6px', height: '6px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            left: `${80 + i * 100}px`, top: '60px', display: 'flex',
          }} />
        ))}

        {/* Gold sparkles */}
        <div style={{
          position: 'absolute', width: '16px', height: '16px', borderRadius: '50%',
          background: '#FCD34D', right: '120px', top: '80px', display: 'flex',
        }} />
        <div style={{
          position: 'absolute', width: '12px', height: '12px', borderRadius: '50%',
          background: '#FCD34D', left: '100px', bottom: '120px', display: 'flex', opacity: 0.8,
        }} />

        {/* Robot icon placeholder */}
        <div style={{
          position: 'absolute', left: '80px', top: '140px',
          width: '220px', height: '220px', borderRadius: '52px',
          background: 'linear-gradient(135deg, #A78BFA, #5B21B6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 20px 60px rgba(91,33,182,0.5)',
        }}>
          {/* Robot face */}
          <div style={{
            width: '160px', height: '120px', borderRadius: '36px',
            background: 'rgba(255,255,255,0.95)', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
          }}>
            {/* Eyes row */}
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{
                width: '40px', height: '28px', borderRadius: '14px',
                background: '#7C3AED', display: 'flex',
              }} />
              <div style={{
                width: '40px', height: '28px', borderRadius: '14px',
                background: '#7C3AED', display: 'flex',
              }} />
            </div>
            {/* Smile */}
            <div style={{
              width: '60px', height: '12px', borderRadius: '6px',
              background: '#7C3AED', display: 'flex',
            }} />
          </div>
        </div>

        {/* Content area */}
        <div style={{
          position: 'absolute', left: '360px', top: '100px', right: '80px',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          {/* Agent badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.12)', borderRadius: '24px',
            padding: '8px 20px', width: 'fit-content',
          }}>
            <span style={{ color: '#FCD34D', fontSize: '18px' }}>⚡</span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '18px', fontWeight: '600' }}>
              {agent}
            </span>
          </div>

          {/* Main title */}
          <div style={{
            color: 'white',
            fontSize: type === 'home' ? '72px' : '58px',
            fontWeight: '900',
            lineHeight: '1.15',
            letterSpacing: '-1px',
            direction: dir,
          }}>
            {title}
          </div>

          {/* Tagline */}
          <div style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '24px',
            fontWeight: '400',
            direction: dir,
          }}>
            {ogMsgs.platform}
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            {[ogMsgs.interactive, ogMsgs.xpPoints, ogMsgs.arabicFirst].map((pill) => (
              <div key={pill} style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '20px', padding: '8px 18px',
                color: 'white', fontSize: '18px', display: 'flex',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                {pill}
              </div>
            ))}
          </div>
        </div>

        {/* Brand name bottom */}
        <div style={{
          position: 'absolute', bottom: '32px', left: '80px',
          color: 'rgba(255,255,255,0.45)', fontSize: '20px', fontWeight: '600',
          letterSpacing: '2px', display: 'flex',
        }}>
          ZKAWI.APP
        </div>

        {/* Achievement overlay — shown when type=achievement */}
        {type === 'achievement' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #1E1B4B 0%, #2D1B69 50%, #0F0A1E 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '24px',
          }}>
            <div style={{ fontSize: '120px', display: 'flex' }}>{emoji}</div>
            <div style={{ color: 'white', fontSize: '56px', fontWeight: '900', textAlign: 'center', direction: dir }}>
              {title}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '28px', textAlign: 'center', direction: dir }}>
              {ogMsgs.achievementUnlocked}
            </div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
              {xp && <div style={{ background: 'rgba(124,58,237,0.3)', borderRadius: '20px', padding: '10px 24px', color: '#A78BFA', fontSize: '22px', display: 'flex', border: '1px solid rgba(124,58,237,0.5)' }}>⭐ {xp} XP</div>}
              {lessons && <div style={{ background: 'rgba(16,185,129,0.2)', borderRadius: '20px', padding: '10px 24px', color: '#6EE7B7', fontSize: '22px', display: 'flex', border: '1px solid rgba(16,185,129,0.4)' }}>📚 {lessons} {ogMsgs.lessons}</div>}
            </div>
          </div>
        )}

        {/* Bottom gold accent line */}
        <div style={{
          position: 'absolute', bottom: '0px', left: '0', right: '0', height: '6px',
          background: 'linear-gradient(90deg, #FCD34D, #F59E0B, #FCD34D)',
          display: 'flex',
        }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
