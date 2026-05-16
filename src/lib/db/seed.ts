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
  SystemPrompts,
  Subjects, SubjectTranslations,
  Providers, ProviderModels, RoutingRules,
  Concepts, ConceptEdges,
} from './Schema';
import { EncryptApiKey } from '../Ai/Crypto';
import { seedProgramming } from './seeds/programming.seed';
import { seedDatabases } from './seeds/databases.seed';
import { seedWebDesign } from './seeds/web-design.seed';
import { seedProblemSolving } from './seeds/problem-solving.seed';
import { seedPromptEngineering } from './seeds/prompt-engineering.seed';
import { seedProjectBuilding } from './seeds/project-building.seed';
import { seedDesignPatterns } from './seeds/design-patterns.seed';
import {
  agents as AgentContent,
  claudeLessons, promptEngineeringLessons,
  claudeApiLessons, developerLessons,
} from '../content/claude-lessons';

const AllLessons = [...claudeLessons, ...promptEngineeringLessons, ...claudeApiLessons, ...developerLessons];

const ACHIEVEMENTS_DATA = [
  { icon: 'Target',    conditionType: 'lessons_completed', conditionValue: 1,   nameAr: 'أول خطوة',   nameEn: 'First Step',        descAr: 'كملت أول درس ليك!',         descEn: 'You completed your first lesson!' },
  { icon: 'Rocket',    conditionType: 'lessons_completed', conditionValue: 3,   nameAr: 'على الطريق', nameEn: 'On the Right Track', descAr: 'كملت 3 دروس — انت بتتقدم!', descEn: "Completed 3 lessons — you're progressing!" },
  { icon: 'Trophy',    conditionType: 'lessons_completed', conditionValue: 5,   nameAr: 'متعلم نشيط', nameEn: 'Active Learner',     descAr: 'كملت 5 دروس — عظيم!',       descEn: 'Completed 5 lessons — amazing!' },
  { icon: 'Star',      conditionType: 'xp_earned',         conditionValue: 100, nameAr: 'جامع النقاط', nameEn: 'Point Collector',   descAr: 'جمعت 100 XP!',              descEn: 'Earned 100 XP!' },
  { icon: 'Sparkles',  conditionType: 'xp_earned',         conditionValue: 500, nameAr: 'على الطريق', nameEn: 'On the Way',        descAr: 'جمعت 500 XP',               descEn: 'Collected 500 XP' },
  { icon: 'Crown',     conditionType: 'xp_earned',         conditionValue: 1000,nameAr: 'خبير ذكاوي', nameEn: 'Zkawi Expert',      descAr: 'جمعت 1000 XP',              descEn: 'Collected 1000 XP' },
  { icon: 'Flame',     conditionType: 'streak_days',       conditionValue: 3,   nameAr: 'متحمس',      nameEn: 'Enthusiast',        descAr: '3 أيام متتالية — استمر!',    descEn: '3 days in a row — keep going!' },
  { icon: 'Zap',       conditionType: 'streak_days',       conditionValue: 7,   nameAr: 'مواظب',      nameEn: 'Consistent',        descAr: '7 أيام متتالية — رائع!',     descEn: '7 days streak — amazing!' },
];

const TRACKS_DATA = [
  { slug: 'explorer',  icon: 'Compass',      order: 1, isDefault: true,  nameAr: 'المستكشف', nameEn: 'Explorer',  descAr: 'للمبتدئين الفضوليين', descEn: 'For curious beginners exploring AI' },
  { slug: 'creator',   icon: 'Palette',      order: 2, isDefault: false, nameAr: 'المبدع',   nameEn: 'Creator',   descAr: 'للمبدعين',             descEn: 'For creatives using AI' },
  { slug: 'engineer',  icon: 'Settings2',    order: 3, isDefault: false, nameAr: 'المهندس',  nameEn: 'Engineer',  descAr: 'للمحترفين التقنيين',    descEn: 'For advanced technical professionals' },
  { slug: 'developer', icon: 'Code2',        order: 4, isDefault: false, nameAr: 'المطور',   nameEn: 'Developer', descAr: 'للمطورين',              descEn: 'For developers integrating AI' },
  { slug: 'educator',  icon: 'GraduationCap',order: 5, isDefault: false, nameAr: 'المعلم',   nameEn: 'Educator',  descAr: 'للمعلمين والمدربين',    descEn: 'For educators using AI' },
];

async function Seed() {
  console.log('🌱 Seeding database...\n');

  for (const A of ACHIEVEMENTS_DATA) {
    const AchId = uuidv7();
    await db.insert(Achievements).values({ Id: AchId, Icon: A.icon, ConditionType: A.conditionType, ConditionValue: A.conditionValue });
    await db.insert(AchievementTranslations).values([
      { Id: uuidv7(), AchievementId: AchId, Locale: 'ar', Name: A.nameAr, Description: A.descAr },
      { Id: uuidv7(), AchievementId: AchId, Locale: 'en', Name: A.nameEn, Description: A.descEn },
    ]);
  }
  console.log(`  ✓ ${ACHIEVEMENTS_DATA.length} achievements`);

  for (const T of TRACKS_DATA) {
    const TrackId = uuidv7();
    const [Track] = await db.insert(Tracks)
      .values({ Id: TrackId, Slug: T.slug, Icon: T.icon, Order: T.order, IsDefault: T.isDefault })
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
    await db.insert(Agents).values({ Id: AgentId, Slug: A.slug, Color: A.color, Icon: A.icon, IsActive: A.isActive, Order: A.order });
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

  // ─── System Prompts ──────────────────────────────────────────────────────────
  const mascotPromptAr = `أنت "ذكي" (Zaki)، المرشد الشخصي الذكي في منصة ذكاوي — منصة تعليمية عربية لتعلم الذكاء الاصطناعي.

── شخصيتك ──
- مرح، ودود، ومشجع دائماً — زي مدرس صاحب وليس جاف
- تتكلم عربي مصري بسيط يناسب الأطفال والكبار
- ردودك قصيرة ومركزة (3-5 جمل) إلا لو طُلب شرح تفصيلي
- دايماً تشجع المستخدم حتى لو أخطأ

── قواعد حاسمة ──
1. أسئلة الكويز: قول "شغل دماغك شوية حاول لوحدك الأول!"
2. لو في درس: اشرح بطريقة أبسط، استخدم أمثلة من الحياة اليومية
3. لو المستخدم محبط: شجّعه بحرارة قبل ما تشرح أي حاجة
4. ردّك دايماً بنفس لغة المستخدم تماماً`;

  const sandboxPromptAr = `أنت مساعد تعليمي ذكي متخصص في تعليم الذكاء الاصطناعي باللغة العربية.
اسمك "ذكاوي" وأنت هنا لمساعدة المتعلمين على فهم مفاهيم الذكاء الاصطناعي وتطبيقاتها.`;

  await db.insert(SystemPrompts).values([
    { Key: 'mascot_base', Content: mascotPromptAr, Locale: 'ar' },
    { Key: 'sandbox_base', Content: sandboxPromptAr, Locale: 'ar' },
  ]).onConflictDoNothing();
  console.log('  ✓ 2 system prompts');

  // ─── Subjects ─────────────────────────────────────────────────────────────────
  const [aiSubject] = await db.insert(Subjects).values({
    Slug: 'ai',
    Icon: 'Bot',
    Color: '#7C3AED',
    Order: 1,
  }).onConflictDoNothing().returning();

  if (aiSubject) {
    await db.insert(SubjectTranslations).values([
      { SubjectId: aiSubject.Id, Locale: 'ar', Name: 'الذكاء الاصطناعي', Description: 'تعلم أساسيات الذكاء الاصطناعي والتعامل مع النماذج اللغوية' },
      { SubjectId: aiSubject.Id, Locale: 'en', Name: 'Artificial Intelligence', Description: 'Learn AI fundamentals and how to work with language models' },
    ]);
    console.log('  ✓ 1 subject (AI)');
  }

  // ─── New subjects (7 + AI = 8 total) ────────────────────────────────────────
  console.log('\n📚 Seeding subjects & courses...');
  await seedProgramming(db);       console.log('  ✓ programming');
  await seedDatabases(db);         console.log('  ✓ databases');
  await seedWebDesign(db);         console.log('  ✓ web-design');
  await seedProblemSolving(db);    console.log('  ✓ problem-solving');
  await seedPromptEngineering(db); console.log('  ✓ prompt-engineering');
  await seedProjectBuilding(db);   console.log('  ✓ project-building');
  await seedDesignPatterns(db);    console.log('  ✓ design-patterns');

  // ─── AI Providers, Models & Routing Rules ────────────────────────────────────
  const existingProviders = await db.select({ Id: Providers.Id }).from(Providers).limit(1);
  if (existingProviders.length === 0) {
    // Use a placeholder encrypted key - real keys set via Admin Dashboard
    const placeholderKey = process.env.ENCRYPTION_KEY
      ? await EncryptApiKey('placeholder-set-via-admin')
      : 'placeholder:placeholder';

    const [anthropic] = await db.insert(Providers).values({
      Id: uuidv7(),
      Name: 'Anthropic',
      Description: 'Claude models for educational AI',
      BaseUrl: 'https://api.anthropic.com',
      ApiKeyEnc: placeholderKey,
      IsActive: true,
    }).returning();

    const [google] = await db.insert(Providers).values({
      Id: uuidv7(),
      Name: 'Google',
      Description: 'Gemini models - cost-effective for simple tasks',
      BaseUrl: 'https://generativelanguage.googleapis.com',
      ApiKeyEnc: placeholderKey,
      IsActive: true,
    }).returning();

    // Anthropic models
    const [haiku] = await db.insert(ProviderModels).values({
      Id: uuidv7(), ProviderId: anthropic.Id,
      ModelName: 'claude-haiku-4-5-20251001',
      InputCostPerM: '1.00', OutputCostPerM: '5.00',
      MaxTokens: 8192, IsActive: true,
    }).returning();

    const [sonnet] = await db.insert(ProviderModels).values({
      Id: uuidv7(), ProviderId: anthropic.Id,
      ModelName: 'claude-sonnet-4-5',
      InputCostPerM: '3.00', OutputCostPerM: '15.00',
      MaxTokens: 8192, IsActive: true,
    }).returning();

    // Google models
    const [flash] = await db.insert(ProviderModels).values({
      Id: uuidv7(), ProviderId: google.Id,
      ModelName: 'gemini-2.0-flash',
      InputCostPerM: '0.10', OutputCostPerM: '0.40',
      MaxTokens: 8192, IsActive: true,
    }).returning();

    // Routing rules
    await db.insert(RoutingRules).values([
      { Id: uuidv7(), TaskType: 'simple_chat', ModelId: flash.Id, Priority: 1, IsActive: true, UpdatedAt: new Date() },
      { Id: uuidv7(), TaskType: 'translation', ModelId: flash.Id, Priority: 1, IsActive: true, UpdatedAt: new Date() },
      { Id: uuidv7(), TaskType: 'explanation', ModelId: haiku.Id, Priority: 1, IsActive: true, UpdatedAt: new Date() },
      { Id: uuidv7(), TaskType: 'socratic', ModelId: sonnet.Id, Priority: 1, IsActive: true, UpdatedAt: new Date() },
      { Id: uuidv7(), TaskType: 'assessment', ModelId: sonnet.Id, Priority: 1, IsActive: true, UpdatedAt: new Date() },
      { Id: uuidv7(), TaskType: 'content_gen', ModelId: sonnet.Id, Priority: 1, IsActive: true, UpdatedAt: new Date() },
    ]);
    console.log('  ✓ 2 providers, 3 models, 6 routing rules');
  } else {
    console.log('  ⏭  Providers already seeded — skipping');
  }

  // ─── Knowledge Graph — Initial Concepts (D-011, D-027, D-026) ───────────────
  const existingConcepts = await db.select({ Id: Concepts.Id }).from(Concepts).limit(1);

  if (existingConcepts.length === 0) {
    // Programming track (D-011) — age 8-12 foundational concepts
    const programmingConceptDefs = [
      { NameAr: 'التفكير الخوارزمي', NameEn: 'Algorithmic Thinking', Difficulty: 1, Type: 'conceptual' },
      { NameAr: 'التسلسل',            NameEn: 'Sequencing',            Difficulty: 1, Type: 'procedural' },
      { NameAr: 'الحلقات',            NameEn: 'Loops',                 Difficulty: 2, Type: 'procedural' },
      { NameAr: 'الشروط',             NameEn: 'Conditionals',          Difficulty: 2, Type: 'procedural' },
      { NameAr: 'المتغيرات',           NameEn: 'Variables',             Difficulty: 2, Type: 'factual'    },
      { NameAr: 'الدوال',             NameEn: 'Functions',             Difficulty: 3, Type: 'procedural' },
    ] as const;

    // Math track (D-027) — age 8-12 foundational concepts
    const mathConceptDefs = [
      { NameAr: 'الأعداد الصحيحة',   NameEn: 'Integers',                    Difficulty: 1, Type: 'factual'    },
      { NameAr: 'الجمع والطرح',       NameEn: 'Addition & Subtraction',      Difficulty: 1, Type: 'procedural' },
      { NameAr: 'الضرب والقسمة',      NameEn: 'Multiplication & Division',   Difficulty: 2, Type: 'procedural' },
      { NameAr: 'الكسور',             NameEn: 'Fractions',                   Difficulty: 3, Type: 'conceptual' },
      { NameAr: 'الهندسة الأساسية',   NameEn: 'Basic Geometry',              Difficulty: 2, Type: 'conceptual' },
    ] as const;

    // Arabic track (D-026) — age 8-12 foundational concepts
    const arabicConceptDefs = [
      { NameAr: 'الحروف الهجائية',    NameEn: 'Arabic Alphabet',             Difficulty: 1, Type: 'factual'    },
      { NameAr: 'الكلمات الأساسية',   NameEn: 'Basic Vocabulary',            Difficulty: 1, Type: 'factual'    },
      { NameAr: 'الجملة البسيطة',     NameEn: 'Simple Sentences',            Difficulty: 2, Type: 'procedural' },
      { NameAr: 'القراءة والفهم',     NameEn: 'Reading Comprehension',       Difficulty: 3, Type: 'conceptual' },
    ] as const;

    // Insert all concepts and collect their generated Ids
    const insertConcept = async (def: { NameAr: string; NameEn: string; Difficulty: number; Type: string }) => {
      const [row] = await db.insert(Concepts).values({
        Id:         uuidv7(),
        NameAr:     def.NameAr,
        NameEn:     def.NameEn,
        Difficulty: def.Difficulty,
        Type:       def.Type,
        IsDeleted:  false,
      }).returning({ Id: Concepts.Id });
      return row.Id;
    };

    const [
      algThinking, sequencing, loops, conditionals, variables, functions,
    ] = await Promise.all(programmingConceptDefs.map(insertConcept));

    const [
      integers, addSub, mulDiv, fractions, geometry,
    ] = await Promise.all(mathConceptDefs.map(insertConcept));

    const [
      alphabet, vocabulary, sentences, readingComp,
    ] = await Promise.all(arabicConceptDefs.map(insertConcept));

    const totalConcepts = programmingConceptDefs.length + mathConceptDefs.length + arabicConceptDefs.length;
    console.log(`  ✓ ${totalConcepts} knowledge graph concepts`);

    // ── ConceptEdges (prerequisite graph) ─────────────────────────────────────
    // RelationType: 'PREREQUISITE_OF' | 'BUILDS_ON' | 'RELATED_TO' | 'EXAMPLE_OF'
    const edges: { FromConceptId: string; ToConceptId: string; RelationType: string }[] = [
      // Programming prerequisites
      { FromConceptId: algThinking, ToConceptId: sequencing,   RelationType: 'PREREQUISITE_OF' },
      { FromConceptId: sequencing,  ToConceptId: loops,         RelationType: 'PREREQUISITE_OF' },
      { FromConceptId: sequencing,  ToConceptId: conditionals,  RelationType: 'PREREQUISITE_OF' },
      { FromConceptId: variables,   ToConceptId: loops,         RelationType: 'PREREQUISITE_OF' },
      { FromConceptId: variables,   ToConceptId: conditionals,  RelationType: 'PREREQUISITE_OF' },
      { FromConceptId: loops,       ToConceptId: functions,     RelationType: 'BUILDS_ON'       },
      { FromConceptId: conditionals,ToConceptId: functions,     RelationType: 'BUILDS_ON'       },
      // Math prerequisites
      { FromConceptId: integers,    ToConceptId: addSub,        RelationType: 'PREREQUISITE_OF' },
      { FromConceptId: addSub,      ToConceptId: mulDiv,        RelationType: 'PREREQUISITE_OF' },
      { FromConceptId: mulDiv,      ToConceptId: fractions,     RelationType: 'PREREQUISITE_OF' },
      { FromConceptId: integers,    ToConceptId: geometry,      RelationType: 'PREREQUISITE_OF' },
      // Arabic prerequisites
      { FromConceptId: alphabet,    ToConceptId: vocabulary,    RelationType: 'PREREQUISITE_OF' },
      { FromConceptId: vocabulary,  ToConceptId: sentences,     RelationType: 'PREREQUISITE_OF' },
      { FromConceptId: sentences,   ToConceptId: readingComp,   RelationType: 'PREREQUISITE_OF' },
      // Cross-track — algorithmic thinking relates to math
      { FromConceptId: algThinking, ToConceptId: mulDiv,        RelationType: 'RELATED_TO'      },
    ];

    await db.insert(ConceptEdges).values(
      edges.map(E => ({ Id: uuidv7(), ...E })),
    );
    console.log(`  ✓ ${edges.length} concept edges`);
  } else {
    console.log('  ⏭  Knowledge graph concepts already seeded — skipping');
  }

  console.log('\n✅ Seed complete!\n');
  process.exit(0);
}

Seed().catch((Err) => { console.error('❌ Seed failed:', Err); process.exit(1); });
