import {
  Subjects, SubjectTranslations, Courses, CourseTranslations,
  Lessons, LessonTranslations, QuizQuestions, QuizQuestionTranslations,
  QuizOptions, QuizOptionTranslations,
} from '@/lib/db/Schema';
import { uuidv7 } from 'uuidv7';

export async function seedDesignPatterns(db: any): Promise<void> {
  const [s] = await db.insert(Subjects).values({ Id: uuidv7(), Slug: 'design-patterns', Icon: 'Layers', Color: '#06B6D4', Order: 8, IsActive: true, IsDeleted: false }).returning();
  await db.insert(SubjectTranslations).values([
    { Id: uuidv7(), SubjectId: s.Id, Locale: 'ar', Name: 'بناء البرامج', Description: 'تعلم كيف تكتب كوداً نظيفاً ومنظماً يفخر به المطورون' },
    { Id: uuidv7(), SubjectId: s.Id, Locale: 'en', Name: 'Software Design', Description: 'Learn to write clean, organized code that developers are proud of' },
  ]);
  const [c] = await db.insert(Courses).values({ Id: uuidv7(), SubjectId: s.Id, Order: 1, Difficulty: 3, EstimatedHours: 2, IsActive: true, IsDeleted: false }).returning();
  await db.insert(CourseTranslations).values([
    { Id: uuidv7(), CourseId: c.Id, Locale: 'ar', Name: 'الكود النظيف', Description: 'مبادئ كتابة كود جيد ومفهوم' },
    { Id: uuidv7(), CourseId: c.Id, Locale: 'en', Name: 'Clean Code', Description: 'Principles of writing good, understandable code' },
  ]);

  async function lesson(order: number, xp: number, mins: number, arT: string, enT: string, arD: string, enD: string, arC: string, enC: string, qa: {q:string;o:string[];c:number}[], qe: {q:string;o:string[]}[]) {
    const [l] = await db.insert(Lessons).values({ Id: uuidv7(), AgentId: null, CourseId: c.Id, Order: order, XpReward: xp, EstimatedMinutes: mins, Difficulty: 3, IsDeleted: false }).returning();
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

  await lesson(1, 60, 7, 'ما هو الكود النظيف؟', 'What is Clean Code?', 'تعرف على مبادئ الكتابة الاحترافية', 'Discover professional coding principles',
    `## الكود النظيف — كود يقرأه البشر

**الكود النظيف** هو كود:
- **يُقرأ بسهولة** من أي مطور
- **سهل التعديل** بدون كسر باقي الكود
- **واضح الهدف** بدون تعليقات كثيرة

## مقارنة

❌ كود غير نظيف:
\`\`\`javascript
function f(x, y) {
  return x * y / 100 + x;
}
\`\`\`

✅ كود نظيف:
\`\`\`javascript
function calculateTotalPrice(basePrice, taxPercent) {
  const tax = basePrice * taxPercent / 100;
  return basePrice + tax;
}
\`\`\`

## قواعد الكود النظيف

1. **أسماء واضحة:** \`studentAge\` مش \`x\`
2. **وظيفة واحدة لكل دالة:** لا تخلط بين أشياء مختلفة
3. **بدون تكرار:** DRY Principle (Don't Repeat Yourself)
4. **تعليقات مفيدة:** اشرح الـ "لماذا" مش الـ "ماذا"`,
    `## Clean Code — Code That Humans Can Read

**Clean code** is code that:
- Is **easy to read** by any developer
- Is **easy to modify** without breaking other code
- Has a **clear purpose** without excessive comments

## Comparison

❌ Dirty code:
\`\`\`javascript
function f(x, y) {
  return x * y / 100 + x;
}
\`\`\`

✅ Clean code:
\`\`\`javascript
function calculateTotalPrice(basePrice, taxPercent) {
  const tax = basePrice * taxPercent / 100;
  return basePrice + tax;
}
\`\`\`

## Clean Code Rules

1. **Clear names:** \`studentAge\` not \`x\`
2. **One function, one job:** Don't mix different responsibilities
3. **No repetition:** DRY Principle (Don't Repeat Yourself)
4. **Useful comments:** Explain "why" not "what"`,
    [{q:'ما تعريف الكود النظيف؟',o:['كود بلا أخطاء فقط','كود واضح سهل القراءة والتعديل','كود قصير جداً','كود بلا تعليقات'],c:1},
     {q:'أيهما اسم متغير أنظف؟',o:['a','temp','studentGrade','x2'],c:2},
     {q:'ما معنى مبدأ DRY؟',o:['اكتب كوداً جافاً','لا تكرر نفس الكود','احذف التعليقات','الكود يكون قصيراً'],c:1}],
    [{q:'What is the definition of clean code?',o:['Code with no errors only','Clear code that is easy to read and modify','Very short code','Code without comments']},
     {q:'Which is the cleaner variable name?',o:['a','temp','studentGrade','x2']},
     {q:'What does the DRY principle mean?',o:['Write dry code','Don\'t repeat yourself','Delete comments','Keep code short']}],
  );

  await lesson(2, 60, 7, 'أسماء واضحة', 'Clear Names', 'تعلم فن تسمية المتغيرات والدوال', 'Learn the art of naming variables and functions',
    `## التسمية — الفن المُهمَل

**الاسم الجيد** بيشرح الكود بدون ما تقرأ التعليمات.

## قواعد التسمية

### للمتغيرات: اسم + وصف
\`\`\`javascript
// ❌ سيء
let d = new Date();
let n = "محمد";
let a = 25;

// ✅ جيد
let currentDate = new Date();
let userName = "محمد";
let userAge = 25;
\`\`\`

### للدوال: فعل + اسم
\`\`\`javascript
// ❌ سيء
function data() {}
function users() {}

// ✅ جيد
function getUserData() {}
function fetchActiveUsers() {}
\`\`\`

### للـ Boolean: سؤال
\`\`\`javascript
// ❌ سيء
let logged = true;

// ✅ جيد
let isLoggedIn = true;
let hasPermission = false;
\`\`\`

> **قاعدة:** لو محتاج تعليق تشرح فيه اسم المتغير، الاسم ده غلط!`,
    `## Naming — The Neglected Art

A **good name** explains the code without reading comments.

## Naming Rules

### For Variables: name + description
\`\`\`javascript
// ❌ Bad
let d = new Date();
let n = "Mohamed";
let a = 25;

// ✅ Good
let currentDate = new Date();
let userName = "Mohamed";
let userAge = 25;
\`\`\`

### For Functions: verb + noun
\`\`\`javascript
// ❌ Bad
function data() {}
function users() {}

// ✅ Good
function getUserData() {}
function fetchActiveUsers() {}
\`\`\`

### For Boolean: a question
\`\`\`javascript
// ❌ Bad
let logged = true;

// ✅ Good
let isLoggedIn = true;
let hasPermission = false;
\`\`\`

> **Rule:** If you need a comment to explain a variable name, that name is wrong!`,
    [{q:'كيف يجب تسمية الدوال في الكود النظيف؟',o:['حرف واحد','فعل + اسم يصف ما تفعله','اسم عشوائي','رقم فقط'],c:1},
     {q:'أي من التالي أفضل اسم لـ Boolean؟',o:['active','flag','isActive','b1'],c:2},
     {q:'ما علامة الاسم السيء للمتغير؟',o:['إنه طويل','إنه يحتاج تعليقاً لشرحه','إنه بالإنجليزي','إنه يبدأ بحرف صغير'],c:1}],
    [{q:'How should functions be named in clean code?',o:['One letter','Verb + noun describing what it does','Random name','Number only']},
     {q:'Which is the best name for a Boolean?',o:['active','flag','isActive','b1']},
     {q:'What is a sign of a bad variable name?',o:['It\'s long','It needs a comment to explain it','It\'s in English','It starts with lowercase']}],
  );

  await lesson(3, 65, 8, 'لا تكرر نفسك (DRY)', "Don't Repeat Yourself (DRY)", 'إزالة التكرار من الكود', 'Remove repetition from code',
    `## DRY — Don't Repeat Yourself

**التكرار** في الكود خطير لأن:
- لو فيه خطأ، لازم تصلحه في أماكن كثيرة
- لو تغيّر المتطلب، لازم تغيّر في كل مكان

## مثال: تكرار سيء

\`\`\`javascript
// ❌ كود مكرر
function greetAhmed() {
  console.log("مرحباً يا أحمد!");
  console.log("كيف حالك؟");
}

function greetSara() {
  console.log("مرحباً يا سارة!");
  console.log("كيف حالك؟");
}
\`\`\`

## الحل: دالة واحدة

\`\`\`javascript
// ✅ DRY
function greetUser(name) {
  console.log(\`مرحباً يا \${name}!\`);
  console.log("كيف حالك؟");
}

greetUser("أحمد");
greetUser("سارة");
\`\`\`

## متى تطبق DRY؟

> لو وجدت نفس الكود (أو مشابه) في 3 أماكن أو أكثر، آن الأوان للـ refactoring!`,
    `## DRY — Don't Repeat Yourself

**Repetition** in code is dangerous because:
- If there's a bug, you must fix it in many places
- If requirements change, you must update everywhere

## Example: Bad Repetition

\`\`\`javascript
// ❌ Repeated code
function greetAhmed() {
  console.log("Hello Ahmed!");
  console.log("How are you?");
}

function greetSara() {
  console.log("Hello Sara!");
  console.log("How are you?");
}
\`\`\`

## Solution: One Function

\`\`\`javascript
// ✅ DRY
function greetUser(name) {
  console.log(\`Hello \${name}!\`);
  console.log("How are you?");
}

greetUser("Ahmed");
greetUser("Sara");
\`\`\`

## When to Apply DRY?

> If you find the same code (or similar) in 3 or more places, it's time for refactoring!`,
    [{q:'ما هو خطر التكرار في الكود؟',o:['لا خطر','صعوبة الإصلاح والتعديل في الأماكن المتعددة','يجعل الكود أجمل','يسرع البرنامج'],c:1},
     {q:'ما المبدأ الذي يحل مشكلة التكرار؟',o:['OOP','DRY (Don\'t Repeat Yourself)','MVP','API'],c:1},
     {q:'ما هو الـ Refactoring؟',o:['كتابة كود جديد','إعادة هيكلة الكود دون تغيير وظيفته','حذف الكود القديم','اختبار الكود'],c:1}],
    [{q:'What is the danger of code repetition?',o:['No danger','Difficulty fixing in multiple places','Makes code beautiful','Speeds up the program']},
     {q:'What principle solves the repetition problem?',o:['OOP','DRY (Don\'t Repeat Yourself)','MVP','API']},
     {q:'What is Refactoring?',o:['Writing new code','Restructuring code without changing its behavior','Deleting old code','Testing code']}],
  );

  await lesson(4, 65, 8, 'وظيفة واحدة لكل دالة', 'One Function, One Job', 'مبدأ المسؤولية الواحدة', 'Single Responsibility Principle',
    `## Single Responsibility Principle

كل دالة لازم تعمل **شيء واحد بس**.

## مثال خاطئ

\`\`\`javascript
// ❌ دالة تعمل أشياء كثيرة
function processStudent(student) {
  // تحسب الدرجة
  let grade = student.scores.reduce((a,b) => a+b) / student.scores.length;
  // تطبع التقرير
  console.log(\`الطالب: \${student.name}, الدرجة: \${grade}\`);
  // تحفظ في قاعدة البيانات
  saveToDatabase(student.id, grade);
}
\`\`\`

## الحل الصحيح

\`\`\`javascript
// ✅ كل دالة مسؤولية واحدة
function calculateAverageGrade(scores) {
  return scores.reduce((a,b) => a+b) / scores.length;
}

function printStudentReport(name, grade) {
  console.log(\`الطالب: \${name}, الدرجة: \${grade}\`);
}

function saveStudentGrade(studentId, grade) {
  saveToDatabase(studentId, grade);
}
\`\`\`

## فوائد المسؤولية الواحدة

- **سهولة الاختبار:** كل دالة تُختبر بشكل منفصل
- **سهولة إعادة الاستخدام:** كل دالة تُستخدم في سياقات مختلفة
- **سهولة التعديل:** تغيير في الحساب لا يأثر على الطباعة`,
    `## Single Responsibility Principle

Every function should do **only one thing**.

## Wrong Example

\`\`\`javascript
// ❌ Function doing too many things
function processStudent(student) {
  // Calculates grade
  let grade = student.scores.reduce((a,b) => a+b) / student.scores.length;
  // Prints report
  console.log(\`Student: \${student.name}, Grade: \${grade}\`);
  // Saves to database
  saveToDatabase(student.id, grade);
}
\`\`\`

## Correct Solution

\`\`\`javascript
// ✅ Each function has one responsibility
function calculateAverageGrade(scores) {
  return scores.reduce((a,b) => a+b) / scores.length;
}

function printStudentReport(name, grade) {
  console.log(\`Student: \${name}, Grade: \${grade}\`);
}

function saveStudentGrade(studentId, grade) {
  saveToDatabase(studentId, grade);
}
\`\`\`

## Benefits of Single Responsibility

- **Easy testing:** Each function tested independently
- **Easy reuse:** Each function used in different contexts
- **Easy modification:** Changes to calculation don't affect printing`,
    [{q:'ما مبدأ المسؤولية الواحدة؟',o:['كل مطور مسؤول عن قسم','كل دالة تعمل شيئاً واحداً فقط','كل ملف فيه دالة واحدة','كل كلاس له متغير واحد'],c:1},
     {q:'ما فائدة تقسيم الدالة الكبيرة لدوال صغيرة؟',o:['لا فائدة','سهولة الاختبار وإعادة الاستخدام','يعقد الكود','يبطئ البرنامج'],c:1},
     {q:'ما علامة الدالة التي تكسر مبدأ المسؤولية الواحدة؟',o:['اسمها طويل','تعمل أشياء متعددة غير مرتبطة','تستخدم متغيرات كثيرة','طولها أكثر من 10 سطور'],c:1}],
    [{q:'What is the Single Responsibility Principle?',o:['Each developer owns a section','Each function does only one thing','Each file has one function','Each class has one variable']},
     {q:'What is the benefit of splitting a big function into small ones?',o:['No benefit','Easy testing and reuse','Complicates code','Slows program']},
     {q:'What is a sign that a function violates Single Responsibility?',o:['Its name is long','It does multiple unrelated things','Uses many variables','Longer than 10 lines']}],
  );

  await lesson(5, 70, 8, 'مراجعة الكود (Code Review)', 'Code Review', 'تعلم كيف تراجع وتقيّم الكود باحترافية', 'Learn how to review and evaluate code professionally',
    `## Code Review — ثقافة الفريق

**Code Review** هو عملية مراجعة كود زميلك قبل دمجه في المشروع.

## لماذا Code Review مهم؟

- **اكتشاف الأخطاء** قبل وصولها للمستخدمين
- **نشر المعرفة** بين أعضاء الفريق
- **تحسين الكود** من خلال وجهات نظر مختلفة
- **الحفاظ على جودة** المشروع

## كيف تُعطي Feedback بناء؟

### ✅ طريقة صحيحة
\`\`\`
"أقترح تغيير اسم المتغير إلى studentAge
لأنه أوضح من 'a'."

"هل يمكن استخدام map() هنا بدلاً من الـ for loop
لجعل الكود أقصر وأوضح؟"
\`\`\`

### ❌ طريقة خاطئة
\`\`\`
"الكود ده وحش."
"مش عارف ليه كاتب كده."
\`\`\`

## آداب الـ Code Review

1. **راجع الكود مش الشخص**
2. **اقترح لا تأمر** — "ممكن نجرب" مش "لازم"
3. **اشرح السبب** وراء كل اقتراح
4. **امدح** الحاجات الجيدة أيضاً!`,
    `## Code Review — Team Culture

**Code Review** is the process of reviewing a colleague's code before merging it into the project.

## Why is Code Review Important?

- **Catch bugs** before they reach users
- **Share knowledge** among team members
- **Improve code** through different perspectives
- **Maintain quality** of the project

## How to Give Constructive Feedback?

### ✅ Correct approach
\`\`\`
"I suggest changing the variable name to studentAge
as it's clearer than 'a'."

"Could we use map() here instead of the for loop
to make the code shorter and clearer?"
\`\`\`

### ❌ Wrong approach
\`\`\`
"This code is bad."
"I don't know why you wrote it this way."
\`\`\`

## Code Review Etiquette

1. **Review the code, not the person**
2. **Suggest, don't command** — "Maybe we could try" not "You must"
3. **Explain the reason** behind each suggestion
4. **Praise** the good things too!`,
    [{q:'ما هو Code Review؟',o:['مراجعة متطلبات المشروع','مراجعة كود الزميل قبل دمجه','اختبار البرنامج','قراءة الوثائق'],c:1},
     {q:'ما الطريقة الصحيحة لإعطاء feedback على كود الزميل؟',o:['"الكود وحش"','انتقاد الشخص','اقتراح تحسينات مع شرح السبب','الموافقة على كل شيء'],c:2},
     {q:'ما فائدة Code Review للفريق؟',o:['إبطاء العمل','نشر المعرفة واكتشاف الأخطاء مبكراً','يسبب خلافات','لا فائدة منه'],c:1}],
    [{q:'What is Code Review?',o:['Reviewing project requirements','Reviewing a colleague\'s code before merging','Testing the program','Reading documentation']},
     {q:'What is the correct way to give feedback on a colleague\'s code?',o:['"The code is bad"','Criticizing the person','Suggesting improvements with explanation','Agreeing with everything']},
     {q:'What is the benefit of Code Review for the team?',o:['Slows work','Spreading knowledge and catching bugs early','Causes conflicts','No benefit']}],
  );
}
