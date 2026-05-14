/**
 * db:seed — inserts all base data using the translations table pattern.
 * All text content lives in `translations`; base tables hold only non-i18n data.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { db } from './index';
import {
  agents as agentsTable,
  lessons as lessonsTable,
  quizQuestions,
  quizOptions,
  achievements as achievementsTable,
  tracks as tracksTable,
  translations,
} from './schema';
import { agents as agentContent, claudeLessons, promptEngineeringLessons, claudeApiLessons } from '../content/claude-lessons';

const allLessonsToSeed = [...claudeLessons, ...promptEngineeringLessons, ...claudeApiLessons];

// ─── helper: bulk insert translations for one entity ─────────────────────────
async function insertTranslations(
  entityType: string,
  entityId: number,
  rows: Array<{ locale: string; field: string; value: string }>,
) {
  if (rows.length === 0) return;
  await db.insert(translations).values(
    rows.map((r) => ({ entityType, entityId, ...r })),
  );
}

// ─── Achievements data ────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  {
    emoji: '🎯',
    conditionType: 'lessons_completed',
    conditionValue: 1,
    ar: { name: 'أول خطوة', description: 'كملت أول درس ليك!' },
    en: { name: 'First Step', description: 'You completed your first lesson!' },
  },
  {
    emoji: '🚀',
    conditionType: 'lessons_completed',
    conditionValue: 3,
    ar: { name: 'على الطريق الصح', description: 'كملت 3 دروس — انت بتتقدم!' },
    en: { name: 'On the Right Track', description: "Completed 3 lessons — you're progressing!" },
  },
  {
    emoji: '🏆',
    conditionType: 'lessons_completed',
    conditionValue: 5,
    ar: { name: 'متعلم نشيط', description: 'كملت كل دروس Claude — عظيم!' },
    en: { name: 'Active Learner', description: 'Completed all Claude lessons — amazing!' },
  },
  {
    emoji: '⭐',
    conditionType: 'perfect_quiz',
    conditionValue: 1,
    ar: { name: 'نجم الكويز', description: 'جبت 100% في كويز — أنت نجم!' },
    en: { name: 'Quiz Star', description: "Scored 100% in a quiz — you're a star!" },
  },
  {
    emoji: '🔥',
    conditionType: 'streak_days',
    conditionValue: 7,
    ar: { name: 'سبع أيام', description: 'فتحت التطبيق 7 أيام متواصلة — رائع!' },
    en: { name: 'Seven Days', description: 'Opened the app 7 days in a row — amazing!' },
  },
  {
    emoji: '💎',
    conditionType: 'total_xp',
    conditionValue: 200,
    ar: { name: 'جامع النقاط', description: 'وصلت لـ 200 نقطة XP!' },
    en: { name: 'XP Collector', description: 'Reached 200 XP points!' },
  },
  {
    emoji: '🤖',
    conditionType: 'agent_completed',
    conditionValue: 1,
    ar: { name: 'صاحب Claude', description: 'قضيت وقت كويس مع Claude — اتعلمت حاجات جميلة!' },
    en: { name: "Claude's Friend", description: 'Spent good time with Claude — you learned great things!' },
  },
  {
    emoji: '🌟',
    conditionType: 'total_xp',
    conditionValue: 500,
    ar: { name: 'صانع المستقبل', description: 'وصلت لـ 500 نقطة XP — انت من صانعي المستقبل!' },
    en: { name: 'Future Maker', description: 'Reached 500 XP — you are a future maker!' },
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starting seed (translations-based schema)...\n');

  let totalTranslations = 0;

  // ── 0. Tracks ──────────────────────────────────────────────────────────────
  console.log('🎯 Inserting learning tracks...');
  const TRACKS = [
    {
      slug: 'explorer', emoji: '🚀', order: 0, isDefault: true,
      ar: { name: 'المستكشف', description: 'ابدأ رحلتك في الذكاء الاصطناعي من الصفر', personaDescription: 'مبتدئ فضولي يريد فهم الذكاء الاصطناعي' },
      en: { name: 'Explorer', description: 'Start your AI journey from scratch', personaDescription: 'A curious beginner who wants to understand AI' },
    },
    {
      slug: 'creator', emoji: '🎨', order: 1, isDefault: false,
      ar: { name: 'المبدع', description: 'استخدم الذكاء الاصطناعي في الإبداع والكتابة', personaDescription: 'مبدع يريد توظيف AI في أعماله الإبداعية' },
      en: { name: 'Creator', description: 'Use AI for creative work and writing', personaDescription: 'A creative who wants to leverage AI in their work' },
    },
    {
      slug: 'engineer', emoji: '⚙️', order: 2, isDefault: false,
      ar: { name: 'المهندس', description: 'أتقن الـ Prompt Engineering والاستخدام الاحترافي', personaDescription: 'محترف يريد إتقان هندسة المطالبات' },
      en: { name: 'Engineer', description: 'Master Prompt Engineering and professional use', personaDescription: 'A professional who wants to master prompt engineering' },
    },
    {
      slug: 'developer', emoji: '💻', order: 3, isDefault: false,
      ar: { name: 'المطور', description: 'ابنِ تطبيقات باستخدام Claude API', personaDescription: 'مطور يريد بناء تطبيقات بالذكاء الاصطناعي' },
      en: { name: 'Developer', description: 'Build applications using Claude API', personaDescription: 'A developer who wants to build AI-powered applications' },
    },
    {
      slug: 'educator', emoji: '📚', order: 4, isDefault: false,
      ar: { name: 'المعلم', description: 'وظّف الذكاء الاصطناعي في التعليم والتدريس', personaDescription: 'معلم يريد توظيف AI في الفصل الدراسي' },
      en: { name: 'Educator', description: 'Use AI in teaching and education', personaDescription: 'An educator who wants to bring AI into the classroom' },
    },
  ];

  const insertedTracks = await db.insert(tracksTable).values(
    TRACKS.map(t => ({ slug: t.slug, emoji: t.emoji, order: t.order, isDefault: t.isDefault }))
  ).returning();

  for (const track of insertedTracks) {
    const data = TRACKS.find(t => t.slug === track.slug)!;
    const rows = [
      { locale: 'ar', field: 'name', value: data.ar.name },
      { locale: 'ar', field: 'description', value: data.ar.description },
      { locale: 'ar', field: 'persona_description', value: data.ar.personaDescription },
      { locale: 'en', field: 'name', value: data.en.name },
      { locale: 'en', field: 'description', value: data.en.description },
      { locale: 'en', field: 'persona_description', value: data.en.personaDescription },
    ];
    await insertTranslations('track', track.id, rows);
    totalTranslations += rows.length;
  }
  console.log(`   ✓ ${insertedTracks.length} tracks (${insertedTracks.length * 6} translations)\n`);

  // ── 1. Agents ──────────────────────────────────────────────────────────────
  console.log('📦 Inserting agents...');
  const insertedAgents = await db
    .insert(agentsTable)
    .values(
      agentContent.map((a) => ({
        slug: a.slug,
        color: a.color,
        emoji: a.emoji,
        isActive: a.isActive,
        order: a.order,
      })),
    )
    .returning();

  for (const agent of insertedAgents) {
    const src = agentContent.find((a) => a.slug === agent.slug)!;
    await insertTranslations('agent', agent.id, [
      { locale: 'ar', field: 'name',             value: src.nameAr },
      { locale: 'ar', field: 'description',      value: src.descriptionAr },
      { locale: 'ar', field: 'full_description', value: src.fullDescriptionAr },
      { locale: 'en', field: 'name',             value: src.nameEn },
      { locale: 'en', field: 'description',      value: src.descriptionEn },
      { locale: 'en', field: 'full_description', value: src.fullDescriptionEn },
    ]);
    totalTranslations += 6;
    console.log(`   ✓ ${src.nameEn} (id=${agent.id}, active=${agent.isActive})`);
  }

  // ── 2. Claude lessons ──────────────────────────────────────────────────────
  const claudeAgent = insertedAgents.find((a) => a.slug === 'claude')!;
  console.log('\n📚 Inserting Claude lessons...');

  let totalQuizQ = 0;
  let totalQuizOpts = 0;

  for (const lesson of allLessonsToSeed) {
    // Insert lesson (no text columns)
    const [dbLesson] = await db
      .insert(lessonsTable)
      .values({
        agentId: claudeAgent.id,
        order: lesson.order,
        xpReward: lesson.xpReward,
        estimatedMinutes: lesson.estimatedMinutes,
      })
      .returning();

    // Insert lesson translations
    await insertTranslations('lesson', dbLesson.id, [
      { locale: 'ar', field: 'title',       value: lesson.titleAr },
      { locale: 'ar', field: 'description', value: lesson.descriptionAr },
      { locale: 'ar', field: 'content',     value: lesson.contentAr },
      { locale: 'en', field: 'title',       value: lesson.titleEn },
      { locale: 'en', field: 'description', value: lesson.descriptionEn },
      { locale: 'en', field: 'content',     value: lesson.contentEn },
    ]);
    totalTranslations += 6;

    console.log(`   ✓ Lesson ${dbLesson.id}: ${lesson.titleEn}`);

    // ── Quiz questions ────────────────────────────────────────────────────────
    for (let qi = 0; qi < lesson.quiz.length; qi++) {
      const q = lesson.quiz[qi];

      const [dbQ] = await db
        .insert(quizQuestions)
        .values({ lessonId: dbLesson.id, type: q.type, order: qi })
        .returning();

      await insertTranslations('quiz_question', dbQ.id, [
        { locale: 'ar', field: 'question', value: q.questionAr },
        { locale: 'en', field: 'question', value: q.questionEn },
      ]);
      totalTranslations += 2;
      totalQuizQ++;

      // ── Quiz options ────────────────────────────────────────────────────────
      for (let oi = 0; oi < q.options.length; oi++) {
        const opt = q.options[oi];

        const [dbOpt] = await db
          .insert(quizOptions)
          .values({ questionId: dbQ.id, isCorrect: opt.isCorrect, order: oi })
          .returning();

        await insertTranslations('quiz_option', dbOpt.id, [
          { locale: 'ar', field: 'text', value: opt.textAr },
          { locale: 'en', field: 'text', value: opt.textEn },
        ]);
        totalTranslations += 2;
        totalQuizOpts++;
      }
    }
  }

  // ── 3. Achievements ────────────────────────────────────────────────────────
  console.log('\n🏆 Inserting achievements...');
  for (const ach of ACHIEVEMENTS) {
    const [dbAch] = await db
      .insert(achievementsTable)
      .values({
        emoji: ach.emoji,
        conditionType: ach.conditionType,
        conditionValue: ach.conditionValue,
      })
      .returning();

    await insertTranslations('achievement', dbAch.id, [
      { locale: 'ar', field: 'name',        value: ach.ar.name },
      { locale: 'ar', field: 'description', value: ach.ar.description },
      { locale: 'en', field: 'name',        value: ach.en.name },
      { locale: 'en', field: 'description', value: ach.en.description },
    ]);
    totalTranslations += 4;
    console.log(`   ✓ ${ach.emoji} ${ach.ar.name}`);
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────────');
  console.log('✅ Seed complete!');
  console.log(`   Agents:        ${insertedAgents.length}`);
  console.log(`   Lessons:       ${claudeLessons.length}`);
  console.log(`   Quiz Qs:       ${totalQuizQ}`);
  console.log(`   Quiz options:  ${totalQuizOpts}`);
  console.log(`   Achievements:  ${ACHIEVEMENTS.length}`);
  console.log(`   Translations:  ${totalTranslations} rows`);
  console.log('──────────────────────────────────────────────\n');
  console.log('💡 To add a new language, just run upsertTranslations()');
  console.log('   from src/lib/db/i18n.ts — no schema changes needed.\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
