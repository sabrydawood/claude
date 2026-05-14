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
  emoji: string;
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
  emoji: string;
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
    emoji: '🤖',
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
    emoji: '💬',
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
    emoji: '✨',
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
    emoji: '👋',
    order: 1,
    xpReward: 50,
    estimatedMinutes: 5,
    contentAr: `
## Claude إيه ده؟ 🤔

تخيل إن عندك صاحب ذكي جداً، بيعرف حاجات كتير في مواضيع كتير، وهو متاح ليك في أي وقت وفي أي مكان. ده بالظبط Claude!

Claude هو **مساعد ذكاء اصطناعي** من شركة اسمها **Anthropic**. يعني إيه ذكاء اصطناعي؟ يعني برنامج كمبيوتر ذكي جداً اتعلم من ملايين الكتب والمقالات والمحادثات، وبقى قادر يفهم اللي بتقوله ويرد عليك بطريقة طبيعية زي ما بتكلم صاحبك!

## Claude زي إيه بالظبط؟ 🌟

فكر في Claude زي:

🧠 **العالم الموسوعي** - بيعرف معلومات عن أي موضوع تقريباً
✍️ **الكاتب المبدع** - بيساعدك تكتب قصص وخطابات وتقارير
💻 **المبرمج المحترف** - بيكتب كود ويشرحه بطريقة سهلة
🔢 **الأستاذ الصبور** - بيشرح الرياضيات والعلوم بطريقة ممتعة
💡 **المستشار الأمين** - بيديك نصايح ويساعدك تفكر في مشاكلك

## هو بيفهم بالعربي؟ 🌍

أيوه! Claude بيفهم ويتكلم أكتر من 50 لغة، منها العربية طبعاً. تقدر تكلمه بالعامية المصرية وهيفهمك تمام! 🎉

## هو زي الروبوت؟ 🤖

مش بالظبط! Claude مش روبوت بيحفظ ردود جاهزة. هو بيفهم سؤالك فعلاً ويفكر فيه ويدي إجابة مناسبة. لكن لازم تعرف إنه برنامج - مش إنسان حقيقي.

## ليه بنتعلم عنه؟ 📚

لأن Claude وغيره من مساعدات الذكاء الاصطناعي هيبقوا جزء مهم من حياتنا كلنا. اللي بيعرف يستخدمهم صح هيقدر يعمل حاجات مذهلة!
    `,
    contentEn: `
## What is Claude? 🤔

Imagine having a very smart friend who knows a lot about many topics, available anytime, anywhere. That's exactly Claude!

Claude is an **AI assistant** from a company called **Anthropic**. What does AI mean? It means a very smart computer program that learned from millions of books, articles, and conversations, and can now understand what you say and respond naturally - just like talking to a friend!

## What is Claude exactly like? 🌟

Think of Claude as:

🧠 **The Encyclopedia Expert** - knows information about almost any topic
✍️ **The Creative Writer** - helps you write stories, letters, and reports
💻 **The Pro Programmer** - writes and explains code in an easy way
🔢 **The Patient Teacher** - explains math and science in a fun way
💡 **The Honest Advisor** - gives advice and helps you think through problems

## Does it understand Arabic? 🌍

Yes! Claude understands and speaks more than 50 languages, including Arabic! You can chat with it in Egyptian dialect and it will understand you perfectly! 🎉

## Is it like a robot? 🤖

Not exactly! Claude isn't a robot that repeats pre-set answers. It actually understands your question, thinks about it, and gives an appropriate response. But remember, it's a program - not a real human.

## Why learn about it? 📚

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
    emoji: '💬',
    order: 2,
    xpReward: 60,
    estimatedMinutes: 7,
    contentAr: `
## التكلم مع Claude سهل! 😊

التكلم مع Claude سهل جداً - زي ما بتبعت رسالة لصاحبك على الواتساب! بس في حاجات صغيرة لو عملتها هتفرق كتير في جودة الإجابة اللي هتاخدها.

## ابدأ بتحية 👋

مش لازم، بس ممكن! Claude بيرد على التحية بطريقة ودودة.

مثال:
> **أنت:** أهلاً! أنا عايز أتعلم عن الفضاء
> **Claude:** أهلاً! ده موضوع رائع، هساعدك تعرف أكتر. إيه اللي بيثير اهتمامك بالتحديد؟

## الطلبات الواضحة بتدي إجابات أحسن 🎯

**مش واضح:**
> "اكتبلي حاجة عن العلوم"

**واضح ومحدد:**
> "اكتبلي فقرة قصيرة عن الثقوب السوداء بطريقة سهلة لطفل عمره 10 سنين"

الفرق؟ في الطلب التاني قلت:
- ✅ الموضوع بالظبط (الثقوب السوداء)
- ✅ طول الإجابة (فقرة قصيرة)
- ✅ مستوى الصعوبة (لطفل 10 سنين)

## أنواع الطلبات اللي ممكن تعملها 📝

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

## نصايح ذهبية 💡

⭐ **لو مش فاهم الإجابة** - قوله: "مش فاهم، ممكن تشرح بطريقة أبسط؟"

⭐ **لو عايز معلومات أكتر** - قوله: "ممكن تكمل وتقولي أكتر؟"

⭐ **لو الإجابة مش اللي كنت عايزه** - وضح أكتر: "أنا كنت قاصد..."

⭐ **مش لازم تكون رسمي** - اتكلم بطريقتك العادية، هيفهمك!
    `,
    contentEn: `
## Talking to Claude is Easy! 😊

Talking to Claude is very easy - just like sending a message to a friend on WhatsApp! But there are small things that, if you do them, will make a big difference in the quality of your answers.

## Start with a Greeting 👋

Not required, but nice! Claude responds to greetings in a friendly way.

Example:
> **You:** Hello! I want to learn about space
> **Claude:** Hello! That's an amazing topic. What specifically interests you?

## Clear Requests Give Better Answers 🎯

**Unclear:**
> "Write me something about science"

**Clear and specific:**
> "Write me a short paragraph about black holes in a simple way for a 10-year-old child"

The difference? In the second request you said:
- ✅ The exact topic (black holes)
- ✅ Length of response (short paragraph)
- ✅ Difficulty level (for a 10-year-old)

## Types of Requests You Can Make 📝

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

## Golden Tips 💡

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
    emoji: '⚡',
    order: 3,
    xpReward: 60,
    estimatedMinutes: 8,
    contentAr: `
## Claude بيعمل حاجات كتير جداً! 🌟

هتتفاجأ بكمية الحاجات اللي Claude بيقدر يساعدك بيها. خلينا نتعرف عليها!

## 1. الكتابة والإبداع ✍️

Claude بيساعدك في أي حاجة بتتعلق بالكتابة:
- 📖 كتابة قصص وحكايات ممتعة
- 📝 كتابة إنشاءات للمدرسة
- 💌 كتابة رسايل وإيميلات
- 🎭 كتابة حوارات ومسرحيات
- 🎵 كتابة أغاني وقصايد

**مثال:** "اكتبلي قصة قصيرة عن ولد اكتشف آلة الزمن وراح عصر الديناصورات"

## 2. الشرح والتعليم 📚

ده اللي Claude بيتألق فيه أكتر!
- 🔢 شرح الرياضيات خطوة خطوة
- 🔬 شرح مواد العلوم بطريقة ممتعة
- 📜 شرح أحداث التاريخ
- 🌍 معلومات عن البلاد والثقافات
- 💡 شرح أي فكرة صعبة بطريقة بسيطة

**مثال:** "فاهمتش الهندسة دي، ممكن تشرحها بأمثلة من الحياة؟"

## 3. البرمجة والتكنولوجيا 💻

حتى لو عمرك ما كتبت كود، Claude يساعدك تبدأ!
- كتابة برامج بسيطة
- شرح كيف الكود بيشتغل
- اكتشاف الأخطاء في الكود
- تعليم لغات برمجة مختلفة

## 4. التحليل والبحث 🔍

- تلخيص نصوص طويلة
- مقارنة بين حاجتين
- تحليل موقف أو مشكلة
- مساعدة في البحث عن معلومات

## 5. الترجمة 🌐

Claude بيترجم بين أكتر من 50 لغة بدقة عالية!
- من العربي للإنجليزي والعكس
- فرنسي، ألماني، إسباني، صيني...

## 6. التخطيط والتنظيم 📋

- عمل خطط دراسة
- تنظيم أفكار مشروع
- عمل قوائم مهام
- التخطيط لرحلة أو حفلة

## حاجات Claude مش بيعملها 🚫

عشان تعرف إيه حدوده:
- مش بيتصل بالإنترنت في الوقت الحالي
- مش بيقدر يشوف صور أو فيديوهات في النسخة العادية
- مش بيعرف الأخبار الجديدة بعد تاريخ تدريبه
- مش بيتذكر المحادثات القديمة (كل محادثة جديدة)
    `,
    contentEn: `
## Claude Does So Many Things! 🌟

You'll be amazed at how many things Claude can help you with. Let's explore!

## 1. Writing and Creativity ✍️

Claude helps with anything related to writing:
- 📖 Writing fun stories and tales
- 📝 Writing school essays
- 💌 Writing letters and emails
- 🎭 Writing dialogues and plays
- 🎵 Writing songs and poems

**Example:** "Write me a short story about a boy who discovers a time machine and goes to the dinosaur era"

## 2. Explanation and Education 📚

This is where Claude truly shines!
- 🔢 Explaining math step by step
- 🔬 Explaining science subjects in a fun way
- 📜 Explaining historical events
- 🌍 Information about countries and cultures
- 💡 Explaining any difficult idea simply

**Example:** "I don't understand this geometry problem, can you explain with real-life examples?"

## 3. Programming and Technology 💻

Even if you've never written code, Claude helps you start!
- Writing simple programs
- Explaining how code works
- Finding errors in code
- Teaching different programming languages

## 4. Analysis and Research 🔍

- Summarizing long texts
- Comparing between two things
- Analyzing a situation or problem
- Helping find information

## 5. Translation 🌐

Claude translates between more than 50 languages with high accuracy!

## 6. Planning and Organization 📋

- Making study plans
- Organizing project ideas
- Making to-do lists
- Planning trips or parties

## Things Claude Doesn't Do 🚫

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
    emoji: '✨',
    order: 4,
    xpReward: 75,
    estimatedMinutes: 10,
    contentAr: `
## سر الـ Prompt الممتاز 🔑

الـ "Prompt" هو الطلب أو السؤال اللي بتبعته لـ Claude. وفي فرق كبير بين prompt كويس وprompt مش كويس!

## الفرق بين طلب عادي وطلب ممتاز 🆚

### مثال 1: المذاكرة

❌ **طلب ضعيف:**
> "ساعدني أذاكر"

✅ **طلب ممتاز:**
> "أنا طالب في الصف الخامس الابتدائي، عندي امتحان رياضيات بكرا في الكسور والأعداد العشرية. ممكن تعمللي خطة مذاكرة لمدة 3 ساعات مع أمثلة تدريبية؟"

### مثال 2: القصة

❌ **طلب ضعيف:**
> "اكتبلي قصة"

✅ **طلب ممتاز:**
> "اكتبلي قصة مغامرات قصيرة (10 أسطر تقريباً) لأطفال عمرهم 8 سنين، البطل ولد اسمه كريم بيكتشف غابة سحرية في حديقة بيته"

## عناصر الطلب الممتاز 📋

### 1. 🎯 التحديد - قول بالظبط إيه اللي عايزه
بدل "حاجة عن الفضاء" قول "معلومات عن كوكب المريخ"

### 2. 📏 الطول - قول كام عايز
"اكتبلي فقرة واحدة" أو "اعمللي قايمة من 5 نقاط"

### 3. 👥 الجمهور - مين هيقرأ؟
"لطفل عمره 8 سنين" أو "لطالب في الجامعة"

### 4. 🎨 الأسلوب - إزاي عايزه يكون؟
"بطريقة ممتعة ومضحكة" أو "بطريقة رسمية ومحترمة"

### 5. 📝 السياق - إيه الخلفية؟
"أنا بكتب موضوع مدرسي عن..." أو "أنا بحاول أفهم..."

## تمرين عملي! 🏋️

دلوقتي جرب تحسن الطلبات دي:

**طلب 1:** "قصيدة"
→ فكر: عن إيه؟ كام بيت؟ لمين؟ بأي أسلوب؟

**طلب 2:** "شرح رياضيات"
→ فكر: أي موضوع؟ مستواك إيه؟ بتعلم وحدك ولا للمذاكرة؟

## نصيحة أخيرة ذهبية 🌟

لو مش عارف تصيغ الطلب صح، قول لـ Claude نفسه:
> "أنا عايز [هدفك]، ساعدني أصيغ طلب كويس عشان تقدر تساعدني صح"

Claude هيساعدك تكتب الطلب المناسب! 🎉
    `,
    contentEn: `
## The Secret of a Great Prompt 🔑

A "prompt" is the request or question you send to Claude. And there's a big difference between a good prompt and a bad one!

## The Difference Between a Normal and Great Request 🆚

### Example 1: Studying

❌ **Weak request:**
> "Help me study"

✅ **Great request:**
> "I'm a 5th grade student, I have a math exam tomorrow on fractions and decimals. Can you make me a 3-hour study plan with practice examples?"

### Example 2: Story

❌ **Weak request:**
> "Write me a story"

✅ **Great request:**
> "Write me a short adventure story (about 10 lines) for 8-year-old children, the hero is a boy named Karim who discovers a magical forest in his backyard"

## Elements of a Great Request 📋

### 1. 🎯 Specificity - Say exactly what you want
Instead of "something about space" say "information about planet Mars"

### 2. 📏 Length - Say how much you want
"Write me one paragraph" or "Make me a list of 5 points"

### 3. 👥 Audience - Who will read it?
"For an 8-year-old" or "For a university student"

### 4. 🎨 Style - How do you want it?
"In a fun and funny way" or "In a formal and professional way"

### 5. 📝 Context - What's the background?
"I'm writing a school essay about..." or "I'm trying to understand..."

## Practical Exercise! 🏋️

Now try to improve these requests:

**Request 1:** "Poem"
→ Think: About what? How many lines? For whom? What style?

**Request 2:** "Math explanation"
→ Think: Which topic? What's your level? Self-study or exam prep?

## Final Golden Tip 🌟

If you don't know how to phrase your request correctly, ask Claude himself:
> "I want [your goal], help me phrase a good request so you can help me properly"

Claude will help you write the right request! 🎉
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
      titleAr: 'حسّن الطلب ده! 🎯',
      titleEn: 'Improve This Request! 🎯',
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
    emoji: '🏫',
    order: 5,
    xpReward: 75,
    estimatedMinutes: 8,
    contentAr: `
## Claude أفضل مساعد في المذاكرة! 📚

كتير من الطلاب بيستخدموا Claude في المذاكرة، وبيقولوا إنه غيّر طريقة تعلمهم كلياً! هنا هتعرف إزاي تستخدمه صح.

## الاستخدامات الذكية في المدرسة 🎓

### 1. فهم الدروس الصعبة 🤔

**بدل ما تقعد تحتار لوحدك، قول لـ Claude:**
> "مش فاهم موضوع الكهرباء الساكنة في العلوم، ممكن تشرحه بمثال من الحياة اليومية؟"

Claude هيشرحلك بطريقة تفهمها وهتفضل فاكرها!

### 2. المراجعة قبل الامتحان 📝

> "أنا عندي امتحان في التاريخ عن العصر الفرعوني. ممكن تعمل 10 أسئلة مراجعة وتديني الإجابات بعد ما أجاوب؟"

ده أحسن من أي ورقة مراجعة! هيعمللك أسئلة مناسبة لمستواك.

### 3. مساعدة في الإنشاء والتعبير ✍️

**لو عندك موضوع إنشاء:**
> "المطلوب مني أكتب موضوع عن 'أهمية القراءة' 150 كلمة. ممكن تساعدني أرتب أفكاري وتقترح نقاط مهمة؟"

**مهم:** اطلب منه أفكار ومساعدة في التفكير، مش إنه يكتب عنك! التعلم هو الأهم.

### 4. حل مسائل الرياضيات 🔢

> "مش قادر أحل المسألة دي: [المسألة]. ممكن تشرحلي الخطوات خطوة خطوة من غير ما تديني الإجابة الأول؟"

اللي بيميز كده إنك بتتعلم الطريقة مش بس الإجابة!

### 5. شرح اللغات 🌍

> "في الإنجليزي مش بفهم الفرق بين 'has been' و'was'. ممكن تشرح الفرق بأمثلة؟"

## ⚠️ تحذير مهم جداً!

هناك فرق كبير بين:

✅ **الاستخدام الصح:** تطلب من Claude يساعدك تفهم وتتعلم
❌ **الاستخدام الغلط:** تطلب منه يعمل الواجب عنك

لو Claude عمل الواجب عنك:
- مش هتتعلم حاجة
- هتفشل في الامتحان لأنك مش فاهم
- بتغش نفسك مش بس الأستاذ!

## نصايح للوالدين والمعلمين 👨‍👩‍👧

Claude أداة تعليمية رائعة لما بيتستخدم صح. هو بيشجع الفهم والتفكير، مش الحفظ والنقل.

## جرب دلوقتي! 🚀

أي مادة بتستصعبها دلوقتي؟ روح على Claude وقوله:
> "أنا طالب في [صفك]، مش فاهم [الموضوع]. ممكن تشرح بطريقة سهلة وبعدين اسألني سؤال عشان أتأكد إني فاهم؟"
    `,
    contentEn: `
## Claude is the Best Study Assistant! 📚

Many students use Claude for studying and say it completely changed their learning! Here you'll learn how to use it correctly.

## Smart Uses at School 🎓

### 1. Understanding Difficult Lessons 🤔

**Instead of struggling alone, tell Claude:**
> "I don't understand static electricity in science, can you explain it with a real-life example?"

Claude will explain it in a way you understand and will remember!

### 2. Reviewing Before Exams 📝

> "I have a history exam about the Pharaonic era. Can you make 10 review questions and give me the answers after I respond?"

Better than any review sheet! It'll make questions appropriate for your level.

### 3. Help with Essays and Compositions ✍️

**If you have an essay topic:**
> "I need to write an essay about 'the importance of reading' in 150 words. Can you help me organize my ideas and suggest important points?"

**Important:** Ask for ideas and thinking help, not for it to write FOR you! Learning is what matters.

### 4. Solving Math Problems 🔢

> "I can't solve this problem: [problem]. Can you explain the steps step by step without giving me the answer first?"

What makes this special is you learn the METHOD not just the answer!

### 5. Language Explanations 🌍

> "In English I don't understand the difference between 'has been' and 'was'. Can you explain with examples?"

## ⚠️ Very Important Warning!

There's a big difference between:

✅ **Correct use:** Asking Claude to help you understand and learn
❌ **Wrong use:** Asking it to do your homework for you

If Claude does your homework:
- You won't learn anything
- You'll fail the exam because you don't understand
- You're cheating yourself, not just the teacher!

## Try It Now! 🚀

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
    emoji: '💬',
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

### 1. 🎯 الهدف
إيه اللي عايزه بالظبط؟

### 2. 📋 السياق
إيه اللي المفروض Claude يعرفه عشان يساعدك؟

### 3. 📏 الشكل
عايز الإجابة إزاي؟ قصيرة؟ طويلة؟ نقط؟ جدول؟

### 4. 🔍 القيود
في حاجة مش عايزها؟ أو حدود معينة؟

---

## مثال عملي

**بدل ما تكتب:**
> "اكتب قصة"

**اكتب:**
> "اكتب قصة قصيرة (150 كلمة) عن طفل اسمه كريم بيكتشف روبوت في حديقة بيته. الأسلوب يكون مناسب لأطفال 8 سنين، ونهايتها سعيدة."

الفرق ضخم جداً في جودة النتيجة! 🚀`,

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

### 1. 🎯 Goal
What exactly do you want?

### 2. 📋 Context
What should Claude know to help you?

### 3. 📏 Format
How do you want the answer? Short? Long? Bullet points? Table?

### 4. 🔍 Constraints
Anything you don't want? Any specific limits?

---

## Practical Example

**Instead of writing:**
> "Write a story"

**Write:**
> "Write a short story (150 words) about a boy named Karim who discovers a robot in his garden. The style should suit 8-year-olds, with a happy ending."

The difference in output quality is huge! 🚀`,

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
    emoji: '🎯',
    contentAr: `## Zero-shot Prompting

الـ **Zero-shot** معناها "صفر أمثلة" — بتسأل Claude مباشرة من غير ما تدي أي مثال أو توضيح إضافي.

---

## إمتى بتشتغل كويس؟

الـ Zero-shot بتشتغل تمام في:

- ✅ الأسئلة البسيطة والواضحة
- ✅ المهام اللي Claude اتدرب عليها كتير
- ✅ لما الوقت ضيق
- ✅ الترجمة والتلخيص والتصنيف

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

## نصيحة مهمة 💡

حتى في الـ Zero-shot، كلما كان طلبك أوضح، كانت النتيجة أحسن.

**مش كويس:**
> "لخص"

**كويس:**
> "لخص النص ده في 3 نقط رئيسية باللغة العربية"

---

## إمتى مش بتكفي؟

لو Claude مش بيفهم المطلوب منه بالظبط، يبقى وقت تجرب الـ **Few-shot** — وهي الدرس الجاي! 👇`,

    contentEn: `## Zero-shot Prompting

**Zero-shot** means "zero examples" — you ask Claude directly without giving any examples or extra clarification.

---

## When Does It Work Well?

Zero-shot works great for:

- ✅ Simple, clear questions
- ✅ Tasks Claude was heavily trained on
- ✅ When you're short on time
- ✅ Translation, summarization, classification

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

## Important Tip 💡

Even in Zero-shot, the clearer your request, the better the result.

**Not great:**
> "Summarize"

**Better:**
> "Summarize this text in 3 main bullet points in Arabic"

---

## When Is It Not Enough?

If Claude doesn't fully understand what you need, it's time to try **Few-shot** — that's the next lesson! 👇`,

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
    emoji: '📚',
    contentAr: `## Few-shot Prompting

الـ **Few-shot** معناها "أمثلة قليلة" — بتدي Claude مثال واحد أو أكتر قبل ما تطلب منه المهمة.

زي ما بتعلم حد جديد — بدل ما تشرحله بالكلام، بتقوله "افعل زي ما أنا بعمل".

---

## الفرق بين Zero-shot و Few-shot

| | Zero-shot | Few-shot |
|---|---|---|
| **أمثلة** | ❌ مفيش | ✅ في أمثلة |
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

Claude هيعرف النمط المطلوب ويجاوب: **محايدة** ✅

---

## مثال 2: توليد بيانات بنمط معين

\`\`\`
حوّل الأسماء دي لصيغة "اسم_عائلة، الاسم_الأول":

أحمد محمد → محمد، أحمد
سارة علي → علي، سارة
خالد يوسف → ???
\`\`\`

Claude هيكمل: **يوسف، خالد** ✅

---

## قاعدة الـ Few-shot

1. **الأمثلة** — 2 إلى 5 أمثلة بتوضح النمط
2. **الفصل** — افصل بين الأمثلة بوضوح
3. **الاتساق** — الأمثلة لازم تكون كلها بنفس الأسلوب
4. **الطلب** — في الآخر اطلب المهمة الجديدة

---

## نصيحة الـ Pro 💡

مش لازم تشرح القاعدة — بس وري الأمثلة وسيب Claude يفهم الباقي. الـ AI ذكي كفاية يستنتج النمط! 🧠`,

    contentEn: `## Few-shot Prompting

**Few-shot** means "a few examples" — you give Claude one or more examples before asking for the task.

Like teaching someone new — instead of explaining in words, you show them "do it like I do."

---

## Zero-shot vs Few-shot

| | Zero-shot | Few-shot |
|---|---|---|
| **Examples** | ❌ None | ✅ Has examples |
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

Claude will recognize the pattern and answer: **Neutral** ✅

---

## Example 2: Generating Data in a Pattern

\`\`\`
Convert these names to "Last_Name, First_Name" format:

Ahmed Mohamed → Mohamed, Ahmed
Sara Ali → Ali, Sara
Khaled Youssef → ???
\`\`\`

Claude will complete: **Youssef, Khaled** ✅

---

## The Few-shot Rule

1. **Examples** — 2 to 5 examples showing the pattern
2. **Separation** — Clearly separate examples
3. **Consistency** — All examples must follow the same style
4. **Request** — At the end, ask for the new task

---

## Pro Tip 💡

You don't need to explain the rule — just show the examples and let Claude figure out the rest. AI is smart enough to infer the pattern! 🧠`,

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
    emoji: '🧠',
    contentAr: `## Chain of Thought Prompting

الـ **Chain of Thought (CoT)** معناها "سلسلة التفكير" — بتطلب من Claude يوضح خطوات تفكيره قبل ما يوصل للإجابة.

---

## ليه مهم؟

لما Claude بيفكر خطوة خطوة:
- ✅ بيغلط أقل في المسائل المعقدة
- ✅ بتقدر تتابع منطقه وتكتشف أي خطأ
- ✅ الإجابات بتبقى أعمق وأكثر تفصيلاً
- ✅ مفيد جداً في الرياضيات والمنطق والقرارات

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
4. الباقي = 18 - 9 = **9 تفاحات** ✅

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
| مسألة رياضية | ✅ دايماً |
| قرار استراتيجي | ✅ دايماً |
| تحليل نص | ✅ مفيد |
| ترجمة كلمة | ❌ مش محتاج |
| إجابة سريعة | ❌ مش محتاج |

---

## Magic Phrase ✨

> **"فكّر خطوة خطوة قبل ما تجاوب"**

الجملة دي وحدها بتحسن دقة Claude في المسائل المعقدة بنسبة كبيرة!`,

    contentEn: `## Chain of Thought Prompting

**Chain of Thought (CoT)** means asking Claude to show its thinking steps before reaching an answer.

---

## Why Does It Matter?

When Claude thinks step by step:
- ✅ Makes fewer mistakes on complex problems
- ✅ You can follow its reasoning and catch errors
- ✅ Answers become deeper and more detailed
- ✅ Very useful for math, logic, and decisions

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
4. Remaining = 18 - 9 = **9 apples** ✅

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
| Math problem | ✅ Always |
| Strategic decision | ✅ Always |
| Text analysis | ✅ Useful |
| Translating a word | ❌ Not needed |
| Quick answer | ❌ Not needed |

---

## Magic Phrase ✨

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
    emoji: '🎭',
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

## تحذير مهم ⚠️

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

## Important Warning ⚠️

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
    emoji: '📋',
    contentAr: `## تنسيق الإجابة

من أهم مهارات الـ Prompting إنك تحدد **شكل الإجابة** اللي عايزها — مش بس المحتوى.

---

## التنسيقات الشائعة

### 📝 نقط (Bullet Points)
\`\`\`
اكتب فوائد ممارسة الرياضة في شكل نقط قصيرة
\`\`\`

### 📊 جدول
\`\`\`
قارن بين Python و JavaScript في جدول فيه: الاستخدام، السهولة، الراتب
\`\`\`

### 🔢 قائمة مرقمة
\`\`\`
اكتب خطوات تعلم البرمجة من الصفر في 10 خطوات مرقمة
\`\`\`

### 💻 JSON
\`\`\`
أعطني معلومات عن مصر في شكل JSON فيه: الاسم، العاصمة، عدد السكان، اللغة
\`\`\`

### 📄 Markdown
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

## نصيحة الـ Pro 💡

دمج التنسيق مع بقية التقنيات بيعطي نتائج ممتازة:

> "**أنت مستشار تسويق** (Role). حلّل منافسينا الثلاثة **خطوة خطوة** (CoT). النتيجة في **جدول** فيه: الاسم، نقاط القوة، نقاط الضعف، الفرصة." (Format)`,

    contentEn: `## Output Formatting

One of the most important prompting skills is specifying the **format** of the answer you want — not just the content.

---

## Common Formats

### 📝 Bullet Points
\`\`\`
Write the benefits of exercise in short bullet points
\`\`\`

### 📊 Table
\`\`\`
Compare Python and JavaScript in a table with: Use case, Ease, Salary
\`\`\`

### 🔢 Numbered List
\`\`\`
Write 10 numbered steps to learn programming from scratch
\`\`\`

### 💻 JSON
\`\`\`
Give me information about Egypt in JSON format with: name, capital, population, language
\`\`\`

### 📄 Markdown
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

## Pro Tip 💡

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
    emoji: '⚙️',
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
- 🎭 بيحدد شخصية الـ AI (اسمه، أسلوبه)
- 📏 بيحدد القواعد (إيه اللي يعمله وإيه اللي ميعملوش)
- 🌍 بيحدد السياق (إيه المنتج، مين المستخدمين)
- 🔒 بيحدد الحدود (لا تتكلم في السياسة، الدين، إلخ)

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
لهجتك ودودة ومبتهجة دايماً 😊
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

## جرّبه دلوقتي في Sandbox! 🧪

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
- 🎭 Defines the AI's persona (name, style)
- 📏 Sets the rules (what to do and what not to do)
- 🌍 Defines context (what's the product, who are the users)
- 🔒 Sets boundaries (no politics, religion, etc.)

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
Your tone is always friendly and cheerful 😊
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

## Try It Now in Sandbox! 🧪

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
    emoji: '🏆',
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

❌ **Prompt غامض** → ✅ كن دقيق ومحدد
❌ **سياق ناقص** → ✅ اديه كل المعلومات المهمة
❌ **تنسيق مش محدد** → ✅ قول عايز الإجابة إزاي
❌ **كل تقنية لوحدها** → ✅ ادمجهم مع بعض

---

## 🎉 مبروك!

خلصت **Prompt Engineering track** كامل! دلوقتي عندك:

- ✅ Zero-shot Prompting
- ✅ Few-shot Prompting
- ✅ Chain of Thought
- ✅ Role Prompting
- ✅ Output Formatting
- ✅ System Prompt
- ✅ دمج التقنيات

جرّب كل اللي اتعلمته في **الـ Sandbox** واكتشف قوتك الحقيقية! 🚀`,

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

❌ **Vague prompt** → ✅ Be precise and specific
❌ **Missing context** → ✅ Give all important information
❌ **Unspecified format** → ✅ Say how you want the answer
❌ **Each technique alone** → ✅ Combine them together

---

## 🎉 Congratulations!

You've completed the full **Prompt Engineering track**! You now have:

- ✅ Zero-shot Prompting
- ✅ Few-shot Prompting
- ✅ Chain of Thought
- ✅ Role Prompting
- ✅ Output Formatting
- ✅ System Prompt
- ✅ Combining Techniques

Try everything you've learned in the **Sandbox** and discover your true power! 🚀`,

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
          { id: 'o1', textAr: 'صح 🎉', textEn: 'True 🎉', isCorrect: true },
          { id: 'o2', textAr: 'غلط', textEn: 'False', isCorrect: false },
        ],
      },
    ],
  },
];

const allLessons: Lesson[] = [...claudeLessons, ...promptEngineeringLessons];

export function getLessonsByAgent(agentSlug: string): Lesson[] {
  return allLessons.filter((l) => l.agentSlug === agentSlug).sort((a, b) => a.order - b.order);
}

export function getLessonById(id: number): Lesson | undefined {
  return allLessons.find((l) => l.id === id);
}

export function getAgentBySlug(slug: string): Agent | undefined {
  return agents.find((a) => a.slug === slug);
}
