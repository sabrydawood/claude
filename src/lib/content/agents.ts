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
