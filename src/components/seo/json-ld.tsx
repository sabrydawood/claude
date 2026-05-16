import { APP_URL } from '@/lib/utils';

interface WebSiteSchemaProps {
  locale: string;
}

export function WebSiteSchema({ locale }: WebSiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ذكاوي | Zkawi',
    alternateName: locale === 'ar' ? 'Zkawi' : 'ذكاوي',
    url: APP_URL,
    description: locale === 'ar'
      ? 'منصة تعليمية للأطفال والكبار لتعلم الذكاء الاصطناعي بطريقة سهلة ومرحة'
      : 'Educational platform for kids and adults to learn AI in a fun and easy way',
    inLanguage: [{ '@type': 'Language', name: 'Arabic' }, { '@type': 'Language', name: 'English' }],
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${APP_URL}/ar/agents/{search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

interface OrganizationSchemaProps {
  locale: string;
}

export function OrganizationSchema({ locale }: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'ذكاوي | Zkawi',
    url: APP_URL,
    logo: `${APP_URL}/logo-icon.svg`,
    description: locale === 'ar'
      ? 'منصة تعليمية تفاعلية للأطفال والكبار لتعلم الذكاء الاصطناعي'
      : 'Interactive educational platform for learning AI',
    sameAs: [],
    foundingDate: '2024',
    knowsAbout: ['Artificial Intelligence', 'Machine Learning', 'Claude AI', 'AI Education'],
    audience: { '@type': 'Audience', audienceType: locale === 'ar' ? 'أطفال وكبار' : 'Kids and Adults' },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

interface CourseSchemaProps {
  locale: string;
  agentSlug: string;
  agentName: string;
  agentDescription: string;
  lessons: Array<{ id: string; title: string; description: string; estimatedMinutes: number }>;
}

export function CourseSchema({ locale, agentSlug, agentName, agentDescription, lessons }: CourseSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: agentName,
    description: agentDescription,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'ذكاوي | Zkawi',
      url: APP_URL,
    },
    url: `${APP_URL}/${locale}/agents/${agentSlug}`,
    inLanguage: locale,
    isAccessibleForFree: true,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: `PT${lessons.reduce((s, l) => s + l.estimatedMinutes, 0)}M`,
    },
    hasPart: lessons.map((lesson) => ({
      '@type': 'Course',
      name: lesson.title,
      description: lesson.description,
      url: `${APP_URL}/${locale}/agents/${agentSlug}/lessons/${lesson.id}`,
      timeRequired: `PT${lesson.estimatedMinutes}M`,
    })),
    audience: { '@type': 'Audience', audienceType: locale === 'ar' ? 'أطفال وكبار' : 'Kids and Adults' },
    educationalLevel: locale === 'ar' ? 'مبتدئ' : 'Beginner',
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

interface LessonSchemaProps {
  locale: string;
  agentSlug: string;
  lessonId: string;
  lesson: {
    title: string;
    description: string;
    estimatedMinutes: number;
    xpReward: number;
  };
}

export function LessonSchema({ locale, agentSlug, lessonId, lesson }: LessonSchemaProps) {
  const title = lesson.title;
  const description = lesson.description;
  const url = `${APP_URL}/${locale}/agents/${agentSlug}/lessons/${lessonId}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: title,
    description,
    url,
    inLanguage: locale,
    isAccessibleForFree: true,
    learningResourceType: 'Lesson',
    educationalLevel: 'Beginner',
    timeRequired: `PT${lesson.estimatedMinutes}M`,
    teaches: title,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'ذكاوي | Zkawi',
      url: APP_URL,
    },
    isPartOf: {
      '@type': 'Course',
      name: 'Claude AI',
      url: `${APP_URL}/${locale}/agents/${agentSlug}`,
    },
    audience: { '@type': 'Audience', audienceType: locale === 'ar' ? 'أطفال وكبار' : 'Kids and Adults' },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
