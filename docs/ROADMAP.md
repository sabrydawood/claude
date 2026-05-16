# Roadmap — ذكاوي (Zkawi)

> **الرؤية:** طفرة نوعية في التعليم العربي — نظام يتعلم من كل طفل ويصبح أذكى وأرخص مع الوقت.
> كل مرحلة تبني على السابقة وتضيف طبقة من الـ ALI (Adaptive Learning Intelligence).

---

## Phase 0 — الأساس (مكتمل)

### البنية التقنية
- [x] Next.js 16 + TypeScript + Bun + Tailwind v4
- [x] PostgreSQL + Drizzle ORM + Translation Tables pattern
- [x] better-auth (email/password + email verification)
- [x] Multi-provider AI: OpenRouter → Gemini → OpenAI → Anthropic
- [x] Rate limiting + Zod validation + Security headers (SEV-001 → SEV-016)
- [x] Sentry error tracking
- [x] PWA (Service Worker + Install Banner)
- [x] i18n: Arabic (default) + English، RTL/LTR

### المحتوى والـ UI
- [x] Mascot 3D (Xbot/Mixamo) — animations + patrol + chat
- [x] RPG Dialogue Box (drag-to-resize + markdown rendering)
- [x] Sandbox (multi-provider + user API key + conversation history sidebar)
- [x] Conversation persistence في DB (Mascot + Sandbox)
- [x] Selection Tooltip ("اشرح مع ذكي ✨")
- [x] XP + Streak + Achievements system
- [x] Leaderboard + Profile

---

## Phase 1 — الذاكرة الذكية (الأسبوع 1-4)

**الهدف:** بناء الطبقات الأساسية للـ ALI — معرفة كـ Graph، طالب كـ Profile، إجابات كـ Cache دائم.

### 1.1 Knowledge Graph
- [ ] `Concepts` table: id, name_ar, name_en, difficulty (1-5), type (factual/procedural/conceptual)
- [ ] `ConceptRelations` table: from_id, to_id, relation_type (PREREQUISITE_OF / EXAMPLE_OF / RELATED_TO / BUILDS_ON)
- [ ] `ConceptChunks` table: concept_id, content (~400 chars), embedding (vector)
- [ ] pgvector extension على PostgreSQL
- [ ] Script AI لاستخراج المفاهيم من الدروس الموجودة
- [ ] Admin UI لمراجعة الـ Graph وتعديله

### 1.2 Student Mastery Profile
- [ ] `StudentMastery` table: user_id, concept_id, score (0-100), attempts, last_tested
- [ ] `LearningSignals` table: user_id, concept_id, signal_type, value, created_at
- [ ] `StudentInsights` table: user_id, insight_type, value ← حقائق مستخلصة (مش تاريخ كامل)
- [ ] Engine لاستخلاص الـ insights من المحادثات بعد كل exchange
- [ ] Profile page: خريطة المفاهيم + نقاط القوة والضعف

### 1.3 Semantic Cache (الذاكرة الدائمة)
- [ ] `SemanticCache` table: question_embedding, answer, page_key, locale, hit_count, created_at
- [ ] دالة بحث بالـ cosine similarity (pgvector) — threshold: 0.92
- [ ] Mascot Controller يمر بالـ Cache أولاً قبل أي AI call
- [ ] **قاعدة:** الـ Cache لا يُحذف تلقائياً — هو قاعدة معرفة دائمة تنمو
- [ ] Dashboard: hit rate + estimated cost savings

### 1.4 تحسين Mascot
- [ ] استبدال static system prompt بـ RAG (top-3 chunks مرتبطة بالسؤال)
- [ ] Student Profile يُضاف للـ context (100 حرف بدل 500)
- [ ] In-process LRU Cache لـ `BuildMascotSystemPrompt` (TTL: 10 دقائق)
- [ ] Anthropic `cache_control: ephemeral` على الـ system prompt → -90% input tokens

---

## Phase 2 — التخصيص الكامل (الشهر 2-3)

**الهدف:** كل طفل يحصل على تجربة مختلفة تماماً — مبنية على مستواه وأسلوب تعلمه.

### 2.1 Adaptive Content Delivery
- [ ] 3 مستويات شرح لكل مفهوم: مبتدئ / متوسط / متقدم
- [ ] محرك اختيار المستوى المناسب من Student Profile
- [ ] `ConceptExplanations` table: concept_id, level, locale, content (pre-generated)

### 2.2 Multi-Signal Assessment Engine
- [ ] Socratic Dialogue Engine — سلسلة أسئلة تُقيّم عمق الفهم
- [ ] تحديث `StudentMastery.score` بعد كل تفاعل (weighted formula)
- [ ] Mastery Score = quiz(20%) + socratic(35%) + practical(30%) + peer(15%)
- [ ] Mastery Badge per concept (المفهوم المُتقن يحصل على شارة)
- [ ] تقرير للطفل: "أتقنت X مفهوم، تحتاج مراجعة Y"

### 2.3 Credits + XP Economy
- [ ] `Credits` table: user_id, balance, total_earned
- [ ] `CreditTransactions` table: user_id, amount, reason, timestamp
- [ ] Time-limited questions: server-side timer، لا يمكن تمديده
- [ ] لا تكرار للـ Credits على نفس السؤال (إجابة تُقبل لكن Credits = 0)
- [ ] Credits Marketplace: شروح مخصصة، Classroom خاص، تحديات متقدمة

### 2.4 Data Flywheel الأول
- [ ] Signal collection: هل الطفل راضٍ عن الرد؟ (implicit signals)
- [ ] Auto-update: مفاهيم تحصل على signals سلبية → يُعاد توليد شرحها
- [ ] Weekly report: أي شرح يحتاج تحسين بناءً على بيانات الأسبوع

---

## Phase 3 — الفصول الذكية (الشهر 4-6)

**الهدف:** AI معلم يدير فصلاً بأطفال متعددين في نفس الوقت.

### 3.1 البنية التحتية Real-time
- [ ] WebSocket server (Bun native WebSocket)
- [ ] `Classrooms` table: id, host_id, topic_concept_id, max_students, state, scheduled_at
- [ ] `ClassroomParticipants` table: classroom_id, user_id, joined_at, role (student/supervisor)
- [ ] Redis / Bun in-memory للـ classroom state الحية

### 3.2 Classroom Orchestrator AI
- [ ] State Machine: TEACHING → QUESTIONING → DISCUSSION → INDIVIDUAL → ASSESSMENT
- [ ] Confusion Detector: رصد "مش فاهم"، صمت طويل، إجابات خاطئة متكررة
- [ ] Turn Manager: دور عادل للكلام، يشجع الساكتين تلقائياً
- [ ] Peer Teaching Matcher: الطفل الأقوى يشرح للأضعف + كلاهما يكسب Credits
- [ ] Human Supervisor Dashboard: الكل يراه، يتدخل فقط عند الحاجة

### 3.3 Classroom Economy
- [ ] Credits bonus للـ peer teaching (+30 للمعلم + +15 للمتعلم)
- [ ] Class leaderboard في نهاية كل جلسة
- [ ] Classroom Credits خاصة (لا تُحتسب في الـ XP العام)

---

## Phase 4 — الشرح المرئي الحي (الشهر 6-9)

**الهدف:** شرح مخصص بصوت + رسوم + كود — يُولَّد للحظة لكل طفل.

### 4.1 TTS (Text-to-Speech)
- [ ] Integration مع ElevenLabs أو Murf (Arabic + Dialects)
- [ ] اختيار صوت حسب عمر الطفل من Student Profile
- [ ] Streaming TTS — لا انتظار لاكتمال النص

### 4.2 Living Canvas
- [ ] JSON-driven animation format: AI يولّد JSON → Canvas يرسم في الوقت الفعلي
- [ ] مكتبة animations للمفاهيم الشائعة (loops، variables، functions، data structures)
- [ ] Mascot يتحرك ويشير للعناصر المرسومة أثناء الشرح

### 4.3 Live Code Execution
- [ ] Sandboxed code runner: Python + JavaScript
- [ ] Step-by-step execution مع شرح كل خطوة
- [ ] Visual output: رسوم بيانية، قوائم، جداول

### 4.4 AI-Generated Explanation Pipeline
- [ ] Pre-generate Living Explanations لكل concept × 3 levels
- [ ] `ConceptLivingExplanations` table: concept_id, level, tts_url, canvas_json, code_snippet
- [ ] Fallback: text-only عند ضعف الاتصال

---

## Phase 5 — النموذج الخاص (الشهر 12+)

**الهدف:** نموذج AI مدرّب على بيانات ذكاوي — أذكى وأرخص من النماذج العامة.

### 5.1 Data Collection Pipeline
- [ ] Socratic dialogues مُعلَّمة (سؤال + إجابة + score)
- [ ] أساليب الشرح الناجحة حسب Student Profile
- [ ] Classroom interactions + Peer teaching quality
- [ ] RLHF signals من تفاعل الطفل (implicit feedback)

### 5.2 Fine-tuning Pipeline
- [ ] Data cleaning + formatting للـ instruction tuning
- [ ] Fine-tune على نموذج مفتوح: Llama 3 أو Qwen 2.5
- [ ] Evaluation على مهام التعليم العربي للأطفال
- [ ] A/B testing: النموذج الخاص vs النموذج العام

### 5.3 Arabic Dialect Support
- [ ] دعم: مصري، سعودي، إماراتي، مغربي، شامي
- [ ] اكتشاف اللهجة تلقائياً من نمط الكلام
- [ ] رد بنفس اللهجة تلقائياً

---

## مؤشرات النجاح

| المرحلة | المؤشر الرئيسي | الهدف |
|---------|---------------|-------|
| Phase 1 | Semantic Cache hit rate | ≥ 40% في أول شهر |
| Phase 2 | Mastery Score correlation | ≥ 90% مع اختبارات خارجية |
| Phase 3 | Classroom engagement rate | ≥ 80% من وقت الجلسة |
| Phase 4 | Time-to-understand concept | < 5 دقائق لمفهوم جديد |
| Phase 5 | AI cost per 1000 messages | -70% مقارنة بالنماذج العامة |

---

## ما لا نبنيه الآن

- ❌ Mobile app (PWA يكفي في هذه المرحلة)
- ❌ فيديو مسجل بمعلم بشري
- ❌ نظام مدفوعات للآباء (مرحلة لاحقة)
- ❌ دعم لغات إضافية (فوق العربية والإنجليزية)
- ❌ Admin لوحة متقدمة (البسيط يكفي)

---

> **القاعدة الذهبية:** إذا كانت الميزة لا تجعل النظام أذكى أو أرخص — فليست أولوية الآن.
