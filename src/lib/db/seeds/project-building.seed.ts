import {
  Subjects, SubjectTranslations, Courses, CourseTranslations,
  Lessons, LessonTranslations, QuizQuestions, QuizQuestionTranslations,
  QuizOptions, QuizOptionTranslations,
} from '@/lib/db/Schema';
import { uuidv7 } from 'uuidv7';

export async function seedProjectBuilding(db: any): Promise<void> {
  const [s] = await db.insert(Subjects).values({ Id: uuidv7(), Slug: 'project-building', Icon: 'Rocket', Color: '#EF4444', Order: 7, IsActive: true, IsDeleted: false }).returning();
  await db.insert(SubjectTranslations).values([
    { Id: uuidv7(), SubjectId: s.Id, Locale: 'ar', Name: 'بناء المشاريع', Description: 'من الفكرة إلى مشروع حقيقي تافتخر بيه' },
    { Id: uuidv7(), SubjectId: s.Id, Locale: 'en', Name: 'Build Projects', Description: 'From idea to a real project you can be proud of' },
  ]);
  const [c] = await db.insert(Courses).values({ Id: uuidv7(), SubjectId: s.Id, Order: 1, Difficulty: 2, EstimatedHours: 3, IsActive: true, IsDeleted: false }).returning();
  await db.insert(CourseTranslations).values([
    { Id: uuidv7(), CourseId: c.Id, Locale: 'ar', Name: 'من الفكرة للمشروع', Description: 'تعلم منهجية بناء المشاريع الناجحة' },
    { Id: uuidv7(), CourseId: c.Id, Locale: 'en', Name: 'From Idea to Project', Description: 'Learn the methodology of building successful projects' },
  ]);

  async function lesson(order: number, xp: number, mins: number, arT: string, enT: string, arD: string, enD: string, arC: string, enC: string, qa: {q:string;o:string[];c:number}[], qe: {q:string;o:string[]}[]) {
    const [l] = await db.insert(Lessons).values({ Id: uuidv7(), AgentId: null, CourseId: c.Id, Order: order, XpReward: xp, EstimatedMinutes: mins, Difficulty: 2, IsDeleted: false }).returning();
    await db.insert(LessonTranslations).values([
      { Id: uuidv7(), LessonId: l.Id, Locale: 'ar', Title: arT, Description: arD, Content: arC },
      { Id: uuidv7(), LessonId: l.Id, Locale: 'en', Title: enT, Description: enD, Content: enC },
    ]);
    for (let i = 0; i < qa.length; i++) {
      const [q] = await db.insert(QuizQuestions).values({ Id: uuidv7(), LessonId: l.Id, Type: 'multiple_choice', Order: i+1 }).returning();
      await db.insert(QuizQuestionTranslations).values([
        { Id: uuidv7(), QuestionId: q.Id, Locale: 'ar', Question: qa[i].q },
        { Id: uuidv7(), QuestionId: q.Id, Locale: 'en', Question: qe[i].q },
      ]);
      const opts = await db.insert(QuizOptions).values([0,1,2,3].map(j => ({ Id: uuidv7(), QuestionId: q.Id, IsCorrect: j === qa[i].c, Order: j+1 }))).returning();
      await db.insert(QuizOptionTranslations).values([
        ...qa[i].o.map((t,j) => ({ Id: uuidv7(), OptionId: opts[j].Id, Locale: 'ar', Text: t })),
        ...qe[i].o.map((t,j) => ({ Id: uuidv7(), OptionId: opts[j].Id, Locale: 'en', Text: t })),
      ]);
    }
  }

  await lesson(1, 55, 7, 'من أين تيجي الأفكار؟', 'Where Do Ideas Come From?', 'اكتشف كيف تجد أفكاراً لمشاريع رائعة', 'Discover how to find ideas for great projects',
    `## مصادر أفكار المشاريع

أحسن المشاريع بتيجي من **مشاكل حقيقية** في حياتنا!

## أسئلة تساعدك تلاقي فكرة

- إيه المشكلة اللي بتضايقني كل يوم؟
- إيه الحاجة اللي بحلها يدوياً وممكن تتأتمت؟
- إيه اللي أصحابي بيشكوا منه؟

## أمثلة ناجحة

- **واتساب:** حل مشكلة تكلفة الرسائل
- **Uber:** حل مشكلة إيجاد تاكسي
- **Canva:** حل مشكلة التصميم للمبتدئين

## مشاريع لطلاب

- تطبيق تنظيم جدول المذاكرة
- موقع مشاركة وصفات الطبخ
- لعبة تعليمية للأطفال
- أداة حساب المتوسطات للطلاب

> **نصيحة:** ابدأ بمشكلة صغيرة تعانيها أنت شخصياً. الشغف بالمشكلة = شغف بالحل!`,
    `## Sources of Project Ideas

The best projects come from **real problems** in our lives!

## Questions to Help You Find an Idea

- What problem bothers me every day?
- What do I do manually that could be automated?
- What do my friends complain about?

## Successful Examples

- **WhatsApp:** Solved the problem of messaging costs
- **Uber:** Solved the problem of finding a taxi
- **Canva:** Solved design for beginners

## Student Projects

- Study schedule organizer app
- Recipe sharing website
- Educational game for children
- Grade average calculator tool

> **Tip:** Start with a small problem you personally face. Passion for the problem = passion for the solution!`,
    [{q:'ما أفضل مصدر لأفكار المشاريع؟',o:['التفكير العشوائي','مشاكل حقيقية من الحياة اليومية','نسخ مشاريع موجودة','الانتظار للإلهام'],c:1},
     {q:'ما الذي حلّه WhatsApp؟',o:['مشكلة الكمبيوتر البطيء','تكلفة الرسائل والمكالمات','صعوبة التصميم','إيجاد السيارات'],c:1},
     {q:'لماذا يُنصح بالبدء بمشاكل شخصية؟',o:['لأنها أصعب','الشغف الشخصي يدفعك للإنجاز','لأنها أبسط دائماً','لا سبب محدد'],c:1}],
    [{q:'What is the best source for project ideas?',o:['Random thinking','Real problems from daily life','Copying existing projects','Waiting for inspiration']},
     {q:'What did WhatsApp solve?',o:['Slow computer','Cost of messages and calls','Design difficulty','Finding cars']},
     {q:'Why is it recommended to start with personal problems?',o:['Because they are harder','Personal passion drives you to complete it','Because they are always simpler','No specific reason']}],
  );

  await lesson(2, 55, 7, 'ابدأ بسيط (MVP)', 'Start Simple (MVP)', 'تعلم مفهوم الـ MVP وليه مهم', 'Learn the MVP concept and why it matters',
    `## MVP — الحد الأدنى القابل للاستخدام

**MVP** = Minimum Viable Product

هو أبسط نسخة من مشروعك تحل المشكلة الأساسية وبس.

## مثال: تطبيق توصيل طعام

❌ بدون MVP: تبني تطبيق كامل بكل الميزات من أول يوم
✅ مع MVP:
- الخطوة 1: قائمة طعام بسيطة + زر طلب
- الخطوة 2: بعد النجاح، أضف التتبع
- الخطوة 3: أضف الدفع الإلكتروني
- الخطوة 4: أضف التقييمات

## لماذا MVP مهم؟

- **توفير الوقت:** لا تبني ما لا يحتاجه أحد
- **التعلم المبكر:** تعرف مبكراً هل الفكرة ناجحة
- **تقليل المخاطر:** لا تخسر كل شيء لو الفكرة فشلت

> أمازون بدأت بكتب فقط. جوجل بدأت بخانة بحث واحدة!`,
    `## MVP — Minimum Viable Product

**MVP** = Minimum Viable Product

It's the simplest version of your project that solves the core problem and nothing more.

## Example: Food Delivery App

❌ Without MVP: Build a complete app with all features from day one
✅ With MVP:
- Step 1: Simple food menu + order button
- Step 2: After success, add tracking
- Step 3: Add electronic payment
- Step 4: Add reviews

## Why is MVP Important?

- **Save time:** Don't build what no one needs
- **Early learning:** Know early if the idea works
- **Reduce risk:** Don't lose everything if the idea fails

> Amazon started with books only. Google started with one search box!`,
    [{q:'ماذا تعني MVP؟',o:['Most Valuable Project','Minimum Viable Product','Maximum Value Program','Modern Visual Platform'],c:1},
     {q:'ما هدف الـ MVP؟',o:['بناء كل الميزات مرة واحدة','تقديم أبسط نسخة تحل المشكلة الأساسية','جذب مستثمرين','إرضاء الجميع'],c:1},
     {q:'لماذا بدأت أمازون بالكتب فقط؟',o:['لأنها لا تعرف غير الكتب','للتركيز وتجربة الفكرة أولاً','لأن الكتب أرخص','بسبب القوانين'],c:1}],
    [{q:'What does MVP stand for?',o:['Most Valuable Project','Minimum Viable Product','Maximum Value Program','Modern Visual Platform']},
     {q:'What is the goal of an MVP?',o:['Build all features at once','Deliver the simplest version that solves the core problem','Attract investors','Please everyone']},
     {q:'Why did Amazon start with books only?',o:['They only knew books','To focus and test the idea first','Because books are cheaper','Due to regulations']}],
  );

  await lesson(3, 55, 7, 'التخطيط قبل الكود', 'Plan Before Code', 'تعلم كيف تخطط لمشروعك قبل البداية', 'Learn how to plan your project before starting',
    `## لماذا نخطط؟

الكود بدون خطة = بناء بيت بدون رسم هندسي!

## خطوات التخطيط

### 1. تعريف المشروع
- المشكلة: ما المشكلة التي أحلها؟
- المستخدم: من سيستخدم تطبيقي؟
- الحل: ما الحل الذي أقدمه؟

### 2. قائمة الميزات
اكتب قائمة بكل الميزات المطلوبة، ثم:
- 🔴 ضروري (MVP)
- 🟡 مهم
- 🟢 اختياري

### 3. رسم تخطيطي (Wireframe)
ارسم الشاشات بشكل بسيط بالقلم والورق أولاً.

\`\`\`
[ الصفحة الرئيسية ]
- شعار التطبيق
- زر "ابدأ"
- قائمة آخر المشاريع
\`\`\`

> **قاعدة:** 1 ساعة تخطيط = 5 ساعات توفير في الكود!`,
    `## Why Do We Plan?

Code without a plan = building a house without blueprints!

## Planning Steps

### 1. Define the Project
- Problem: What problem am I solving?
- User: Who will use my app?
- Solution: What solution am I providing?

### 2. Feature List
Write a list of all required features, then categorize:
- 🔴 Essential (MVP)
- 🟡 Important
- 🟢 Optional

### 3. Wireframe
Draw the screens simply with pen and paper first.

\`\`\`
[ Main Page ]
- App logo
- "Start" button
- List of recent projects
\`\`\`

> **Rule:** 1 hour of planning = 5 hours saved in coding!`,
    [{q:'لماذا يجب التخطيط قبل كتابة الكود؟',o:['لإضاعة الوقت','لتحديد الميزات ومنع الأخطاء المبكرة','لأنه إجباري','لإرضاء المدير'],c:1},
     {q:'ما هو الـ Wireframe؟',o:['نوع من الكود','رسم تخطيطي بسيط لشاشات التطبيق','قائمة المشاريع','أداة برمجية'],c:1},
     {q:'ما الميزات التي تُبنى أولاً في الـ MVP؟',o:['الاختيارية','المهمة','الضرورية فقط','الجميلة'],c:2}],
    [{q:'Why must we plan before writing code?',o:['To waste time','To define features and prevent early mistakes','Because it is mandatory','To please the manager']},
     {q:'What is a Wireframe?',o:['A type of code','A simple sketch of app screens','A project list','A software tool']},
     {q:'Which features are built first in the MVP?',o:['Optional','Important','Essential only','Beautiful']}],
  );

  await lesson(4, 60, 8, 'من الكود للمستخدم', 'From Code to User', 'تعلم كيف تختبر مشروعك وتحصل على feedback', 'Learn how to test your project and get feedback',
    `## الاختبار مع المستخدمين الحقيقيين

أحسن اختبار هو لما حد تاني بيستخدم مشروعك!

## مراحل الاختبار

### 1. Self-testing
جرّب التطبيق بنفسك أولاً وحاول تكسّره.

### 2. Friend Testing
اديه لصديق ولاحظ:
- أين تعثّر؟
- ما الذي لم يفهمه؟
- ما الذي أعجبه؟

### 3. جمع الـ Feedback

\`\`\`
أسئلة مفيدة للمستخدمين:
- هل وجدت ما تريد بسهولة؟
- ما الذي أربكك؟
- ماذا تريد تحسين؟
\`\`\`

## التكرار والتحسين

بعد كل feedback، حسّن وجرب تاني. البرامج الناجحة تمر بمئات الإصدارات!

> **لا يوجد مشروع مكتمل** — هناك دائماً إصدار أفضل قادم.`,
    `## Testing with Real Users

The best test is when someone else uses your project!

## Testing Stages

### 1. Self-testing
Try the app yourself first and try to break it.

### 2. Friend Testing
Give it to a friend and observe:
- Where did they get stuck?
- What did they not understand?
- What did they like?

### 3. Collecting Feedback

\`\`\`
Useful questions for users:
- Did you find what you wanted easily?
- What confused you?
- What do you want improved?
\`\`\`

## Iteration and Improvement

After each feedback session, improve and test again. Successful programs go through hundreds of versions!

> **No project is ever complete** — there is always a better version coming.`,
    [{q:'لماذا نختبر مع مستخدمين حقيقيين؟',o:['لإضاعة الوقت','لأنهم يكتشفون مشاكل لا نراها نحن','لأنه إجباري','لا فائدة منه'],c:1},
     {q:'ما هو الـ Feedback في تطوير البرمجيات؟',o:['خطأ في الكود','آراء وملاحظات المستخدمين','نوع من الاختبار التلقائي','اسم لأداة برمجية'],c:1},
     {q:'ما معنى إصدار (Version) في البرمجيات؟',o:['نسخة محدّثة من البرنامج','نوع من قواعد البيانات','خطأ في البرنامج','اسم المطور'],c:0}],
    [{q:'Why do we test with real users?',o:['To waste time','They discover problems we don\'t see','Because it\'s mandatory','No benefit']},
     {q:'What is Feedback in software development?',o:['A code error','User opinions and observations','A type of automated testing','A software tool name']},
     {q:'What does a software Version mean?',o:['An updated copy of the program','A type of database','A program error','The developer\'s name']}],
  );

  await lesson(5, 65, 9, 'شارك مشروعك', 'Share Your Project', 'تعلم كيف تعرض مشروعك بثقة', 'Learn how to present your project with confidence',
    `## عرض المشروع — قصتك

المشروع الجيد يحتاج عرض جيد!

## هيكل العرض المثالي

### 1. المشكلة (30 ثانية)
"لاحظت إن الطلاب ينسون مواعيد التسليم..."

### 2. الحل (30 ثانية)
"بنيت تطبيق يذكّرك قبل 24 ساعة من كل تسليم..."

### 3. Demo
أرِ المشروع وهو شغال!

### 4. ما تعلمته
"تعلمت كيف أعمل مع API لأول مرة..."

### 5. الخطوة الجاية
"أريد إضافة تنبيهات للتليفون..."

## نصائح للعرض

- **تمرّن مسبقاً** على ما ستقوله
- **ابدأ بالـ Demo** — الناس تحب ترى قبل تسمع
- **كن صادقاً** عن التحديات والأخطاء
- **ابتسم** — الحماس معدٍ!

> أفضل خطاب هو اللي تتكلم فيه عن حاجة بتحبها!`,
    `## Presenting Your Project — Your Story

A great project needs a great presentation!

## Ideal Presentation Structure

### 1. The Problem (30 seconds)
"I noticed students forget submission deadlines..."

### 2. The Solution (30 seconds)
"I built an app that reminds you 24 hours before each submission..."

### 3. Demo
Show the project working!

### 4. What You Learned
"I learned how to work with APIs for the first time..."

### 5. Next Step
"I want to add phone notifications..."

## Presentation Tips

- **Practice beforehand** what you will say
- **Start with the Demo** — people like to see before they hear
- **Be honest** about challenges and mistakes
- **Smile** — enthusiasm is contagious!

> The best speech is about something you love!`,
    [{q:'ما أول شيء يجب ذكره في عرض المشروع؟',o:['الكود التقني','المشكلة التي يحلها المشروع','اسم المطور','تقنيات المستخدمة'],c:1},
     {q:'لماذا يُنصح بالبدء بالـ Demo؟',o:['لأنه أسهل','لأن الناس تفضل الرؤية على الاستماع','لإخفاء المشاكل','لا سبب'],c:1},
     {q:'لماذا الصدق عن التحديات مهم في العرض؟',o:['لإظهار الضعف','يبني الثقة ويُظهر التعلم الحقيقي','ليس مهماً','للحصول على تعاطف'],c:1}],
    [{q:'What is the first thing to mention in a project presentation?',o:['Technical code','The problem the project solves','Developer name','Technologies used']},
     {q:'Why is it recommended to start with the Demo?',o:['Because it\'s easier','People prefer seeing over hearing','To hide problems','No reason']},
     {q:'Why is honesty about challenges important in the presentation?',o:['To show weakness','Builds trust and shows real learning','It\'s not important','To get sympathy']}],
  );
}
