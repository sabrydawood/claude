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

export function getLessonsByAgent(agentSlug: string): Lesson[] {
  return claudeLessons.filter((l) => l.agentSlug === agentSlug).sort((a, b) => a.order - b.order);
}

export function getLessonById(id: number): Lesson | undefined {
  return claudeLessons.find((l) => l.id === id);
}

export function getAgentBySlug(slug: string): Agent | undefined {
  return agents.find((a) => a.slug === slug);
}
