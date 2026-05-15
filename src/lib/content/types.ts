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
