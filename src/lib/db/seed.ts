/**
 * db:seed — inserts all base data: agents, lessons, quiz questions/options, achievements.
 * Safe to run on an empty DB after db:migrate.
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
} from './schema';
import { agents as agentContent, claudeLessons } from '../content/claude-lessons';

// ─── Achievements seed data ───────────────────────────────────────────────────
const ACHIEVEMENTS = [
  {
    nameAr: 'أول خطوة',
    nameEn: 'First Step',
    descriptionAr: 'كملت أول درس ليك!',
    descriptionEn: 'You completed your first lesson!',
    emoji: '🎯',
    conditionType: 'lessons_completed',
    conditionValue: 1,
  },
  {
    nameAr: 'على الطريق الصح',
    nameEn: 'On the Right Track',
    descriptionAr: 'كملت 3 دروس — انت بتتقدم!',
    descriptionEn: 'Completed 3 lessons — you\'re progressing!',
    emoji: '🚀',
    conditionType: 'lessons_completed',
    conditionValue: 3,
  },
  {
    nameAr: 'متعلم نشيط',
    nameEn: 'Active Learner',
    descriptionAr: 'كملت كل دروس Claude — عظيم!',
    descriptionEn: 'Completed all Claude lessons — amazing!',
    emoji: '🏆',
    conditionType: 'lessons_completed',
    conditionValue: 5,
  },
  {
    nameAr: 'نجم الكويز',
    nameEn: 'Quiz Star',
    descriptionAr: 'جبت 100% في كويز — أنت نجم!',
    descriptionEn: 'Scored 100% in a quiz — you\'re a star!',
    emoji: '⭐',
    conditionType: 'perfect_quiz',
    conditionValue: 1,
  },
  {
    nameAr: 'سبع أيام',
    nameEn: 'Seven Days',
    descriptionAr: 'فتحت التطبيق 7 أيام متواصلة — رائع!',
    descriptionEn: 'Opened the app 7 days in a row — amazing!',
    emoji: '🔥',
    conditionType: 'streak_days',
    conditionValue: 7,
  },
  {
    nameAr: 'جامع النقاط',
    nameEn: 'XP Collector',
    descriptionAr: 'وصلت لـ 200 نقطة XP!',
    descriptionEn: 'Reached 200 XP points!',
    emoji: '💎',
    conditionType: 'total_xp',
    conditionValue: 200,
  },
  {
    nameAr: 'صاحب Claude',
    nameEn: 'Claude\'s Friend',
    descriptionAr: 'قضيت وقت كويس مع Claude — اتعلمت حاجات جميلة!',
    descriptionEn: 'Spent good time with Claude — you learned great things!',
    emoji: '🤖',
    conditionType: 'agent_completed',
    conditionValue: 1,
  },
  {
    nameAr: 'صانع المستقبل',
    nameEn: 'Future Maker',
    descriptionAr: 'وصلت لـ 500 نقطة XP — انت من صانعي المستقبل!',
    descriptionEn: 'Reached 500 XP — you are a future maker!',
    emoji: '🌟',
    conditionType: 'total_xp',
    conditionValue: 500,
  },
];

// ─── Main seed function ───────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Starting seed...\n');

  // 1. Agents
  console.log('📦 Inserting agents...');
  const insertedAgents = await db
    .insert(agentsTable)
    .values(
      agentContent.map((a) => ({
        slug: a.slug,
        nameAr: a.nameAr,
        nameEn: a.nameEn,
        descriptionAr: a.descriptionAr,
        descriptionEn: a.descriptionEn,
        color: a.color,
        emoji: a.emoji,
        isActive: a.isActive,
        order: a.order,
      })),
    )
    .returning();

  for (const agent of insertedAgents) {
    console.log(`   ✓ ${agent.nameEn} (id=${agent.id}, active=${agent.isActive})`);
  }

  // 2. Claude lessons + quiz
  const claudeAgent = insertedAgents.find((a) => a.slug === 'claude');
  if (!claudeAgent) throw new Error('Claude agent not found after insert');

  console.log('\n📚 Inserting Claude lessons...');

  for (const lesson of claudeLessons) {
    const [insertedLesson] = await db
      .insert(lessonsTable)
      .values({
        agentId: claudeAgent.id,
        titleAr: lesson.titleAr,
        titleEn: lesson.titleEn,
        descriptionAr: lesson.descriptionAr,
        descriptionEn: lesson.descriptionEn,
        contentAr: lesson.contentAr,
        contentEn: lesson.contentEn,
        order: lesson.order,
        xpReward: lesson.xpReward,
        estimatedMinutes: lesson.estimatedMinutes,
      })
      .returning();

    console.log(`   ✓ Lesson ${insertedLesson.id}: ${insertedLesson.titleEn}`);

    // Quiz questions for this lesson
    for (const q of lesson.quiz) {
      const [insertedQ] = await db
        .insert(quizQuestions)
        .values({
          lessonId: insertedLesson.id,
          questionAr: q.questionAr,
          questionEn: q.questionEn,
          type: q.type,
        })
        .returning();

      // Options for this question
      await db.insert(quizOptions).values(
        q.options.map((opt) => ({
          questionId: insertedQ.id,
          textAr: opt.textAr,
          textEn: opt.textEn,
          isCorrect: opt.isCorrect,
        })),
      );

      console.log(
        `     ↳ Q: "${q.questionAr.slice(0, 40)}..." (${q.options.length} options)`,
      );
    }
  }

  // 3. Achievements
  console.log('\n🏆 Inserting achievements...');
  const insertedAchievements = await db
    .insert(achievementsTable)
    .values(ACHIEVEMENTS)
    .returning();

  for (const ach of insertedAchievements) {
    console.log(`   ✓ ${ach.emoji} ${ach.nameAr}`);
  }

  // ── Summary ──
  console.log('\n──────────────────────────────────────');
  console.log(`✅ Seed complete!`);
  console.log(`   Agents:       ${insertedAgents.length}`);
  console.log(`   Lessons:      ${claudeLessons.length}`);
  console.log(
    `   Quiz Qs:      ${claudeLessons.reduce((s, l) => s + l.quiz.length, 0)}`,
  );
  console.log(
    `   Quiz opts:    ${claudeLessons.reduce((s, l) => s + l.quiz.reduce((ss, q) => ss + q.options.length, 0), 0)}`,
  );
  console.log(`   Achievements: ${insertedAchievements.length}`);
  console.log('──────────────────────────────────────\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
