/**
 * Seed.ts
 * Populates the database with initial content using per-entity translation tables.
 * Run: bun run db:seed
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { uuidv7 } from 'uuidv7';
import { db } from './Index';
import {
  Agents, AgentTranslations,
  Lessons, LessonTranslations,
  QuizQuestions, QuizQuestionTranslations,
  QuizOptions, QuizOptionTranslations,
  Tracks, TrackTranslations,
  Achievements, AchievementTranslations,
} from './Schema';
import {
  agents as AgentContent,
  claudeLessons, promptEngineeringLessons,
  claudeApiLessons, developerLessons,
} from '../content/claude-lessons';

const AllLessons = [...claudeLessons, ...promptEngineeringLessons, ...claudeApiLessons, ...developerLessons];

const ACHIEVEMENTS_DATA = [
  { emoji: '🎯', conditionType: 'lessons_completed', conditionValue: 1,  nameAr: 'أول خطوة',      nameEn: 'First Step',        descAr: 'كملت أول درس ليك!',           descEn: 'You completed your first lesson!' },
  { emoji: '🚀', conditionType: 'lessons_completed', conditionValue: 3,  nameAr: 'على الطريق',     nameEn: 'On the Right Track', descAr: 'كملت 3 دروس — انت بتتقدم!',   descEn: "Completed 3 lessons — you're progressing!" },
  { emoji: '🏆', conditionType: 'lessons_completed', conditionValue: 5,  nameAr: 'متعلم نشيط',    nameEn: 'Active Learner',     descAr: 'كملت 5 دروس — عظيم!',          descEn: 'Completed 5 lessons — amazing!' },
  { emoji: '⭐', conditionType: 'xp_earned',          conditionValue: 100, nameAr: 'جامع النقاط',  nameEn: 'Point Collector',   descAr: 'جمعت 100 XP!',                 descEn: 'Earned 100 XP!' },
  { emoji: '💫', conditionType: 'xp_earned',          conditionValue: 500, nameAr: 'على الطريق',   nameEn: 'On the Way',        descAr: 'جمعت 500 XP',                  descEn: 'Collected 500 XP' },
  { emoji: '👑', conditionType: 'xp_earned',          conditionValue: 1000,nameAr: 'خبير ذكاوي',   nameEn: 'Zkawi Expert',      descAr: 'جمعت 1000 XP',                 descEn: 'Collected 1000 XP' },
  { emoji: '🔥', conditionType: 'streak_days',        conditionValue: 3,  nameAr: 'متحمس',          nameEn: 'Enthusiast',        descAr: '3 أيام متتالية — استمر!',       descEn: '3 days in a row — keep going!' },
  { emoji: '⚡', conditionType: 'streak_days',        conditionValue: 7,  nameAr: 'مواظب',           nameEn: 'Consistent',        descAr: '7 أيام متتالية — رائع!',        descEn: '7 days streak — amazing!' },
];

const TRACKS_DATA = [
  { slug: 'explorer',  emoji: '🧭', order: 1, isDefault: true,  nameAr: 'المستكشف', nameEn: 'Explorer',  descAr: 'للمبتدئين الفضوليين', descEn: 'For curious beginners exploring AI' },
  { slug: 'creator',   emoji: '🎨', order: 2, isDefault: false, nameAr: 'المبدع',    nameEn: 'Creator',   descAr: 'للمبدعين',             descEn: 'For creatives using AI' },
  { slug: 'engineer',  emoji: '⚙️', order: 3, isDefault: false, nameAr: 'المهندس',   nameEn: 'Engineer',  descAr: 'للمحترفين التقنيين',    descEn: 'For advanced technical professionals' },
  { slug: 'developer', emoji: '💻', order: 4, isDefault: false, nameAr: 'المطور',    nameEn: 'Developer', descAr: 'للمطورين',              descEn: 'For developers integrating AI' },
  { slug: 'educator',  emoji: '📚', order: 5, isDefault: false, nameAr: 'المعلم',    nameEn: 'Educator',  descAr: 'للمعلمين والمدربين',    descEn: 'For educators using AI' },
];

async function Seed() {
  console.log('🌱 Seeding database...\n');

  for (const A of ACHIEVEMENTS_DATA) {
    const AchId = uuidv7();
    await db.insert(Achievements).values({ Id: AchId, Emoji: A.emoji, ConditionType: A.conditionType, ConditionValue: A.conditionValue });
    await db.insert(AchievementTranslations).values([
      { Id: uuidv7(), AchievementId: AchId, Locale: 'ar', Name: A.nameAr, Description: A.descAr },
      { Id: uuidv7(), AchievementId: AchId, Locale: 'en', Name: A.nameEn, Description: A.descEn },
    ]);
  }
  console.log(`  ✓ ${ACHIEVEMENTS_DATA.length} achievements`);

  for (const T of TRACKS_DATA) {
    const TrackId = uuidv7();
    const [Track] = await db.insert(Tracks)
      .values({ Id: TrackId, Slug: T.slug, Emoji: T.emoji, Order: T.order, IsDefault: T.isDefault })
      .onConflictDoNothing()
      .returning({ Id: Tracks.Id });
    if (Track) {
      await db.insert(TrackTranslations).values([
        { Id: uuidv7(), TrackId: Track.Id, Locale: 'ar', Name: T.nameAr, Description: T.descAr },
        { Id: uuidv7(), TrackId: Track.Id, Locale: 'en', Name: T.nameEn, Description: T.descEn },
      ]).onConflictDoNothing();
    }
  }
  console.log(`  ✓ ${TRACKS_DATA.length} tracks`);

  const AgentIdMap = new Map<string, string>();
  for (const A of AgentContent) {
    const AgentId = uuidv7();
    AgentIdMap.set(A.slug, AgentId);
    await db.insert(Agents).values({ Id: AgentId, Slug: A.slug, Color: A.color, Emoji: A.emoji, IsActive: A.isActive, Order: A.order });
    await db.insert(AgentTranslations).values([
      { Id: uuidv7(), AgentId, Locale: 'ar', Name: A.nameAr, Description: A.descriptionAr, FullDescription: A.fullDescriptionAr },
      { Id: uuidv7(), AgentId, Locale: 'en', Name: A.nameEn, Description: A.descriptionEn, FullDescription: A.fullDescriptionEn },
    ]);
  }
  console.log(`  ✓ ${AgentContent.length} agents`);

  let LC = 0, QC = 0, OC = 0;
  for (const L of AllLessons) {
    const AgentId = AgentIdMap.get(L.agentSlug);
    if (!AgentId) { console.warn(`  ⚠️  No agent for slug: ${L.agentSlug}`); continue; }
    const LessonId = uuidv7();
    await db.insert(Lessons).values({ Id: LessonId, AgentId, Order: L.order, XpReward: L.xpReward, EstimatedMinutes: L.estimatedMinutes });
    await db.insert(LessonTranslations).values([
      { Id: uuidv7(), LessonId, Locale: 'ar', Title: L.titleAr, Description: L.descriptionAr, Content: L.contentAr },
      { Id: uuidv7(), LessonId, Locale: 'en', Title: L.titleEn, Description: L.descriptionEn, Content: L.contentEn },
    ]);
    LC++;
    for (let Qi = 0; Qi < (L.quiz ?? []).length; Qi++) {
      const Q = L.quiz[Qi];
      const QuestionId = uuidv7();
      await db.insert(QuizQuestions).values({ Id: QuestionId, LessonId, Type: Q.type, Order: Qi });
      await db.insert(QuizQuestionTranslations).values([
        { Id: uuidv7(), QuestionId, Locale: 'ar', Question: Q.questionAr },
        { Id: uuidv7(), QuestionId, Locale: 'en', Question: Q.questionEn },
      ]);
      QC++;
      for (let Oi = 0; Oi < (Q.options ?? []).length; Oi++) {
        const O = Q.options[Oi];
        const OptionId = uuidv7();
        await db.insert(QuizOptions).values({ Id: OptionId, QuestionId, IsCorrect: O.isCorrect, Order: Oi });
        await db.insert(QuizOptionTranslations).values([
          { Id: uuidv7(), OptionId, Locale: 'ar', Text: O.textAr },
          { Id: uuidv7(), OptionId, Locale: 'en', Text: O.textEn },
        ]);
        OC++;
      }
    }
  }
  console.log(`  ✓ ${LC} lessons, ${QC} questions, ${OC} options`);
  console.log('\n✅ Seed complete!\n');
  process.exit(0);
}

Seed().catch((Err) => { console.error('❌ Seed failed:', Err); process.exit(1); });
