import {
  Subjects, SubjectTranslations,
  Courses, CourseTranslations,
  Lessons, LessonTranslations,
  QuizQuestions, QuizQuestionTranslations,
  QuizOptions, QuizOptionTranslations,
} from '@/lib/db/Schema';
import { uuidv7 } from 'uuidv7';

export async function seedDatabases(db: any): Promise<void> {
  const [s] = await db.insert(Subjects).values({
    Id: uuidv7(), Slug: 'databases', Icon: 'Database', Color: '#10B981',
    Order: 3, IsActive: true, IsDeleted: false,
  }).returning();

  await db.insert(SubjectTranslations).values([
    { Id: uuidv7(), SubjectId: s.Id, Locale: 'ar', Name: 'قواعد البيانات', Description: 'تعلم كيف تخزن وتدير البيانات باحتراف' },
    { Id: uuidv7(), SubjectId: s.Id, Locale: 'en', Name: 'Databases', Description: 'Learn how to store and manage data professionally' },
  ]);

  const [c] = await db.insert(Courses).values({
    Id: uuidv7(), SubjectId: s.Id, Order: 1, Difficulty: 2,
    EstimatedHours: 2, IsActive: true, IsDeleted: false,
  }).returning();

  await db.insert(CourseTranslations).values([
    { Id: uuidv7(), CourseId: c.Id, Locale: 'ar', Name: 'SQL للأطفال', Description: 'تعلم لغة SQL لاستعلام قواعد البيانات' },
    { Id: uuidv7(), CourseId: c.Id, Locale: 'en', Name: 'SQL for Kids', Description: 'Learn SQL to query databases' },
  ]);

  async function addLesson(order: number, xp: number, mins: number,
    arTitle: string, enTitle: string, arDesc: string, enDesc: string,
    arContent: string, enContent: string,
    quizAr: { q: string; opts: string[]; correct: number }[],
    quizEn: { q: string; opts: string[] }[],
  ) {
    const [l] = await db.insert(Lessons).values({
      Id: uuidv7(), AgentId: null, CourseId: c.Id,
      Order: order, XpReward: xp, EstimatedMinutes: mins,
      Difficulty: 2, IsActive: true, IsDeleted: false,
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

  await addLesson(1, 50, 6,
    'ما هي قاعدة البيانات؟', 'What is a Database?',
    'تعرف على قواعد البيانات وأهميتها', 'Discover databases and their importance',
    `## قاعدة البيانات — المستودع الذكي

**قاعدة البيانات** هي مكان منظم لتخزين المعلومات. فكر فيها زي دولاب فيه أدراج، كل درج فيه أوراق منظمة.

## أمثلة من حياتنا

- **واتساب:** بيخزن رسائلك وجهات اتصالك
- **يوتيوب:** بيخزن الفيديوهات وبيانات المستخدمين
- **مدرستك:** بيخزن درجاتك وبياناتك

## الجدول (Table)

في قواعد البيانات، البيانات مرتبة في **جداول** زي Excel:

| id | الاسم | العمر | الصف |
|----|-------|-------|------|
| 1  | أحمد  | 14    | 8    |
| 2  | سارة  | 13    | 7    |
| 3  | محمد  | 15    | 9    |

## لماذا نستخدم قواعد البيانات؟

- **سرعة:** تقدر تجيب أي معلومة في ثوانٍ
- **أمان:** البيانات محفوظة ومأمونة
- **تنظيم:** كل شيء في مكانه`,
    `## Database — The Smart Warehouse

A **database** is an organized place to store information. Think of it like a cabinet with drawers, each containing organized papers.

## Real-life Examples

- **WhatsApp:** Stores your messages and contacts
- **YouTube:** Stores videos and user data
- **Your school:** Stores your grades and information

## Tables

In databases, data is organized in **tables** like Excel:

| id | name  | age | grade |
|----|-------|-----|-------|
| 1  | Ahmed | 14  | 85    |
| 2  | Sara  | 13  | 92    |
| 3  | Mohamed| 15 | 9     |

## Why Use Databases?

- **Speed:** Get any information in seconds
- **Security:** Data is stored safely
- **Organization:** Everything in its place`,
    [
      { q: 'قاعدة البيانات هي...؟', opts: ['نوع من البرامج', 'مكان منظم لتخزين البيانات', 'لغة برمجة', 'موقع إنترنت'], correct: 1 },
      { q: 'ما وحدة تخزين البيانات الأساسية في قاعدة البيانات؟', opts: ['ملف', 'جدول', 'صورة', 'كود'], correct: 1 },
      { q: 'أي من التالي يستخدم قاعدة بيانات؟', opts: ['آلة حاسبة بسيطة', 'تطبيق يوتيوب', 'مروحة كهربائية', 'قلم رصاص'], correct: 1 },
    ],
    [
      { q: 'A database is...?', opts: ['A type of program', 'An organized place to store data', 'A programming language', 'A website'] },
      { q: 'What is the basic unit of data storage in a database?', opts: ['File', 'Table', 'Image', 'Code'] },
      { q: 'Which of the following uses a database?', opts: ['Simple calculator', 'YouTube app', 'Electric fan', 'Pencil'] },
    ],
  );

  await addLesson(2, 55, 7,
    'الجداول والصفوف والأعمدة', 'Tables, Rows, and Columns',
    'فهم بنية الجدول في قاعدة البيانات', 'Understanding table structure in a database',
    `## بنية الجدول

كل جدول في قاعدة البيانات مكوّن من:

- **الأعمدة (Columns):** هي خصائص البيانات. مثلاً: الاسم، العمر، الدرجة
- **الصفوف (Rows):** هي السجلات الفعلية. كل صف = طالب واحد
- **المفتاح الأساسي (Primary Key):** عمود فريد يميز كل صف (عادةً id)

## مثال: جدول الطلاب

\`\`\`sql
جدول Students:
- id (المفتاح الأساسي)
- name (النص)
- age (الرقم)
- grade (الرقم)
\`\`\`

| id | name    | age | grade |
|----|---------|-----|-------|
| 1  | أحمد    | 14  | 85    |
| 2  | سارة    | 13  | 92    |
| 3  | خالد    | 15  | 78    |

## القواعد المهمة

> كل صف لازم يكون له **id فريد** — لا يتكرر أبداً!
> الأعمدة بتحدد **نوع البيانات** اللي فيها`,
    `## Table Structure

Every table in a database consists of:

- **Columns:** The properties of the data. e.g., name, age, grade
- **Rows:** The actual records. Each row = one student
- **Primary Key:** A unique column identifying each row (usually id)

## Example: Students Table

\`\`\`sql
Table Students:
- id (Primary Key)
- name (text)
- age (number)
- grade (number)
\`\`\`

| id | name    | age | grade |
|----|---------|-----|-------|
| 1  | Ahmed   | 14  | 85    |
| 2  | Sara    | 13  | 92    |
| 3  | Khaled  | 15  | 78    |

## Important Rules

> Every row must have a **unique id** — never repeated!
> Columns define the **data type** they contain`,
    [
      { q: 'ما هو الصف (Row) في الجدول؟', opts: ['خاصية من خصائص البيانات', 'سجل واحد كامل', 'اسم الجدول', 'المفتاح الأساسي'], correct: 1 },
      { q: 'ما هو المفتاح الأساسي (Primary Key)؟', opts: ['أول عمود في الجدول', 'قيمة فريدة تميز كل صف', 'آخر صف في الجدول', 'كلمة السر'], correct: 1 },
      { q: 'كم عدد الأعمدة في جدول Students بالمثال؟', opts: ['2', '3', '4', '5'], correct: 2 },
    ],
    [
      { q: 'What is a Row in a table?', opts: ['A data property', 'One complete record', 'The table name', 'The primary key'] },
      { q: 'What is a Primary Key?', opts: ['The first column', 'A unique value identifying each row', 'The last row', 'A password'] },
      { q: 'How many columns are in the Students table example?', opts: ['2', '3', '4', '5'] },
    ],
  );

  await addLesson(3, 60, 8,
    'أول استعلام SELECT', 'First SELECT Query',
    'تعلم استرجاع البيانات من قاعدة البيانات', 'Learn to retrieve data from a database',
    `## SELECT — جيب البيانات!

**SELECT** هي أهم جملة في SQL. بنستخدمها عشان نجيب بيانات من الجدول.

## الشكل الأساسي

\`\`\`sql
SELECT * FROM Students;
\`\`\`

النجمة * معناها "جيب كل الأعمدة".

## اختيار أعمدة محددة

\`\`\`sql
SELECT name, age FROM Students;
\`\`\`

هنا بنجيب الاسم والعمر بس.

## مثال كامل

جدول Students:
| id | name | age | grade |
|----|------|-----|-------|
| 1  | أحمد | 14  | 85    |
| 2  | سارة | 13  | 92    |

\`\`\`sql
SELECT name FROM Students;
-- النتيجة:
-- أحمد
-- سارة
\`\`\`

> **قاعدة:** SQL مش case-sensitive — SELECT = select = Select`,
    `## SELECT — Get the Data!

**SELECT** is the most important SQL statement. We use it to retrieve data from a table.

## Basic Form

\`\`\`sql
SELECT * FROM Students;
\`\`\`

The asterisk * means "get all columns."

## Selecting Specific Columns

\`\`\`sql
SELECT name, age FROM Students;
\`\`\`

Here we only get the name and age.

## Complete Example

Students table:
| id | name  | age | grade |
|----|-------|-----|-------|
| 1  | Ahmed | 14  | 85    |
| 2  | Sara  | 13  | 92    |

\`\`\`sql
SELECT name FROM Students;
-- Result:
-- Ahmed
-- Sara
\`\`\`

> **Rule:** SQL is not case-sensitive — SELECT = select = Select`,
    [
      { q: 'ما وظيفة جملة SELECT؟', opts: ['حذف بيانات', 'تحديث بيانات', 'استرجاع بيانات', 'إضافة بيانات'], correct: 2 },
      { q: 'ماذا تعني النجمة * في SELECT * FROM Table؟', opts: ['جيب أول صف', 'جيب كل الأعمدة', 'جيب كل الجداول', 'احذف كل شيء'], correct: 1 },
      { q: 'ما الجملة الصحيحة لاسترجاع عمود name فقط؟', opts: ['GET name FROM Students', 'SELECT name FROM Students', 'FETCH name Students', 'READ name FROM Students'], correct: 1 },
    ],
    [
      { q: 'What is the purpose of SELECT?', opts: ['Delete data', 'Update data', 'Retrieve data', 'Add data'] },
      { q: 'What does * mean in SELECT * FROM Table?', opts: ['Get first row', 'Get all columns', 'Get all tables', 'Delete everything'] },
      { q: 'What is the correct query to get only the name column?', opts: ['GET name FROM Students', 'SELECT name FROM Students', 'FETCH name Students', 'READ name FROM Students'] },
    ],
  );

  await addLesson(4, 60, 8,
    'تصفية البيانات WHERE', 'Filtering Data with WHERE',
    'جيب البيانات اللي تريدها فقط', 'Get only the data you want',
    `## WHERE — فلتر البيانات

**WHERE** بتخليك تجيب صفوف محددة بناءً على شرط.

\`\`\`sql
SELECT * FROM Students WHERE grade >= 90;
\`\`\`

هنا بنجيب الطلاب اللي درجتهم 90 أو أكتر.

## عوامل المقارنة

| العامل | المعنى | مثال |
|--------|--------|------|
| = | يساوي | age = 14 |
| > | أكبر من | grade > 80 |
| < | أصغر من | age < 15 |
| >= | أكبر من أو يساوي | grade >= 90 |
| != | لا يساوي | name != 'أحمد' |

## شروط متعددة

\`\`\`sql
-- AND: الشرطان معاً
SELECT * FROM Students WHERE age = 14 AND grade > 80;

-- OR: أي شرط منهما
SELECT * FROM Students WHERE grade >= 90 OR age < 13;
\`\`\``,
    `## WHERE — Filter the Data

**WHERE** lets you retrieve specific rows based on a condition.

\`\`\`sql
SELECT * FROM Students WHERE grade >= 90;
\`\`\`

This gets students with a grade of 90 or more.

## Comparison Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| = | Equals | age = 14 |
| > | Greater than | grade > 80 |
| < | Less than | age < 15 |
| >= | Greater than or equal | grade >= 90 |
| != | Not equal | name != 'Ahmed' |

## Multiple Conditions

\`\`\`sql
-- AND: both conditions
SELECT * FROM Students WHERE age = 14 AND grade > 80;

-- OR: either condition
SELECT * FROM Students WHERE grade >= 90 OR age < 13;
\`\`\``,
    [
      { q: 'ما وظيفة WHERE في SQL؟', opts: ['ترتيب النتائج', 'تصفية البيانات بشرط', 'جمع القيم', 'عرض الجداول'], correct: 1 },
      { q: 'ما الاستعلام الصحيح لجلب الطلاب العمرهم 14؟', opts: ['SELECT * FROM Students age=14', 'SELECT * FROM Students WHERE age=14', 'GET Students WHERE age=14', 'FIND Students age 14'], correct: 1 },
      { q: 'ما معنى AND في جملة WHERE؟', opts: ['أو', 'و (الشرطان معاً)', 'ليس', 'أو لا'], correct: 1 },
    ],
    [
      { q: 'What is the purpose of WHERE in SQL?', opts: ['Sort results', 'Filter data by condition', 'Sum values', 'Show tables'] },
      { q: 'Correct query to get students aged 14?', opts: ['SELECT * FROM Students age=14', 'SELECT * FROM Students WHERE age=14', 'GET Students WHERE age=14', 'FIND Students age 14'] },
      { q: 'What does AND mean in a WHERE clause?', opts: ['Or', 'Both conditions must be true', 'Not', 'Neither'] },
    ],
  );

  await addLesson(5, 65, 8,
    'ترتيب النتائج ORDER BY', 'Sorting Results with ORDER BY',
    'رتب نتائجك بالطريقة اللي تريدها', 'Sort your results the way you want',
    `## ORDER BY — رتّب النتائج

**ORDER BY** بتخليك ترتب النتائج تصاعدياً أو تنازلياً.

\`\`\`sql
-- ترتيب تصاعدي (الأصغر أولاً)
SELECT * FROM Students ORDER BY age ASC;

-- ترتيب تنازلي (الأكبر أولاً)
SELECT * FROM Students ORDER BY grade DESC;
\`\`\`

## ASC و DESC

- **ASC** (Ascending): من الأصغر للأكبر (الافتراضي)
- **DESC** (Descending): من الأكبر للأصغر

## دمج مع WHERE

\`\`\`sql
SELECT name, grade
FROM Students
WHERE grade >= 70
ORDER BY grade DESC;
\`\`\`

هنا بنجيب الطلاب الناجحين مرتبين من الأعلى درجة.

## ترتيب على أكتر من عمود

\`\`\`sql
SELECT * FROM Students
ORDER BY grade DESC, name ASC;
\`\`\`

أولاً بالدرجة، ولو الدرجات متساوية يرتبوا بالاسم.`,
    `## ORDER BY — Sort Results

**ORDER BY** lets you sort results in ascending or descending order.

\`\`\`sql
-- Ascending order (smallest first)
SELECT * FROM Students ORDER BY age ASC;

-- Descending order (largest first)
SELECT * FROM Students ORDER BY grade DESC;
\`\`\`

## ASC and DESC

- **ASC** (Ascending): From smallest to largest (default)
- **Speed:** Get any information in seconds
- **DESC** (Descending): From largest to smallest

## Combining with WHERE

\`\`\`sql
SELECT name, grade
FROM Students
WHERE grade >= 70
ORDER BY grade DESC;
\`\`\`

This gets passing students sorted from highest grade.

## Sort by Multiple Columns

\`\`\`sql
SELECT * FROM Students
ORDER BY grade DESC, name ASC;
\`\`\`

First by grade, then by name if grades are equal.`,
    [
      { q: 'ما وظيفة ORDER BY؟', opts: ['تصفية البيانات', 'ترتيب النتائج', 'حذف الصفوف', 'إضافة بيانات'], correct: 1 },
      { q: 'ما معنى DESC في ORDER BY؟', opts: ['تصاعدي', 'تنازلي', 'عشوائي', 'أبجدي'], correct: 1 },
      { q: 'ما الترتيب الافتراضي لـ ORDER BY بدون كلمة إضافية؟', opts: ['DESC', 'ASC', 'عشوائي', 'لا ترتيب'], correct: 1 },
    ],
    [
      { q: 'What is the purpose of ORDER BY?', opts: ['Filter data', 'Sort results', 'Delete rows', 'Add data'] },
      { q: 'What does DESC mean in ORDER BY?', opts: ['Ascending', 'Descending', 'Random', 'Alphabetical'] },
      { q: 'What is the default sort order of ORDER BY without a keyword?', opts: ['DESC', 'ASC', 'Random', 'No order'] },
    ],
  );
}
