import {
  Subjects, SubjectTranslations, Courses, CourseTranslations,
  Lessons, LessonTranslations, QuizQuestions, QuizQuestionTranslations,
  QuizOptions, QuizOptionTranslations,
} from '@/lib/db/Schema';
import { uuidv7 } from 'uuidv7';

export async function seedPromptEngineering(db: any): Promise<void> {
  const [s] = await db.insert(Subjects).values({ Id: uuidv7(), Slug: 'prompt-engineering', Icon: 'Sparkles', Color: '#EC4899', Order: 6, IsActive: true, IsDeleted: false }).returning();
  await db.insert(SubjectTranslations).values([
    { Id: uuidv7(), SubjectId: s.Id, Locale: 'ar', Name: 'هندسة الـ Prompts', Description: 'تعلم كيف تتواصل مع الذكاء الاصطناعي بفعالية' },
    { Id: uuidv7(), SubjectId: s.Id, Locale: 'en', Name: 'Prompt Engineering', Description: 'Learn how to communicate with AI effectively' },
  ]);
  const [c] = await db.insert(Courses).values({ Id: uuidv7(), SubjectId: s.Id, Order: 1, Difficulty: 2, EstimatedHours: 2, IsActive: true, IsDeleted: false }).returning();
  await db.insert(CourseTranslations).values([
    { Id: uuidv7(), CourseId: c.Id, Locale: 'ar', Name: 'أساسيات الـ Prompts', Description: 'أتقن فن التعامل مع نماذج الذكاء الاصطناعي' },
    { Id: uuidv7(), CourseId: c.Id, Locale: 'en', Name: 'Prompt Fundamentals', Description: 'Master the art of communicating with AI models' },
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

  await lesson(1, 55, 7, 'ما هو الـ Prompt؟', 'What is a Prompt?', 'تعرف على المفهوم الأساسي للتواصل مع الـ AI', 'Understand the fundamental concept of AI communication',
    `## الـ Prompt — كلامك مع الذكاء الاصطناعي

**الـ Prompt** هو الرسالة اللي بتبعتها لنموذج الذكاء الاصطناعي. هو الطريقة الوحيدة للتواصل معاه.

## مثال بسيط

\`\`\`
Prompt غامض: "اكتب حاجة"
Prompt واضح: "اكتب قصيدة قصيرة عن البحر بالعربية لطالب في المرحلة المتوسطة"
\`\`\`

## أجزاء الـ Prompt الجيد

- **التعليمات:** إيه اللي تريده
- **السياق:** معلومات تساعد الـ AI
- **الشكل:** كيف تريد الإجابة

## لماذا الـ Prompt مهم؟

> الـ AI مش عارف ايه اللي في دماغك. كلما كانت تعليماتك أوضح، كانت الإجابة أحسن.

نفس الـ AI ممكن يعطيك إجابات مختلفة تماماً بناءً على كيفية صياغة السؤال!`,
    `## The Prompt — Your Conversation with AI

A **prompt** is the message you send to an AI model. It's the only way to communicate with it.

## Simple Example

\`\`\`
Vague prompt: "Write something"
Clear prompt: "Write a short poem about the ocean in English for a middle school student"
\`\`\`

## Parts of a Good Prompt

- **Instructions:** What you want
- **Context:** Information that helps the AI
- **Format:** How you want the answer

## Why Does the Prompt Matter?

> The AI doesn't know what's in your head. The clearer your instructions, the better the answer.

The same AI can give completely different answers based on how you phrase the question!`,
    [{q:'ما هو الـ Prompt؟',o:['نوع من البرامج','الرسالة المرسلة لنموذج الذكاء الاصطناعي','لغة برمجة','نموذج AI'],c:1},
     {q:'ما الفرق بين الـ Prompt الجيد والسيء؟',o:['لا فرق','الـ Prompt الجيد أطول','الـ Prompt الجيد أكثر وضوحاً وتفصيلاً','الـ Prompt الجيد أقصر'],c:2},
     {q:'لماذا يؤثر وضوح الـ Prompt على الإجابة؟',o:['الـ AI يخمن المقصود','الـ AI يستجيب فقط لما يفهمه بوضوح','الـ AI دائماً يعطي نفس الإجابة','الـ Prompt لا يؤثر'],c:1}],
    [{q:'What is a Prompt?',o:['A type of software','A message sent to an AI model','A programming language','An AI model']},
     {q:'What is the difference between a good and bad prompt?',o:['No difference','Good prompt is longer','Good prompt is clearer and more detailed','Good prompt is shorter']},
     {q:'Why does prompt clarity affect the answer?',o:['AI guesses the meaning','AI responds only to what it clearly understands','AI always gives the same answer','Prompt has no effect']}],
  );

  await lesson(2, 55, 7, 'كيف تطلب بشكل صح؟', 'How to Ask Correctly?', 'تقنيات صياغة الـ Prompt الفعّال', 'Techniques for effective prompt writing',
    `## تقنيات الـ Prompt الفعّال

### 1. كن محدداً

❌ "اشرح البرمجة"
✅ "اشرح مفهوم المتغيرات في Python لطالب مبتدئ بأمثلة بسيطة"

### 2. حدد الدور (Role Prompting)

\`\`\`
"أنت مدرس رياضيات خبير. اشرح لي نظرية فيثاغورس بطريقة ممتعة."
\`\`\`

### 3. حدد الشكل

\`\`\`
"اعطني قائمة من 5 نقاط (bullet points) عن فوائد القراءة"
\`\`\`

### 4. أعطِ سياقاً

\`\`\`
"أنا طالب في الصف الثامن، عندي امتحان غداً في الجبر. ساعدني في فهم المعادلات من الدرجة الأولى."
\`\`\`

> **قاعدة ذهبية:** تخيّل إنك بتشرح لشخص ما عندوش أي معلومة عن موضوعك.`,
    `## Effective Prompt Techniques

### 1. Be Specific

❌ "Explain programming"
✅ "Explain the concept of variables in Python for a beginner with simple examples"

### 2. Set the Role (Role Prompting)

\`\`\`
"You are an expert math teacher. Explain the Pythagorean theorem to me in a fun way."
\`\`\`

### 3. Define the Format

\`\`\`
"Give me a bullet-point list of 5 benefits of reading"
\`\`\`

### 4. Provide Context

\`\`\`
"I'm an 8th grade student with an algebra exam tomorrow. Help me understand first-degree equations."
\`\`\`

> **Golden rule:** Imagine you're explaining to someone who has zero knowledge about your topic.`,
    [{q:'ما معنى Role Prompting؟',o:['طلب لعب دور','تحديد دور أو شخصية للـ AI','نوع من الألعاب','طريقة ترميز'],c:1},
     {q:'أي من التالي Prompt أفضل؟',o:['اشرح الكيمياء','اشرح التفاعلات الكيميائية لطالب ابتدائي بأمثلة يومية','اكتب عن الكيمياء','الكيمياء'],c:1},
     {q:'لماذا نعطي سياقاً في الـ Prompt؟',o:['لإطالة الرسالة','لمساعدة الـ AI على فهم احتياجاتنا بدقة','لإرباك الـ AI','لا فائدة منه'],c:1}],
    [{q:'What does Role Prompting mean?',o:['Asking to play a role','Assigning a role or persona to AI','A type of game','An encoding method']},
     {q:'Which is the better prompt?',o:['Explain chemistry','Explain chemical reactions to an elementary student with everyday examples','Write about chemistry','Chemistry']},
     {q:'Why do we provide context in a prompt?',o:['To make it longer','To help AI understand our needs precisely','To confuse AI','No benefit']}],
  );

  await lesson(3, 60, 8, 'Few-shot Learning', 'Few-shot Learning', 'علّم الـ AI بالأمثلة', 'Teach AI with examples',
    `## Few-shot Learning — علّم بالمثال

**Few-shot** تعني إنك بتدي الـ AI أمثلة في الـ Prompt عشان يفهم النمط المطلوب.

## مثال: تصنيف المشاعر

\`\`\`
Prompt:
مثال 1: "أنا سعيد جداً اليوم!" → إيجابي
مثال 2: "الجو سيء ومزاجي وحش" → سلبي
مثال 3: "الطقس عادي" → محايد

الآن صنّف: "حصلت على جائزة!"
\`\`\`

الـ AI سيتبع النمط ويقول: إيجابي ✅

## لماذا Few-shot فعّال؟

- يوضح **النمط** المطلوب
- يحدد **الشكل** المتوقع للإجابة
- يقلل من **الأخطاء** في الفهم

## متى تستخدمه؟

لما تريد إجابات بتنسيق محدد، أو عندما التعليمات وحدها غير كافية.`,
    `## Few-shot Learning — Teach with Examples

**Few-shot** means giving AI examples in the prompt so it understands the required pattern.

## Example: Sentiment Classification

\`\`\`
Prompt:
Example 1: "I'm so happy today!" → Positive
Example 2: "The weather is bad and I'm in a bad mood" → Negative
Example 3: "The weather is normal" → Neutral

Now classify: "I won a prize!"
\`\`\`

The AI will follow the pattern and say: Positive ✅

## Why is Few-shot Effective?

- Clarifies the required **pattern**
- Defines the expected **format** of the answer
- Reduces **misunderstandings**

## When to Use It?

When you want answers in a specific format, or when instructions alone aren't enough.`,
    [{q:'ما معنى Few-shot Learning؟',o:['تعليم الـ AI بدون أمثلة','إعطاء أمثلة في الـ Prompt لتوضيح النمط','نوع من الشبكات العصبية','طريقة تدريب نماذج AI'],c:1},
     {q:'متى يكون Few-shot مفيداً؟',o:['دائماً','عندما نريد إجابات بتنسيق محدد','عندما يكون الـ AI بطيئاً','لا يكون مفيداً أبداً'],c:1},
     {q:'ما الهدف من إعطاء مثالين أو ثلاثة قبل السؤال؟',o:['ملء المساحة','توضيح النمط المطلوب للـ AI','إرباك الـ AI','تطويل الـ Prompt'],c:1}],
    [{q:'What does Few-shot Learning mean?',o:['Teaching AI without examples','Giving examples in the prompt to clarify the pattern','A type of neural network','An AI training method']},
     {q:'When is Few-shot useful?',o:['Always','When we want answers in a specific format','When AI is slow','Never useful']},
     {q:'What is the purpose of giving 2-3 examples before the question?',o:['Fill the space','Clarify the required pattern for AI','Confuse AI','Make the prompt longer']}],
  );

  await lesson(4, 60, 8, 'Chain of Thought', 'Chain of Thought', 'اطلب من الـ AI يفكر خطوة بخطوة', 'Ask AI to think step by step',
    `## Chain of Thought — فكّر بصوت عالٍ

**Chain of Thought (CoT)** تعني إنك بتطلب من الـ AI يشرح تفكيره خطوة بخطوة.

## مقارنة

❌ بدون CoT:
"كم ناتج 17 × 23؟"
الـ AI: "391"

✅ مع CoT:
"كم ناتج 17 × 23؟ فكّر خطوة بخطوة."
الـ AI:
- 17 × 20 = 340
- 17 × 3 = 51
- 340 + 51 = 391

## لماذا CoT أفضل؟

- إجابات **أدق** في المسائل المعقدة
- تقدر **تتحقق** من منطق الإجابة
- الـ AI **يكتشف** أخطاءه بنفسه أثناء التفكير

## عبارات تفعّل CoT

- "فكّر خطوة بخطوة"
- "اشرح تفكيرك"
- "Think step by step"
- "Let's think through this carefully"`,
    `## Chain of Thought — Think Out Loud

**Chain of Thought (CoT)** means asking AI to explain its thinking step by step.

## Comparison

❌ Without CoT:
"What is 17 × 23?"
AI: "391"

✅ With CoT:
"What is 17 × 23? Think step by step."
AI:
- 17 × 20 = 340
- 17 × 3 = 51
- 340 + 51 = 391

## Why is CoT Better?

- **More accurate** answers for complex problems
- You can **verify** the logic of the answer
- AI **discovers** its own mistakes while thinking

## Phrases That Activate CoT

- "Think step by step"
- "Explain your reasoning"
- "Let's think through this carefully"`,
    [{q:'ما هو Chain of Thought Prompting؟',o:['طلب قصة متسلسلة','طلب الـ AI يشرح تفكيره خطوة بخطوة','نوع من الكود','طريقة تشفير'],c:1},
     {q:'ما فائدة CoT للمسائل المعقدة؟',o:['يبطئ الـ AI','يجعل الإجابات أدق ويمكن التحقق منها','يجعل الـ AI يرفض الإجابة','لا فائدة'],c:1},
     {q:'أي عبارة تفعّل Chain of Thought؟',o:['"أجب بسرعة"','"فكّر خطوة بخطوة"','"أعطني إجابة قصيرة"','"لا تشرح"'],c:1}],
    [{q:'What is Chain of Thought Prompting?',o:['Requesting a sequential story','Asking AI to explain its thinking step by step','A type of code','An encryption method']},
     {q:'What is the benefit of CoT for complex problems?',o:['Slows down AI','Makes answers more accurate and verifiable','Makes AI refuse to answer','No benefit']},
     {q:'Which phrase activates Chain of Thought?',o:['"Answer quickly"','"Think step by step"','"Give me a short answer"','"Don\'t explain"']}],
  );

  await lesson(5, 65, 8, 'Prompts للكود', 'Prompts for Code', 'استخدم الـ AI لمساعدتك في البرمجة', 'Use AI to help you with programming',
    `## Prompts للبرمجة

الـ AI ممكن يساعدك في البرمجة بطرق كثيرة لو سألته صح!

## أمثلة Prompts مفيدة للكود

### كتابة كود
\`\`\`
"اكتب دالة JavaScript تأخذ قائمة أرقام وترجع مجموعها"
\`\`\`

### شرح كود
\`\`\`
"اشرح لي هذا الكود خطوة بخطوة:
const result = arr.filter(x => x > 0).map(x => x * 2);"
\`\`\`

### إصلاح خطأ
\`\`\`
"هذا الكود بيطلع خطأ، ساعدني في إصلاحه:
[الكود هنا]
رسالة الخطأ: [الخطأ هنا]"
\`\`\`

### تحسين الكود
\`\`\`
"حسّن هذا الكود عشان يكون أسرع وأوضح"
\`\`\`

## نصيحة مهمة

> دايماً افهم الكود اللي الـ AI كتبه قبل ما تستخدمه — لا تنسخ من غير ما تفهم!`,
    `## Prompts for Programming

AI can help you with programming in many ways if you ask correctly!

## Useful Code Prompts

### Writing Code
\`\`\`
"Write a JavaScript function that takes a list of numbers and returns their sum"
\`\`\`

### Explaining Code
\`\`\`
"Explain this code step by step:
const result = arr.filter(x => x > 0).map(x => x * 2);"
\`\`\`

### Fixing an Error
\`\`\`
"This code has an error, help me fix it:
[code here]
Error message: [error here]"
\`\`\`

### Improving Code
\`\`\`
"Improve this code to make it faster and clearer"
\`\`\`

## Important Advice

> Always understand the code AI writes before using it — never copy without understanding!`,
    [{q:'كيف يمكن للـ AI مساعدتنا في البرمجة؟',o:['لا يمكنه ذلك','كتابة وشرح وتصحيح الكود','رسم الكود فقط','تشغيل الكود فقط'],c:1},
     {q:'عند طلب إصلاح خطأ، ماذا يجب تضمين في الـ Prompt؟',o:['اسمك فقط','الكود ورسالة الخطأ','رأيك في الكود','تاريخ كتابة الكود'],c:1},
     {q:'لماذا يجب فهم الكود الذي يكتبه الـ AI؟',o:['لأنه دائماً خاطئ','لتعلم وتطوير مهاراتك','لأنه مملوء بالأخطاء','لا حاجة لفهمه'],c:1}],
    [{q:'How can AI help us with programming?',o:['It cannot','Writing, explaining, and fixing code','Only drawing code','Only running code']},
     {q:'When requesting error fixing, what should be in the prompt?',o:['Your name only','The code and error message','Your opinion about the code','Date of writing the code']},
     {q:'Why should you understand the code AI writes?',o:['Because it\'s always wrong','To learn and develop your skills','Because it\'s full of errors','No need to understand']}],
  );
}
