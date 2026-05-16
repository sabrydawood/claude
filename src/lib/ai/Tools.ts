// src/Lib/Ai/Tools.ts

export type TaskType =
  | 'simple_chat'
  | 'explanation'
  | 'socratic'
  | 'assessment'
  | 'content_gen'
  | 'translation';

export function ClassifyTaskType(message: string): TaskType {
  const lower = message.toLowerCase();
  const wordCount = message.trim().split(/\s+/).length;

  if (wordCount < 10 && !lower.match(/\b(ما|كيف|اشرح|لماذا|هل|what|how|why|explain)\b/)) {
    return 'simple_chat';
  }
  if (lower.match(/\b(لماذا|why|سبب|reason)\b/)) return 'socratic';
  if (lower.match(/\b(ما هو|ما هي|اشرح|كيف|what is|explain|how)\b/)) return 'explanation';
  return 'explanation';
}

export const MascotTools = [
  {
    name: 'get_concept',
    description: 'جلب شرح مفهوم محدد من Knowledge Graph. استخدم عند سؤال الطالب عن مفهوم تعليمي.',
    input_schema: {
      type: 'object' as const,
      properties: {
        concept_id: { type: 'string', description: 'معرّف المفهوم في Knowledge Graph' },
        detail_level: { type: 'string', enum: ['brief', 'full'], description: 'مستوى التفصيل' },
      },
      required: ['concept_id'],
    },
  },
  {
    name: 'get_prerequisites',
    description: 'المفاهيم التي يجب إتقانها قبل هذا المفهوم.',
    input_schema: {
      type: 'object' as const,
      properties: {
        concept_id: { type: 'string' },
      },
      required: ['concept_id'],
    },
  },
  {
    name: 'check_student_mastery',
    description: 'مستوى إتقان الطالب لمفهوم معين (0-100). استخدم لتكييف الشرح.',
    input_schema: {
      type: 'object' as const,
      properties: {
        user_id: { type: 'string' },
        concept_id: { type: 'string' },
      },
      required: ['user_id', 'concept_id'],
    },
  },
  {
    name: 'get_student_profile',
    description: 'ملخص أسلوب تعلم الطالب ونقاط ضعفه. استخدم لتخصيص الأسلوب.',
    input_schema: {
      type: 'object' as const,
      properties: {
        user_id: { type: 'string' },
      },
      required: ['user_id'],
    },
  },
  {
    name: 'get_related_examples',
    description: 'أمثلة من الحياة اليومية لمفهوم حسب الفئة العمرية.',
    input_schema: {
      type: 'object' as const,
      properties: {
        concept_id: { type: 'string' },
        age_range: { type: 'string', enum: ['4-8', '9-12', '13-16'] },
      },
      required: ['concept_id', 'age_range'],
    },
  },
  {
    name: 'record_signal',
    description: 'تسجيل signal تعلم في قاعدة البيانات. استخدم بعد كل تفاعل تعليمي.',
    input_schema: {
      type: 'object' as const,
      properties: {
        user_id: { type: 'string' },
        concept_id: { type: 'string' },
        signal_type: {
          type: 'string',
          enum: ['quiz_correct', 'quiz_wrong', 'socratic_pass', 'socratic_fail', 'practical_complete'],
        },
        value: { type: 'number', description: 'القيمة بين 0 و 1' },
      },
      required: ['user_id', 'concept_id', 'signal_type', 'value'],
    },
  },
] as const;

export type MascotToolName = typeof MascotTools[number]['name'];
