const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

interface WebSiteSchemaProps {
  locale: string;
}

export function WebSiteSchema({ locale }: WebSiteSchemaProps) {
  const isAr = locale === 'ar';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ذكاوي | Zkawi',
    alternateName: isAr ? 'Zkawi' : 'ذكاوي',
    url: APP_URL,
    description: isAr
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
  const isAr = locale === 'ar';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'ذكاوي | Zkawi',
    url: APP_URL,
    logo: `${APP_URL}/logo-icon.svg`,
    description: isAr
      ? 'منصة تعليمية تفاعلية للأطفال والكبار لتعلم الذكاء الاصطناعي'
      : 'Interactive educational platform for learning AI',
    sameAs: [],
    foundingDate: '2024',
    knowsAbout: ['Artificial Intelligence', 'Machine Learning', 'Claude AI', 'AI Education'],
    audience: { '@type': 'Audience', audienceType: isAr ? 'أطفال وكبار' : 'Kids and Adults' },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

interface CourseSchemaProps {
  locale: string;
  agentSlug: string;
  agentName: string;
  agentDescription: string;
  lessons: Array<{ slug: string; titleAr: string; titleEn: string; descriptionAr: string; descriptionEn: string; estimatedMinutes: number }>;
}

export function CourseSchema({ locale, agentSlug, agentName, agentDescription, lessons }: CourseSchemaProps) {
  const isAr = locale === 'ar';
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
    inLanguage: isAr ? 'ar' : 'en',
    isAccessibleForFree: true,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: `PT${lessons.reduce((s, l) => s + l.estimatedMinutes, 0)}M`,
    },
    hasPart: lessons.map((lesson) => ({
      '@type': 'Course',
      name: isAr ? lesson.titleAr : lesson.titleEn,
      description: isAr ? lesson.descriptionAr : lesson.descriptionEn,
      url: `${APP_URL}/${locale}/agents/${agentSlug}/lessons/${lesson.slug}`,
      timeRequired: `PT${lesson.estimatedMinutes}M`,
    })),
    audience: { '@type': 'Audience', audienceType: isAr ? 'أطفال وكبار' : 'Kids and Adults' },
    educationalLevel: isAr ? 'مبتدئ' : 'Beginner',
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

interface LessonSchemaProps {
  locale: string;
  agentSlug: string;
  lesson: {
    slug: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    estimatedMinutes: number;
    xpReward: number;
  };
}

export function LessonSchema({ locale, agentSlug, lesson }: LessonSchemaProps) {
  const isAr = locale === 'ar';
  const title = isAr ? lesson.titleAr : lesson.titleEn;
  const description = isAr ? lesson.descriptionAr : lesson.descriptionEn;
  const url = `${APP_URL}/${locale}/agents/${agentSlug}/lessons/${lesson.slug}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: title,
    description,
    url,
    inLanguage: isAr ? 'ar' : 'en',
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
    audience: { '@type': 'Audience', audienceType: isAr ? 'أطفال وكبار' : 'Kids and Adults' },
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
