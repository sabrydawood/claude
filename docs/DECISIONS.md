# DECISIONS.md — سجل البحث والقرارات

> هذا الملف يوثّق كل بحث خارجي تم، وكل قرار تم الاتفاق عليه مع Sabry.
> **قاعدة:** لا ينفَّذ أي قرار معماري أو تصميمي إلا بعد توثيقه هنا وتأكيد الموافقة.

---

## كيفية القراءة

- ✅ **متفق عليه** — تم الاتفاق صراحةً مع Sabry
- 🔬 **بحث فقط** — تم البحث ولم يُتخذ قرار بعد
- ⏳ **معلق** — مطروح للنقاش، ينتظر الموافقة
- ❌ **مرفوض** — تم البحث لكن رُفض

---

## [D-001] معمارية ALI — الذاكرة والتكلفة

**التاريخ:** 2026-05-16
**الحالة:** ✅ متفق عليه

### البحث

تحليل داخلي للكود الحالي + نقاش معماري مع Sabry. المشكلة الأصلية: كل فتح للـ Mascot = AI call جديد، التكلفة تكبر خطياً مع المستخدمين.

### الخيارات التي نوقشت

| الخيار | المشكلة |
|--------|---------|
| Semantic Cache للأسئلة | فاشل — أطفال يسألون بـ 99% طرق مختلفة، hit rate ≈ 1% |
| Traditional RAG | ناقص — يجلب نصاً لكن لا يفهم علاقات المفاهيم |
| GraphRAG + Agent RAG | الأفضل — يفهم العلاقات، يطلب ما يحتاجه فقط |

### المتفق عليه ✅

1. **GraphRAG** بدل Traditional RAG — المعرفة كـ Graph مترابط
2. **Concept-centric Cache** — cache المفاهيم لا الأسئلة
3. **Tools** بدل System Prompt الضخم — AI يطلب ما يحتاجه
4. **First-hit + Pre-generate** للـ greetings
5. **بدون TTL** — الـ Cache دائم ويكبر مع الاستخدام
6. **يصبح أرخص مع الاستخدام** — المبدأ الحاكم لكل قرار

---

## [D-002] قياس الفهم — Multi-Signal Mastery

**التاريخ:** 2026-05-16
**الحالة:** ✅ متفق عليه

### المتفق عليه ✅

```
mastery_score =
    quiz_score       × 0.20   (كويز موقوت)
    socratic_score   × 0.35   (AI يسأل بأسلوب سقراطي)
    practical_score  × 0.30   (كود / مشروع حقيقي)
    peer_teaching    × 0.15   (يعلّم زميله في Classroom)
```

---

## [D-003] اقتصاد XP + Credits

**التاريخ:** 2026-05-16
**الحالة:** ✅ متفق عليه

### المتفق عليه ✅

| العنصر | التفصيل |
|--------|---------|
| XP | سمعة علنية، لا تُشترى |
| Credits | عملة داخلية، تُكسب بالإتقان |
| أسئلة موقوتة | server-side timer، لا يمكن تمديده |
| لا تكرار للكريديت | لو أعاد السؤال: الإجابة تُقبل لكن Credits = 0 |
| Credits تُنفق على | شروح مخصصة، Classroom خاص، تحديات متقدمة |

**الكسب:**
- إجابة كويز صحيحة في الوقت → +10 XP / +10 Credits
- Socratic dialogue ناجح → +20 XP / +25 Credits
- مشروع عملي مقبول → +30 XP / +40 Credits
- تعليم زميل في Classroom → +15 XP / +30 Credits

**الخسارة:**
- إجابة خاطئة → -5 XP (لا خسارة في Credits)

---

## [D-004] Classroom AI

**التاريخ:** 2026-05-16
**الحالة:** ✅ متفق عليه

### المتفق عليه ✅

- **AI معلم أساسي** + بشري مشرف فقط عند الحاجة
- State Machine: TEACHING → QUESTIONING → DISCUSSION → INDIVIDUAL → ASSESSMENT
- Peer Teaching: الأقوى يشرح للأضعف + كلاهما يكسب Credits
- Human Supervisor Dashboard يرى كل شيء لكن لا يتدخل إلا عند الحاجة

---

## [D-005] شرح الدروس — Living Explanation

**التاريخ:** 2026-05-16
**الحالة:** ✅ متفق عليه

### ما رُفض ❌

- فيديو مسجل بمعلم بشري — ثابت، لا يتكيف
- AI Avatar مسجل (Synthesia) — غالي جداً per-request

### المتفق عليه ✅

**Living Explanation** = يُولَّد في الوقت الفعلي لكل طفل:
- صوت AI (TTS) يشرح بأسلوب ومستوى الطفل
- Canvas animation يرسم الفكرة لحظياً
- كود يُنفَّذ live خطوة بخطوة
- Xbot يعلّق ويشجع

---

## [D-006] Data — الهدف من بيانات التفاعل

**التاريخ:** 2026-05-16
**الحالة:** ✅ متفق عليه

### المتفق عليه ✅

كل الأهداف معاً:
1. تحسين النظام تلقائياً للجميع (Data Flywheel)
2. Profile شخصي لكل طفل
3. تقارير للمعلمين والأهل

---

## [D-007] تنظيف الكود — حذف العناصر غير المستخدمة

**التاريخ:** 2026-05-16
**الحالة:** ✅ تم التنفيذ

### ما تم حذفه ✅

**ملفات Docs قديمة:**
- `docs/AGENT_PROGRESS.md`, `Architecture.Plan.md`, `Audit.Fixes.Mapping.md`
- `docs/CLAUDE.md` (المرجعية في الـ root), `Migration.Plan.md`, `Platform.Plan.md`, `STATUS.md`
- `audit-report.md`, `compact.md` (root)

**Dev pages:**
- `src/app/[locale]/(main)/dev/characters/page.tsx`
- `src/app/[locale]/(main)/dev/robot/page.tsx`
- `src/components/dev-sidebar.tsx`

**3D Models غير مستخدمة:**
- `public/models/RobotExpressive.glb` (454KB)
- `public/models/Soldier.glb` (2.1MB)

**Code cleanup في `mascot-gltf.tsx`:**
- حذف: `RobotExpressiveInner`, `RobotLighting`, `RobotExpressive`, `RobotExpressivePortrait`
- حذف: `XbotPortrait`, `SoldierExpressive`, `SOLDIER_CFG`
- بقي فقط: `XbotExpressive` + infrastructure

---

## [D-008] بحث الـ UI — 3D والتصميم التعليمي

**التاريخ:** 2026-05-16
**الحالة:** ✅ متفق عليه

### مصادر البحث الخارجي

| المصدر | ما تعلمناه |
|--------|-----------|
| [CodeCombat](https://codecombat.com/) | RPG-style + avatar + progressive complexity = ناجح مع أطفال |
| [Roblox Education](https://www.roblox.com/create) | Social + 3D world + collaborative learning |
| [Mozaik](https://www.mozaweb.com/) | 3D scenes + interactive lessons for K-12 |
| [Khan Academy Design](https://medium.com/khan-academy-design) | Minimal + mentorship-first + learning science |
| [Duolingo](https://duolingo.com) | Gamification + mascot + streaks + emotional reinforcement |
| [Lollypop Design Trends 2025](https://lollypop.design/blog/2025/august/top-education-app-design-trends-2025/) | Minimalist, bright colors, gesture-based, AI personalization |
| [React Three Fiber](https://github.com/pmndrs/react-three-fiber) | Full 3D web feasibility + trade-offs |
| [Spline](https://spline.design/) | 3D hero sections + hybrid approach |

### نتائج البحث (مقترحة — لم يُوافق عليها بعد)

**سؤال 3: هل الـ UI الحالي مناسب؟**
الأساس التقني صح (RTL، Xbot، XP)، لكن الشكل العام يبدو "موقع كورسات" لا "عالم تعليمي".

**سؤال 4: تخيل الـ UI الجديد**
- خريطة مفاهيم مرئية (Knowledge Graph كـ world map)
- Xbot رفيق دائم لا widget عائم
- الدرس = "دخول منطقة" بـ transition سينمائي
- التقدم = العالم يتغير ومناطق جديدة تُفتح

**سؤال 5: هل Full 3D ممكن؟**
البحث يقول: لا للكامل 100% بسبب:
- Mobile GPU limitations (>50% traffic on mobile)
- Accessibility (Canvas لا يدعم screen readers — WCAG)
- SEO (Google لا يقرأ Canvas)

**المقترح: Progressive 3D (Hybrid)**
- طبقة 3D: World Map + Xbot + Learning Scenes
- طبقة HTML فوقها: Navigation + Forms + Text
- Cinematic 3D transitions بين الصفحات

### المتفق عليه ✅

1. **World Map كـ Navigation** — الطفل يرى خريطة عالم بدل قائمة دروس، كل منطقة = مفهوم
2. **Progressive 3D Hybrid** — 3D للـ World Map + Xbot + Learning Scenes / HTML للـ Navigation + Forms + Text
3. **متوازياً** — تصميم الـ UI الجديد يبدأ الآن بالتوازي مع Phase 1 ALI

---

## سجل القرارات المعلقة

*لا يوجد قرارات معلقة حالياً — جميع القرارات مكتملة.*

---

> **قاعدة:** كل قرار جديد يُضاف هنا أولاً ← ثم يُنفَّذ.
