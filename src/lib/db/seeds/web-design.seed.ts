import {
  Subjects, SubjectTranslations,
  Courses, CourseTranslations,
  Lessons, LessonTranslations,
  QuizQuestions, QuizQuestionTranslations,
  QuizOptions, QuizOptionTranslations,
} from '@/lib/db/Schema';
import { uuidv7 } from 'uuidv7';

export async function seedWebDesign(db: any): Promise<void> {
  const [s] = await db.insert(Subjects).values({
    Id: uuidv7(), Slug: 'web-design', Icon: 'Globe', Color: '#F59E0B',
    Order: 4, IsActive: true, IsDeleted: false,
  }).returning();

  await db.insert(SubjectTranslations).values([
    { Id: uuidv7(), SubjectId: s.Id, Locale: 'ar', Name: 'تصميم الويب', Description: 'ابني موقعك الأول بـ HTML و CSS' },
    { Id: uuidv7(), SubjectId: s.Id, Locale: 'en', Name: 'Web Design', Description: 'Build your first website with HTML and CSS' },
  ]);

  const [c] = await db.insert(Courses).values({
    Id: uuidv7(), SubjectId: s.Id, Order: 1, Difficulty: 1,
    EstimatedHours: 3, IsActive: true, IsDeleted: false,
  }).returning();

  await db.insert(CourseTranslations).values([
    { Id: uuidv7(), CourseId: c.Id, Locale: 'ar', Name: 'أول موقع ويب', Description: 'ابني صفحتك الشخصية من الصفر' },
    { Id: uuidv7(), CourseId: c.Id, Locale: 'en', Name: 'First Website', Description: 'Build your personal page from scratch' },
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

  await addLesson(1, 50, 6,
    'ما هو HTML؟', 'What is HTML?',
    'تعرف على لغة بناء صفحات الويب', 'Discover the language of web pages',
    `## HTML — هيكل الصفحة

**HTML** (HyperText Markup Language) هي لغة بناء صفحات الويب. فكر فيها زي **الهيكل العظمي** للصفحة — بتحدد المحتوى وترتيبه.

## أول صفحة HTML

\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>صفحتي الأولى</title>
  </head>
  <body>
    <h1>مرحباً بالعالم!</h1>
    <p>هذه صفحتي الأولى.</p>
  </body>
</html>
\`\`\`

## أهم الوسوم (Tags)

| الوسم | الاستخدام |
|-------|-----------|
| \`<h1>\` إلى \`<h6>\` | العناوين (h1 الأكبر) |
| \`<p>\` | فقرة نصية |
| \`<strong>\` | خط عريض |
| \`<em>\` | خط مائل |
| \`<br>\` | سطر جديد |

> **مهم:** كل وسم مفتوح لازم له وسم إغلاق \`</tag>\``,
    `## HTML — The Page Skeleton

**HTML** (HyperText Markup Language) is the language for building web pages. Think of it as the **skeleton** of a page — it defines the content and its structure.

## First HTML Page

\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    <p>This is my first page.</p>
  </body>
</html>
\`\`\`

## Important Tags

| Tag | Usage |
|-----|-------|
| \`<h1>\` to \`<h6>\` | Headings (h1 is largest) |
| \`<p>\` | Text paragraph |
| \`<strong>\` | Bold text |
| \`<em>\` | Italic text |
| \`<br>\` | New line |

> **Important:** Every opening tag needs a closing tag \`</tag>\``,
    [
      { q: 'ماذا تعني اختصار HTML؟', opts: ['High Text Markup Language', 'HyperText Markup Language', 'Home Tool Making Language', 'HyperText Making Links'], correct: 1 },
      { q: 'أي وسم يُستخدم للعنوان الرئيسي الأكبر؟', opts: ['<h6>', '<header>', '<h1>', '<title>'], correct: 2 },
      { q: 'أين يُكتب محتوى الصفحة المرئي في HTML؟', opts: ['<head>', '<title>', '<body>', '<html>'], correct: 2 },
    ],
    [
      { q: 'What does HTML stand for?', opts: ['High Text Markup Language', 'HyperText Markup Language', 'Home Tool Making Language', 'HyperText Making Links'] },
      { q: 'Which tag is used for the largest main heading?', opts: ['<h6>', '<header>', '<h1>', '<title>'] },
      { q: 'Where is visible page content written in HTML?', opts: ['<head>', '<title>', '<body>', '<html>'] },
    ],
  );

  await addLesson(2, 55, 7,
    'CSS — لوّن وزيّن صفحتك', 'CSS — Color and Style Your Page',
    'اعرف إزاي تخلي صفحتك تبدو جميلة', 'Learn how to make your page look beautiful',
    `## CSS — التزيين والتنسيق

**CSS** (Cascading Style Sheets) بتتحكم في **شكل** صفحتك — الألوان، الحجم، المسافات.

## كيف نربط CSS بـ HTML؟

\`\`\`html
<head>
  <style>
    h1 {
      color: blue;
      font-size: 32px;
    }
    p {
      color: gray;
      font-family: Arial;
    }
  </style>
</head>
\`\`\`

## خصائص CSS المهمة

\`\`\`css
/* الألوان */
color: red;              /* لون النص */
background-color: yellow; /* لون الخلفية */

/* الحجم */
font-size: 24px;
width: 300px;
height: 150px;

/* المسافات */
margin: 10px;   /* مسافة خارجية */
padding: 15px;  /* مسافة داخلية */
\`\`\`

> **نصيحة:** استخدم ألوان من \`coolors.co\` لاختيار ألوان جميلة متناسقة!`,
    `## CSS — Styling and Decoration

**CSS** (Cascading Style Sheets) controls the **appearance** of your page — colors, sizes, spacing.

## How to Link CSS to HTML?

\`\`\`html
<head>
  <style>
    h1 {
      color: blue;
      font-size: 32px;
    }
    p {
      color: gray;
      font-family: Arial;
    }
  </style>
</head>
\`\`\`

## Important CSS Properties

\`\`\`css
/* Colors */
color: red;               /* text color */
background-color: yellow; /* background color */

/* Size */
font-size: 24px;
width: 300px;
height: 150px;

/* Spacing */
margin: 10px;   /* outer spacing */
padding: 15px;  /* inner spacing */
\`\`\`

> **Tip:** Use \`coolors.co\` to choose beautiful matching colors!`,
    [
      { q: 'ماذا تعني CSS؟', opts: ['Computer Style System', 'Cascading Style Sheets', 'Creative Style Software', 'Color Style System'], correct: 1 },
      { q: 'ما خاصية CSS لتغيير لون النص؟', opts: ['background-color', 'text-color', 'color', 'font-color'], correct: 2 },
      { q: 'ما الفرق بين margin وpadding؟', opts: ['لا فرق', 'margin داخلية وpadding خارجية', 'margin خارجية وpadding داخلية', 'كلاهما للحجم'], correct: 2 },
    ],
    [
      { q: 'What does CSS stand for?', opts: ['Computer Style System', 'Cascading Style Sheets', 'Creative Style Software', 'Color Style System'] },
      { q: 'Which CSS property changes text color?', opts: ['background-color', 'text-color', 'color', 'font-color'] },
      { q: 'What is the difference between margin and padding?', opts: ['No difference', 'margin is inner, padding is outer', 'margin is outer, padding is inner', 'Both are for size'] },
    ],
  );

  await addLesson(3, 55, 7,
    'الروابط والصور', 'Links and Images',
    'أضف روابط وصور لصفحتك', 'Add links and images to your page',
    `## الروابط — <a> Tag

\`\`\`html
<a href="https://google.com">اذهب لجوجل</a>
<a href="about.html">عن الموقع</a>
<a href="mailto:hi@example.com">راسلني</a>
\`\`\`

## فتح في تبويب جديد

\`\`\`html
<a href="https://google.com" target="_blank">افتح في تبويب جديد</a>
\`\`\`

## الصور — <img> Tag

\`\`\`html
<img src="photo.jpg" alt="صورة لأحمد" width="300">
<img src="https://example.com/image.png" alt="صورة من الإنترنت">
\`\`\`

## خصائص الصور

- **src:** مسار الصورة (ضروري)
- **alt:** وصف الصورة (للمكفوفين + لو الصورة مش اشتغلت)
- **width/height:** حجم الصورة

> **نصيحة:** دايماً اكتب نص alt لكل صورة — ده احترافية وإتاحية!`,
    `## Links — <a> Tag

\`\`\`html
<a href="https://google.com">Go to Google</a>
<a href="about.html">About page</a>
<a href="mailto:hi@example.com">Email me</a>
\`\`\`

## Open in New Tab

\`\`\`html
<a href="https://google.com" target="_blank">Open in new tab</a>
\`\`\`

## Images — <img> Tag

\`\`\`html
<img src="photo.jpg" alt="Ahmed's photo" width="300">
<img src="https://example.com/image.png" alt="Internet image">
\`\`\`

## Image Attributes

- **src:** Image path (required)
- **alt:** Image description (for accessibility + if image fails)
- **width/height:** Image size

> **Tip:** Always write alt text for every image — it's professional and accessible!`,
    [
      { q: 'أي وسم HTML يُستخدم لإنشاء رابط؟', opts: ['<link>', '<url>', '<a>', '<href>'], correct: 2 },
      { q: 'ما خاصية الصورة التي تصف محتواها للمكفوفين؟', opts: ['src', 'alt', 'title', 'id'], correct: 1 },
      { q: 'ما قيمة target لفتح رابط في تبويب جديد؟', opts: ['_new', '_tab', '_blank', '_open'], correct: 2 },
    ],
    [
      { q: 'Which HTML tag creates a link?', opts: ['<link>', '<url>', '<a>', '<href>'] },
      { q: 'Which image attribute describes its content for accessibility?', opts: ['src', 'alt', 'title', 'id'] },
      { q: 'What is the target value for opening a link in a new tab?', opts: ['_new', '_tab', '_blank', '_open'] },
    ],
  );

  await addLesson(4, 60, 8,
    'القوائم والجداول', 'Lists and Tables',
    'نظّم محتواك بقوائم وجداول', 'Organize content with lists and tables',
    `## القوائم

### قائمة غير مرتبة
\`\`\`html
<ul>
  <li>تفاح</li>
  <li>برتقال</li>
  <li>موز</li>
</ul>
\`\`\`

### قائمة مرتبة
\`\`\`html
<ol>
  <li>أول خطوة</li>
  <li>ثاني خطوة</li>
  <li>ثالث خطوة</li>
</ol>
\`\`\`

## الجداول

\`\`\`html
<table border="1">
  <tr>
    <th>الاسم</th>
    <th>العمر</th>
  </tr>
  <tr>
    <td>أحمد</td>
    <td>14</td>
  </tr>
  <tr>
    <td>سارة</td>
    <td>13</td>
  </tr>
</table>
\`\`\`

- **tr:** صف في الجدول
- **th:** خلية عنوان (Bold)
- **td:** خلية بيانات عادية`,
    `## Lists

### Unordered List
\`\`\`html
<ul>
  <li>Apple</li>
  <li>Orange</li>
  <li>Banana</li>
</ul>
\`\`\`

### Ordered List
\`\`\`html
<ol>
  <li>First step</li>
  <li>Second step</li>
  <li>Third step</li>
</ol>
\`\`\`

## Tables

\`\`\`html
<table border="1">
  <tr>
    <th>Name</th>
    <th>Age</th>
  </tr>
  <tr>
    <td>Ahmed</td>
    <td>14</td>
  </tr>
  <tr>
    <td>Sara</td>
    <td>13</td>
  </tr>
</table>
\`\`\`

- **tr:** table row
- **th:** header cell (Bold)
- **td:** regular data cell`,
    [
      { q: 'أي وسم يُستخدم للقائمة غير المرتبة؟', opts: ['<ol>', '<ul>', '<list>', '<li>'], correct: 1 },
      { q: 'ما وسم عنصر القائمة؟', opts: ['<item>', '<li>', '<el>', '<list-item>'], correct: 1 },
      { q: 'أي وسم يمثل صف في الجدول؟', opts: ['<td>', '<th>', '<tr>', '<row>'], correct: 2 },
    ],
    [
      { q: 'Which tag is used for an unordered list?', opts: ['<ol>', '<ul>', '<list>', '<li>'] },
      { q: 'What tag is used for a list item?', opts: ['<item>', '<li>', '<el>', '<list-item>'] },
      { q: 'Which tag represents a table row?', opts: ['<td>', '<th>', '<tr>', '<row>'] },
    ],
  );

  await addLesson(5, 70, 10,
    'مشروعي الأول — صفحتي الشخصية', 'My First Project — Personal Page',
    'ابن صفحتك الشخصية بكل اللي تعلمته', 'Build your personal page with everything you learned',
    `## مشروعك الأول!

حان الوقت تجمع كل اللي اتعلمته وتبني صفحتك الشخصية.

## هيكل الصفحة

\`\`\`html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>صفحة أحمد الشخصية</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f4ff;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #7c3aed; }
    .card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <h1>مرحباً، أنا أحمد! 👋</h1>

  <div class="card">
    <h2>عني</h2>
    <p>أنا طالب عمري 14 سنة، بحب البرمجة والألعاب.</p>
  </div>

  <div class="card">
    <h2>مهاراتي</h2>
    <ul>
      <li>HTML وCSS</li>
      <li>JavaScript</li>
      <li>SQL</li>
    </ul>
  </div>

  <div class="card">
    <h2>تواصل معي</h2>
    <a href="mailto:ahmed@example.com">راسلني 📧</a>
  </div>
</body>
</html>
\`\`\`

## خطوات المشروع

1. **انسخ الكود** وجربه في المتصفح
2. **غيّر الاسم** والبيانات بتاعتك
3. **أضف** قسم جديد — هواياتك مثلاً
4. **غيّر الألوان** اللي تحبها`,
    `## Your First Project!

Time to combine everything you've learned and build your personal page.

## Page Structure

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Ahmed's Personal Page</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f0f4ff;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #7c3aed; }
    .card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <h1>Hi, I'm Ahmed! 👋</h1>

  <div class="card">
    <h2>About Me</h2>
    <p>I'm a 14-year-old student who loves programming and games.</p>
  </div>

  <div class="card">
    <h2>My Skills</h2>
    <ul>
      <li>HTML and CSS</li>
      <li>JavaScript</li>
      <li>SQL</li>
    </ul>
  </div>

  <div class="card">
    <h2>Contact Me</h2>
    <a href="mailto:ahmed@example.com">Email me 📧</a>
  </div>
</body>
</html>
\`\`\`

## Project Steps

1. **Copy the code** and try it in your browser
2. **Change the name** and your information
3. **Add** a new section — your hobbies for example
4. **Change** the colors you like`,
    [
      { q: 'ما أهمية meta charset="UTF-8"؟', opts: ['تسريع الصفحة', 'دعم اللغة العربية والأحرف الخاصة', 'إضافة ألوان', 'ربط CSS'], correct: 1 },
      { q: 'ما الخاصية التي تجعل اتجاه الصفحة من اليمين لليسار؟', opts: ['lang="ar"', 'direction="right"', 'dir="rtl"', 'align="right"'], correct: 2 },
      { q: 'ماذا يفعل margin: 0 auto في CSS؟', opts: ['يحذف الهوامش', 'يمركز العنصر أفقياً', 'يضيف حدوداً', 'يغير اللون'], correct: 1 },
    ],
    [
      { q: 'Why is meta charset="UTF-8" important?', opts: ['Speed up page', 'Support Arabic and special characters', 'Add colors', 'Link CSS'] },
      { q: 'Which attribute makes page direction right-to-left?', opts: ['lang="ar"', 'direction="right"', 'dir="rtl"', 'align="right"'] },
      { q: 'What does margin: 0 auto do in CSS?', opts: ['Remove margins', 'Center the element horizontally', 'Add borders', 'Change color'] },
    ],
  );
}
