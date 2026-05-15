import {
  Subjects, SubjectTranslations, Courses, CourseTranslations,
  Lessons, LessonTranslations, QuizQuestions, QuizQuestionTranslations,
  QuizOptions, QuizOptionTranslations,
} from '@/lib/db/Schema';
import { uuidv7 } from 'uuidv7';

export async function seedProblemSolving(db: any): Promise<void> {
  const [s] = await db.insert(Subjects).values({ Id: uuidv7(), Slug: 'problem-solving', Icon: 'Brain', Color: '#8B5CF6', Order: 5, IsActive: true, IsDeleted: false }).returning();
  await db.insert(SubjectTranslations).values([
    { Id: uuidv7(), SubjectId: s.Id, Locale: 'ar', Name: 'التفكير المنطقي', Description: 'تعلم كيف تحل المشاكل بطريقة منظمة وذكية' },
    { Id: uuidv7(), SubjectId: s.Id, Locale: 'en', Name: 'Problem Solving', Description: 'Learn how to solve problems in an organized and smart way' },
  ]);
  const [c] = await db.insert(Courses).values({ Id: uuidv7(), SubjectId: s.Id, Order: 1, Difficulty: 1, EstimatedHours: 2, IsActive: true, IsDeleted: false }).returning();
  await db.insert(CourseTranslations).values([
    { Id: uuidv7(), CourseId: c.Id, Locale: 'ar', Name: 'كيف تحل المشاكل؟', Description: 'تعلم خطوات حل المشاكل بفعالية' },
    { Id: uuidv7(), CourseId: c.Id, Locale: 'en', Name: 'How to Solve Problems?', Description: 'Learn effective problem-solving steps' },
  ]);

  async function lesson(order: number, xp: number, mins: number, arT: string, enT: string, arD: string, enD: string, arC: string, enC: string, qa: {q:string;o:string[];c:number}[], qe: {q:string;o:string[]}[]) {
    const [l] = await db.insert(Lessons).values({ Id: uuidv7(), AgentId: null, CourseId: c.Id, Order: order, XpReward: xp, EstimatedMinutes: mins, Difficulty: 1, IsDeleted: false }).returning();
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

  await lesson(1, 50, 6,
    'فهم المشكلة أولاً', 'Understand the Problem First',
    'الخطوة الأهم في حل أي مشكلة', 'The most important step in solving any problem',
    `## فهم المشكلة — الخطوة الأولى والأهم

كتير من الناس بيبدأوا في الحل قبل ما يفهموا المشكلة كويس، وده بيضيّع وقت كتير!

## أسئلة لازم تسألها

- **إيه المشكلة بالضبط؟** — اكتبها بكلامك
- **إيه الهدف المطلوب؟** — إيه النتيجة المثالية؟
- **عندي إيه؟** — المعطيات والمعلومات
- **إيه اللي ماعنديش؟** — المجهول اللي لازم أوصله

## مثال: مشكلة الامتحان

> "درجتي في الامتحان 60 من 100، والدرجة الحد الأدنى للنجاح 65."

- المشكلة: درجتي أقل من الحد الأدنى
- الهدف: الحصول على 65 على الأقل
- عندي: درجة 60
- المجهول: كيف أزيد 5 درجات في الامتحان الجاي

## القاعدة الذهبية

> **لو ما فهمتش المشكلة صح، هتوصل لحل غلط حتى لو أجادك فيه!**`,
    `## Understand the Problem — The First and Most Important Step

Many people start solving before fully understanding the problem, which wastes a lot of time!

## Questions You Must Ask

- **What exactly is the problem?** — Write it in your own words
- **What is the goal?** — What does success look like?
- **What do I have?** — The given information
- **What am I missing?** — The unknown to find

## Example: Exam Problem

> "My exam score is 60 out of 100, and the minimum passing score is 65."

- Problem: My score is below the minimum
- Goal: Get at least 65
- Have: Score of 60
- Missing: How to gain 5 more points on the next exam

## The Golden Rule

> **If you don't understand the problem correctly, you'll reach the wrong solution even if you work hard on it!**`,
    [{q:'ما أهم خطوة في حل المشكلة؟',o:['الحل الفوري','فهم المشكلة أولاً','طلب المساعدة','تجاهل المشكلة'],c:1},
     {q:'ماذا يعني "المجهول" في المشكلة؟',o:['المعطيات المعروفة','الهدف النهائي','ما نريد إيجاده','الخطوات المتبعة'],c:2},
     {q:'لماذا يجب فهم المشكلة قبل الحل؟',o:['لتوفير الوقت وتجنب الحلول الخاطئة','لأنه أسهل','لإرضاء المعلم','لا فائدة منه'],c:0}],
    [{q:'What is the most important step in solving a problem?',o:['Immediately solve it','Understand the problem first','Ask for help','Ignore the problem']},
     {q:'What does "the unknown" mean in a problem?',o:['Known information','The final goal','What we need to find','Steps to follow']},
     {q:'Why understand the problem before solving?',o:['Save time and avoid wrong solutions','It is easier','To please the teacher','No benefit']}],
  );

  await lesson(2, 50, 7,
    'تقسيم المشكلة', 'Break Down the Problem',
    'تعلم كيف تقسم المشكلة الكبيرة لأجزاء صغيرة', 'Learn to break big problems into small pieces',
    `## التقسيم — Decomposition

**التقسيم** هو تحليل المشكلة الكبيرة لأجزاء أصغر يسهل حلها.

## مثال: عمل سندوتش

بدل ما تفكر "ازاي اعمل سندوتش" فكر:
1. جيب الخبز
2. ضع الملء
3. أضف الصلصة
4. اقطع واعرض

## مثال برمجي: بناء تطبيق

مشكلة كبيرة: "ابني تطبيق طقس"

تقسيمها:
- جيب بيانات الطقس من الإنترنت
- اعرض درجة الحرارة
- اعرض الأيقونة المناسبة
- اضف تفاصيل (رياح، رطوبة)

> **قاعدة:** لو المشكلة بتخوّفك، قسّمها!`,
    `## Decomposition

**Decomposition** means breaking a big problem into smaller, easier-to-solve parts.

## Example: Making a Sandwich

Instead of thinking "how do I make a sandwich?" think:
1. Get the bread
2. Add the filling
3. Add the sauce
4. Cut and serve

## Programming Example: Building a Weather App

Big problem: "Build a weather app"

Breaking it down:
- Fetch weather data from the internet
- Display temperature
- Show appropriate icon
- Add details (wind, humidity)

> **Rule:** If a problem scares you, break it down!`,
    [{q:'ما معنى Decomposition في حل المشاكل؟',o:['تجاهل المشكلة','تقسيم المشكلة لأجزاء أصغر','جمع المشاكل معاً','طلب مساعدة'],c:1},
     {q:'ما فائدة تقسيم المشكلة؟',o:['تعقيد الحل','جعل كل جزء أسهل للحل','إضاعة الوقت','لا فائدة'],c:1},
     {q:'عند بناء تطبيق، ما الخطوة الأولى؟',o:['كتابة كل الكود دفعة واحدة','تقسيم التطبيق لوظائف صغيرة','التصميم أولاً فقط','إطلاق التطبيق'],c:1}],
    [{q:'What does Decomposition mean in problem solving?',o:['Ignore the problem','Break problem into smaller parts','Combine problems','Ask for help']},
     {q:'What is the benefit of breaking down a problem?',o:['Makes it complex','Makes each part easier to solve','Wastes time','No benefit']},
     {q:'When building an app, what is the first step?',o:['Write all code at once','Break app into small functions','Only design first','Launch the app']}],
  );

  await lesson(3, 55, 7,
    'الأنماط المتكررة', 'Recognizing Patterns',
    'اكتشف الأنماط لتحل المشاكل أسرع', 'Find patterns to solve problems faster',
    `## التعرف على الأنماط

**النمط** هو تكرار منتظم يمكن استخدامه لحل مشاكل مشابهة.

## أمثلة من الحياة

- 1، 2، 4، 8، 16... (كل رقم ضعف السابق)
- قواعد النحو العربي (نفس القاعدة لكلمات كثيرة)
- الصلاة 5 مرات في اليوم (نمط يومي)

## في البرمجة

\`\`\`javascript
// نمط: كل عنصر في قائمة يحتاج نفس المعالجة
for (let item of list) {
  process(item);  // نفس العملية لكل عنصر
}
\`\`\`

## فائدة الأنماط

لما تعرف النمط، تقدر:
- **تتنبأ** بالخطوة الجاية
- **تكرر** الحل على مشاكل مشابهة
- **توفر** وقت كبير

> اللي يعرف يشوف الأنماط بيحل المشاكل أسرع بكتير!`,
    `## Pattern Recognition

A **pattern** is a regular repetition that can be used to solve similar problems.

## Real-life Examples

- 1, 2, 4, 8, 16... (each number doubles)
- Grammar rules (same rule for many words)
- Daily prayer at fixed times (a daily pattern)

## In Programming

\`\`\`javascript
// Pattern: every item in a list needs the same processing
for (let item of list) {
  process(item);  // same operation for each item
}
\`\`\`

## Benefits of Patterns

When you recognize a pattern, you can:
- **Predict** the next step
- **Reuse** the solution for similar problems
- **Save** a lot of time

> Those who see patterns solve problems much faster!`,
    [{q:'ما هو النمط في حل المشاكل؟',o:['مشكلة صعبة','تكرار منتظم يمكن الاستفادة منه','نوع من البرمجة','أداة رياضية'],c:1},
     {q:'ما التسلسل الصحيح؟ 2، 6، 18، ...؟',o:['20','24','54','36'],c:2},
     {q:'لماذا يفيد التعرف على الأنماط؟',o:['لأنه صعب','يساعد على حل مشاكل مشابهة أسرع','لا فائدة منه','يعقد الأمور'],c:1}],
    [{q:'What is a pattern in problem solving?',o:['A hard problem','A regular repetition that can be reused','A type of programming','A math tool']},
     {q:'What is the correct sequence? 2, 6, 18, ...?',o:['20','24','54','36']},
     {q:'Why is pattern recognition useful?',o:['Because it is hard','Helps solve similar problems faster','No benefit','Complicates things']}],
  );

  await lesson(4, 55, 7,
    'ما هي الخوارزمية؟', 'What is an Algorithm?',
    'تعلم بناء خطوات منظمة لحل المشاكل', 'Learn to build organized steps for solving problems',
    `## الخوارزمية — وصفة الحل

**الخوارزمية** هي مجموعة خطوات منظمة ومحددة لحل مشكلة. زي وصفة الطبخ بالضبط!

## مثال: خوارزمية عمل شاي

1. أشعل الغاز
2. ضع الماء في الإبريق
3. انتظر لغلي الماء
4. أضف كيس الشاي
5. انتظر 3 دقائق
6. أضف السكر حسب الرغبة
7. اشرب!

## خوارزمية برمجية: إيجاد أكبر عدد

\`\`\`
ابدأ: أكبر = العدد الأول
لكل عدد في القائمة:
  لو العدد أكبر من أكبر:
    أكبر = العدد الحالي
أعد أكبر
\`\`\`

## صفات الخوارزمية الجيدة

- **واضحة:** كل خطوة مفهومة
- **محددة:** لا غموض في أي خطوة
- **تنتهي:** لا تستمر للأبد`,
    `## Algorithm — The Recipe for a Solution

An **algorithm** is a set of organized, specific steps to solve a problem. Just like a cooking recipe!

## Example: Making Tea Algorithm

1. Turn on the stove
2. Put water in the kettle
3. Wait for water to boil
4. Add tea bag
5. Wait 3 minutes
6. Add sugar as desired
7. Enjoy!

## Programming Algorithm: Find the Largest Number

\`\`\`
Start: largest = first number
For each number in the list:
  If number > largest:
    largest = current number
Return largest
\`\`\`

## Characteristics of a Good Algorithm

- **Clear:** Each step is understandable
- **Definite:** No ambiguity in any step
- **Finite:** Has an end`,
    [{q:'الخوارزمية هي...؟',o:['لغة برمجة','مجموعة خطوات منظمة لحل مشكلة','نوع من البيانات','أداة رسم'],c:1},
     {q:'ما أهم صفة للخوارزمية؟',o:['أن تكون طويلة','أن تكون واضحة ومحددة','أن تكون معقدة','أن تكون سريعة فقط'],c:1},
     {q:'وصفة الطبخ هي مثال على...؟',o:['متغير','خوارزمية','حلقة','دالة'],c:1}],
    [{q:'An algorithm is...?',o:['A programming language','An organized set of steps to solve a problem','A data type','A drawing tool']},
     {q:'What is the most important characteristic of an algorithm?',o:['Being long','Being clear and definite','Being complex','Being fast only']},
     {q:'A cooking recipe is an example of...?',o:['A variable','An algorithm','A loop','A function']}],
  );

  await lesson(5, 60, 8,
    'جرّب وغلط وصح', 'Try, Fail, and Fix',
    'عقلية المبرمج: الخطأ خطوة للنجاح', 'The programmer mindset: mistakes are steps to success',
    `## التجربة والخطأ — عقلية الحل

أعظم المبدعين في التاريخ جربوا وفشلوا مئات المرات قبل النجاح!

## توماس إديسون ودرس مهم

عندما سُئل توماس إديسون عن فشله 1000 مرة في اختراع المصباح، قال:
> "أنا لم أفشل 1000 مرة، بل وجدت 1000 طريقة لا تعمل!"

## في البرمجة: Debugging

**الـ bug** هو خطأ في الكود. **الـ debugging** هو إيجاد الخطأ وإصلاحه.

خطوات الـ debugging:
1. لاحظ المشكلة (ما اللي مش شغال؟)
2. افهم المفروض يحصل إيه
3. اقرأ رسالة الخطأ
4. صحّح وجرب تاني

## قاعدة 5 دقائق

لو واجهت مشكلة، جرب تحلها بنفسك 5 دقائق على الأقل قبل ما تطلب مساعدة. الإحساس بالحل بنفسك لا يعوّض!

> كل خطأ بتصلحه = خبرة جديدة بتضيفها`,
    `## Trial and Error — The Problem-Solving Mindset

The greatest innovators in history tried and failed hundreds of times before succeeding!

## Thomas Edison and an Important Lesson

When asked about failing 1000 times to invent the light bulb, Edison said:
> "I have not failed 1,000 times. I have successfully discovered 1,000 ways to NOT make a light bulb!"

## In Programming: Debugging

A **bug** is an error in code. **Debugging** is finding and fixing the error.

Debugging steps:
1. Notice the problem (what isn't working?)
2. Understand what should happen
3. Read the error message
4. Fix and try again

## The 5-Minute Rule

If you face a problem, try to solve it yourself for at least 5 minutes before asking for help. The feeling of solving it yourself is irreplaceable!

> Every mistake you fix = new experience you gain`,
    [{q:'ما هو الـ bug في البرمجة؟',o:['نوع من الحشرات','خطأ في الكود','ميزة إضافية','أداة مساعدة'],c:1},
     {q:'ما هو الـ debugging؟',o:['كتابة كود جديد','إيجاد الأخطاء وإصلاحها','حذف البرنامج','تشغيل البرنامج'],c:1},
     {q:'ماذا نتعلم من مثال توماس إديسون؟',o:['الفشل نهاية','الفشل خطوة للنجاح والتعلم','يجب تجنب التجارب','الاستسلام أسهل'],c:1}],
    [{q:'What is a bug in programming?',o:['A type of insect','An error in code','An extra feature','A helper tool']},
     {q:'What is debugging?',o:['Writing new code','Finding and fixing errors','Deleting the program','Running the program']},
     {q:'What do we learn from Edison\'s example?',o:['Failure is the end','Failure is a step to success and learning','Avoid experiments','Giving up is easier']}],
  );
}
