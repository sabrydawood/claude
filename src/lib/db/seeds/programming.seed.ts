import {
  Subjects, SubjectTranslations,
  Courses, CourseTranslations,
  Lessons, LessonTranslations,
  QuizQuestions, QuizQuestionTranslations,
  QuizOptions, QuizOptionTranslations,
} from '@/lib/db/Schema';
import { uuidv7 } from 'uuidv7';

export async function seedProgramming(db: any): Promise<void> {
  // Subject
  const [s] = await db.insert(Subjects).values({
    Id: uuidv7(), Slug: 'programming', Icon: 'Code2', Color: '#3B82F6',
    Order: 2, IsActive: true, IsDeleted: false,
  }).returning();

  await db.insert(SubjectTranslations).values([
    { Id: uuidv7(), SubjectId: s.Id, Locale: 'ar', Name: 'البرمجة للأطفال', Description: 'تعلم البرمجة من الصفر بطريقة ممتعة وبسيطة' },
    { Id: uuidv7(), SubjectId: s.Id, Locale: 'en', Name: 'Kids Programming', Description: 'Learn programming from scratch in a fun and simple way' },
  ]);

  const [c] = await db.insert(Courses).values({
    Id: uuidv7(), SubjectId: s.Id, Order: 1, Difficulty: 2,
    EstimatedHours: 3, IsActive: true, IsDeleted: false,
  }).returning();

  await db.insert(CourseTranslations).values([
    { Id: uuidv7(), CourseId: c.Id, Locale: 'ar', Name: 'JavaScript للأطفال', Description: 'تعلم JavaScript — أشهر لغة برمجة في العالم' },
    { Id: uuidv7(), CourseId: c.Id, Locale: 'en', Name: 'JavaScript for Kids', Description: 'Learn JavaScript — the world\'s most popular programming language' },
  ]);

  // Helper to add a lesson with quiz
  async function addLesson(order: number, xp: number, mins: number,
    arTitle: string, enTitle: string, arDesc: string, enDesc: string,
    arContent: string, enContent: string,
    quizAr: { q: string; opts: string[]; correct: number }[],
    quizEn: { q: string; opts: string[] }[],
  ) {
    const [l] = await db.insert(Lessons).values({
      Id: uuidv7(), AgentId: null, CourseId: c.Id,
      Order: order, XpReward: xp, EstimatedMinutes: mins,
      Difficulty: 1, IsActive: true, IsDeleted: false,
    }).returning();

    await db.insert(LessonTranslations).values([
      { Id: uuidv7(), LessonId: l.Id, Locale: 'ar', Title: arTitle, Description: arDesc, Content: arContent },
      { Id: uuidv7(), LessonId: l.Id, Locale: 'en', Title: enTitle, Description: enDesc, Content: enContent },
    ]);

    for (let qi = 0; qi < quizAr.length; qi++) {
      const [q] = await db.insert(QuizQuestions).values({
        Id: uuidv7(), LessonId: l.Id, Type: 'multiple_choice', Order: qi + 1,
      }).returning();
      await db.insert(QuizQuestionTranslations).values([
        { Id: uuidv7(), QuestionId: q.Id, Locale: 'ar', Question: quizAr[qi].q },
        { Id: uuidv7(), QuestionId: q.Id, Locale: 'en', Question: quizEn[qi].q },
      ]);
      const optIds = await db.insert(QuizOptions).values(
        [0,1,2,3].map(i => ({ Id: uuidv7(), QuestionId: q.Id, IsCorrect: i === quizAr[qi].correct, Order: i+1 }))
      ).returning();
      await db.insert(QuizOptionTranslations).values([
        ...quizAr[qi].opts.map((t,i) => ({ Id: uuidv7(), OptionId: optIds[i].Id, Locale: 'ar', Text: t })),
        ...quizEn[qi].opts.map((t,i) => ({ Id: uuidv7(), OptionId: optIds[i].Id, Locale: 'en', Text: t })),
      ]);
    }
  }

  // Lesson 1: ما هي البرمجة؟
  await addLesson(1, 50, 6,
    'ما هي البرمجة؟', 'What is Programming?',
    'تعرف على البرمجة وكيف تعمل', 'Discover programming and how it works',
    `## ما هي البرمجة؟

البرمجة هي **إعطاء تعليمات للكمبيوتر** عشان يعمل حاجة معينة. زي لما تكتب وصفة طبخ خطوة خطوة — الكمبيوتر بيتبع الخطوات دي بالضبط!

## ليه نتعلم البرمجة؟

- **حل المشاكل:** البرمجة بتعلمك تفكر بطريقة منظمة
- **الإبداع:** تقدر تبني مواقع، ألعاب، وتطبيقات
- **المستقبل:** المبرمجين من أكتر الناس طلباً في سوق الشغل

## أمثلة من حياتنا

> فكر في ريموت التليفزيون — لما تضغط زرار، بيبعت تعليمة للتلفزيون عشان يعمل حاجة. البرمجة زي كده بالظبط!

## أول برنامج

\`\`\`javascript
console.log("مرحباً بالعالم!");
\`\`\`

السطر ده بيطبع رسالة على الشاشة. بسيطة؟ الحل دايماً بسيط في البداية!`,
    `## What is Programming?

Programming means **giving instructions to a computer** to do specific tasks. It's like writing a recipe — the computer follows the steps exactly!

## Why Learn Programming?

- **Problem solving:** Think in an organized, logical way
- **Creativity:** Build websites, games, and apps
- **The future:** Programmers are among the most in-demand people in the job market

## Real-world Example

> Think of a TV remote — when you press a button, it sends an instruction to the TV. Programming is exactly like that!

## First Program

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

This line prints a message to the screen. Simple? The solution is always simple at the start!`,
    [
      { q: 'البرمجة هي...؟', opts: ['رسم الصور', 'إعطاء تعليمات للكمبيوتر', 'لعب الألعاب', 'كتابة قصص'], correct: 1 },
      { q: 'أيهم مثال على برنامج؟', opts: ['كتاب مدرسي', 'تطبيق واتساب', 'قلم رصاص', 'دفتر ملاحظات'], correct: 1 },
      { q: 'ما هو console.log في JavaScript؟', opts: ['طباعة رسالة', 'حذف ملف', 'فتح متصفح', 'إيقاف البرنامج'], correct: 0 },
    ],
    [
      { q: 'Programming is...?', opts: ['Drawing pictures', 'Giving instructions to a computer', 'Playing games', 'Writing stories'] },
      { q: 'Which is an example of a program?', opts: ['A textbook', 'WhatsApp app', 'A pencil', 'A notebook'] },
      { q: 'What does console.log do in JavaScript?', opts: ['Print a message', 'Delete a file', 'Open a browser', 'Stop the program'] },
    ],
  );

  // Lesson 2: المتغيرات
  await addLesson(2, 55, 7,
    'المتغيرات (Variables)', 'Variables',
    'تعلم كيف تخزن المعلومات في البرنامج', 'Learn how to store information in a program',
    `## المتغيرات — صناديق المعلومات

**المتغير** هو زي صندوق فيه اسم وجواه معلومة. مثلاً:

\`\`\`javascript
let age = 15;
let name = "أحمد";
let isStudent = true;
\`\`\`

## أنواع المتغيرات

| النوع | مثال | الوصف |
|-------|------|-------|
| رقم | \`let score = 100\` | أي رقم |
| نص | \`let city = "القاهرة"\` | كلام بين "" |
| صح/غلط | \`let pass = true\` | true أو false |

## كيف نستخدمها؟

\`\`\`javascript
let name = "سارة";
let age = 14;
console.log("اسمي " + name + " وعمري " + age);
// النتيجة: اسمي سارة وعمري 14
\`\`\`

> **نصيحة:** اختار اسم واضح للمتغير! \`studentAge\` أحسن من \`x\``,
    `## Variables — Information Boxes

A **variable** is like a labeled box containing information. For example:

\`\`\`javascript
let age = 15;
let name = "Ahmed";
let isStudent = true;
\`\`\`

## Types of Variables

| Type | Example | Description |
|------|---------|-------------|
| Number | \`let score = 100\` | Any number |
| String | \`let city = "Cairo"\` | Text in quotes |
| Boolean | \`let pass = true\` | true or false |

## Using Variables

\`\`\`javascript
let name = "Sara";
let age = 14;
console.log("My name is " + name + " and I'm " + age);
// Result: My name is Sara and I'm 14
\`\`\`

> **Tip:** Choose a clear variable name! \`studentAge\` is better than \`x\``,
    [
      { q: 'المتغير في البرمجة هو...؟', opts: ['معادلة رياضية', 'صندوق لتخزين معلومات', 'نوع من الألعاب', 'أمر للطباعة'], correct: 1 },
      { q: 'أي منها طريقة صح لإنشاء متغير؟', opts: ['variable name = 5', 'let name = "أحمد"', 'store name 5', 'name := 5'], correct: 1 },
      { q: 'ما نوع المتغير: let isActive = true ؟', opts: ['رقم', 'نص', 'صح/غلط (Boolean)', 'قائمة'], correct: 2 },
    ],
    [
      { q: 'A variable in programming is...?', opts: ['A math equation', 'A box to store information', 'A type of game', 'A print command'] },
      { q: 'Which is a correct way to create a variable?', opts: ['variable name = 5', 'let name = "Ahmed"', 'store name 5', 'name := 5'] },
      { q: 'What type is: let isActive = true?', opts: ['Number', 'String', 'Boolean', 'Array'] },
    ],
  );

  // Lesson 3: الجمل الشرطية
  await addLesson(3, 60, 8,
    'الجمل الشرطية (If/Else)', 'Conditionals (If/Else)',
    'اتخاذ القرارات في البرمجة', 'Decision making in programming',
    `## الجمل الشرطية — خذ القرار الصح

**if/else** بتخلي برنامجك يتخذ قرارات! زي:
> "لو النتيجة أكبر من 50، قول نجحت. غير كده، قول راسب."

## الشكل العام

\`\`\`javascript
if (الشرط) {
  // لو الشرط صح
} else {
  // لو الشرط غلط
}
\`\`\`

## مثال عملي

\`\`\`javascript
let score = 75;

if (score >= 50) {
  console.log("مبروك، نجحت! 🎉");
} else {
  console.log("حاول تاني، تقدر! 💪");
}
\`\`\`

## شروط متعددة

\`\`\`javascript
if (score >= 90) {
  console.log("ممتاز!");
} else if (score >= 70) {
  console.log("جيد جداً");
} else if (score >= 50) {
  console.log("مقبول");
} else {
  console.log("يحتاج مراجعة");
}
\`\`\``,
    `## Conditionals — Make the Right Decision

**if/else** lets your program make decisions! Like:
> "If the score is above 50, say passed. Otherwise, say failed."

## General Form

\`\`\`javascript
if (condition) {
  // if condition is true
} else {
  // if condition is false
}
\`\`\`

## Practical Example

\`\`\`javascript
let score = 75;

if (score >= 50) {
  console.log("Congratulations, you passed! 🎉");
} else {
  console.log("Try again, you can do it! 💪");
}
\`\`\`

## Multiple Conditions

\`\`\`javascript
if (score >= 90) {
  console.log("Excellent!");
} else if (score >= 70) {
  console.log("Very Good");
} else if (score >= 50) {
  console.log("Pass");
} else {
  console.log("Needs review");
}
\`\`\``,
    [
      { q: 'ما هي وظيفة جملة if؟', opts: ['طباعة نص', 'تنفيذ كود لو شرط صح', 'تكرار أمر', 'تعريف متغير'], correct: 1 },
      { q: 'ما الكلمة المستخدمة للشرط البديل؟', opts: ['otherwise', 'else', 'or', 'when'], correct: 1 },
      { q: 'لو score = 85، ما النتيجة؟\nif(score>=90){A} else if(score>=70){B} else {C}', opts: ['A', 'B', 'C', 'لا شيء'], correct: 1 },
    ],
    [
      { q: 'What is the purpose of an if statement?', opts: ['Print text', 'Execute code when a condition is true', 'Repeat a command', 'Define a variable'] },
      { q: 'What keyword is used for an alternative condition?', opts: ['otherwise', 'else', 'or', 'when'] },
      { q: 'If score = 85, what is the result?\nif(score>=90){A} else if(score>=70){B} else {C}', opts: ['A', 'B', 'C', 'Nothing'] },
    ],
  );

  // Lesson 4: الحلقات
  await addLesson(4, 60, 8,
    'الحلقات (Loops)', 'Loops',
    'تكرار الأوامر بذكاء', 'Repeat commands smartly',
    `## الحلقات — كرر بذكاء

تخيل لو محتاج تطبع "مرحباً" 100 مرة. مش هتكتبها 100 مرة! الحلقات بتحل المشكلة دي.

## حلقة for

\`\`\`javascript
for (let i = 1; i <= 5; i++) {
  console.log("المرة رقم " + i);
}
// المرة رقم 1
// المرة رقم 2
// ... حتى 5
\`\`\`

## حلقة while

\`\`\`javascript
let count = 1;
while (count <= 3) {
  console.log("العد: " + count);
  count++;
}
\`\`\`

## مثال ممتع — جدول الضرب

\`\`\`javascript
for (let i = 1; i <= 10; i++) {
  console.log("5 × " + i + " = " + (5 * i));
}
\`\`\`

> **تحذير:** انتبه من الحلقة اللانهائية! تأكد دايماً إن الشرط هيتوقف.`,
    `## Loops — Repeat Smartly

Imagine needing to print "Hello" 100 times. You won't write it 100 times! Loops solve this.

## for Loop

\`\`\`javascript
for (let i = 1; i <= 5; i++) {
  console.log("Time number " + i);
}
// Time number 1, 2, 3, 4, 5
\`\`\`

## while Loop

\`\`\`javascript
let count = 1;
while (count <= 3) {
  console.log("Count: " + count);
  count++;
}
\`\`\`

## Fun Example — Multiplication Table

\`\`\`javascript
for (let i = 1; i <= 10; i++) {
  console.log("5 × " + i + " = " + (5 * i));
}
\`\`\`

> **Warning:** Beware of infinite loops! Always make sure the condition will eventually stop.`,
    [
      { q: 'الحلقات في البرمجة تُستخدم لـ...؟', opts: ['حذف الأخطاء', 'تكرار الأوامر', 'إنشاء متغيرات', 'طباعة مرة واحدة'], correct: 1 },
      { q: 'كم مرة تتكرر الحلقة؟\nfor(let i=0; i<4; i++)', opts: ['3 مرات', '4 مرات', '5 مرات', 'لا نهاية'], correct: 1 },
      { q: 'ما خطر الحلقة اللانهائية؟', opts: ['تسريع البرنامج', 'تجميد البرنامج', 'حذف البيانات', 'لا خطر'], correct: 1 },
    ],
    [
      { q: 'Loops in programming are used to...?', opts: ['Delete errors', 'Repeat commands', 'Create variables', 'Print once'] },
      { q: 'How many times does this loop run?\nfor(let i=0; i<4; i++)', opts: ['3 times', '4 times', '5 times', 'Infinite'] },
      { q: 'What is the danger of an infinite loop?', opts: ['Speed up program', 'Freeze the program', 'Delete data', 'No danger'] },
    ],
  );

  // Lesson 5: الدوال
  await addLesson(5, 65, 9,
    'الدوال (Functions)', 'Functions',
    'اكتب مرة واستخدم ألف مرة', 'Write once, use a thousand times',
    `## الدوال — قوة إعادة الاستخدام

**الدالة** هي مجموعة أوامر ليها اسم، تقدر تناديها أي وقت.

## إنشاء دالة

\`\`\`javascript
function greet(name) {
  return "مرحباً يا " + name + "!";
}

// استخدام الدالة
console.log(greet("أحمد"));  // مرحباً يا أحمد!
console.log(greet("سارة"));  // مرحباً يا سارة!
\`\`\`

## دالة الحساب

\`\`\`javascript
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

console.log(add(5, 3));       // 8
console.log(multiply(4, 6));  // 24
\`\`\`

## فوايد الدوال

- **لا تكرار:** اكتب الكود مرة واحدة
- **تنظيم:** كل دالة مسؤولة عن حاجة واحدة
- **سهولة التعديل:** غير في مكان واحد فبس`,
    `## Functions — The Power of Reuse

A **function** is a group of commands with a name that you can call anytime.

## Creating a Function

\`\`\`javascript
function greet(name) {
  return "Hello " + name + "!";
}

// Using the function
console.log(greet("Ahmed"));  // Hello Ahmed!
console.log(greet("Sara"));   // Hello Sara!
\`\`\`

## Calculator Function

\`\`\`javascript
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

console.log(add(5, 3));       // 8
console.log(multiply(4, 6));  // 24
\`\`\`

## Benefits of Functions

- **No repetition:** Write the code once
- **Organization:** Each function does one thing
- **Easy to modify:** Change in one place only`,
    [
      { q: 'الدالة في البرمجة هي...؟', opts: ['متغير خاص', 'مجموعة أوامر بها اسم', 'نوع من البيانات', 'خطأ برمجي'], correct: 1 },
      { q: 'ما الكلمة المستخدمة لإنشاء دالة في JavaScript؟', opts: ['create', 'def', 'function', 'method'], correct: 2 },
      { q: 'ما فائدة كلمة return في الدالة؟', opts: ['إيقاف البرنامج', 'إرجاع قيمة من الدالة', 'طباعة النتيجة', 'تعريف متغير'], correct: 1 },
    ],
    [
      { q: 'A function in programming is...?', opts: ['A special variable', 'A group of commands with a name', 'A data type', 'A bug'] },
      { q: 'What keyword creates a function in JavaScript?', opts: ['create', 'def', 'function', 'method'] },
      { q: 'What does the return keyword do in a function?', opts: ['Stop the program', 'Return a value from the function', 'Print the result', 'Define a variable'] },
    ],
  );
}
