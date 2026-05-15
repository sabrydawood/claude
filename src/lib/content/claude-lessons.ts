export interface QuizOption {
 id: string;
 textAr: string;
 textEn: string;
 isCorrect: boolean;
}

export interface QuizQuestion {
 id: string;
 questionAr: string;
 questionEn: string;
 type: 'multiple_choice' | 'true_false';
 options: QuizOption[];
}

export interface Lesson {
 id: number;
 slug: string;
 agentSlug: string;
 titleAr: string;
 titleEn: string;
 descriptionAr: string;
 descriptionEn: string;
 contentAr: string;
 contentEn: string;
 order: number;
 xpReward: number;
 estimatedMinutes: number;
 quiz: QuizQuestion[];
 activity?: {
 titleAr: string;
 titleEn: string;
 descriptionAr: string;
 descriptionEn: string;
 type: 'improve_prompt' | 'match' | 'fill';
 data?: unknown;
 };
}

export interface Agent {
 id: number;
 slug: string;
 nameAr: string;
 nameEn: string;
 descriptionAr: string;
 descriptionEn: string;
 fullDescriptionAr: string;
 fullDescriptionEn: string;
 color: string;
 gradient: string;
 icon: string;
 isActive: boolean;
 order: number;
}

export const agents: Agent[] = [
 {
 id: 1,
 slug: 'claude',
 nameAr: 'كلود',
 nameEn: 'Claude',
 descriptionAr: 'مساعد ذكي من شركة Anthropic. بيساعدك في الكتابة والكود والأسئلة الصعبة بطريقة واضحة.',
 descriptionEn: 'A smart AI assistant from Anthropic that helps with writing, coding, and tough questions.',
 fullDescriptionAr: 'Claude هو مساعد ذكاء اصطناعي متطور من شركة Anthropic الأمريكية. بيتميز بإنه بيتكلم بطريقة طبيعية ومحترمة، وبيساعد في حاجات كتير زي الكتابة والبرمجة والرياضيات وشرح المواضيع الصعبة بطريقة سهلة ومبسطة.',
 fullDescriptionEn: 'Claude is an advanced AI assistant from Anthropic. Known for its natural and respectful communication, it helps with writing, coding, math, and explaining complex topics simply.',
 color: '#7C3AED',
 gradient: 'from-purple-500 to-purple-700',
 icon: 'Bot',
 isActive: true,
 order: 1,
 },
 {
 id: 2,
 slug: 'chatgpt',
 nameAr: 'ChatGPT',
 nameEn: 'ChatGPT',
 descriptionAr: 'مساعد ذكي من شركة OpenAI. واحد من أشهر مساعدات الذكاء الاصطناعي في العالم.',
 descriptionEn: 'A smart AI assistant from OpenAI. One of the most famous AI assistants in the world.',
 fullDescriptionAr: 'ChatGPT هو مساعد ذكاء اصطناعي من شركة OpenAI. اتعرف عليه العالم كله في 2022 وبقى أشهر AI في التاريخ.',
 fullDescriptionEn: 'ChatGPT is an AI assistant from OpenAI, which became world-famous in 2022.',
 color: '#10B981',
 gradient: 'from-emerald-400 to-teal-500',
 icon: 'MessageCircle',
 isActive: false,
 order: 2,
 },
 {
 id: 3,
 slug: 'gemini',
 nameAr: 'Gemini',
 nameEn: 'Gemini',
 descriptionAr: 'مساعد ذكي من Google. بيفهم النصوص والصور والصوت معاً.',
 descriptionEn: 'A smart AI assistant from Google that understands text, images, and audio together.',
 fullDescriptionAr: 'Gemini هو مساعد الذكاء الاصطناعي من Google. بيتميز بقدرته على فهم أنواع مختلفة من المحتوى.',
 fullDescriptionEn: 'Gemini is Google\'s AI assistant known for understanding multiple content types.',
 color: '#3B82F6',
 gradient: 'from-blue-400 to-blue-600',
 icon: 'Sparkles',
 isActive: false,
 order: 3,
 },
];

export const claudeLessons: Lesson[] = [
 {
 id: 1,
 slug: 'welcome-to-claude',
 agentSlug: 'claude',
 titleAr: 'مرحبا بـ Claude',
 titleEn: 'Welcome to Claude',
 descriptionAr: 'اتعرف على Claude - صديقك الذكي الجديد!',
 descriptionEn: 'Get to know Claude - your new smart friend!',
 order: 1,
 xpReward: 50,
 estimatedMinutes: 5,
 contentAr: `
## Claude إيه ده؟ 

تخيل إن عندك صاحب ذكي جداً، بيعرف حاجات كتير في مواضيع كتير، وهو متاح ليك في أي وقت وفي أي مكان. ده بالظبط Claude!

Claude هو **مساعد ذكاء اصطناعي** من شركة اسمها **Anthropic**. يعني إيه ذكاء اصطناعي؟ يعني برنامج كمبيوتر ذكي جداً اتعلم من ملايين الكتب والمقالات والمحادثات، وبقى قادر يفهم اللي بتقوله ويرد عليك بطريقة طبيعية زي ما بتكلم صاحبك!

## Claude زي إيه بالظبط؟ 

فكر في Claude زي:

 **العالم الموسوعي** - بيعرف معلومات عن أي موضوع تقريباً
 **الكاتب المبدع** - بيساعدك تكتب قصص وخطابات وتقارير
 **المبرمج المحترف** - بيكتب كود ويشرحه بطريقة سهلة
 **الأستاذ الصبور** - بيشرح الرياضيات والعلوم بطريقة ممتعة
 **المستشار الأمين** - بيديك نصايح ويساعدك تفكر في مشاكلك

## هو بيفهم بالعربي؟ 

أيوه! Claude بيفهم ويتكلم أكتر من 50 لغة، منها العربية طبعاً. تقدر تكلمه بالعامية المصرية وهيفهمك تمام! 

## هو زي الروبوت؟ 

مش بالظبط! Claude مش روبوت بيحفظ ردود جاهزة. هو بيفهم سؤالك فعلاً ويفكر فيه ويدي إجابة مناسبة. لكن لازم تعرف إنه برنامج - مش إنسان حقيقي.

## ليه بنتعلم عنه؟ 

لأن Claude وغيره من مساعدات الذكاء الاصطناعي هيبقوا جزء مهم من حياتنا كلنا. اللي بيعرف يستخدمهم صح هيقدر يعمل حاجات مذهلة!
 `,
 contentEn: `
## What is Claude? 

Imagine having a very smart friend who knows a lot about many topics, available anytime, anywhere. That's exactly Claude!

Claude is an **AI assistant** from a company called **Anthropic**. What does AI mean? It means a very smart computer program that learned from millions of books, articles, and conversations, and can now understand what you say and respond naturally - just like talking to a friend!

## What is Claude exactly like? 

Think of Claude as:

 **The Encyclopedia Expert** - knows information about almost any topic
 **The Creative Writer** - helps you write stories, letters, and reports
 **The Pro Programmer** - writes and explains code in an easy way
 **The Patient Teacher** - explains math and science in a fun way
 **The Honest Advisor** - gives advice and helps you think through problems

## Does it understand Arabic? 

Yes! Claude understands and speaks more than 50 languages, including Arabic! You can chat with it in Egyptian dialect and it will understand you perfectly! 

## Is it like a robot? 

Not exactly! Claude isn't a robot that repeats pre-set answers. It actually understands your question, thinks about it, and gives an appropriate response. But remember, it's a program - not a real human.

## Why learn about it? 

Because Claude and other AI assistants will become an important part of all our lives. Those who know how to use them properly will be able to do amazing things!
 `,
 quiz: [
 {
 id: 'q1-1',
 questionAr: 'Claude من أي شركة؟',
 questionEn: 'Which company made Claude?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'Google', textEn: 'Google', isCorrect: false },
 { id: 'o2', textAr: 'Anthropic', textEn: 'Anthropic', isCorrect: true },
 { id: 'o3', textAr: 'OpenAI', textEn: 'OpenAI', isCorrect: false },
 { id: 'o4', textAr: 'Microsoft', textEn: 'Microsoft', isCorrect: false },
 ],
 },
 {
 id: 'q1-2',
 questionAr: 'Claude بيقدر يتكلم بالعربية',
 questionEn: 'Claude can speak Arabic',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح', textEn: 'True', isCorrect: true },
 { id: 'o2', textAr: 'غلط', textEn: 'False', isCorrect: false },
 ],
 },
 {
 id: 'q1-3',
 questionAr: 'إيه اللي Claude مش بيعمله؟',
 questionEn: "What does Claude NOT do?",
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'بيكتب قصص', textEn: 'Writes stories', isCorrect: false },
 { id: 'o2', textAr: 'بيشرح الرياضيات', textEn: 'Explains math', isCorrect: false },
 { id: 'o3', textAr: 'بيطبخ الأكل', textEn: 'Cooks food', isCorrect: true },
 { id: 'o4', textAr: 'بيساعد في البرمجة', textEn: 'Helps with coding', isCorrect: false },
 ],
 },
 ],
 },
 {
 id: 2,
 slug: 'how-to-talk-to-claude',
 agentSlug: 'claude',
 titleAr: 'إزاي تتكلم مع Claude؟',
 titleEn: 'How to Talk to Claude?',
 descriptionAr: 'تعلم إزاي تبدأ محادثة مع Claude وتحصل على أفضل إجابات!',
 descriptionEn: 'Learn how to start a conversation with Claude and get the best answers!',
 order: 2,
 xpReward: 60,
 estimatedMinutes: 7,
 contentAr: `
## التكلم مع Claude سهل! 

التكلم مع Claude سهل جداً - زي ما بتبعت رسالة لصاحبك على الواتساب! بس في حاجات صغيرة لو عملتها هتفرق كتير في جودة الإجابة اللي هتاخدها.

## ابدأ بتحية 

مش لازم، بس ممكن! Claude بيرد على التحية بطريقة ودودة.

مثال:
> **أنت:** أهلاً! أنا عايز أتعلم عن الفضاء
> **Claude:** أهلاً! ده موضوع رائع، هساعدك تعرف أكتر. إيه اللي بيثير اهتمامك بالتحديد؟

## الطلبات الواضحة بتدي إجابات أحسن 

**مش واضح:**
> "اكتبلي حاجة عن العلوم"

**واضح ومحدد:**
> "اكتبلي فقرة قصيرة عن الثقوب السوداء بطريقة سهلة لطفل عمره 10 سنين"

الفرق؟ في الطلب التاني قلت:
- الموضوع بالظبط (الثقوب السوداء)
- طول الإجابة (فقرة قصيرة)
- مستوى الصعوبة (لطفل 10 سنين)

## أنواع الطلبات اللي ممكن تعملها 

### 1. اسأل سؤال
> "إيه هو الضوء؟"
> "ليه السما زرقا؟"
> "امتى اتبنت الأهرامات؟"

### 2. اطلب مساعدة في حاجة
> "ساعدني أفهم الكسور"
> "راجعلي الإنشاء ده وقولي فين الأخطاء"

### 3. اطلب إنه يعمل حاجة
> "اكتبلي قصيدة عن البحر"
> "اعمللي خطة مذاكرة لأسبوع"

### 4. تحدث معاه بطريقة عادية
> "أنا زهقان، محتاج فكرة لعبة جديدة"
> "شايف الامتحان ده صعب، إيه رأيك؟"

## نصايح ذهبية 

⭐ **لو مش فاهم الإجابة** - قوله: "مش فاهم، ممكن تشرح بطريقة أبسط؟"

⭐ **لو عايز معلومات أكتر** - قوله: "ممكن تكمل وتقولي أكتر؟"

⭐ **لو الإجابة مش اللي كنت عايزه** - وضح أكتر: "أنا كنت قاصد..."

⭐ **مش لازم تكون رسمي** - اتكلم بطريقتك العادية، هيفهمك!
 `,
 contentEn: `
## Talking to Claude is Easy! 

Talking to Claude is very easy - just like sending a message to a friend on WhatsApp! But there are small things that, if you do them, will make a big difference in the quality of your answers.

## Start with a Greeting 

Not required, but nice! Claude responds to greetings in a friendly way.

Example:
> **You:** Hello! I want to learn about space
> **Claude:** Hello! That's an amazing topic. What specifically interests you?

## Clear Requests Give Better Answers 

**Unclear:**
> "Write me something about science"

**Clear and specific:**
> "Write me a short paragraph about black holes in a simple way for a 10-year-old child"

The difference? In the second request you said:
- The exact topic (black holes)
- Length of response (short paragraph)
- Difficulty level (for a 10-year-old)

## Types of Requests You Can Make 

### 1. Ask a Question
> "What is light?"
> "Why is the sky blue?"

### 2. Ask for Help with Something
> "Help me understand fractions"
> "Review my essay and tell me where the errors are"

### 3. Ask it to Do Something
> "Write me a poem about the sea"
> "Make me a study plan for a week"

### 4. Chat Normally
> "I'm bored, I need an idea for a new game"

## Golden Tips 

⭐ **If you don't understand the answer** - say: "I don't understand, can you explain more simply?"

⭐ **If you want more information** - say: "Can you continue and tell me more?"

⭐ **If the answer isn't what you wanted** - clarify: "I meant..."

⭐ **Don't be formal** - talk in your normal way, it will understand you!
 `,
 quiz: [
 {
 id: 'q2-1',
 questionAr: 'إيه اللي بيخلي طلبك أفضل وبتاخد إجابة أحسن؟',
 questionEn: 'What makes your request better and gets you a better answer?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'إنك تكتب بالإنجليزي', textEn: 'Writing in English', isCorrect: false },
 { id: 'o2', textAr: 'إنك تكون واضح ومحدد في طلبك', textEn: 'Being clear and specific in your request', isCorrect: true },
 { id: 'o3', textAr: 'إنك تكتب كتير', textEn: 'Writing a lot', isCorrect: false },
 { id: 'o4', textAr: 'إنك تستخدم كلمات صعبة', textEn: 'Using difficult words', isCorrect: false },
 ],
 },
 {
 id: 'q2-2',
 questionAr: 'لو Claude قالك حاجة مش فاهمها، المفروض تعمل إيه؟',
 questionEn: "If Claude tells you something you don't understand, what should you do?",
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'تقوله يشرح بطريقة أبسط', textEn: 'Ask it to explain more simply', isCorrect: true },
 { id: 'o2', textAr: 'تسيبه وتمشي', textEn: 'Leave and go', isCorrect: false },
 ],
 },
 {
 id: 'q2-3',
 questionAr: 'أنهي طلب أفضل؟',
 questionEn: 'Which request is better?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: '"اكتبلي عن التاريخ"', textEn: '"Write about history"', isCorrect: false },
 { id: 'o2', textAr: '"اكتبلي 5 أسطر عن حياة صلاح الدين الأيوبي لطفل في المدرسة"', textEn: '"Write me 5 lines about the life of Saladin for a school child"', isCorrect: true },
 { id: 'o3', textAr: '"تاريخ"', textEn: '"History"', isCorrect: false },
 { id: 'o4', textAr: '"كتابة تاريخية من فضلك يا Claude الغالي"', textEn: '"Historical writing please dear Claude"', isCorrect: false },
 ],
 },
 ],
 },
 {
 id: 3,
 slug: 'what-claude-can-do',
 agentSlug: 'claude',
 titleAr: 'Claude يعمل إيه؟',
 titleEn: 'What Can Claude Do?',
 descriptionAr: 'اكتشف كل الحاجات الرائعة اللي Claude يقدر يساعدك بيها!',
 descriptionEn: 'Discover all the amazing things Claude can help you with!',
 order: 3,
 xpReward: 60,
 estimatedMinutes: 8,
 contentAr: `
## Claude بيعمل حاجات كتير جداً! 

هتتفاجأ بكمية الحاجات اللي Claude بيقدر يساعدك بيها. خلينا نتعرف عليها!

## 1. الكتابة والإبداع 

Claude بيساعدك في أي حاجة بتتعلق بالكتابة:
- كتابة قصص وحكايات ممتعة
- كتابة إنشاءات للمدرسة
- كتابة رسايل وإيميلات
- كتابة حوارات ومسرحيات
- كتابة أغاني وقصايد

**مثال:** "اكتبلي قصة قصيرة عن ولد اكتشف آلة الزمن وراح عصر الديناصورات"

## 2. الشرح والتعليم 

ده اللي Claude بيتألق فيه أكتر!
- شرح الرياضيات خطوة خطوة
- شرح مواد العلوم بطريقة ممتعة
- شرح أحداث التاريخ
- معلومات عن البلاد والثقافات
- شرح أي فكرة صعبة بطريقة بسيطة

**مثال:** "فاهمتش الهندسة دي، ممكن تشرحها بأمثلة من الحياة؟"

## 3. البرمجة والتكنولوجيا 

حتى لو عمرك ما كتبت كود، Claude يساعدك تبدأ!
- كتابة برامج بسيطة
- شرح كيف الكود بيشتغل
- اكتشاف الأخطاء في الكود
- تعليم لغات برمجة مختلفة

## 4. التحليل والبحث 

- تلخيص نصوص طويلة
- مقارنة بين حاجتين
- تحليل موقف أو مشكلة
- مساعدة في البحث عن معلومات

## 5. الترجمة 

Claude بيترجم بين أكتر من 50 لغة بدقة عالية!
- من العربي للإنجليزي والعكس
- فرنسي، ألماني، إسباني، صيني...

## 6. التخطيط والتنظيم 

- عمل خطط دراسة
- تنظيم أفكار مشروع
- عمل قوائم مهام
- التخطيط لرحلة أو حفلة

## حاجات Claude مش بيعملها 

عشان تعرف إيه حدوده:
- مش بيتصل بالإنترنت في الوقت الحالي
- مش بيقدر يشوف صور أو فيديوهات في النسخة العادية
- مش بيعرف الأخبار الجديدة بعد تاريخ تدريبه
- مش بيتذكر المحادثات القديمة (كل محادثة جديدة)
 `,
 contentEn: `
## Claude Does So Many Things! 

You'll be amazed at how many things Claude can help you with. Let's explore!

## 1. Writing and Creativity 

Claude helps with anything related to writing:
- Writing fun stories and tales
- Writing school essays
- Writing letters and emails
- Writing dialogues and plays
- Writing songs and poems

**Example:** "Write me a short story about a boy who discovers a time machine and goes to the dinosaur era"

## 2. Explanation and Education 

This is where Claude truly shines!
- Explaining math step by step
- Explaining science subjects in a fun way
- Explaining historical events
- Information about countries and cultures
- Explaining any difficult idea simply

**Example:** "I don't understand this geometry problem, can you explain with real-life examples?"

## 3. Programming and Technology 

Even if you've never written code, Claude helps you start!
- Writing simple programs
- Explaining how code works
- Finding errors in code
- Teaching different programming languages

## 4. Analysis and Research 

- Summarizing long texts
- Comparing between two things
- Analyzing a situation or problem
- Helping find information

## 5. Translation 

Claude translates between more than 50 languages with high accuracy!

## 6. Planning and Organization 

- Making study plans
- Organizing project ideas
- Making to-do lists
- Planning trips or parties

## Things Claude Doesn't Do 

Know its limits:
- Doesn't browse the internet in real-time
- Can't see images or videos in basic version
- Doesn't know news after its training cutoff date
- Doesn't remember old conversations (each is new)
 `,
 quiz: [
 {
 id: 'q3-1',
 questionAr: 'إيه من اللي Claude بيقدر يعمله؟',
 questionEn: 'Which of the following can Claude do?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'يطبخ الأكل', textEn: 'Cook food', isCorrect: false },
 { id: 'o2', textAr: 'يكتب قصص ويشرح درس', textEn: 'Write stories and explain lessons', isCorrect: true },
 { id: 'o3', textAr: 'يلعب فيديو جيم معاك', textEn: 'Play video games with you', isCorrect: false },
 { id: 'o4', textAr: 'يجيب لك حاجات من النت', textEn: 'Order things for you online', isCorrect: false },
 ],
 },
 {
 id: 'q3-2',
 questionAr: 'Claude بيتذكر المحادثات القديمة',
 questionEn: 'Claude remembers old conversations',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح', textEn: 'True', isCorrect: false },
 { id: 'o2', textAr: 'غلط', textEn: 'False', isCorrect: true },
 ],
 },
 {
 id: 'q3-3',
 questionAr: 'Claude بيترجم بين أكتر من كام لغة؟',
 questionEn: 'Claude translates between more than how many languages?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: '10 لغات', textEn: '10 languages', isCorrect: false },
 { id: 'o2', textAr: '25 لغة', textEn: '25 languages', isCorrect: false },
 { id: 'o3', textAr: '50 لغة', textEn: '50 languages', isCorrect: true },
 { id: 'o4', textAr: '5 لغات بس', textEn: 'Only 5 languages', isCorrect: false },
 ],
 },
 ],
 },
 {
 id: 4,
 slug: 'write-good-prompts',
 agentSlug: 'claude',
 titleAr: 'اكتب طلب صح',
 titleEn: 'Write a Good Request',
 descriptionAr: 'اتعلم سر كيفية كتابة طلبات ممتازة تجيبلك نتايج مذهلة!',
 descriptionEn: 'Learn the secret to writing excellent requests that get you amazing results!',
 order: 4,
 xpReward: 75,
 estimatedMinutes: 10,
 contentAr: `
## سر الـ Prompt الممتاز 

الـ "Prompt" هو الطلب أو السؤال اللي بتبعته لـ Claude. وفي فرق كبير بين prompt كويس وprompt مش كويس!

## الفرق بين طلب عادي وطلب ممتاز 🆚

### مثال 1: المذاكرة

 **طلب ضعيف:**
> "ساعدني أذاكر"

 **طلب ممتاز:**
> "أنا طالب في الصف الخامس الابتدائي، عندي امتحان رياضيات بكرا في الكسور والأعداد العشرية. ممكن تعمللي خطة مذاكرة لمدة 3 ساعات مع أمثلة تدريبية؟"

### مثال 2: القصة

 **طلب ضعيف:**
> "اكتبلي قصة"

 **طلب ممتاز:**
> "اكتبلي قصة مغامرات قصيرة (10 أسطر تقريباً) لأطفال عمرهم 8 سنين، البطل ولد اسمه كريم بيكتشف غابة سحرية في حديقة بيته"

## عناصر الطلب الممتاز 

### 1. التحديد - قول بالظبط إيه اللي عايزه
بدل "حاجة عن الفضاء" قول "معلومات عن كوكب المريخ"

### 2. الطول - قول كام عايز
"اكتبلي فقرة واحدة" أو "اعمللي قايمة من 5 نقاط"

### 3. الجمهور - مين هيقرأ؟
"لطفل عمره 8 سنين" أو "لطالب في الجامعة"

### 4. الأسلوب - إزاي عايزه يكون؟
"بطريقة ممتعة ومضحكة" أو "بطريقة رسمية ومحترمة"

### 5. السياق - إيه الخلفية؟
"أنا بكتب موضوع مدرسي عن..." أو "أنا بحاول أفهم..."

## تمرين عملي! 

دلوقتي جرب تحسن الطلبات دي:

**طلب 1:** "قصيدة"
→ فكر: عن إيه؟ كام بيت؟ لمين؟ بأي أسلوب؟

**طلب 2:** "شرح رياضيات"
→ فكر: أي موضوع؟ مستواك إيه؟ بتعلم وحدك ولا للمذاكرة؟

## نصيحة أخيرة ذهبية 

لو مش عارف تصيغ الطلب صح، قول لـ Claude نفسه:
> "أنا عايز [هدفك]، ساعدني أصيغ طلب كويس عشان تقدر تساعدني صح"

Claude هيساعدك تكتب الطلب المناسب! 
 `,
 contentEn: `
## The Secret of a Great Prompt 

A "prompt" is the request or question you send to Claude. And there's a big difference between a good prompt and a bad one!

## The Difference Between a Normal and Great Request 🆚

### Example 1: Studying

 **Weak request:**
> "Help me study"

 **Great request:**
> "I'm a 5th grade student, I have a math exam tomorrow on fractions and decimals. Can you make me a 3-hour study plan with practice examples?"

### Example 2: Story

 **Weak request:**
> "Write me a story"

 **Great request:**
> "Write me a short adventure story (about 10 lines) for 8-year-old children, the hero is a boy named Karim who discovers a magical forest in his backyard"

## Elements of a Great Request 

### 1. Specificity - Say exactly what you want
Instead of "something about space" say "information about planet Mars"

### 2. Length - Say how much you want
"Write me one paragraph" or "Make me a list of 5 points"

### 3. Audience - Who will read it?
"For an 8-year-old" or "For a university student"

### 4. Style - How do you want it?
"In a fun and funny way" or "In a formal and professional way"

### 5. Context - What's the background?
"I'm writing a school essay about..." or "I'm trying to understand..."

## Practical Exercise! 

Now try to improve these requests:

**Request 1:** "Poem"
→ Think: About what? How many lines? For whom? What style?

**Request 2:** "Math explanation"
→ Think: Which topic? What's your level? Self-study or exam prep?

## Final Golden Tip 

If you don't know how to phrase your request correctly, ask Claude himself:
> "I want [your goal], help me phrase a good request so you can help me properly"

Claude will help you write the right request! 
 `,
 quiz: [
 {
 id: 'q4-1',
 questionAr: 'إيه معنى "Prompt"؟',
 questionEn: 'What does "Prompt" mean?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'إجابة Claude', textEn: "Claude's answer", isCorrect: false },
 { id: 'o2', textAr: 'الطلب أو السؤال اللي بتبعته لـ Claude', textEn: 'The request or question you send to Claude', isCorrect: true },
 { id: 'o3', textAr: 'اسم برنامج تاني', textEn: 'Another program name', isCorrect: false },
 { id: 'o4', textAr: 'لغة برمجة', textEn: 'A programming language', isCorrect: false },
 ],
 },
 {
 id: 'q4-2',
 questionAr: 'ذكر الجمهور (مين هيقرأ) في الطلب بيحسن الإجابة',
 questionEn: 'Mentioning the audience (who will read) in the request improves the answer',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح', textEn: 'True', isCorrect: true },
 { id: 'o2', textAr: 'غلط', textEn: 'False', isCorrect: false },
 ],
 },
 {
 id: 'q4-3',
 questionAr: 'أنهي عنصر مش ضروري في الطلب الممتاز؟',
 questionEn: "Which element is NOT necessary in a great request?",
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'التحديد', textEn: 'Specificity', isCorrect: false },
 { id: 'o2', textAr: 'السياق', textEn: 'Context', isCorrect: false },
 { id: 'o3', textAr: 'إنك تكتب بالإنجليزي', textEn: 'Writing in English', isCorrect: true },
 { id: 'o4', textAr: 'الجمهور', textEn: 'Audience', isCorrect: false },
 ],
 },
 ],
 activity: {
 titleAr: 'حسّن الطلب ده! ',
 titleEn: 'Improve This Request! ',
 descriptionAr: 'الطلب ده ضعيف: "اكتبلي عن الحيوانات" - حاول تحسنه باستخدام عناصر الطلب الممتاز اللي اتعلمتها!',
 descriptionEn: 'This request is weak: "Write about animals" - try to improve it using the elements you learned!',
 type: 'improve_prompt',
 data: {
 badPrompt: 'اكتبلي عن الحيوانات',
 badPromptEn: 'Write about animals',
 hints: [
 'أي حيوان تحديداً؟',
 'كام سطر تقريباً؟',
 'لمين (أطفال، كبار)؟',
 'بأي أسلوب؟',
 ],
 exampleGoodPrompt: 'اكتبلي 5 حقائق ممتعة عن الدلافين بطريقة مسلية لأطفال عمرهم 9 سنين',
 },
 },
 },
 {
 id: 5,
 slug: 'claude-at-school',
 agentSlug: 'claude',
 titleAr: 'Claude في المدرسة',
 titleEn: 'Claude at School',
 descriptionAr: 'اكتشف إزاي Claude بيقدر يساعدك في مذاكرتك ودروسك!',
 descriptionEn: 'Discover how Claude can help you with your studies and schoolwork!',
 order: 5,
 xpReward: 75,
 estimatedMinutes: 8,
 contentAr: `
## Claude أفضل مساعد في المذاكرة! 

كتير من الطلاب بيستخدموا Claude في المذاكرة، وبيقولوا إنه غيّر طريقة تعلمهم كلياً! هنا هتعرف إزاي تستخدمه صح.

## الاستخدامات الذكية في المدرسة 

### 1. فهم الدروس الصعبة 

**بدل ما تقعد تحتار لوحدك، قول لـ Claude:**
> "مش فاهم موضوع الكهرباء الساكنة في العلوم، ممكن تشرحه بمثال من الحياة اليومية؟"

Claude هيشرحلك بطريقة تفهمها وهتفضل فاكرها!

### 2. المراجعة قبل الامتحان 

> "أنا عندي امتحان في التاريخ عن العصر الفرعوني. ممكن تعمل 10 أسئلة مراجعة وتديني الإجابات بعد ما أجاوب؟"

ده أحسن من أي ورقة مراجعة! هيعمللك أسئلة مناسبة لمستواك.

### 3. مساعدة في الإنشاء والتعبير 

**لو عندك موضوع إنشاء:**
> "المطلوب مني أكتب موضوع عن 'أهمية القراءة' 150 كلمة. ممكن تساعدني أرتب أفكاري وتقترح نقاط مهمة؟"

**مهم:** اطلب منه أفكار ومساعدة في التفكير، مش إنه يكتب عنك! التعلم هو الأهم.

### 4. حل مسائل الرياضيات 

> "مش قادر أحل المسألة دي: [المسألة]. ممكن تشرحلي الخطوات خطوة خطوة من غير ما تديني الإجابة الأول؟"

اللي بيميز كده إنك بتتعلم الطريقة مش بس الإجابة!

### 5. شرح اللغات 

> "في الإنجليزي مش بفهم الفرق بين 'has been' و'was'. ممكن تشرح الفرق بأمثلة؟"

## تحذير مهم جداً!

هناك فرق كبير بين:

 **الاستخدام الصح:** تطلب من Claude يساعدك تفهم وتتعلم
 **الاستخدام الغلط:** تطلب منه يعمل الواجب عنك

لو Claude عمل الواجب عنك:
- مش هتتعلم حاجة
- هتفشل في الامتحان لأنك مش فاهم
- بتغش نفسك مش بس الأستاذ!

## نصايح للوالدين والمعلمين ‍‍

Claude أداة تعليمية رائعة لما بيتستخدم صح. هو بيشجع الفهم والتفكير، مش الحفظ والنقل.

## جرب دلوقتي! 

أي مادة بتستصعبها دلوقتي؟ روح على Claude وقوله:
> "أنا طالب في [صفك]، مش فاهم [الموضوع]. ممكن تشرح بطريقة سهلة وبعدين اسألني سؤال عشان أتأكد إني فاهم؟"
 `,
 contentEn: `
## Claude is the Best Study Assistant! 

Many students use Claude for studying and say it completely changed their learning! Here you'll learn how to use it correctly.

## Smart Uses at School 

### 1. Understanding Difficult Lessons 

**Instead of struggling alone, tell Claude:**
> "I don't understand static electricity in science, can you explain it with a real-life example?"

Claude will explain it in a way you understand and will remember!

### 2. Reviewing Before Exams 

> "I have a history exam about the Pharaonic era. Can you make 10 review questions and give me the answers after I respond?"

Better than any review sheet! It'll make questions appropriate for your level.

### 3. Help with Essays and Compositions 

**If you have an essay topic:**
> "I need to write an essay about 'the importance of reading' in 150 words. Can you help me organize my ideas and suggest important points?"

**Important:** Ask for ideas and thinking help, not for it to write FOR you! Learning is what matters.

### 4. Solving Math Problems 

> "I can't solve this problem: [problem]. Can you explain the steps step by step without giving me the answer first?"

What makes this special is you learn the METHOD not just the answer!

### 5. Language Explanations 

> "In English I don't understand the difference between 'has been' and 'was'. Can you explain with examples?"

## Very Important Warning!

There's a big difference between:

 **Correct use:** Asking Claude to help you understand and learn
 **Wrong use:** Asking it to do your homework for you

If Claude does your homework:
- You won't learn anything
- You'll fail the exam because you don't understand
- You're cheating yourself, not just the teacher!

## Try It Now! 

What subject do you find difficult right now? Go to Claude and say:
> "I'm a student in [your grade], I don't understand [topic]. Can you explain simply and then ask me a question to make sure I understand?"
 `,
 quiz: [
 {
 id: 'q5-1',
 questionAr: 'إيه الاستخدام الصح لـ Claude في المدرسة؟',
 questionEn: 'What is the correct use of Claude at school?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'يكتب الواجب عنك', textEn: 'Write your homework for you', isCorrect: false },
 { id: 'o2', textAr: 'يساعدك تفهم الدرس وتتعلم', textEn: 'Help you understand the lesson and learn', isCorrect: true },
 { id: 'o3', textAr: 'يجاوب على أسئلة الامتحان', textEn: 'Answer exam questions', isCorrect: false },
 { id: 'o4', textAr: 'مش مناسب للمدرسة خالص', textEn: 'Not suitable for school at all', isCorrect: false },
 ],
 },
 {
 id: 'q5-2',
 questionAr: 'لو Claude عمل الواجب عنك، هتتعلم كويس',
 questionEn: 'If Claude does your homework for you, you will learn well',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح', textEn: 'True', isCorrect: false },
 { id: 'o2', textAr: 'غلط', textEn: 'False', isCorrect: true },
 ],
 },
 {
 id: 'q5-3',
 questionAr: 'إزاي تستخدم Claude في الرياضيات بطريقة ذكية؟',
 questionEn: 'How do you use Claude for math in a smart way?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'تقوله يحل المسألة مباشرة', textEn: 'Tell it to solve the problem directly', isCorrect: false },
 { id: 'o2', textAr: 'تطلب منه يشرح الخطوات من غير ما يديك الإجابة أول', textEn: 'Ask it to explain the steps without giving you the answer first', isCorrect: true },
 { id: 'o3', textAr: 'تنسخ الإجابة وتسلمها للأستاذ', textEn: 'Copy the answer and submit it to the teacher', isCorrect: false },
 { id: 'o4', textAr: 'ما تستخدمهوش في الرياضيات خالص', textEn: "Don't use it for math at all", isCorrect: false },
 ],
 },
 ],
 },
];

export const promptEngineeringLessons: Lesson[] = [
 {
 id: 6,
 slug: 'what-is-a-prompt',
 agentSlug: 'claude',
 titleAr: 'إيه هو الـ Prompt؟',
 titleEn: 'What is a Prompt?',
 descriptionAr: 'تعلّم أساس أساس التعامل مع الذكاء الاصطناعي — الطلب الصح.',
 descriptionEn: 'Learn the foundation of working with AI — the right request.',
 order: 6,
 xpReward: 75,
 estimatedMinutes: 8,
 contentAr: `## إيه هو الـ Prompt؟

الـ **Prompt** هو ببساطة الكلام اللي بتكتبه لـ Claude أو أي AI.

زي ما بتكلم صاحبك وبتقوله "ساعدني في حاجة"، الـ Prompt هو الكلام ده بالظبط.

---

## الفرق بين Prompt ضعيف وقوي

| Prompt ضعيف | Prompt قوي |
|---|---|
| "اكتب حاجة" | "اكتب رسالة بريد إلكتروني رسمية لمديري أطلب فيها إجازة 3 أيام الأسبوع الجاي" |
| "ساعدني" | "ساعدني أفهم الفرق بين Python و JavaScript لمبتدئ عنده 10 سنين" |
| "ترجم" | "ترجم الجملة دي للإنجليزي بطريقة رسمية: 'شكراً على مساعدتك'" |

---

## مكونات الـ Prompt الكويس

الـ Prompt الكويس فيه 4 حاجات:

### 1. الهدف
إيه اللي عايزه بالظبط؟

### 2. السياق
إيه اللي المفروض Claude يعرفه عشان يساعدك؟

### 3. الشكل
عايز الإجابة إزاي؟ قصيرة؟ طويلة؟ نقط؟ جدول؟

### 4. القيود
في حاجة مش عايزها؟ أو حدود معينة؟

---

## مثال عملي

**بدل ما تكتب:**
> "اكتب قصة"

**اكتب:**
> "اكتب قصة قصيرة (150 كلمة) عن طفل اسمه كريم بيكتشف روبوت في حديقة بيته. الأسلوب يكون مناسب لأطفال 8 سنين، ونهايتها سعيدة."

الفرق ضخم جداً في جودة النتيجة! `,

 contentEn: `## What is a Prompt?

A **Prompt** is simply the text you write to Claude or any AI.

Just like talking to a friend and saying "help me with something," the prompt is exactly that message.

---

## Weak vs Strong Prompts

| Weak Prompt | Strong Prompt |
|---|---|
| "Write something" | "Write a formal email to my manager requesting 3 days off next week" |
| "Help me" | "Help me understand the difference between Python and JavaScript for a 10-year-old beginner" |
| "Translate" | "Translate this sentence formally to English: 'Thank you for your help'" |

---

## Components of a Good Prompt

A good prompt has 4 things:

### 1. Goal
What exactly do you want?

### 2. Context
What should Claude know to help you?

### 3. Format
How do you want the answer? Short? Long? Bullet points? Table?

### 4. Constraints
Anything you don't want? Any specific limits?

---

## Practical Example

**Instead of writing:**
> "Write a story"

**Write:**
> "Write a short story (150 words) about a boy named Karim who discovers a robot in his garden. The style should suit 8-year-olds, with a happy ending."

The difference in output quality is huge! `,

 quiz: [
 {
 id: 'q6-1',
 questionAr: 'إيه هو الـ Prompt؟',
 questionEn: 'What is a Prompt?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'الكلام اللي بتكتبه للـ AI', textEn: 'The text you write to the AI', isCorrect: true },
 { id: 'o2', textAr: 'برنامج كمبيوتر خاص', textEn: 'A special computer program', isCorrect: false },
 { id: 'o3', textAr: 'نوع من أنواع الكود', textEn: 'A type of code', isCorrect: false },
 { id: 'o4', textAr: 'اسم شركة AI', textEn: 'The name of an AI company', isCorrect: false },
 ],
 },
 {
 id: 'q6-2',
 questionAr: 'أنهي Prompt هو الأقوى؟',
 questionEn: 'Which prompt is stronger?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: '"اكتب موضوع"', textEn: '"Write a topic"', isCorrect: false },
 { id: 'o2', textAr: '"اكتب موضوع إنشاء عربي لطالب في الصف الأول الإعدادي عن فوائد القراءة، 200 كلمة"', textEn: '"Write an Arabic essay for a 7th grader on benefits of reading, 200 words"', isCorrect: true },
 { id: 'o3', textAr: '"موضوع كويس"', textEn: '"Good topic"', isCorrect: false },
 { id: 'o4', textAr: '"موضوع إنشاء"', textEn: '"Essay topic"', isCorrect: false },
 ],
 },
 {
 id: 'q6-3',
 questionAr: 'من مكونات الـ Prompt الكويس؟',
 questionEn: 'Which is a component of a good prompt?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'الهدف + السياق + الشكل + القيود', textEn: 'Goal + Context + Format + Constraints', isCorrect: true },
 { id: 'o2', textAr: 'الاسم + العمر + البلد', textEn: 'Name + Age + Country', isCorrect: false },
 { id: 'o3', textAr: 'الكود + البرمجة + الداتا', textEn: 'Code + Programming + Data', isCorrect: false },
 { id: 'o4', textAr: 'السرعة + الدقة + السعر', textEn: 'Speed + Accuracy + Price', isCorrect: false },
 ],
 },
 ],
 },

 {
 id: 7,
 slug: 'zero-shot-prompting',
 agentSlug: 'claude',
 titleAr: 'Zero-shot: اسأل مباشرة',
 titleEn: 'Zero-shot: Ask Directly',
 descriptionAr: 'أبسط طريقة — اسأل Claude مباشرة من غير ما تدي أمثلة.',
 descriptionEn: 'The simplest technique — ask Claude directly without giving examples.',
 order: 7,
 xpReward: 75,
 estimatedMinutes: 8,
 contentAr: `## Zero-shot Prompting

الـ **Zero-shot** معناها "صفر أمثلة" — بتسأل Claude مباشرة من غير ما تدي أي مثال أو توضيح إضافي.

---

## إمتى بتشتغل كويس؟

الـ Zero-shot بتشتغل تمام في:

- الأسئلة البسيطة والواضحة
- المهام اللي Claude اتدرب عليها كتير
- لما الوقت ضيق
- الترجمة والتلخيص والتصنيف

---

## أمثلة عملية

**ترجمة:**
> "ترجم للإنجليزي: المنصة دي بتعلم الذكاء الاصطناعي بالعربي"

**تصنيف:**
> "صنّف الجملة دي: إيجابية، سلبية، ولا محايدة؟ — 'الأكل كان معقول'"

**ملخص:**
> "لخص النص ده في جملتين: [النص]"

**توليد أفكار:**
> "اقترح 5 أسماء لتطبيق موبايل للتعلم"

---

## نصيحة مهمة 

حتى في الـ Zero-shot، كلما كان طلبك أوضح، كانت النتيجة أحسن.

**مش كويس:**
> "لخص"

**كويس:**
> "لخص النص ده في 3 نقط رئيسية باللغة العربية"

---

## إمتى مش بتكفي؟

لو Claude مش بيفهم المطلوب منه بالظبط، يبقى وقت تجرب الـ **Few-shot** — وهي الدرس الجاي! `,

 contentEn: `## Zero-shot Prompting

**Zero-shot** means "zero examples" — you ask Claude directly without giving any examples or extra clarification.

---

## When Does It Work Well?

Zero-shot works great for:

- Simple, clear questions
- Tasks Claude was heavily trained on
- When you're short on time
- Translation, summarization, classification

---

## Practical Examples

**Translation:**
> "Translate to Arabic: This platform teaches AI in Arabic"

**Classification:**
> "Classify this sentence: positive, negative, or neutral? — 'The food was okay'"

**Summary:**
> "Summarize this text in two sentences: [text]"

**Idea generation:**
> "Suggest 5 names for a mobile learning app"

---

## Important Tip 

Even in Zero-shot, the clearer your request, the better the result.

**Not great:**
> "Summarize"

**Better:**
> "Summarize this text in 3 main bullet points in Arabic"

---

## When Is It Not Enough?

If Claude doesn't fully understand what you need, it's time to try **Few-shot** — that's the next lesson! `,

 quiz: [
 {
 id: 'q7-1',
 questionAr: 'إيه معنى "Zero-shot"؟',
 questionEn: 'What does "Zero-shot" mean?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'سؤال مباشر من غير أمثلة', textEn: 'A direct question without examples', isCorrect: true },
 { id: 'o2', textAr: 'سؤال فيه صفر كلمات', textEn: 'A question with zero words', isCorrect: false },
 { id: 'o3', textAr: 'سؤال بيتطلب إجابة قصيرة', textEn: 'A question requiring a short answer', isCorrect: false },
 { id: 'o4', textAr: 'نوع من البرمجة', textEn: 'A type of programming', isCorrect: false },
 ],
 },
 {
 id: 'q7-2',
 questionAr: 'الـ Zero-shot بتشتغل كويس في؟',
 questionEn: 'Zero-shot works well for?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'الترجمة والتلخيص والتصنيف', textEn: 'Translation, summarization, and classification', isCorrect: true },
 { id: 'o2', textAr: 'المهام المعقدة جداً', textEn: 'Very complex tasks only', isCorrect: false },
 { id: 'o3', textAr: 'البرمجة المتقدمة فقط', textEn: 'Advanced programming only', isCorrect: false },
 { id: 'o4', textAr: 'الصور والفيديو', textEn: 'Images and video', isCorrect: false },
 ],
 },
 {
 id: 'q7-3',
 questionAr: 'صح ولا غلط: لو Claude مش فاهم، الأحسن تجرب Few-shot',
 questionEn: 'True or False: If Claude doesn\'t understand, it\'s better to try Few-shot',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح', textEn: 'True', isCorrect: true },
 { id: 'o2', textAr: 'غلط', textEn: 'False', isCorrect: false },
 ],
 },
 ],
 },

 {
 id: 8,
 slug: 'few-shot-prompting',
 agentSlug: 'claude',
 titleAr: 'Few-shot: علّم بالمثال',
 titleEn: 'Few-shot: Teach by Example',
 descriptionAr: 'دي المفروض تعرفها — إزاي تدي Claude أمثلة يتعلم منها.',
 descriptionEn: 'The must-know technique — how to give Claude examples to learn from.',
 order: 8,
 xpReward: 80,
 estimatedMinutes: 10,
 contentAr: `## Few-shot Prompting

الـ **Few-shot** معناها "أمثلة قليلة" — بتدي Claude مثال واحد أو أكتر قبل ما تطلب منه المهمة.

زي ما بتعلم حد جديد — بدل ما تشرحله بالكلام، بتقوله "افعل زي ما أنا بعمل".

---

## الفرق بين Zero-shot و Few-shot

| | Zero-shot | Few-shot |
|---|---|---|
| **أمثلة** | مفيش | في أمثلة |
| **وقت الكتابة** | سريع | أبطأ شوية |
| **جودة النتيجة** | كويس | أحسن للمهام المعقدة |
| **أحسن لـ** | مهام واضحة | مهام محتاجة نمط معين |

---

## مثال 1: تصنيف المراجعات

\`\`\`
صنّف المراجعات دي: إيجابية أو سلبية

مراجعة: "المنتج رائع وجودته ممتازة" → إيجابية
مراجعة: "التوصيل أتأخر كتير" → سلبية
مراجعة: "السعر مناسب بس التغليف بسيط" → ???
\`\`\`

Claude هيعرف النمط المطلوب ويجاوب: **محايدة** 

---

## مثال 2: توليد بيانات بنمط معين

\`\`\`
حوّل الأسماء دي لصيغة "اسم_عائلة، الاسم_الأول":

أحمد محمد → محمد، أحمد
سارة علي → علي، سارة
خالد يوسف → ???
\`\`\`

Claude هيكمل: **يوسف، خالد** 

---

## قاعدة الـ Few-shot

1. **الأمثلة** — 2 إلى 5 أمثلة بتوضح النمط
2. **الفصل** — افصل بين الأمثلة بوضوح
3. **الاتساق** — الأمثلة لازم تكون كلها بنفس الأسلوب
4. **الطلب** — في الآخر اطلب المهمة الجديدة

---

## نصيحة الـ Pro 

مش لازم تشرح القاعدة — بس وري الأمثلة وسيب Claude يفهم الباقي. الـ AI ذكي كفاية يستنتج النمط! `,

 contentEn: `## Few-shot Prompting

**Few-shot** means "a few examples" — you give Claude one or more examples before asking for the task.

Like teaching someone new — instead of explaining in words, you show them "do it like I do."

---

## Zero-shot vs Few-shot

| | Zero-shot | Few-shot |
|---|---|---|
| **Examples** | None | Has examples |
| **Writing time** | Fast | Slightly slower |
| **Output quality** | Good | Better for complex tasks |
| **Best for** | Clear tasks | Tasks needing a specific pattern |

---

## Example 1: Classifying Reviews

\`\`\`
Classify these reviews: Positive or Negative

Review: "The product is amazing, great quality" → Positive
Review: "Delivery was very late" → Negative
Review: "Price is fair but packaging is simple" → ???
\`\`\`

Claude will recognize the pattern and answer: **Neutral** 

---

## Example 2: Generating Data in a Pattern

\`\`\`
Convert these names to "Last_Name, First_Name" format:

Ahmed Mohamed → Mohamed, Ahmed
Sara Ali → Ali, Sara
Khaled Youssef → ???
\`\`\`

Claude will complete: **Youssef, Khaled** 

---

## The Few-shot Rule

1. **Examples** — 2 to 5 examples showing the pattern
2. **Separation** — Clearly separate examples
3. **Consistency** — All examples must follow the same style
4. **Request** — At the end, ask for the new task

---

## Pro Tip 

You don't need to explain the rule — just show the examples and let Claude figure out the rest. AI is smart enough to infer the pattern! `,

 quiz: [
 {
 id: 'q8-1',
 questionAr: 'Few-shot بتنفع أكتر في؟',
 questionEn: 'Few-shot is most useful for?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'المهام اللي محتاجة نمط أو أسلوب معين', textEn: 'Tasks that need a specific pattern or style', isCorrect: true },
 { id: 'o2', textAr: 'الأسئلة البسيطة جداً', textEn: 'Very simple questions', isCorrect: false },
 { id: 'o3', textAr: 'ترجمة كلمة واحدة', textEn: 'Translating a single word', isCorrect: false },
 { id: 'o4', textAr: 'إنشاء صور', textEn: 'Generating images', isCorrect: false },
 ],
 },
 {
 id: 'q8-2',
 questionAr: 'كام مثال الأنسب في الـ Few-shot؟',
 questionEn: 'How many examples are ideal for Few-shot?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: '2 إلى 5 أمثلة', textEn: '2 to 5 examples', isCorrect: true },
 { id: 'o2', textAr: 'مثال واحد فقط دايماً', textEn: 'Always exactly one example', isCorrect: false },
 { id: 'o3', textAr: '50 مثال على الأقل', textEn: 'At least 50 examples', isCorrect: false },
 { id: 'o4', textAr: 'مش مهم العدد خالص', textEn: 'The number doesn\'t matter at all', isCorrect: false },
 ],
 },
 {
 id: 'q8-3',
 questionAr: 'صح ولا غلط: في الـ Few-shot لازم تشرح القاعدة بالتفصيل',
 questionEn: 'True or False: In Few-shot you must explain the rule in detail',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح', textEn: 'True', isCorrect: false },
 { id: 'o2', textAr: 'غلط — الأمثلة بتكفي', textEn: 'False — examples are enough', isCorrect: true },
 ],
 },
 ],
 },

 {
 id: 9,
 slug: 'chain-of-thought',
 agentSlug: 'claude',
 titleAr: 'Chain of Thought: فكّر خطوة خطوة',
 titleEn: 'Chain of Thought: Think Step by Step',
 descriptionAr: 'اطلب من Claude يفكر بصوت عالٍ — هتلاقي الإجابات أدق بكتير.',
 descriptionEn: 'Ask Claude to think out loud — you\'ll find the answers much more accurate.',
 order: 9,
 xpReward: 85,
 estimatedMinutes: 10,
 contentAr: `## Chain of Thought Prompting

الـ **Chain of Thought (CoT)** معناها "سلسلة التفكير" — بتطلب من Claude يوضح خطوات تفكيره قبل ما يوصل للإجابة.

---

## ليه مهم؟

لما Claude بيفكر خطوة خطوة:
- بيغلط أقل في المسائل المعقدة
- بتقدر تتابع منطقه وتكتشف أي خطأ
- الإجابات بتبقى أعمق وأكثر تفصيلاً
- مفيد جداً في الرياضيات والمنطق والقرارات

---

## الطريقة الأولى: "فكّر خطوة خطوة"

بس أضف في آخر طلبك:

> "فكّر خطوة خطوة"
> أو "Think step by step"
> أو "اشرح تفكيرك"

**مثال:**
> "أحمد عنده 24 تفاحة. أكل ربعها وأدى نصف الباقي لأصحابه. كام تفاحة فضلت؟ **فكّر خطوة خطوة.**"

Claude هيقول:
1. 24 ÷ 4 = 6 تفاحات أكلها أحمد
2. الباقي = 24 - 6 = 18 تفاحة
3. أدى نصفها = 18 ÷ 2 = 9 تفاحات
4. الباقي = 18 - 9 = **9 تفاحات** 

---

## الطريقة التانية: حدد الخطوات

\`\`\`
حلل الموقف ده في 3 خطوات:
1. حدد المشكلة
2. اقترح الحلول
3. اختار الأنسب

الموقف: شركتي خسرانة عملاء بسبب بطء الخدمة
\`\`\`

---

## إمتى تستخدم CoT؟

| المهمة | تستخدم CoT؟ |
|---|---|
| مسألة رياضية | دايماً |
| قرار استراتيجي | دايماً |
| تحليل نص | مفيد |
| ترجمة كلمة | مش محتاج |
| إجابة سريعة | مش محتاج |

---

## Magic Phrase 

> **"فكّر خطوة خطوة قبل ما تجاوب"**

الجملة دي وحدها بتحسن دقة Claude في المسائل المعقدة بنسبة كبيرة!`,

 contentEn: `## Chain of Thought Prompting

**Chain of Thought (CoT)** means asking Claude to show its thinking steps before reaching an answer.

---

## Why Does It Matter?

When Claude thinks step by step:
- Makes fewer mistakes on complex problems
- You can follow its reasoning and catch errors
- Answers become deeper and more detailed
- Very useful for math, logic, and decisions

---

## Method 1: "Think Step by Step"

Just add to the end of your request:

> "Think step by step"
> or "Explain your reasoning"

**Example:**
> "Ahmed has 24 apples. He ate a quarter of them and gave half of the rest to friends. How many are left? **Think step by step.**"

Claude will say:
1. 24 ÷ 4 = 6 apples eaten
2. Remaining = 24 - 6 = 18 apples
3. Half given away = 18 ÷ 2 = 9 apples
4. Remaining = 18 - 9 = **9 apples** 

---

## Method 2: Define the Steps

\`\`\`
Analyze this situation in 3 steps:
1. Identify the problem
2. Suggest solutions
3. Pick the best one

Situation: My company is losing customers due to slow service
\`\`\`

---

## When to Use CoT?

| Task | Use CoT? |
|---|---|
| Math problem | Always |
| Strategic decision | Always |
| Text analysis | Useful |
| Translating a word | Not needed |
| Quick answer | Not needed |

---

## Magic Phrase 

> **"Think step by step before answering"**

This phrase alone significantly improves Claude's accuracy on complex problems!`,

 quiz: [
 {
 id: 'q9-1',
 questionAr: 'إيه الهدف من Chain of Thought؟',
 questionEn: 'What is the goal of Chain of Thought?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'جعل Claude يشرح خطوات تفكيره', textEn: 'Making Claude explain its thinking steps', isCorrect: true },
 { id: 'o2', textAr: 'جعل الإجابة أقصر', textEn: 'Making the answer shorter', isCorrect: false },
 { id: 'o3', textAr: 'تقليل استهلاك الـ tokens', textEn: 'Reducing token usage', isCorrect: false },
 { id: 'o4', textAr: 'جعل Claude يكتب شعر', textEn: 'Making Claude write poetry', isCorrect: false },
 ],
 },
 {
 id: 'q9-2',
 questionAr: 'أنهي جملة بتفعّل Chain of Thought؟',
 questionEn: 'Which phrase activates Chain of Thought?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: '"فكّر خطوة خطوة"', textEn: '"Think step by step"', isCorrect: true },
 { id: 'o2', textAr: '"كن سريعاً"', textEn: '"Be fast"', isCorrect: false },
 { id: 'o3', textAr: '"رد باختصار"', textEn: '"Reply briefly"', isCorrect: false },
 { id: 'o4', textAr: '"اكتب كود"', textEn: '"Write code"', isCorrect: false },
 ],
 },
 {
 id: 'q9-3',
 questionAr: 'صح ولا غلط: CoT مفيد في ترجمة الكلمات البسيطة',
 questionEn: 'True or False: CoT is useful for translating simple words',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح', textEn: 'True', isCorrect: false },
 { id: 'o2', textAr: 'غلط — مش محتاجه في المهام البسيطة', textEn: 'False — not needed for simple tasks', isCorrect: true },
 ],
 },
 ],
 },

 {
 id: 10,
 slug: 'role-prompting',
 agentSlug: 'claude',
 titleAr: 'Role Prompting: العب دور',
 titleEn: 'Role Prompting: Play a Role',
 descriptionAr: 'بدّل شخصية Claude وشوف كيف تتغير الإجابات — تقنية قوية جداً.',
 descriptionEn: 'Change Claude\'s persona and watch how answers transform — a very powerful technique.',
 order: 10,
 xpReward: 80,
 estimatedMinutes: 9,
 contentAr: `## Role Prompting

الـ **Role Prompting** معناها إنك بتقول لـ Claude "تصرف كأنك [شخص معين]" قبل ما تطلب منه أي حاجة.

---

## ليه بتختلف الإجابة؟

Claude عنده معرفة واسعة جداً في مجالات مختلفة. لما بتحدد دور معين، بتوجّه ده المعرفة دي في اتجاه واحد.

**نفس السؤال، أدوار مختلفة:**

> "إيه رأيك في الذكاء الاصطناعي؟"

- **كـ دكتور**: سيتكلم عن التطبيقات الطبية والمخاوف الأخلاقية
- **كـ مدرس**: سيركز على التعليم وتأثيره على الطلاب
- **كـ مطوّر**: سيتكلم عن APIs والـ models والكود
- **كـ طفل عنده 10 سنين**: سيشرح بأمثلة بسيطة وممتعة

---

## فن كتابة الـ Role

\`\`\`
أنت [الدور] متخصص/ة في [المجال].
لهجتك [الأسلوب].
جمهورك [من هيقرأ].
\`\`\`

**مثال ممتاز:**
> "أنت مدرس رياضيات خبير بتحب تشرح بأمثلة من الحياة اليومية. لهجتك مبسطة ومشجعة. اشرح لي مفهوم الكسور لطالب في الصف الرابع الابتدائي."

---

## أمثلة تانية قوية

**محامي:**
> "أنت محامي متخصص في قانون العمل المصري. ساعدني أفهم حقوقي لو أتفصلت من شغلي من غير إنذار."

**مستشار مالي:**
> "أنت مستشار مالي محافظ بتفضل الاستثمار الآمن. أنا عندي 10,000 جنيه وعايز أستثمرها لمدة 3 سنين. إيه نصيحتك؟"

**صاحب شركة:**
> "أنت صاحب شركة ناشئة ناجح في مجال التكنولوجيا. راجع خطة العمل دي وقولي نقاط الضعف."

---

## تحذير مهم 

الـ Role بيأثر على **الأسلوب والتركيز**، مش على **الحقائق**. Claude لسه بيقدم معلومات دقيقة حتى لو بيلعب دور. مش بيكدب عشان "هو في الدور"!`,

 contentEn: `## Role Prompting

**Role Prompting** means telling Claude "act as [a specific person]" before making any request.

---

## Why Do Answers Change?

Claude has vast knowledge across many fields. When you specify a role, you focus that knowledge in one direction.

**Same question, different roles:**

> "What do you think about AI?"

- **As a doctor**: Will discuss medical applications and ethical concerns
- **As a teacher**: Will focus on education and impact on students
- **As a developer**: Will talk about APIs, models, and code
- **As a 10-year-old child**: Will explain with simple, fun examples

---

## The Art of Writing a Role

\`\`\`
You are a [role] specializing in [field].
Your tone is [style].
Your audience is [who will read this].
\`\`\`

**Great example:**
> "You are an expert math teacher who loves explaining with real-life examples. Your tone is simple and encouraging. Explain the concept of fractions to a 4th-grade student."

---

## More Powerful Examples

**Lawyer:**
> "You are a lawyer specializing in Egyptian labor law. Help me understand my rights if I'm fired without notice."

**Financial advisor:**
> "You are a conservative financial advisor who prefers safe investments. I have 10,000 EGP to invest for 3 years. What's your advice?"

**Entrepreneur:**
> "You are a successful tech startup founder. Review this business plan and tell me the weaknesses."

---

## Important Warning 

The role affects **style and focus**, not **facts**. Claude still provides accurate information even when playing a role. It doesn't lie because it's "in character"!`,

 quiz: [
 {
 id: 'q10-1',
 questionAr: 'إيه هو الـ Role Prompting؟',
 questionEn: 'What is Role Prompting?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'تحديد شخصية أو دور معين لـ Claude', textEn: 'Assigning Claude a specific persona or role', isCorrect: true },
 { id: 'o2', textAr: 'طلب من Claude يكتب مسرحية', textEn: 'Asking Claude to write a play', isCorrect: false },
 { id: 'o3', textAr: 'إعطاء Claude اسم جديد', textEn: 'Giving Claude a new name', isCorrect: false },
 { id: 'o4', textAr: 'تغيير لغة الإجابة', textEn: 'Changing the answer language', isCorrect: false },
 ],
 },
 {
 id: 'q10-2',
 questionAr: 'الـ Role بيأثر على؟',
 questionEn: 'The role affects?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'الأسلوب والتركيز فقط', textEn: 'Style and focus only', isCorrect: true },
 { id: 'o2', textAr: 'الحقائق والمعلومات', textEn: 'Facts and information', isCorrect: false },
 { id: 'o3', textAr: 'سرعة الإجابة', textEn: 'Answer speed', isCorrect: false },
 { id: 'o4', textAr: 'طول الإجابة دايماً', textEn: 'Answer length always', isCorrect: false },
 ],
 },
 {
 id: 'q10-3',
 questionAr: 'أنهي دور من الأمثلة دي الأنسب لسؤال عن الاستثمار؟',
 questionEn: 'Which role is most suitable for an investment question?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'مستشار مالي', textEn: 'Financial advisor', isCorrect: true },
 { id: 'o2', textAr: 'طباخ', textEn: 'Chef', isCorrect: false },
 { id: 'o3', textAr: 'رياضي محترف', textEn: 'Professional athlete', isCorrect: false },
 { id: 'o4', textAr: 'طفل', textEn: 'Child', isCorrect: false },
 ],
 },
 ],
 },

 {
 id: 11,
 slug: 'output-formatting',
 agentSlug: 'claude',
 titleAr: 'تنسيق الإجابة: شكّل الناتج',
 titleEn: 'Output Formatting: Shape the Output',
 descriptionAr: 'تعلّم إزاي تطلب إجابات بشكل محدد — JSON، جدول، نقط، وأكتر.',
 descriptionEn: 'Learn how to request answers in a specific format — JSON, tables, bullets, and more.',
 order: 11,
 xpReward: 85,
 estimatedMinutes: 10,
 contentAr: `## تنسيق الإجابة

من أهم مهارات الـ Prompting إنك تحدد **شكل الإجابة** اللي عايزها — مش بس المحتوى.

---

## التنسيقات الشائعة

### نقط (Bullet Points)
\`\`\`
اكتب فوائد ممارسة الرياضة في شكل نقط قصيرة
\`\`\`

### جدول
\`\`\`
قارن بين Python و JavaScript في جدول فيه: الاستخدام، السهولة، الراتب
\`\`\`

### قائمة مرقمة
\`\`\`
اكتب خطوات تعلم البرمجة من الصفر في 10 خطوات مرقمة
\`\`\`

### JSON
\`\`\`
أعطني معلومات عن مصر في شكل JSON فيه: الاسم، العاصمة، عدد السكان، اللغة
\`\`\`

### Markdown
\`\`\`
اكتب تقرير عن الذكاء الاصطناعي بعناوين وفقرات واضحة بصيغة Markdown
\`\`\`

---

## مثال عملي: نفس الطلب، تنسيقات مختلفة

**الطلب الأساسي:** "فوائد النوم الكافي"

**كنقط:**
> أكتب فوائد النوم في 5 نقط قصيرة

**كجدول:**
> أكتب فوائد النوم في جدول فيه: الفائدة والتفصيل

**كـ JSON:**
> أكتب فوائد النوم في JSON — كل عنصر فيه: title و description

---

## تحديد الطول

بتحدد طول الإجابة كمان:

| التعليمة | المعنى |
|---|---|
| "في جملة واحدة" | إجابة قصيرة جداً |
| "في 3 نقط" | محدود ومركّز |
| "في 200 كلمة" | متوسط |
| "بالتفصيل الممل" | طويل وشامل |

---

## نصيحة الـ Pro 

دمج التنسيق مع بقية التقنيات بيعطي نتائج ممتازة:

> "**أنت مستشار تسويق** (Role). حلّل منافسينا الثلاثة **خطوة خطوة** (CoT). النتيجة في **جدول** فيه: الاسم، نقاط القوة، نقاط الضعف، الفرصة." (Format)`,

 contentEn: `## Output Formatting

One of the most important prompting skills is specifying the **format** of the answer you want — not just the content.

---

## Common Formats

### Bullet Points
\`\`\`
Write the benefits of exercise in short bullet points
\`\`\`

### Table
\`\`\`
Compare Python and JavaScript in a table with: Use case, Ease, Salary
\`\`\`

### Numbered List
\`\`\`
Write 10 numbered steps to learn programming from scratch
\`\`\`

### JSON
\`\`\`
Give me information about Egypt in JSON format with: name, capital, population, language
\`\`\`

### Markdown
\`\`\`
Write a report on AI with clear headings and paragraphs in Markdown format
\`\`\`

---

## Practical Example: Same Request, Different Formats

**Base request:** "Benefits of enough sleep"

**As bullets:**
> Write the benefits of sleep in 5 short bullet points

**As table:**
> Write sleep benefits in a table with: Benefit and Detail

**As JSON:**
> Write sleep benefits in JSON — each item has: title and description

---

## Controlling Length

You can also control the length:

| Instruction | Meaning |
|---|---|
| "In one sentence" | Very short answer |
| "In 3 points" | Limited and focused |
| "In 200 words" | Medium length |
| "In full detail" | Long and comprehensive |

---

## Pro Tip 

Combining formatting with other techniques gives excellent results:

> "**You are a marketing consultant** (Role). Analyze our three competitors **step by step** (CoT). Result in a **table** with: Name, Strengths, Weaknesses, Opportunity." (Format)`,

 quiz: [
 {
 id: 'q11-1',
 questionAr: 'لو عايز Claude يرجع بيانات منظمة لبرنامج، أحسن تنسيق هو؟',
 questionEn: 'If you want Claude to return structured data for a program, the best format is?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'JSON', textEn: 'JSON', isCorrect: true },
 { id: 'o2', textAr: 'نثر حر', textEn: 'Free prose', isCorrect: false },
 { id: 'o3', textAr: 'شعر', textEn: 'Poetry', isCorrect: false },
 { id: 'o4', textAr: 'نقط فقط', textEn: 'Bullet points only', isCorrect: false },
 ],
 },
 {
 id: 'q11-2',
 questionAr: 'إزاي بتحدد طول الإجابة؟',
 questionEn: 'How do you control the answer length?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'بتحدد في الـ prompt: "في 3 نقط" أو "في 200 كلمة"', textEn: 'You specify in the prompt: "in 3 points" or "in 200 words"', isCorrect: true },
 { id: 'o2', textAr: 'Claude بيحدده وحده دايماً', textEn: 'Claude always decides it automatically', isCorrect: false },
 { id: 'o3', textAr: 'مفيش طريقة لتحديد الطول', textEn: 'There\'s no way to control length', isCorrect: false },
 { id: 'o4', textAr: 'بتستخدم كود خاص', textEn: 'You use special code', isCorrect: false },
 ],
 },
 {
 id: 'q11-3',
 questionAr: 'صح ولا غلط: ممكن تدمج تنسيق الإجابة مع Role Prompting في نفس الـ Prompt',
 questionEn: 'True or False: You can combine output formatting with Role Prompting in the same prompt',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح', textEn: 'True', isCorrect: true },
 { id: 'o2', textAr: 'غلط', textEn: 'False', isCorrect: false },
 ],
 },
 ],
 },

 {
 id: 12,
 slug: 'system-prompt',
 agentSlug: 'claude',
 titleAr: 'System Prompt: البرمجة الخفية',
 titleEn: 'System Prompt: The Hidden Programming',
 descriptionAr: 'اكتشف الـ System Prompt — الكود اللي بيحدد شخصية الـ AI قبل ما تكلمه.',
 descriptionEn: 'Discover the System Prompt — the code that defines AI\'s personality before you talk to it.',
 order: 12,
 xpReward: 90,
 estimatedMinutes: 11,
 contentAr: `## الـ System Prompt

الـ **System Prompt** هو تعليمات مخفية بتتبعث لـ Claude **قبل** ما تبدأ المحادثة. المستخدم مش شايفها، بس Claude بيطبقها طول الوقت.

---

## إزاي بيشتغل؟

\`\`\`
[System Prompt — المستخدم مش شايفه]
أنت مساعد تعليمي اسمه "ذكاوي".
بتتكلم بعامية مصرية بسيطة.
جمهورك أطفال من 8 إلى 14 سنة.
لا تذكر أي محتوى غير مناسب أبداً.

[المستخدم بيكتب]
إيه هو الذكاء الاصطناعي؟

[Claude بيرد بناءً على التعليمات]
الذكاء الاصطناعي ده برامج كمبيوتر...
\`\`\`

---

## ليه مهم للمطورين؟

لو بتبني تطبيق بـ Claude API، الـ System Prompt هو اللي:
- بيحدد شخصية الـ AI (اسمه، أسلوبه)
- بيحدد القواعد (إيه اللي يعمله وإيه اللي ميعملوش)
- بيحدد السياق (إيه المنتج، مين المستخدمين)
- بيحدد الحدود (لا تتكلم في السياسة، الدين، إلخ)

---

## مثال System Prompt لـ تطبيق

\`\`\`
أنت "Sakko"، مساعد ذكاء اصطناعي لمطعم "Sakko's Pizza".
مهمتك:
1. مساعدة العملاء في الطلب
2. الإجابة على أسئلة القائمة
3. قبول طلبات التوصيل

القائمة: مارغريتا 80ج، بيبروني 95ج، خضار 85ج

لا تتكلم في أي موضوع غير المطعم والطلبات.
لو سألك عن حاجة تانية، قول: "أنا متخصص في خدمة مطعم Sakko فقط!"
لهجتك ودودة ومبتهجة دايماً 
\`\`\`

---

## الـ System Prompt مقابل الـ User Prompt

| | System Prompt | User Prompt |
|---|---|---|
| **من بيكتبه** | المطوّر | المستخدم |
| **شايفه المستخدم؟** | لا (مخفي) | نعم |
| **بيتغير؟** | نادراً | كل رسالة |
| **وظيفته** | تحديد السلوك | طرح الأسئلة |

---

## جرّبه دلوقتي في Sandbox! 

افتح الـ Sandbox في المنصة واكتب:
> "تصرف كأنك مساعد مختص في الطبخ المصري فقط، وردّ على كل سؤال بطريقة شيف محترف"

وبعدين اسأله أي سؤال تاني مش عن الطبخ — هتشوف كيف بيحافظ على الشخصية!`,

 contentEn: `## The System Prompt

The **System Prompt** is a hidden set of instructions sent to Claude **before** the conversation starts. The user doesn't see it, but Claude follows it throughout the entire conversation.

---

## How Does It Work?

\`\`\`
[System Prompt — user doesn't see this]
You are an educational assistant named "Zkawi".
You speak in simple Egyptian Arabic.
Your audience is children aged 8 to 14.
Never mention any inappropriate content.

[User writes]
What is artificial intelligence?

[Claude replies based on the instructions]
Artificial intelligence is computer programs...
\`\`\`

---

## Why Is It Important for Developers?

If you're building an app with the Claude API, the System Prompt is what:
- Defines the AI's persona (name, style)
- Sets the rules (what to do and what not to do)
- Defines context (what's the product, who are the users)
- Sets boundaries (no politics, religion, etc.)

---

## Example System Prompt for an App

\`\`\`
You are "Sakko," an AI assistant for "Sakko's Pizza" restaurant.
Your job:
1. Help customers with orders
2. Answer menu questions
3. Accept delivery orders

Menu: Margherita $8, Pepperoni $10, Veggie $9

Do not discuss any topic other than the restaurant and orders.
If asked about something else, say: "I specialize in Sakko's restaurant service only!"
Your tone is always friendly and cheerful 
\`\`\`

---

## System Prompt vs User Prompt

| | System Prompt | User Prompt |
|---|---|---|
| **Who writes it** | Developer | User |
| **Visible to user?** | No (hidden) | Yes |
| **Does it change?** | Rarely | Every message |
| **Purpose** | Define behavior | Ask questions |

---

## Try It Now in Sandbox! 

Open the Sandbox on the platform and write:
> "Act as an assistant specialized only in Egyptian cooking, and respond to every question like a professional chef"

Then ask it a question about something else — watch how it maintains the persona!`,

 quiz: [
 {
 id: 'q12-1',
 questionAr: 'مين اللي بيكتب الـ System Prompt عادةً؟',
 questionEn: 'Who usually writes the System Prompt?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'المطوّر أو صاحب التطبيق', textEn: 'The developer or app owner', isCorrect: true },
 { id: 'o2', textAr: 'المستخدم العادي', textEn: 'The regular user', isCorrect: false },
 { id: 'o3', textAr: 'Claude نفسه', textEn: 'Claude itself', isCorrect: false },
 { id: 'o4', textAr: 'شركة Anthropic بس', textEn: 'Anthropic only', isCorrect: false },
 ],
 },
 {
 id: 'q12-2',
 questionAr: 'هل المستخدم بيشوف الـ System Prompt؟',
 questionEn: 'Does the user see the System Prompt?',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'أيوه دايماً', textEn: 'Yes always', isCorrect: false },
 { id: 'o2', textAr: 'لا، بيكون مخفي', textEn: 'No, it\'s hidden', isCorrect: true },
 ],
 },
 {
 id: 'q12-3',
 questionAr: 'الـ System Prompt بيُستخدم في؟',
 questionEn: 'The System Prompt is used for?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'تحديد شخصية وقواعد الـ AI في التطبيق', textEn: 'Defining the AI\'s persona and rules in the app', isCorrect: true },
 { id: 'o2', textAr: 'سرعة الإجابات', textEn: 'Speeding up responses', isCorrect: false },
 { id: 'o3', textAr: 'تخفيض تكلفة الـ API', textEn: 'Reducing API costs', isCorrect: false },
 { id: 'o4', textAr: 'إنشاء صور', textEn: 'Generating images', isCorrect: false },
 ],
 },
 ],
 },

 {
 id: 13,
 slug: 'prompt-engineering-review',
 agentSlug: 'claude',
 titleAr: 'مراجعة: دمج التقنيات',
 titleEn: 'Review: Combining Techniques',
 descriptionAr: 'دمّج كل التقنيات اللي اتعلمتها وابني prompts احترافية.',
 descriptionEn: 'Combine all the techniques you\'ve learned and build professional prompts.',
 order: 13,
 xpReward: 100,
 estimatedMinutes: 12,
 contentAr: `## دمج التقنيات — المستوى الاحترافي

وصلت للدرس الأخير في Prompt Engineering! جه الوقت تدمج كل حاجة اتعلمتها.

---

## الـ 5 تقنيات في لمحة

| التقنية | الجوهر | متى؟ |
|---|---|---|
| **Zero-shot** | اسأل مباشرة | مهام واضحة وبسيطة |
| **Few-shot** | دي أمثلة + اطلب | مهام محتاجة نمط |
| **Chain of Thought** | فكّر خطوة خطوة | مسائل معقدة |
| **Role Prompting** | أنت خبير في X | محتوى متخصص |
| **Output Format** | رد في شكل Y | عرض منظم |

---

## الـ Prompt الاحترافي = دمج التقنيات

\`\`\`
[Role] أنت محلل أعمال خبير بـ 10 سنين خبرة.

[Context] لدي شركة ناشئة في مجال التعليم الإلكتروني.
معنا 500 مستخدم ومش بنقدر نحافظ عليهم.

[CoT] حلّل الموقف في 3 خطوات:
1. حدد أسباب الفقد المحتملة
2. اقترح 3 حلول عملية
3. رتّبهم حسب الأهمية

[Format] الإجابة في جدول فيه: الخطوة، التفاصيل، الأولوية
\`\`\`

---

## تمرين: صلّح الـ Prompts دي

**الأصلي:** "اكتب إعلان"

**المحسّن:**
> أنت كاتب إعلانات محترف متخصص في السوشيال ميديا العربي. اكتب إعلان لمنتج [X] لجمهور [Y]. الطول: 3 جمل. اللهجة: ودودة وجذابة. ضمّن call-to-action في الآخر.

---

**الأصلي:** "حلّ المسألة دي"

**المحسّن:**
> فكّر خطوة خطوة في المسألة دي وبيّن حساباتك بوضوح: [المسألة]

---

## الأخطاء الشائعة

 **Prompt غامض** → كن دقيق ومحدد
 **سياق ناقص** → اديه كل المعلومات المهمة
 **تنسيق مش محدد** → قول عايز الإجابة إزاي
 **كل تقنية لوحدها** → ادمجهم مع بعض

---

## مبروك!

خلصت **Prompt Engineering track** كامل! دلوقتي عندك:

- Zero-shot Prompting
- Few-shot Prompting
- Chain of Thought
- Role Prompting
- Output Formatting
- System Prompt
- دمج التقنيات

جرّب كل اللي اتعلمته في **الـ Sandbox** واكتشف قوتك الحقيقية! `,

 contentEn: `## Combining Techniques — Professional Level

You've reached the last lesson in Prompt Engineering! Time to combine everything you've learned.

---

## The 5 Techniques at a Glance

| Technique | Core | When? |
|---|---|---|
| **Zero-shot** | Ask directly | Clear, simple tasks |
| **Few-shot** | Give examples + ask | Tasks needing a pattern |
| **Chain of Thought** | Think step by step | Complex problems |
| **Role Prompting** | You are an expert in X | Specialized content |
| **Output Format** | Reply in format Y | Organized display |

---

## The Professional Prompt = Combining Techniques

\`\`\`
[Role] You are a business analyst with 10 years of experience.

[Context] I have an ed-tech startup.
We have 500 users and can't retain them.

[CoT] Analyze the situation in 3 steps:
1. Identify potential churn causes
2. Suggest 3 practical solutions
3. Rank them by importance

[Format] Answer in a table with: Step, Details, Priority
\`\`\`

---

## Exercise: Fix These Prompts

**Original:** "Write an ad"

**Improved:**
> You are a professional copywriter specializing in Arabic social media. Write an ad for product [X] targeting audience [Y]. Length: 3 sentences. Tone: friendly and catchy. Include a call-to-action at the end.

---

**Original:** "Solve this problem"

**Improved:**
> Think step by step through this problem and show your calculations clearly: [problem]

---

## Common Mistakes

 **Vague prompt** → Be precise and specific
 **Missing context** → Give all important information
 **Unspecified format** → Say how you want the answer
 **Each technique alone** → Combine them together

---

## Congratulations!

You've completed the full **Prompt Engineering track**! You now have:

- Zero-shot Prompting
- Few-shot Prompting
- Chain of Thought
- Role Prompting
- Output Formatting
- System Prompt
- Combining Techniques

Try everything you've learned in the **Sandbox** and discover your true power! `,

 quiz: [
 {
 id: 'q13-1',
 questionAr: 'الـ Prompt الاحترافي بيدمج؟',
 questionEn: 'A professional prompt combines?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'أكتر من تقنية مع بعض', textEn: 'Multiple techniques together', isCorrect: true },
 { id: 'o2', textAr: 'تقنية واحدة فقط', textEn: 'Only one technique', isCorrect: false },
 { id: 'o3', textAr: 'لا تقنيات خالص', textEn: 'No techniques at all', isCorrect: false },
 { id: 'o4', textAr: 'أطول prompt ممكن', textEn: 'The longest prompt possible', isCorrect: false },
 ],
 },
 {
 id: 'q13-2',
 questionAr: 'من الأخطاء الشائعة في كتابة الـ Prompts؟',
 questionEn: 'Which is a common mistake in writing prompts?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'سياق ناقص + تنسيق مش محدد', textEn: 'Missing context + unspecified format', isCorrect: true },
 { id: 'o2', textAr: 'استخدام Role Prompting', textEn: 'Using Role Prompting', isCorrect: false },
 { id: 'o3', textAr: 'طلب إجابة منظمة', textEn: 'Requesting a structured answer', isCorrect: false },
 { id: 'o4', textAr: 'تحديد الجمهور المستهدف', textEn: 'Specifying the target audience', isCorrect: false },
 ],
 },
 {
 id: 'q13-3',
 questionAr: 'صح ولا غلط: تعلمت في الـ track ده Zero-shot, Few-shot, CoT, Role, Format, و System Prompt',
 questionEn: 'True or False: In this track you learned Zero-shot, Few-shot, CoT, Role, Format, and System Prompt',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح ', textEn: 'True ', isCorrect: true },
 { id: 'o2', textAr: 'غلط', textEn: 'False', isCorrect: false },
 ],
 },
 ],
 },
];

export const claudeApiLessons: Lesson[] = [
 {
 id: 14,
 slug: 'claude-api-intro',
 agentSlug: 'claude',
 titleAr: 'Claude API — المقدمة',
 titleEn: 'Claude API — Introduction',
 descriptionAr: 'ابدأ رحلتك كمطور مع Claude API — المفتاح، الـ SDK، وأول request.',
 descriptionEn: 'Start your developer journey with Claude API — the key, SDK, and first request.',
 order: 14,
 xpReward: 90,
 estimatedMinutes: 10,
 contentAr: `## Claude API — المقدمة

الـ **Claude API** هو الطريقة اللي بتخلي برنامجك يتكلم مع Claude مباشرة — من غير ما تفتح متصفح أو تكتب يدوياً.

---

## إيه اللي هتعمله؟

\`\`\`
برنامجك → Claude API → Claude → الرد
\`\`\`

بدل ما تفتح claude.ai وتكتب بإيدك، برنامجك بيبعت الطلب ويستقبل الرد تلقائياً.

---

## المتطلبات

### 1. مفتاح API
- روح على [console.anthropic.com](https://console.anthropic.com)
- أنشئ حساب واطلع على الـ API Key
- يبدأ بـ \`sk-ant-...\`
- **متشاركوش المفتاح ده مع حد أبداً**

### 2. تثبيت الـ SDK

**Python:**
\`\`\`bash
pip install anthropic
\`\`\`

**JavaScript/TypeScript:**
\`\`\`bash
npm install @anthropic-ai/sdk
\`\`\`

---

## أول Request

**Python:**
\`\`\`python
import anthropic

client = anthropic.Anthropic(api_key="sk-ant-...")

message = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=1024,
 messages=[
 {"role": "user", "content": "مرحبا يا Claude!"}
 ]
)

print(message.content[0].text)
\`\`\`

**JavaScript:**
\`\`\`javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: 'sk-ant-...' });

const message = await client.messages.create({
 model: 'claude-opus-4-7',
 max_tokens: 1024,
 messages: [{ role: 'user', content: 'مرحبا يا Claude!' }],
});

console.log(message.content[0].text);
\`\`\`

---

## المعاملات الأساسية

| المعامل | الوظيفة | مثال |
|---|---|---|
| \`model\` | أي نموذج تستخدم | \`"claude-opus-4-7"\` |
| \`max_tokens\` | أقصى طول للرد | \`1024\` |
| \`messages\` | تاريخ المحادثة | \`[{role, content}]\` |
| \`system\` | System Prompt | \`"أنت مساعد..."\` |

---

## نصيحة الأمان 

**مش تحط المفتاح في الكود مباشرة!**

\`\`\`python
# غلط
client = anthropic.Anthropic(api_key="sk-ant-abc123")

# صح — استخدم متغير بيئة
import os
client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
\`\`\``,

 contentEn: `## Claude API — Introduction

The **Claude API** lets your program talk to Claude directly — without opening a browser or typing manually.

---

## What Will You Do?

\`\`\`
Your app → Claude API → Claude → Response
\`\`\`

Instead of opening claude.ai and typing by hand, your program sends the request and receives the response automatically.

---

## Requirements

### 1. API Key
- Go to [console.anthropic.com](https://console.anthropic.com)
- Create an account and generate an API Key
- Starts with \`sk-ant-...\`
- **Never share this key with anyone**

### 2. Install the SDK

**Python:**
\`\`\`bash
pip install anthropic
\`\`\`

**JavaScript/TypeScript:**
\`\`\`bash
npm install @anthropic-ai/sdk
\`\`\`

---

## First Request

**Python:**
\`\`\`python
import anthropic

client = anthropic.Anthropic(api_key="sk-ant-...")

message = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=1024,
 messages=[
 {"role": "user", "content": "Hello Claude!"}
 ]
)

print(message.content[0].text)
\`\`\`

**JavaScript:**
\`\`\`javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: 'sk-ant-...' });

const message = await client.messages.create({
 model: 'claude-opus-4-7',
 max_tokens: 1024,
 messages: [{ role: 'user', content: 'Hello Claude!' }],
});

console.log(message.content[0].text);
\`\`\`

---

## Core Parameters

| Parameter | Purpose | Example |
|---|---|---|
| \`model\` | Which model to use | \`"claude-opus-4-7"\` |
| \`max_tokens\` | Max response length | \`1024\` |
| \`messages\` | Conversation history | \`[{role, content}]\` |
| \`system\` | System prompt | \`"You are..."\` |

---

## Security Tip 

**Don't put the key directly in code!**

\`\`\`python
# Wrong
client = anthropic.Anthropic(api_key="sk-ant-abc123")

# Right — use environment variable
import os
client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
\`\`\``,

 quiz: [
 {
 id: 'q14-1',
 questionAr: 'الـ Claude API بيعمل إيه؟',
 questionEn: 'What does the Claude API do?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'بيخلي برامجك تتواصل مع Claude مباشرة', textEn: 'Lets your programs communicate with Claude directly', isCorrect: true },
 { id: 'o2', textAr: 'بيفتح متصفح ويكتب تلقائياً', textEn: 'Opens a browser and types automatically', isCorrect: false },
 { id: 'o3', textAr: 'بيتيح تحميل Claude على جهازك', textEn: 'Allows downloading Claude to your device', isCorrect: false },
 { id: 'o4', textAr: 'بيعمل ترجمة فقط', textEn: 'Only does translation', isCorrect: false },
 ],
 },
 {
 id: 'q14-2',
 questionAr: 'الطريقة الصح لحفظ الـ API Key في الكود؟',
 questionEn: 'The correct way to store the API Key in code?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'متغير بيئة (Environment Variable)', textEn: 'Environment Variable', isCorrect: true },
 { id: 'o2', textAr: 'مباشرة في الكود كـ string', textEn: 'Directly in code as a string', isCorrect: false },
 { id: 'o3', textAr: 'في ملف README', textEn: 'In a README file', isCorrect: false },
 { id: 'o4', textAr: 'في اسم الـ variable', textEn: 'In the variable name', isCorrect: false },
 ],
 },
 {
 id: 'q14-3',
 questionAr: 'الـ max_tokens بيتحكم في؟',
 questionEn: 'max_tokens controls?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'أقصى طول للرد', textEn: 'Maximum length of the response', isCorrect: true },
 { id: 'o2', textAr: 'سرعة الاستجابة', textEn: 'Response speed', isCorrect: false },
 { id: 'o3', textAr: 'عدد الطلبات في اليوم', textEn: 'Number of requests per day', isCorrect: false },
 { id: 'o4', textAr: 'سعر الطلب', textEn: 'Request price', isCorrect: false },
 ],
 },
 ],
 },

 {
 id: 15,
 slug: 'messages-api',
 agentSlug: 'claude',
 titleAr: 'Messages API — المحادثة',
 titleEn: 'Messages API — Conversation',
 descriptionAr: 'إزاي تبني محادثة متعددة الأدوار مع Claude في كودك.',
 descriptionEn: 'How to build a multi-turn conversation with Claude in your code.',
 order: 15,
 xpReward: 90,
 estimatedMinutes: 11,
 contentAr: `## Messages API

الـ **Messages API** هو القلب النابض لـ Claude API. كل طلب بتبعته بيكون على شكل قائمة رسائل بـ \`role\` و \`content\`.

---

## هيكل الرسائل

\`\`\`python
messages = [
 {"role": "user", "content": "مرحبا"},
 {"role": "assistant", "content": "أهلاً! كيف أساعدك؟"},
 {"role": "user", "content": "عايز أتعلم Python"},
]
\`\`\`

**الـ roles المتاحة:**
- \`"user"\` — رسائل المستخدم
- \`"assistant"\` — ردود Claude

---

## محادثة متعددة الأدوار

عشان Claude يتذكر المحادثة السابقة، بتبعت **كل التاريخ** في كل request:

\`\`\`python
import anthropic

client = anthropic.Anthropic()
conversation = []

def chat(user_message):
 conversation.append({
 "role": "user",
 "content": user_message
 })

 response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=1024,
 messages=conversation
 )

 assistant_reply = response.content[0].text
 conversation.append({
 "role": "assistant",
 "content": assistant_reply
 })

 return assistant_reply

# استخدام
print(chat("اسمي أحمد"))
print(chat("إيه اسمي؟")) # هيقول: اسمك أحمد 
\`\`\`

---

## بنية الـ Response

\`\`\`python
response = client.messages.create(...)

# النص الرئيسي
text = response.content[0].text

# معلومات الاستخدام
print(response.usage.input_tokens) # tokens الـ input
print(response.usage.output_tokens) # tokens الـ output

# سبب التوقف
print(response.stop_reason) # "end_turn" أو "max_tokens"
\`\`\`

---

## Content Blocks

الـ \`content\` ممكن يكون أكتر من نص:

\`\`\`python
# رسالة فيها نص وصورة
messages = [{
 "role": "user",
 "content": [
 {"type": "text", "text": "إيه اللي في الصورة دي؟"},
 {
 "type": "image",
 "source": {
 "type": "base64",
 "media_type": "image/jpeg",
 "data": "<base64_data>"
 }
 }
 ]
}]
\`\`\`

---

## حدود مهمة 

| النموذج | Context Window |
|---|---|
| claude-opus-4-7 | 1M token |
| claude-haiku-4-5 | 200K token |

لو المحادثة طويلة جداً، بتحتاج تعمل تلخيص أو truncation للرسائل القديمة.`,

 contentEn: `## Messages API

The **Messages API** is the core of Claude API. Every request you send is a list of messages with \`role\` and \`content\`.

---

## Message Structure

\`\`\`python
messages = [
 {"role": "user", "content": "Hello"},
 {"role": "assistant", "content": "Hi! How can I help?"},
 {"role": "user", "content": "I want to learn Python"},
]
\`\`\`

**Available roles:**
- \`"user"\` — user messages
- \`"assistant"\` — Claude's replies

---

## Multi-turn Conversation

For Claude to remember previous conversation, you send **the entire history** in every request:

\`\`\`python
import anthropic

client = anthropic.Anthropic()
conversation = []

def chat(user_message):
 conversation.append({
 "role": "user",
 "content": user_message
 })

 response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=1024,
 messages=conversation
 )

 assistant_reply = response.content[0].text
 conversation.append({
 "role": "assistant",
 "content": assistant_reply
 })

 return assistant_reply

# Usage
print(chat("My name is Ahmed"))
print(chat("What's my name?")) # Will say: Your name is Ahmed 
\`\`\`

---

## Response Structure

\`\`\`python
response = client.messages.create(...)

# Main text
text = response.content[0].text

# Usage info
print(response.usage.input_tokens) # input tokens
print(response.usage.output_tokens) # output tokens

# Stop reason
print(response.stop_reason) # "end_turn" or "max_tokens"
\`\`\`

---

## Content Blocks

\`content\` can be more than just text:

\`\`\`python
# Message with text and image
messages = [{
 "role": "user",
 "content": [
 {"type": "text", "text": "What's in this image?"},
 {
 "type": "image",
 "source": {
 "type": "base64",
 "media_type": "image/jpeg",
 "data": "<base64_data>"
 }
 }
 ]
}]
\`\`\`

---

## Important Limits 

| Model | Context Window |
|---|---|
| claude-opus-4-7 | 1M tokens |
| claude-haiku-4-5 | 200K tokens |

If the conversation gets too long, you'll need to summarize or truncate old messages.`,

 quiz: [
 {
 id: 'q15-1',
 questionAr: 'ليه بنبعت كل تاريخ المحادثة في كل request؟',
 questionEn: 'Why do we send the entire conversation history in every request?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'عشان Claude مش بيحتفظ بذاكرة بين الـ requests', textEn: 'Because Claude has no memory between requests', isCorrect: true },
 { id: 'o2', textAr: 'عشان ده أسرع', textEn: 'Because it\'s faster', isCorrect: false },
 { id: 'o3', textAr: 'متطلب من الـ API مش مهم', textEn: 'An API requirement that doesn\'t matter', isCorrect: false },
 { id: 'o4', textAr: 'عشان نوفر tokens', textEn: 'To save tokens', isCorrect: false },
 ],
 },
 {
 id: 'q15-2',
 questionAr: 'الـ stop_reason بيوضح؟',
 questionEn: 'The stop_reason indicates?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'ليه Claude وقف الرد', textEn: 'Why Claude stopped the response', isCorrect: true },
 { id: 'o2', textAr: 'سرعة الرد', textEn: 'Response speed', isCorrect: false },
 { id: 'o3', textAr: 'عدد الأخطاء', textEn: 'Number of errors', isCorrect: false },
 { id: 'o4', textAr: 'حجم الملف', textEn: 'File size', isCorrect: false },
 ],
 },
 {
 id: 'q15-3',
 questionAr: 'صح ولا غلط: الـ content في الرسالة ممكن يحتوي على صورة ونص معاً',
 questionEn: 'True or False: The content in a message can contain both image and text',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح', textEn: 'True', isCorrect: true },
 { id: 'o2', textAr: 'غلط', textEn: 'False', isCorrect: false },
 ],
 },
 ],
 },

 {
 id: 16,
 slug: 'streaming-api',
 agentSlug: 'claude',
 titleAr: 'Streaming — الرد الفوري',
 titleEn: 'Streaming — Real-time Response',
 descriptionAr: 'اعمل تجربة ChatGPT في تطبيقك — الكلام يظهر كلمة كلمة.',
 descriptionEn: 'Build a ChatGPT-like experience in your app — words appear one by one.',
 order: 16,
 xpReward: 95,
 estimatedMinutes: 11,
 contentAr: `## Streaming

الـ **Streaming** بيخلي الرد يظهر تدريجياً — كلمة كلمة — بدل ما تستنى الرد كله قبل ما يظهر.

---

## ليه Streaming؟

| بدون Streaming | مع Streaming |
|---|---|
| تستنى 5-10 ثواني | أول كلمة تظهر في < 1 ثانية |
| صفحة فاضية | المستخدم بيشوف الرد فوراً |
| تجربة سيئة | تجربة ممتازة |

---

## Python — Streaming

\`\`\`python
import anthropic

client = anthropic.Anthropic()

with client.messages.stream(
 model="claude-opus-4-7",
 max_tokens=1024,
 messages=[{"role": "user", "content": "اكتب قصيدة عن النيل"}]
) as stream:
 for text in stream.text_stream:
 print(text, end="", flush=True)

print() # سطر جديد في الآخر
\`\`\`

---

## JavaScript — Streaming

\`\`\`javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const stream = await client.messages.create({
 model: 'claude-opus-4-7',
 max_tokens: 1024,
 messages: [{ role: 'user', content: 'اكتب قصيدة عن النيل' }],
 stream: true,
});

for await (const event of stream) {
 if (event.type === 'content_block_delta') {
 process.stdout.write(event.delta.text);
 }
}
\`\`\`

---

## الـ Events في الـ Stream

\`\`\`
message_start → بداية الرسالة (فيها usage معلومات)
content_block_start → بداية block جديد
content_block_delta → جزء جديد من النص ← هنا بتطبع
content_block_stop → نهاية الـ block
message_delta → تحديث على مستوى الرسالة
message_stop → انتهى كل شيء
\`\`\`

---

## في الـ Web (Next.js/React)

\`\`\`typescript
// API Route
export async function POST(req: Request) {
 const { message } = await req.json();

 const stream = new ReadableStream({
 async start(controller) {
 const response = await anthropic.messages.create({
 model: 'claude-opus-4-7',
 max_tokens: 1024,
 messages: [{ role: 'user', content: message }],
 stream: true,
 });

 for await (const event of response) {
 if (event.type === 'content_block_delta') {
 controller.enqueue(
 new TextEncoder().encode(event.delta.text)
 );
 }
 }
 controller.close();
 },
 });

 return new Response(stream);
}
\`\`\`

---

## نصيحة الـ UX 

دايماً استخدم Streaming في تطبيقاتك — المستخدمين بيكرهوا الانتظار. حتى لو الرد بطيء، لما يشوف الكلمات بتتكتب، بيحس إن الـ app سريع!`,

 contentEn: `## Streaming

**Streaming** makes the response appear progressively — word by word — instead of waiting for the entire response before it shows.

---

## Why Streaming?

| Without Streaming | With Streaming |
|---|---|
| Wait 5-10 seconds | First word appears in < 1 second |
| Blank page | User sees response immediately |
| Bad experience | Excellent experience |

---

## Python — Streaming

\`\`\`python
import anthropic

client = anthropic.Anthropic()

with client.messages.stream(
 model="claude-opus-4-7",
 max_tokens=1024,
 messages=[{"role": "user", "content": "Write a poem about the Nile"}]
) as stream:
 for text in stream.text_stream:
 print(text, end="", flush=True)

print() # newline at the end
\`\`\`

---

## JavaScript — Streaming

\`\`\`javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const stream = await client.messages.create({
 model: 'claude-opus-4-7',
 max_tokens: 1024,
 messages: [{ role: 'user', content: 'Write a poem about the Nile' }],
 stream: true,
});

for await (const event of stream) {
 if (event.type === 'content_block_delta') {
 process.stdout.write(event.delta.text);
 }
}
\`\`\`

---

## Events in the Stream

\`\`\`
message_start → Message started (has usage info)
content_block_start → New block started
content_block_delta → New chunk of text ← print here
content_block_stop → Block ended
message_delta → Message-level update
message_stop → Everything done
\`\`\`

---

## In the Web (Next.js/React)

\`\`\`typescript
// API Route
export async function POST(req: Request) {
 const { message } = await req.json();

 const stream = new ReadableStream({
 async start(controller) {
 const response = await anthropic.messages.create({
 model: 'claude-opus-4-7',
 max_tokens: 1024,
 messages: [{ role: 'user', content: message }],
 stream: true,
 });

 for await (const event of response) {
 if (event.type === 'content_block_delta') {
 controller.enqueue(
 new TextEncoder().encode(event.delta.text)
 );
 }
 }
 controller.close();
 },
 });

 return new Response(stream);
}
\`\`\`

---

## UX Tip 

Always use Streaming in your apps — users hate waiting. Even if the response is slow, seeing words appearing makes the app feel fast!`,

 quiz: [
 {
 id: 'q16-1',
 questionAr: 'الميزة الرئيسية للـ Streaming؟',
 questionEn: 'The main benefit of Streaming?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'الرد يظهر تدريجياً فوراً بدل الانتظار', textEn: 'Response appears progressively instead of waiting', isCorrect: true },
 { id: 'o2', textAr: 'يوفر تكلفة الـ API', textEn: 'Saves API cost', isCorrect: false },
 { id: 'o3', textAr: 'يجعل Claude أذكى', textEn: 'Makes Claude smarter', isCorrect: false },
 { id: 'o4', textAr: 'يزيد عدد الـ tokens', textEn: 'Increases token count', isCorrect: false },
 ],
 },
 {
 id: 'q16-2',
 questionAr: 'أنهي event فيه النص الجديد في الـ Stream؟',
 questionEn: 'Which event contains the new text in the Stream?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'content_block_delta', textEn: 'content_block_delta', isCorrect: true },
 { id: 'o2', textAr: 'message_start', textEn: 'message_start', isCorrect: false },
 { id: 'o3', textAr: 'message_stop', textEn: 'message_stop', isCorrect: false },
 { id: 'o4', textAr: 'content_block_stop', textEn: 'content_block_stop', isCorrect: false },
 ],
 },
 {
 id: 'q16-3',
 questionAr: 'صح ولا غلط: Streaming بيغير جودة الرد',
 questionEn: 'True or False: Streaming changes the quality of the response',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح', textEn: 'True', isCorrect: false },
 { id: 'o2', textAr: 'غلط — بس طريقة التسليم اللي بتتغير', textEn: 'False — only the delivery method changes', isCorrect: true },
 ],
 },
 ],
 },

 {
 id: 17,
 slug: 'tool-use',
 agentSlug: 'claude',
 titleAr: 'Tool Use — اديه أدوات',
 titleEn: 'Tool Use — Give It Tools',
 descriptionAr: 'اربط Claude بدوال في كودك — كالك يجيب بيانات حقيقية.',
 descriptionEn: 'Connect Claude to functions in your code — let it fetch real data.',
 order: 17,
 xpReward: 100,
 estimatedMinutes: 13,
 contentAr: `## Tool Use

الـ **Tool Use** (أو Function Calling) بيخلي Claude يطلب من برنامجك ينفذ دالة معينة ويرجعله النتيجة.

---

## فكرة بسيطة

\`\`\`
المستخدم: "إيه درجة الحرارة دلوقتي في القاهرة؟"

Claude: لا أعرف — بس ممكن أطلب من البرنامج

البرنامج: [يستدعي get_weather("القاهرة")]

الـ API: درجة الحرارة 28°C

Claude: "درجة الحرارة دلوقتي في القاهرة 28°C "
\`\`\`

---

## تعريف الـ Tool

\`\`\`python
tools = [
 {
 "name": "get_weather",
 "description": "يجيب الطقس الحالي لمدينة معينة",
 "input_schema": {
 "type": "object",
 "properties": {
 "city": {
 "type": "string",
 "description": "اسم المدينة"
 }
 },
 "required": ["city"]
 }
 }
]
\`\`\`

---

## الـ Loop الكامل

\`\`\`python
import anthropic, json

client = anthropic.Anthropic()

def get_weather(city: str) -> str:
 # في الحقيقة هتستدعي API حقيقي
 return f"درجة الحرارة في {city}: 28°C "

messages = [{"role": "user", "content": "إيه الطقس في القاهرة؟"}]

while True:
 response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=1024,
 tools=tools,
 messages=messages
 )

 # لو Claude طلب tool
 if response.stop_reason == "tool_use":
 tool_call = next(b for b in response.content if b.type == "tool_use")

 # نفذ الـ function
 result = get_weather(**tool_call.input)

 # أضف النتيجة للمحادثة
 messages.append({"role": "assistant", "content": response.content})
 messages.append({
 "role": "user",
 "content": [{
 "type": "tool_result",
 "tool_use_id": tool_call.id,
 "content": result
 }]
 })
 else:
 # Claude وصل للإجابة النهائية
 print(response.content[0].text)
 break
\`\`\`

---

## أمثلة على Tools مفيدة

| Tool | الوظيفة |
|---|---|
| \`search_web\` | البحث في الإنترنت |
| \`get_current_time\` | الوقت الحالي |
| \`query_database\` | استعلام من DB |
| \`send_email\` | إرسال إيميل |
| \`create_file\` | إنشاء ملف |
| \`calculate\` | حسابات دقيقة |

---

## متى تستخدم Tool Use؟

 لما Claude محتاج بيانات real-time (طقس، أسعار)
 لما محتاج يتفاعل مع نظامك (DB، APIs)
 لما محتاج يعمل حسابات دقيقة جداً
 للمهام الإبداعية البحتة (كتابة، ترجمة)`,

 contentEn: `## Tool Use

**Tool Use** (or Function Calling) lets Claude ask your program to execute a specific function and return the result.

---

## Simple Concept

\`\`\`
User: "What's the current temperature in Cairo?"

Claude: I don't know — but I can ask the program

Program: [calls get_weather("Cairo")]

API: Temperature is 28°C

Claude: "The current temperature in Cairo is 28°C "
\`\`\`

---

## Defining a Tool

\`\`\`python
tools = [
 {
 "name": "get_weather",
 "description": "Gets the current weather for a given city",
 "input_schema": {
 "type": "object",
 "properties": {
 "city": {
 "type": "string",
 "description": "The city name"
 }
 },
 "required": ["city"]
 }
 }
]
\`\`\`

---

## The Full Loop

\`\`\`python
import anthropic, json

client = anthropic.Anthropic()

def get_weather(city: str) -> str:
 # In reality you'd call a real API
 return f"Temperature in {city}: 28°C "

messages = [{"role": "user", "content": "What's the weather in Cairo?"}]

while True:
 response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=1024,
 tools=tools,
 messages=messages
 )

 # If Claude requested a tool
 if response.stop_reason == "tool_use":
 tool_call = next(b for b in response.content if b.type == "tool_use")

 # Execute the function
 result = get_weather(**tool_call.input)

 # Add result to conversation
 messages.append({"role": "assistant", "content": response.content})
 messages.append({
 "role": "user",
 "content": [{
 "type": "tool_result",
 "tool_use_id": tool_call.id,
 "content": result
 }]
 })
 else:
 # Claude reached the final answer
 print(response.content[0].text)
 break
\`\`\`

---

## Useful Tool Examples

| Tool | Purpose |
|---|---|
| \`search_web\` | Search the internet |
| \`get_current_time\` | Current time |
| \`query_database\` | Query a DB |
| \`send_email\` | Send email |
| \`create_file\` | Create a file |
| \`calculate\` | Precise calculations |

---

## When to Use Tool Use?

 When Claude needs real-time data (weather, prices)
 When it needs to interact with your system (DB, APIs)
 When it needs very precise calculations
 For purely creative tasks (writing, translation)`,

 quiz: [
 {
 id: 'q17-1',
 questionAr: 'الـ Tool Use بيحل مشكلة إيه؟',
 questionEn: 'What problem does Tool Use solve?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'يخلي Claude يوصل لبيانات خارجية ويتفاعل مع الأنظمة', textEn: 'Lets Claude access external data and interact with systems', isCorrect: true },
 { id: 'o2', textAr: 'يجعل Claude أسرع', textEn: 'Makes Claude faster', isCorrect: false },
 { id: 'o3', textAr: 'يقلل تكلفة الـ API', textEn: 'Reduces API cost', isCorrect: false },
 { id: 'o4', textAr: 'يترجم بشكل أحسن', textEn: 'Translates better', isCorrect: false },
 ],
 },
 {
 id: 'q17-2',
 questionAr: 'لما الـ stop_reason يكون "tool_use"، معناه؟',
 questionEn: 'When stop_reason is "tool_use", it means?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'Claude محتاج ينفذ tool قبل ما يكمل الإجابة', textEn: 'Claude needs to execute a tool before continuing the answer', isCorrect: true },
 { id: 'o2', textAr: 'الإجابة اتكملت', textEn: 'The answer is complete', isCorrect: false },
 { id: 'o3', textAr: 'في error في الـ API', textEn: 'There\'s an API error', isCorrect: false },
 { id: 'o4', textAr: 'وصل لـ max_tokens', textEn: 'Reached max_tokens', isCorrect: false },
 ],
 },
 {
 id: 'q17-3',
 questionAr: 'صح ولا غلط: Tool Use مفيد لمهام الكتابة الإبداعية البحتة',
 questionEn: 'True or False: Tool Use is useful for purely creative writing tasks',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح', textEn: 'True', isCorrect: false },
 { id: 'o2', textAr: 'غلط — مفيش داعي للـ tools في المهام الإبداعية', textEn: 'False — no need for tools in creative tasks', isCorrect: true },
 ],
 },
 ],
 },

 {
 id: 18,
 slug: 'prompt-caching',
 agentSlug: 'claude',
 titleAr: 'Prompt Caching — وفّر فلوس',
 titleEn: 'Prompt Caching — Save Money',
 descriptionAr: 'خلي Claude يحفظ الـ context الطويل ووفّر 90% من التكلفة.',
 descriptionEn: 'Let Claude cache long context and save 90% of the cost.',
 order: 18,
 xpReward: 95,
 estimatedMinutes: 10,
 contentAr: `## Prompt Caching

الـ **Prompt Caching** بيخلي Claude يحتفظ بأجزاء من الـ prompt في الذاكرة — عشان متبعتش نفس المحتوى الطويل في كل request.

---

## المشكلة بدون Caching

لو عندك System Prompt طويل (مثلاً 10,000 token):

\`\`\`
Request 1: System (10K tokens) + Message (50 tokens) = 10,050 tokens
Request 2: System (10K tokens) + Message (50 tokens) = 10,050 tokens
Request 3: System (10K tokens) + Message (50 tokens) = 10,050 tokens

التكلفة = 3 × 10,050 = 30,150 tokens 
\`\`\`

---

## مع Caching

\`\`\`
Request 1: System (10K — بيتحسب كامل) + Message = 10,050 tokens
Request 2: System (CACHED ) + Message = 50 tokens فقط
Request 3: System (CACHED ) + Message = 50 tokens فقط

التكلفة = ~10,100 tokens بس! 
\`\`\`

---

## إزاي تفعّله؟

بتضيف \`cache_control\` على الجزء اللي عايزه يتحفظ:

\`\`\`python
response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=1024,
 system=[
 {
 "type": "text",
 "text": "أنت مساعد ذكاوي... [نص طويل جداً]",
 "cache_control": {"type": "ephemeral"}
 }
 ],
 messages=[{"role": "user", "content": "سؤالي هنا"}]
)
\`\`\`

---

## الـ Cache بيستمر قد إيه؟

- الـ \`ephemeral\` cache بيعيش **5 دقايق** من آخر استخدام
- لو بعت request قبل ما تنتهي الـ 5 دقايق، الـ cache بيتجدد تلقائياً

---

## متى تستخدم Caching؟

 System Prompt طويل (> 1024 token)
 وثائق أو PDF بتبعتها في كل request
 Chatbot بيكرر نفس السياق
 Few-shot examples طويلة

---

## التوفير الحقيقي 

| | بدون Cache | مع Cache |
|---|---|---|
| **السعر** | كامل input price | 10% من input price |
| **التوفير** | — | 90% على الـ cached tokens |

لو عندك تطبيق بـ 1000 request/يوم مع system prompt طويل، الـ caching ممكن يوفر عليك آلاف الدولارات شهرياً!`,

 contentEn: `## Prompt Caching

**Prompt Caching** lets Claude keep parts of the prompt in memory — so you don't resend the same long content in every request.

---

## The Problem Without Caching

If you have a long System Prompt (e.g., 10,000 tokens):

\`\`\`
Request 1: System (10K tokens) + Message (50 tokens) = 10,050 tokens
Request 2: System (10K tokens) + Message (50 tokens) = 10,050 tokens
Request 3: System (10K tokens) + Message (50 tokens) = 10,050 tokens

Cost = 3 × 10,050 = 30,150 tokens 
\`\`\`

---

## With Caching

\`\`\`
Request 1: System (10K — charged in full) + Message = 10,050 tokens
Request 2: System (CACHED ) + Message = 50 tokens only
Request 3: System (CACHED ) + Message = 50 tokens only

Cost = ~10,100 tokens total! 
\`\`\`

---

## How to Enable It?

Add \`cache_control\` to the part you want cached:

\`\`\`python
response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=1024,
 system=[
 {
 "type": "text",
 "text": "You are a Zkawi assistant... [very long text]",
 "cache_control": {"type": "ephemeral"}
 }
 ],
 messages=[{"role": "user", "content": "My question here"}]
)
\`\`\`

---

## How Long Does Cache Last?

- \`ephemeral\` cache lives for **5 minutes** from last use
- If you send a request before the 5 minutes expire, the cache auto-renews

---

## When to Use Caching?

 Long System Prompt (> 1024 tokens)
 Documents or PDFs sent in every request
 Chatbot repeating the same context
 Long few-shot examples

---

## Real Savings 

| | Without Cache | With Cache |
|---|---|---|
| **Price** | Full input price | 10% of input price |
| **Savings** | — | 90% on cached tokens |

If you have an app with 1000 requests/day with a long system prompt, caching can save you thousands of dollars monthly!`,

 quiz: [
 {
 id: 'q18-1',
 questionAr: 'الـ Prompt Caching بيوفر على التكلفة إزاي؟',
 questionEn: 'How does Prompt Caching save on cost?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'بيحسب الـ cached tokens بـ 10% من سعرهم الأصلي', textEn: 'Charges cached tokens at 10% of their original price', isCorrect: true },
 { id: 'o2', textAr: 'بيلغي فلوس الـ output tokens', textEn: 'Eliminates output token charges', isCorrect: false },
 { id: 'o3', textAr: 'بيخلي الـ API مجاناً', textEn: 'Makes the API free', isCorrect: false },
 { id: 'o4', textAr: 'بيقلل حجم الـ response', textEn: 'Reduces response size', isCorrect: false },
 ],
 },
 {
 id: 'q18-2',
 questionAr: 'الـ ephemeral cache بيعيش قد إيه؟',
 questionEn: 'How long does the ephemeral cache last?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: '5 دقايق من آخر استخدام', textEn: '5 minutes from last use', isCorrect: true },
 { id: 'o2', textAr: '24 ساعة', textEn: '24 hours', isCorrect: false },
 { id: 'o3', textAr: '30 ثانية', textEn: '30 seconds', isCorrect: false },
 { id: 'o4', textAr: 'للأبد', textEn: 'Forever', isCorrect: false },
 ],
 },
 {
 id: 'q18-3',
 questionAr: 'أنهي حالة من دول الأنسب للـ Caching؟',
 questionEn: 'Which scenario is best suited for Caching?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'Chatbot بـ System Prompt طويل بيتكرر في كل request', textEn: 'Chatbot with long System Prompt repeated in every request', isCorrect: true },
 { id: 'o2', textAr: 'سؤال واحد بسيط', textEn: 'A single simple question', isCorrect: false },
 { id: 'o3', textAr: 'ترجمة كلمة', textEn: 'Translating a word', isCorrect: false },
 { id: 'o4', textAr: 'توليد صورة', textEn: 'Generating an image', isCorrect: false },
 ],
 },
 ],
 },

 {
 id: 19,
 slug: 'api-best-practices',
 agentSlug: 'claude',
 titleAr: 'أفضل الممارسات — API',
 titleEn: 'Best Practices — API',
 descriptionAr: 'نصائح الـ pro لبناء تطبيقات Claude محترفة وآمنة واقتصادية.',
 descriptionEn: 'Pro tips for building professional, secure, and cost-efficient Claude apps.',
 order: 19,
 xpReward: 100,
 estimatedMinutes: 12,
 contentAr: `## أفضل الممارسات — Claude API

وصلت لآخر درس في track الـ API! دي أهم النصائح اللي هتفرق بين مطور مبتدئ ومحترف.

---

## 1. الأمان أولاً 

\`\`\`python
# غلط جداً
api_key = "sk-ant-abc123"
client = anthropic.Anthropic(api_key=api_key)

# صح
import os
from dotenv import load_dotenv
load_dotenv()
client = anthropic.Anthropic() # بياخد من ANTHROPIC_API_KEY تلقائياً
\`\`\`

**قواعد الأمان:**
- مش تحط المفتاح في الكود أو الـ git
- استخدم \`.env\` files واضفها لـ \`.gitignore\`
- على السيرفر: استخدم Environment Variables
- روتيت المفاتيح دورياً (كل شهر مثلاً)

---

## 2. اختار النموذج الصح 

| النموذج | الاستخدام | التكلفة |
|---|---|---|
| claude-opus-4-7 | المهام المعقدة، الكتابة، التحليل | عالية |
| claude-haiku-4-5 | التصنيف، الترجمة، المهام البسيطة | منخفضة |

**قاعدة:** ابدأ بـ Haiku وانتقل لـ Opus لو النتيجة مش كافية.

---

## 3. Error Handling 

\`\`\`python
from anthropic import APIError, RateLimitError, APIConnectionError
import time

def safe_request(messages, retries=3):
 for attempt in range(retries):
 try:
 return client.messages.create(
 model="claude-opus-4-7",
 max_tokens=1024,
 messages=messages
 )
 except RateLimitError:
 wait = 2 ** attempt # exponential backoff
 time.sleep(wait)
 except APIConnectionError:
 time.sleep(1)
 except APIError as e:
 print(f"API Error: {e.status_code}")
 raise
 raise Exception("فشل بعد كل المحاولات")
\`\`\`

---

## 4. التحكم في التكلفة 

\`\`\`python
# راقب الاستخدام
response = client.messages.create(...)
print(f"Input: {response.usage.input_tokens} tokens")
print(f"Output: {response.usage.output_tokens} tokens")

# حدد سقف للـ output
response = client.messages.create(
 max_tokens=500, # مش أكتر من 500 token في الرد
 ...
)
\`\`\`

**استراتيجيات التوفير:**
- استخدم Haiku للـ tasks البسيطة
- فعّل Prompt Caching للـ system prompts الطويلة
- حدد \`max_tokens\` بشكل معقول
- لا تبعت سياق أكتر من اللازم

---

## 5. Validation قبل الإرسال 

\`\`\`python
def validate_message(content: str) -> bool:
 if not content or not content.strip():
 return False
 if len(content) > 100_000: # حد معقول
 return False
 return True

if validate_message(user_input):
 response = safe_request([{"role": "user", "content": user_input}])
\`\`\`

---

## 6. Rate Limits 

Anthropic عنده حدود على عدد الـ requests:
- لو وصلت للـ limit، بتاخد error 429
- الحل: Exponential Backoff (زي المثال فوق)
- للإنتاج: راقب الاستخدام من [console.anthropic.com](https://console.anthropic.com)

---

## مبروك — خلصت Claude API Track!

دلوقتي عندك كل المهارات اللازمة تبني تطبيقات حقيقية بـ Claude:

- API Key والـ SDK
- Messages API والمحادثات
- Streaming
- Tool Use
- Prompt Caching
- Best Practices

الخطوة الجاية؟ ابني تطبيقك الأول! `,

 contentEn: `## Best Practices — Claude API

You've reached the last lesson in the API track! These are the most important tips that separate a beginner from a pro developer.

---

## 1. Security First 

\`\`\`python
# Very wrong
api_key = "sk-ant-abc123"
client = anthropic.Anthropic(api_key=api_key)

# Correct
import os
from dotenv import load_dotenv
load_dotenv()
client = anthropic.Anthropic() # Auto-reads from ANTHROPIC_API_KEY
\`\`\`

**Security rules:**
- Never put the key in code or git
- Use \`.env\` files and add to \`.gitignore\`
- On servers: use Environment Variables
- Rotate keys periodically (monthly for example)

---

## 2. Choose the Right Model 

| Model | Use case | Cost |
|---|---|---|
| claude-opus-4-7 | Complex tasks, writing, analysis | High |
| claude-haiku-4-5 | Classification, translation, simple tasks | Low |

**Rule:** Start with Haiku, switch to Opus if results aren't good enough.

---

## 3. Error Handling 

\`\`\`python
from anthropic import APIError, RateLimitError, APIConnectionError
import time

def safe_request(messages, retries=3):
 for attempt in range(retries):
 try:
 return client.messages.create(
 model="claude-opus-4-7",
 max_tokens=1024,
 messages=messages
 )
 except RateLimitError:
 wait = 2 ** attempt # exponential backoff
 time.sleep(wait)
 except APIConnectionError:
 time.sleep(1)
 except APIError as e:
 print(f"API Error: {e.status_code}")
 raise
 raise Exception("Failed after all retries")
\`\`\`

---

## 4. Cost Control 

\`\`\`python
# Monitor usage
response = client.messages.create(...)
print(f"Input: {response.usage.input_tokens} tokens")
print(f"Output: {response.usage.output_tokens} tokens")

# Set output cap
response = client.messages.create(
 max_tokens=500, # No more than 500 tokens in response
 ...
)
\`\`\`

**Saving strategies:**
- Use Haiku for simple tasks
- Enable Prompt Caching for long system prompts
- Set reasonable \`max_tokens\`
- Don't send more context than needed

---

## 5. Validate Before Sending 

\`\`\`python
def validate_message(content: str) -> bool:
 if not content or not content.strip():
 return False
 if len(content) > 100_000: # reasonable limit
 return False
 return True

if validate_message(user_input):
 response = safe_request([{"role": "user", "content": user_input}])
\`\`\`

---

## 6. Rate Limits 

Anthropic has limits on request count:
- If you hit the limit, you get a 429 error
- Solution: Exponential Backoff (like the example above)
- For production: Monitor usage from [console.anthropic.com](https://console.anthropic.com)

---

## Congratulations — You Finished the Claude API Track!

You now have all the skills needed to build real apps with Claude:

- API Key and SDK
- Messages API and conversations
- Streaming
- Tool Use
- Prompt Caching
- Best Practices

Next step? Build your first real app! `,

 quiz: [
 {
 id: 'q19-1',
 questionAr: 'لو وصلت لـ Rate Limit، إيه أحسن حل؟',
 questionEn: 'If you hit a Rate Limit, what\'s the best solution?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'Exponential Backoff — انتظر وجرب تاني', textEn: 'Exponential Backoff — wait and retry', isCorrect: true },
 { id: 'o2', textAr: 'ابعت أكتر requests بسرعة', textEn: 'Send more requests faster', isCorrect: false },
 { id: 'o3', textAr: 'غيّر الـ API Key', textEn: 'Change the API Key', isCorrect: false },
 { id: 'o4', textAr: 'وقّف التطبيق', textEn: 'Stop the application', isCorrect: false },
 ],
 },
 {
 id: 'q19-2',
 questionAr: 'للمهام البسيطة زي التصنيف، أحسن نموذج؟',
 questionEn: 'For simple tasks like classification, the best model is?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'claude-haiku-4-5 (أرخص وأسرع)', textEn: 'claude-haiku-4-5 (cheaper and faster)', isCorrect: true },
 { id: 'o2', textAr: 'claude-opus-4-7 دايماً', textEn: 'claude-opus-4-7 always', isCorrect: false },
 { id: 'o3', textAr: 'أي نموذج سواء', textEn: 'Any model is fine', isCorrect: false },
 { id: 'o4', textAr: 'مفيش فرق في التكلفة', textEn: 'No difference in cost', isCorrect: false },
 ],
 },
 {
 id: 'q19-3',
 questionAr: 'صح ولا غلط: من الأفضل حفظ الـ API Key في ملف .env وإضافته لـ .gitignore',
 questionEn: 'True or False: It\'s best to store the API Key in a .env file and add it to .gitignore',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح ', textEn: 'True ', isCorrect: true },
 { id: 'o2', textAr: 'غلط', textEn: 'False', isCorrect: false },
 ],
 },
 ],
 },
];

export const developerLessons: Lesson[] = [
 {
 id: 20,
 slug: 'build-a-chatbot',
 agentSlug: 'claude',
 titleAr: 'ابني Chatbot من الصفر',
 titleEn: 'Build a Chatbot from Scratch',
 descriptionAr: 'خطوة بخطوة — ابني chatbot كامل بـ Python في أقل من 50 سطر.',
 descriptionEn: 'Step by step — build a complete chatbot in Python in under 50 lines.',
 order: 20,
 xpReward: 100,
 estimatedMinutes: 15,
 contentAr: `## ابني Chatbot من الصفر

في الدرس ده هتبني chatbot كامل يشتغل في الـ terminal بـ Python — محادثة حقيقية متعددة الأدوار!

---

## الكود الكامل (47 سطر)

\`\`\`python
import anthropic
import os

client = anthropic.Anthropic(
 api_key=os.environ.get("ANTHROPIC_API_KEY")
)

SYSTEM_PROMPT = """أنت مساعد ذكي ومفيد.
بتتكلم بالعربية دايماً.
بتكون موجز وواضح في إجاباتك."""

def chat():
 print(" Chatbot جاهز! اكتب 'خروج' للإنهاء\\n")
 conversation = []

 while True:
 # استقبال input من المستخدم
 user_input = input("أنت: ").strip()

 if not user_input:
 continue

 if user_input.lower() in ["خروج", "exit", "quit"]:
 print("\\n مع السلامة!")
 break

 # إضافة للمحادثة
 conversation.append({
 "role": "user",
 "content": user_input
 })

 try:
 # استدعاء Claude
 response = client.messages.create(
 model="claude-haiku-4-5",
 max_tokens=1024,
 system=SYSTEM_PROMPT,
 messages=conversation
 )

 assistant_reply = response.content[0].text

 # حفظ الرد في التاريخ
 conversation.append({
 "role": "assistant",
 "content": assistant_reply
 })

 print(f"\\n Claude: {assistant_reply}\\n")

 except Exception as e:
 print(f" خطأ: {e}")

if __name__ == "__main__":
 chat()
\`\`\`

---

## إزاي تشغله؟

\`\`\`bash
# 1. ثبّت الـ SDK
pip install anthropic

# 2. حدد الـ API Key
export ANTHROPIC_API_KEY="sk-ant-..."

# 3. شغّل
python chatbot.py
\`\`\`

---

## تحسينات ممكنة 

### إضافة حد للمحادثة
\`\`\`python
MAX_MESSAGES = 20

# قبل الإرسال
if len(conversation) > MAX_MESSAGES:
 # احتفظ بأول رسالة + آخر 19
 conversation = conversation[:1] + conversation[-(MAX_MESSAGES-1):]
\`\`\`

### حفظ المحادثة في ملف
\`\`\`python
import json

def save_conversation(conv, filename="chat_history.json"):
 with open(filename, "w", encoding="utf-8") as f:
 json.dump(conv, f, ensure_ascii=False, indent=2)
\`\`\`

### إضافة Streaming
\`\`\`python
print(" Claude: ", end="", flush=True)
with client.messages.stream(
 model="claude-haiku-4-5",
 max_tokens=1024,
 system=SYSTEM_PROMPT,
 messages=conversation
) as stream:
 reply = ""
 for text in stream.text_stream:
 print(text, end="", flush=True)
 reply += text
print() # سطر جديد
\`\`\`

---

## التحدي 

عدّل الـ Chatbot ده عشان يكون:
1. متخصص في موضوع معين (طبخ، رياضة، كود)
2. يحفظ المحادثة في ملف JSON
3. يستخدم Streaming`,

 contentEn: `## Build a Chatbot from Scratch

In this lesson you'll build a complete chatbot that runs in the terminal using Python — a real multi-turn conversation!

---

## The Complete Code (47 lines)

\`\`\`python
import anthropic
import os

client = anthropic.Anthropic(
 api_key=os.environ.get("ANTHROPIC_API_KEY")
)

SYSTEM_PROMPT = """You are a smart and helpful assistant.
Always respond in a clear and concise manner."""

def chat():
 print(" Chatbot ready! Type 'quit' to exit\\n")
 conversation = []

 while True:
 user_input = input("You: ").strip()

 if not user_input:
 continue

 if user_input.lower() in ["quit", "exit"]:
 print("\\n Goodbye!")
 break

 conversation.append({
 "role": "user",
 "content": user_input
 })

 try:
 response = client.messages.create(
 model="claude-haiku-4-5",
 max_tokens=1024,
 system=SYSTEM_PROMPT,
 messages=conversation
 )

 assistant_reply = response.content[0].text

 conversation.append({
 "role": "assistant",
 "content": assistant_reply
 })

 print(f"\\n Claude: {assistant_reply}\\n")

 except Exception as e:
 print(f" Error: {e}")

if __name__ == "__main__":
 chat()
\`\`\`

---

## How to Run It?

\`\`\`bash
# 1. Install SDK
pip install anthropic

# 2. Set API Key
export ANTHROPIC_API_KEY="sk-ant-..."

# 3. Run
python chatbot.py
\`\`\`

---

## Possible Improvements 

### Add conversation limit
\`\`\`python
MAX_MESSAGES = 20

if len(conversation) > MAX_MESSAGES:
 conversation = conversation[:1] + conversation[-(MAX_MESSAGES-1):]
\`\`\`

### Save to file
\`\`\`python
import json

def save_conversation(conv, filename="chat_history.json"):
 with open(filename, "w", encoding="utf-8") as f:
 json.dump(conv, f, ensure_ascii=False, indent=2)
\`\`\`

### Add Streaming
\`\`\`python
print(" Claude: ", end="", flush=True)
with client.messages.stream(
 model="claude-haiku-4-5",
 max_tokens=1024,
 system=SYSTEM_PROMPT,
 messages=conversation
) as stream:
 reply = ""
 for text in stream.text_stream:
 print(text, end="", flush=True)
 reply += text
print()
\`\`\`

---

## The Challenge 

Modify this chatbot to:
1. Specialize in a topic (cooking, sports, code)
2. Save conversation to JSON file
3. Use Streaming`,

 quiz: [
 {
 id: 'q20-1',
 questionAr: 'ليه بنحتفظ بالـ conversation list؟',
 questionEn: 'Why do we maintain the conversation list?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'عشان Claude يتذكر المحادثة السابقة', textEn: 'So Claude remembers the previous conversation', isCorrect: true },
 { id: 'o2', textAr: 'عشان نوفر tokens', textEn: 'To save tokens', isCorrect: false },
 { id: 'o3', textAr: 'متطلب من Python', textEn: 'Required by Python', isCorrect: false },
 { id: 'o4', textAr: 'لمنع الـ errors', textEn: 'To prevent errors', isCorrect: false },
 ],
 },
 {
 id: 'q20-2',
 questionAr: 'ليه استخدمنا claude-haiku-4-5 في الـ Chatbot؟',
 questionEn: 'Why did we use claude-haiku-4-5 in the Chatbot?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'أرخص وأسرع للمحادثات اليومية', textEn: 'Cheaper and faster for everyday conversations', isCorrect: true },
 { id: 'o2', textAr: 'الوحيد المتاح', textEn: 'The only available model', isCorrect: false },
 { id: 'o3', textAr: 'الأذكى دايماً', textEn: 'Always the smartest', isCorrect: false },
 { id: 'o4', textAr: 'بيدعم العربية بس هو', textEn: 'Only one supporting Arabic', isCorrect: false },
 ],
 },
 {
 id: 'q20-3',
 questionAr: 'صح ولا غلط: ممكن تضيف Streaming لأي chatbot بتبنيه',
 questionEn: 'True or False: You can add Streaming to any chatbot you build',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح', textEn: 'True', isCorrect: true },
 { id: 'o2', textAr: 'غلط', textEn: 'False', isCorrect: false },
 ],
 },
 ],
 },

 {
 id: 21,
 slug: 'document-qa',
 agentSlug: 'claude',
 titleAr: 'Document Q&A — اسأل على المستندات',
 titleEn: 'Document Q&A — Ask About Documents',
 descriptionAr: 'ابني نظام يجاوب على أسئلة من ملفات PDF و Word بـ Claude.',
 descriptionEn: 'Build a system that answers questions from PDF and Word files using Claude.',
 order: 21,
 xpReward: 100,
 estimatedMinutes: 14,
 contentAr: `## Document Q&A

من أقوى تطبيقات الـ AI — نظام بيقرأ مستندات ويجاوب على أسئلة عنها.

---

## الفكرة

\`\`\`
ملف PDF/Word → استخرج النص → ابعته لـ Claude → اسأل عنه
\`\`\`

---

## استخراج النص من PDF

\`\`\`python
pip install anthropic pymupdf
\`\`\`

\`\`\`python
import fitz # PyMuPDF
import anthropic
import os

def extract_pdf_text(pdf_path: str) -> str:
 doc = fitz.open(pdf_path)
 text = ""
 for page in doc:
 text += page.get_text()
 return text

client = anthropic.Anthropic()

def ask_about_document(pdf_path: str, question: str) -> str:
 document_text = extract_pdf_text(pdf_path)

 response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=2048,
 system="""أنت مساعد متخصص في تحليل المستندات.
أجب على الأسئلة بناءً على محتوى المستند فقط.
لو المعلومة مش موجودة في المستند، قول ذلك بوضوح.""",
 messages=[
 {
 "role": "user",
 "content": f"""المستند:
---
{document_text}
---

السؤال: {question}"""
 }
 ]
 )

 return response.content[0].text

# استخدام
answer = ask_about_document(
 "contract.pdf",
 "إيه هي شروط الإلغاء في العقد ده؟"
)
print(answer)
\`\`\`

---

## محادثة متعددة الأسئلة

\`\`\`python
def document_chat(pdf_path: str):
 document_text = extract_pdf_text(pdf_path)
 conversation = []

 print(f" تم تحميل المستند. اسأل أي سؤال!\\n")

 while True:
 question = input("سؤالك: ").strip()
 if question.lower() in ["خروج", "exit"]:
 break

 conversation.append({
 "role": "user",
 "content": question
 })

 response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=2048,
 system=f"""أنت مساعد لتحليل هذا المستند:
---
{document_text}
---
أجب فقط بناءً على محتوى المستند.""",
 messages=conversation
 )

 answer = response.content[0].text
 conversation.append({"role": "assistant", "content": answer})
 print(f"\\n {answer}\\n")
\`\`\`

---

## تحسينات للـ Production 

### لو المستند طويل جداً
Claude عنده context window كبير (1M token في Opus)، بس لو المستند أكبر:

\`\`\`python
def chunk_text(text: str, max_chars: int = 50000) -> list:
 # قسّم النص لأجزاء
 chunks = []
 for i in range(0, len(text), max_chars):
 chunks.append(text[i:i + max_chars])
 return chunks
\`\`\`

### إضافة Word files
\`\`\`bash
pip install python-docx
\`\`\`

\`\`\`python
from docx import Document

def extract_word_text(docx_path: str) -> str:
 doc = Document(docx_path)
 return "\\n".join([para.text for para in doc.paragraphs])
\`\`\`

---

## أمثلة على الاستخدام 

- **قانوني:** اسأل على عقود ووثائق قانونية
- **أعمال:** حلل تقارير مالية
- **أكاديمي:** اسأل على أبحاث ودراسات
- **موارد بشرية:** قارن بين CVs`,

 contentEn: `## Document Q&A

One of the most powerful AI applications — a system that reads documents and answers questions about them.

---

## The Concept

\`\`\`
PDF/Word file → Extract text → Send to Claude → Ask questions
\`\`\`

---

## Extract Text from PDF

\`\`\`python
pip install anthropic pymupdf
\`\`\`

\`\`\`python
import fitz # PyMuPDF
import anthropic
import os

def extract_pdf_text(pdf_path: str) -> str:
 doc = fitz.open(pdf_path)
 text = ""
 for page in doc:
 text += page.get_text()
 return text

client = anthropic.Anthropic()

def ask_about_document(pdf_path: str, question: str) -> str:
 document_text = extract_pdf_text(pdf_path)

 response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=2048,
 system="""You are a document analysis assistant.
Answer questions based solely on the document content.
If the information isn't in the document, clearly say so.""",
 messages=[
 {
 "role": "user",
 "content": f"""Document:
---
{document_text}
---

Question: {question}"""
 }
 ]
 )

 return response.content[0].text

# Usage
answer = ask_about_document(
 "contract.pdf",
 "What are the cancellation terms in this contract?"
)
print(answer)
\`\`\`

---

## Multi-question Chat

\`\`\`python
def document_chat(pdf_path: str):
 document_text = extract_pdf_text(pdf_path)
 conversation = []

 print(f" Document loaded. Ask any question!\\n")

 while True:
 question = input("Your question: ").strip()
 if question.lower() in ["quit", "exit"]:
 break

 conversation.append({"role": "user", "content": question})

 response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=2048,
 system=f"""You are an assistant for analyzing this document:
---
{document_text}
---
Answer only based on the document content.""",
 messages=conversation
 )

 answer = response.content[0].text
 conversation.append({"role": "assistant", "content": answer})
 print(f"\\n {answer}\\n")
\`\`\`

---

## Production Improvements 

### If document is very long
Claude has a large context window (1M tokens in Opus), but if the document is larger:

\`\`\`python
def chunk_text(text: str, max_chars: int = 50000) -> list:
 chunks = []
 for i in range(0, len(text), max_chars):
 chunks.append(text[i:i + max_chars])
 return chunks
\`\`\`

### Add Word files
\`\`\`python
from docx import Document

def extract_word_text(docx_path: str) -> str:
 doc = Document(docx_path)
 return "\\n".join([para.text for para in doc.paragraphs])
\`\`\`

---

## Use Case Examples 

- **Legal:** Ask about contracts and legal documents
- **Business:** Analyze financial reports
- **Academic:** Ask about research papers
- **HR:** Compare CVs`,

 quiz: [
 {
 id: 'q21-1',
 questionAr: 'إيه الخطوة الأولى في بناء Document Q&A؟',
 questionEn: 'What is the first step in building Document Q&A?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'استخراج النص من الملف', textEn: 'Extracting text from the file', isCorrect: true },
 { id: 'o2', textAr: 'إرسال الملف مباشرة لـ Claude', textEn: 'Sending the file directly to Claude', isCorrect: false },
 { id: 'o3', textAr: 'تشغيل الـ chatbot', textEn: 'Running the chatbot', isCorrect: false },
 { id: 'o4', textAr: 'إنشاء قاعدة بيانات', textEn: 'Creating a database', isCorrect: false },
 ],
 },
 {
 id: 'q21-2',
 questionAr: 'لو المستند أكبر من الـ context window، إيه الحل؟',
 questionEn: 'If the document exceeds the context window, what\'s the solution?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'تقسيم النص لأجزاء (chunking)', textEn: 'Split text into chunks (chunking)', isCorrect: true },
 { id: 'o2', textAr: 'استخدام نموذج مختلف', textEn: 'Use a different model', isCorrect: false },
 { id: 'o3', textAr: 'تصغير الملف', textEn: 'Compress the file', isCorrect: false },
 { id: 'o4', textAr: 'مش ممكن تحل المشكلة دي', textEn: 'This problem can\'t be solved', isCorrect: false },
 ],
 },
 {
 id: 'q21-3',
 questionAr: 'صح ولا غلط: Claude يقدر يجاوب على أسئلة من ملفات PDF و Word',
 questionEn: 'True or False: Claude can answer questions from PDF and Word files',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح — بعد استخراج النص منهم', textEn: 'True — after extracting text from them', isCorrect: true },
 { id: 'o2', textAr: 'غلط', textEn: 'False', isCorrect: false },
 ],
 },
 ],
 },

 {
 id: 22,
 slug: 'content-moderation',
 agentSlug: 'claude',
 titleAr: 'Content Moderation — مراقبة المحتوى',
 titleEn: 'Content Moderation — Monitor Content',
 descriptionAr: 'استخدم Claude عشان تصنّف وتراقب محتوى المستخدمين تلقائياً.',
 descriptionEn: 'Use Claude to automatically classify and moderate user content.',
 order: 22,
 xpReward: 95,
 estimatedMinutes: 12,
 contentAr: `## Content Moderation

الـ **Content Moderation** هو تصنيف المحتوى تلقائياً — هل ده آمن؟ مسيء؟ سبام؟

---

## ليه Claude مثالي للـ Moderation؟

- يفهم السياق مش بس الكلمات
- بيتعامل مع العربية والعامية كويس
- ممكن تشرح له قواعدك بالظبط
- أقل false positives من الأدوات التقليدية

---

## مثال: تصنيف التعليقات

\`\`\`python
import anthropic
import json

client = anthropic.Anthropic()

def moderate_comment(comment: str) -> dict:
 response = client.messages.create(
 model="claude-haiku-4-5",
 max_tokens=256,
 system="""أنت نظام مراقبة محتوى.
صنّف التعليق وأرجع JSON فقط بالشكل ده:
{
 "safe": true/false,
 "category": "safe|spam|hate|violence|adult",
 "confidence": 0.0-1.0,
 "reason": "سبب موجز"
}
لا تكتب أي كلام تاني غير الـ JSON.""",
 messages=[
 {"role": "user", "content": f"صنّف التعليق ده: {comment}"}
 ]
 )

 return json.loads(response.content[0].text)

# أمثلة
comments = [
 "المنتج ده رائع جداً، بنصح بيه!",
 "اشتري الآن! سعر خاص! رابط في البايو!",
 "أنا مش راضي عن الخدمة",
]

for comment in comments:
 result = moderate_comment(comment)
 status = "" if result["safe"] else ""
 print(f"{status} '{comment[:30]}...' → {result['category']}")
\`\`\`

---

## Batch Moderation للـ Scale

\`\`\`python
def moderate_batch(comments: list[str]) -> list[dict]:
 # بعت كل التعليقات في request واحد توفيراً
 comments_text = "\\n".join(
 f"{i+1}. {c}" for i, c in enumerate(comments)
 )

 response = client.messages.create(
 model="claude-haiku-4-5",
 max_tokens=2048,
 system="""صنّف كل تعليق وأرجع JSON array:
[{"id": 1, "safe": true, "category": "...", "confidence": 0.9}, ...]""",
 messages=[{"role": "user", "content": comments_text}]
 )

 return json.loads(response.content[0].text)
\`\`\`

---

## تخصيص القواعد لمنصتك

\`\`\`python
MODERATION_RULES = """
قواعد المنصة:
1. لا إعلانات أو سبام
2. لا ألفاظ مسيئة أو تحرش
3. لا معلومات شخصية (تليفون، عنوان)
4. لا محتوى سياسي حاد
5. التعليقات التعليمية والنقد البناء مسموح بيه

صنّف التعليق: safe, spam, inappropriate, personal_info, political
"""
\`\`\`

---

## نصيحة الـ Production 

مش لازم Claude يقرر وحده — استخدمه كـ **first filter** ثم راجع الـ edge cases يدوياً:

\`\`\`
Confidence > 0.9 → قرار تلقائي
Confidence 0.6-0.9 → مراجعة بشرية
Confidence < 0.6 → مراجعة بشرية دايماً
\`\`\``,

 contentEn: `## Content Moderation

**Content Moderation** is automatically classifying content — is it safe? Abusive? Spam?

---

## Why Claude Is Ideal for Moderation?

- Understands context, not just keywords
- Handles Arabic and dialects well
- You can explain your exact rules
- Fewer false positives than traditional tools

---

## Example: Comment Classification

\`\`\`python
import anthropic
import json

client = anthropic.Anthropic()

def moderate_comment(comment: str) -> dict:
 response = client.messages.create(
 model="claude-haiku-4-5",
 max_tokens=256,
 system="""You are a content moderation system.
Classify the comment and return ONLY JSON in this format:
{
 "safe": true/false,
 "category": "safe|spam|hate|violence|adult",
 "confidence": 0.0-1.0,
 "reason": "brief reason"
}
Write nothing other than the JSON.""",
 messages=[
 {"role": "user", "content": f"Classify this comment: {comment}"}
 ]
 )

 return json.loads(response.content[0].text)

# Examples
comments = [
 "This product is amazing, highly recommended!",
 "Buy now! Special price! Link in bio!",
 "I'm not satisfied with the service",
]

for comment in comments:
 result = moderate_comment(comment)
 status = "" if result["safe"] else ""
 print(f"{status} '{comment[:30]}...' → {result['category']}")
\`\`\`

---

## Batch Moderation for Scale

\`\`\`python
def moderate_batch(comments: list[str]) -> list[dict]:
 comments_text = "\\n".join(
 f"{i+1}. {c}" for i, c in enumerate(comments)
 )

 response = client.messages.create(
 model="claude-haiku-4-5",
 max_tokens=2048,
 system="""Classify each comment and return a JSON array:
[{"id": 1, "safe": true, "category": "...", "confidence": 0.9}, ...]""",
 messages=[{"role": "user", "content": comments_text}]
 )

 return json.loads(response.content[0].text)
\`\`\`

---

## Customize Rules for Your Platform

\`\`\`python
MODERATION_RULES = """
Platform rules:
1. No ads or spam
2. No offensive language or harassment
3. No personal information (phone, address)
4. No extreme political content
5. Educational comments and constructive criticism are allowed

Classify as: safe, spam, inappropriate, personal_info, political
"""
\`\`\`

---

## Production Tip 

Claude doesn't have to decide alone — use it as a **first filter** then manually review edge cases:

\`\`\`
Confidence > 0.9 → Automatic decision
Confidence 0.6-0.9 → Human review
Confidence < 0.6 → Always human review
\`\`\``,

 quiz: [
 {
 id: 'q22-1',
 questionAr: 'ليه Claude أحسن من أدوات الـ moderation التقليدية في كتير من الحالات؟',
 questionEn: 'Why is Claude better than traditional moderation tools in many cases?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'لأنه بيفهم السياق مش بس الكلمات', textEn: 'Because it understands context, not just keywords', isCorrect: true },
 { id: 'o2', textAr: 'لأنه أسرع', textEn: 'Because it\'s faster', isCorrect: false },
 { id: 'o3', textAr: 'لأنه مجاني', textEn: 'Because it\'s free', isCorrect: false },
 { id: 'o4', textAr: 'لأنه بيدعم أكتر من 100 لغة', textEn: 'Because it supports over 100 languages', isCorrect: false },
 ],
 },
 {
 id: 'q22-2',
 questionAr: 'لما الـ confidence يكون 0.7، إيه المناسب؟',
 questionEn: 'When confidence is 0.7, what\'s appropriate?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'مراجعة بشرية', textEn: 'Human review', isCorrect: true },
 { id: 'o2', textAr: 'قرار تلقائي فوري', textEn: 'Immediate automatic decision', isCorrect: false },
 { id: 'o3', textAr: 'تجاهل التعليق', textEn: 'Ignore the comment', isCorrect: false },
 { id: 'o4', textAr: 'حذف تلقائي', textEn: 'Automatic deletion', isCorrect: false },
 ],
 },
 {
 id: 'q22-3',
 questionAr: 'صح ولا غلط: Batch Moderation بتوفر تكلفة وتبعت كل التعليقات في request واحد',
 questionEn: 'True or False: Batch Moderation saves cost by sending all comments in one request',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح', textEn: 'True', isCorrect: true },
 { id: 'o2', textAr: 'غلط', textEn: 'False', isCorrect: false },
 ],
 },
 ],
 },

 {
 id: 23,
 slug: 'structured-data-extraction',
 agentSlug: 'claude',
 titleAr: 'استخراج البيانات المنظمة',
 titleEn: 'Structured Data Extraction',
 descriptionAr: 'حوّل أي نص غير منظم لـ JSON نظيف — فواتير، CVs، عقود.',
 descriptionEn: 'Convert any unstructured text to clean JSON — invoices, CVs, contracts.',
 order: 23,
 xpReward: 95,
 estimatedMinutes: 12,
 contentAr: `## استخراج البيانات المنظمة

من أهم تطبيقات الـ AI في الأعمال — تحويل النصوص الحرة لبيانات منظمة يقدر الكمبيوتر يتعامل معها.

---

## المشكلة

\`\`\`
النص: "أحمد محمد، 28 سنة، مهندس برمجيات، خبرة 5 سنين في Python وJavaScript،
 شغال في شركة التقنية منذ 2021، حاصل على بكالوريوس هندسة حاسبات"

المطلوب: JSON منظم يقدر نحفظه في DB
\`\`\`

---

## الحل مع Claude

\`\`\`python
import anthropic, json

client = anthropic.Anthropic()

def extract_cv_data(cv_text: str) -> dict:
 response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=1024,
 system="""استخرج البيانات من الـ CV وأرجع JSON بالشكل ده فقط:
{
 "name": "الاسم الكامل",
 "age": العمر كـ int أو null,
 "title": "المسمى الوظيفي",
 "experience_years": سنوات الخبرة كـ int,
 "skills": ["skill1", "skill2"],
 "current_company": "اسم الشركة أو null",
 "education": "أعلى درجة علمية",
 "languages": ["العربية", "الإنجليزية"]
}
لا تكتب أي شيء غير الـ JSON.""",
 messages=[{"role": "user", "content": cv_text}]
 )

 return json.loads(response.content[0].text)

cv = """
أحمد محمد علي
مهندس برمجيات أول — 28 سنة
شغال في شركة TechCorp من يناير 2021
خبرة: Python, JavaScript, React, PostgreSQL
تعليم: بكالوريوس هندسة حاسبات — جامعة القاهرة 2019
"""

data = extract_cv_data(cv)
print(json.dumps(data, ensure_ascii=False, indent=2))
\`\`\`

**النتيجة:**
\`\`\`json
{
 "name": "أحمد محمد علي",
 "age": 28,
 "title": "مهندس برمجيات أول",
 "experience_years": 5,
 "skills": ["Python", "JavaScript", "React", "PostgreSQL"],
 "current_company": "TechCorp",
 "education": "بكالوريوس هندسة حاسبات",
 "languages": ["العربية"]
}
\`\`\`

---

## استخراج بيانات فاتورة

\`\`\`python
def extract_invoice(invoice_text: str) -> dict:
 response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=1024,
 system="""استخرج بيانات الفاتورة وأرجع JSON:
{
 "invoice_number": "رقم الفاتورة",
 "date": "YYYY-MM-DD",
 "vendor": "اسم البائع",
 "total": المبلغ الإجمالي كـ float,
 "currency": "EGP/USD/EUR",
 "items": [{"name": "...", "quantity": 1, "price": 0.0}]
}""",
 messages=[{"role": "user", "content": invoice_text}]
 )
 return json.loads(response.content[0].text)
\`\`\`

---

## نصيحة للـ Reliability 

Claude ممكن يغلط أحياناً في الـ JSON format. استخدم try/except دايماً:

\`\`\`python
def safe_extract(text: str, extract_fn) -> dict | None:
 try:
 return extract_fn(text)
 except json.JSONDecodeError:
 # جرب تاني مع تعليمات أوضح
 return None
\`\`\``,

 contentEn: `## Structured Data Extraction

One of the most important AI applications in business — converting free-form text into structured data that computers can process.

---

## The Problem

\`\`\`
Text: "Ahmed Mohamed, 28 years old, software engineer, 5 years experience
 in Python and JavaScript, working at Tech Company since 2021,
 BS in Computer Engineering"

Needed: Structured JSON that can be saved in DB
\`\`\`

---

## The Solution with Claude

\`\`\`python
import anthropic, json

client = anthropic.Anthropic()

def extract_cv_data(cv_text: str) -> dict:
 response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=1024,
 system="""Extract data from the CV and return ONLY this JSON:
{
 "name": "Full name",
 "age": age as int or null,
 "title": "Job title",
 "experience_years": years as int,
 "skills": ["skill1", "skill2"],
 "current_company": "Company name or null",
 "education": "Highest degree",
 "languages": ["Arabic", "English"]
}
Write nothing other than the JSON.""",
 messages=[{"role": "user", "content": cv_text}]
 )

 return json.loads(response.content[0].text)

cv = """
Ahmed Mohamed Ali
Senior Software Engineer — 28 years old
Working at TechCorp since January 2021
Skills: Python, JavaScript, React, PostgreSQL
Education: BS Computer Engineering — Cairo University 2019
"""

data = extract_cv_data(cv)
print(json.dumps(data, indent=2))
\`\`\`

**Result:**
\`\`\`json
{
 "name": "Ahmed Mohamed Ali",
 "age": 28,
 "title": "Senior Software Engineer",
 "experience_years": 5,
 "skills": ["Python", "JavaScript", "React", "PostgreSQL"],
 "current_company": "TechCorp",
 "education": "BS Computer Engineering"
}
\`\`\`

---

## Extract Invoice Data

\`\`\`python
def extract_invoice(invoice_text: str) -> dict:
 response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=1024,
 system="""Extract invoice data and return JSON:
{
 "invoice_number": "invoice number",
 "date": "YYYY-MM-DD",
 "vendor": "vendor name",
 "total": total amount as float,
 "currency": "USD/EUR/GBP",
 "items": [{"name": "...", "quantity": 1, "price": 0.0}]
}""",
 messages=[{"role": "user", "content": invoice_text}]
 )
 return json.loads(response.content[0].text)
\`\`\`

---

## Reliability Tip 

Claude can sometimes make JSON format mistakes. Always use try/except:

\`\`\`python
def safe_extract(text: str, extract_fn) -> dict | None:
 try:
 return extract_fn(text)
 except json.JSONDecodeError:
 # Try again with clearer instructions
 return None
\`\`\``,

 quiz: [
 {
 id: 'q23-1',
 questionAr: 'إيه الهدف من Structured Data Extraction؟',
 questionEn: 'What is the goal of Structured Data Extraction?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'تحويل النصوص الحرة لبيانات منظمة (JSON/DB)', textEn: 'Converting free-form text to structured data (JSON/DB)', isCorrect: true },
 { id: 'o2', textAr: 'ترجمة النصوص', textEn: 'Translating text', isCorrect: false },
 { id: 'o3', textAr: 'تلخيص المستندات', textEn: 'Summarizing documents', isCorrect: false },
 { id: 'o4', textAr: 'إنشاء تقارير PDF', textEn: 'Creating PDF reports', isCorrect: false },
 ],
 },
 {
 id: 'q23-2',
 questionAr: 'ليه لازم نستخدم try/except مع JSON extraction؟',
 questionEn: 'Why should we use try/except with JSON extraction?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'لأن Claude ممكن يغلط أحياناً في الـ JSON format', textEn: 'Because Claude might sometimes make JSON format mistakes', isCorrect: true },
 { id: 'o2', textAr: 'متطلب من Python', textEn: 'Required by Python', isCorrect: false },
 { id: 'o3', textAr: 'عشان نوفر tokens', textEn: 'To save tokens', isCorrect: false },
 { id: 'o4', textAr: 'عشان الـ API بطيء', textEn: 'Because the API is slow', isCorrect: false },
 ],
 },
 {
 id: 'q23-3',
 questionAr: 'صح ولا غلط: ممكن نستخدم نفس التقنية لاستخراج بيانات من فواتير وعقود وـ CVs',
 questionEn: 'True or False: We can use the same technique for invoices, contracts, and CVs',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح', textEn: 'True', isCorrect: true },
 { id: 'o2', textAr: 'غلط', textEn: 'False', isCorrect: false },
 ],
 },
 ],
 },

 {
 id: 24,
 slug: 'ai-agent-basics',
 agentSlug: 'claude',
 titleAr: 'AI Agent — الوكيل الذكي',
 titleEn: 'AI Agent — The Smart Agent',
 descriptionAr: 'ابني AI Agent بيخطط وينفذ مهام معقدة من تلقاء نفسه.',
 descriptionEn: 'Build an AI Agent that plans and executes complex tasks on its own.',
 order: 24,
 xpReward: 110,
 estimatedMinutes: 15,
 contentAr: `## AI Agent

الـ **AI Agent** هو برنامج بيستخدم الـ AI عشان يخطط وينفذ مهام معقدة بشكل مستقل — من غير تدخل بشري في كل خطوة.

---

## الفرق بين Chatbot و Agent

| Chatbot | AI Agent |
|---|---|
| يرد على سؤال | ينفذ مهمة كاملة |
| خطوة واحدة | خطوات متعددة |
| يحتاج توجيه مستمر | يخطط لوحده |
| مثال: "رد على إيميل" | مثال: "رتّب اجتماع مع الفريق" |

---

## بنية الـ Agent البسيط

\`\`\`python
import anthropic
import json

client = anthropic.Anthropic()

# الأدوات المتاحة للـ Agent
tools = [
 {
 "name": "search_web",
 "description": "ابحث في الإنترنت عن معلومات",
 "input_schema": {
 "type": "object",
 "properties": {
 "query": {"type": "string", "description": "جملة البحث"}
 },
 "required": ["query"]
 }
 },
 {
 "name": "save_note",
 "description": "احفظ ملاحظة",
 "input_schema": {
 "type": "object",
 "properties": {
 "title": {"type": "string"},
 "content": {"type": "string"}
 },
 "required": ["title", "content"]
 }
 }
]

# تنفيذ الأدوات
def execute_tool(name: str, inputs: dict) -> str:
 if name == "search_web":
 return f"نتائج البحث عن '{inputs['query']}': [نتائج وهمية للتوضيح]"
 elif name == "save_note":
 return f"تم حفظ الملاحظة: {inputs['title']}"
 return "tool not found"

# الـ Agent Loop
def run_agent(task: str, max_steps: int = 10):
 messages = [{"role": "user", "content": task}]
 steps = 0

 print(f" المهمة: {task}\\n")

 while steps < max_steps:
 response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=4096,
 tools=tools,
 messages=messages,
 system="""أنت AI Agent مهمتك إنجاز المهام المعقدة.
استخدم الأدوات المتاحة لإتمام المهمة خطوة خطوة.
لما تخلص، قول "المهمة اكتملت" واشرح النتيجة."""
 )

 # لو خلص
 if response.stop_reason == "end_turn":
 print(f" {response.content[0].text}")
 break

 # لو طلب tool
 if response.stop_reason == "tool_use":
 messages.append({"role": "assistant", "content": response.content})

 tool_results = []
 for block in response.content:
 if block.type == "tool_use":
 print(f" ينفذ: {block.name}({block.input})")
 result = execute_tool(block.name, block.input)
 tool_results.append({
 "type": "tool_result",
 "tool_use_id": block.id,
 "content": result
 })

 messages.append({"role": "user", "content": tool_results})

 steps += 1

# شغّل الـ Agent
run_agent("ابحث عن أحدث أخبار الذكاء الاصطناعي واحفظ ملخصها")
\`\`\`

---

## أمثلة على Agents حقيقية 

- **Research Agent** — يبحث ويلخص ويكتب تقرير
- **Code Review Agent** — يراجع كود ويقترح تحسينات
- **Customer Service Agent** — يتعامل مع شكاوى العملاء
- **Data Pipeline Agent** — يجمع ويحلل ويرفع بيانات

---

## متى تبني Agent؟

 المهمة تحتاج خطوات متعددة وقرارات
 المهمة قابلة للأتمتة لكنها معقدة
 قيمة المهمة تبرر التكلفة والوقت
 مهام بسيطة تكفيها API call واحدة`,

 contentEn: `## AI Agent

An **AI Agent** is a program that uses AI to plan and execute complex tasks independently — without human intervention at every step.

---

## Chatbot vs Agent

| Chatbot | AI Agent |
|---|---|
| Responds to a question | Executes a complete task |
| Single step | Multiple steps |
| Needs constant guidance | Plans on its own |
| Example: "Reply to email" | Example: "Schedule team meeting" |

---

## Simple Agent Structure

\`\`\`python
import anthropic
import json

client = anthropic.Anthropic()

tools = [
 {
 "name": "search_web",
 "description": "Search the internet for information",
 "input_schema": {
 "type": "object",
 "properties": {
 "query": {"type": "string", "description": "Search query"}
 },
 "required": ["query"]
 }
 },
 {
 "name": "save_note",
 "description": "Save a note",
 "input_schema": {
 "type": "object",
 "properties": {
 "title": {"type": "string"},
 "content": {"type": "string"}
 },
 "required": ["title", "content"]
 }
 }
]

def execute_tool(name: str, inputs: dict) -> str:
 if name == "search_web":
 return f"Search results for '{inputs['query']}': [mock results]"
 elif name == "save_note":
 return f"Note saved: {inputs['title']}"
 return "tool not found"

def run_agent(task: str, max_steps: int = 10):
 messages = [{"role": "user", "content": task}]
 steps = 0

 print(f" Task: {task}\\n")

 while steps < max_steps:
 response = client.messages.create(
 model="claude-opus-4-7",
 max_tokens=4096,
 tools=tools,
 messages=messages,
 system="""You are an AI Agent tasked with completing complex tasks.
Use the available tools to complete the task step by step.
When done, say "Task completed" and explain the result."""
 )

 if response.stop_reason == "end_turn":
 print(f" {response.content[0].text}")
 break

 if response.stop_reason == "tool_use":
 messages.append({"role": "assistant", "content": response.content})

 tool_results = []
 for block in response.content:
 if block.type == "tool_use":
 print(f" Executing: {block.name}({block.input})")
 result = execute_tool(block.name, block.input)
 tool_results.append({
 "type": "tool_result",
 "tool_use_id": block.id,
 "content": result
 })

 messages.append({"role": "user", "content": tool_results})

 steps += 1

run_agent("Search for latest AI news and save a summary")
\`\`\`

---

## Real Agent Examples 

- **Research Agent** — searches, summarizes, writes report
- **Code Review Agent** — reviews code and suggests improvements
- **Customer Service Agent** — handles customer complaints
- **Data Pipeline Agent** — collects, analyzes, uploads data

---

## When to Build an Agent?

 Task needs multiple steps and decisions
 Task is automatable but complex
 Task value justifies cost and time
 Simple tasks that need just one API call`,

 quiz: [
 {
 id: 'q24-1',
 questionAr: 'الفرق الرئيسي بين Chatbot وـ AI Agent؟',
 questionEn: 'The main difference between a Chatbot and an AI Agent?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'الـ Agent بينفذ مهام متعددة الخطوات بشكل مستقل', textEn: 'The Agent executes multi-step tasks independently', isCorrect: true },
 { id: 'o2', textAr: 'الـ Agent أسرع من الـ Chatbot', textEn: 'The Agent is faster than the Chatbot', isCorrect: false },
 { id: 'o3', textAr: 'الـ Agent أرخص تكلفة', textEn: 'The Agent is cheaper', isCorrect: false },
 { id: 'o4', textAr: 'مفيش فرق جوهري', textEn: 'No fundamental difference', isCorrect: false },
 ],
 },
 {
 id: 'q24-2',
 questionAr: 'الـ Agent Loop بيتوقف لما؟',
 questionEn: 'The Agent Loop stops when?',
 type: 'multiple_choice',
 options: [
 { id: 'o1', textAr: 'stop_reason يكون "end_turn" أو يوصل لـ max_steps', textEn: 'stop_reason is "end_turn" or reaches max_steps', isCorrect: true },
 { id: 'o2', textAr: 'بعد 3 خطوات دايماً', textEn: 'Always after 3 steps', isCorrect: false },
 { id: 'o3', textAr: 'لما المستخدم يكتب "stop"', textEn: 'When user types "stop"', isCorrect: false },
 { id: 'o4', textAr: 'بعد استدعاء tool واحد', textEn: 'After one tool call', isCorrect: false },
 ],
 },
 {
 id: 'q24-3',
 questionAr: 'صح ولا غلط: مهمة بسيطة زي ترجمة كلمة تستاهل نبني ليها Agent',
 questionEn: 'True or False: A simple task like translating a word is worth building an Agent for',
 type: 'true_false',
 options: [
 { id: 'o1', textAr: 'صح', textEn: 'True', isCorrect: false },
 { id: 'o2', textAr: 'غلط — API call واحدة أكفأ', textEn: 'False — one API call is more efficient', isCorrect: true },
 ],
 },
 ],
 },
];

const allLessons: Lesson[] = [...claudeLessons, ...promptEngineeringLessons, ...claudeApiLessons, ...developerLessons];

export function getLessonsByAgent(agentSlug: string): Lesson[] {
 return allLessons.filter((l) => l.agentSlug === agentSlug).sort((a, b) => a.order - b.order);
}

export function getLessonById(id: number): Lesson | undefined {
 return allLessons.find((l) => l.id === id);
}

export function getAgentBySlug(slug: string): Agent | undefined {
 return agents.find((a) => a.slug === slug);
}
