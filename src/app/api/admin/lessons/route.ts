import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { agents, lessons, translations } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { isAdminEmail } from '@/lib/admin';

async function getAdminSession(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) return null;
  if (!isAdminEmail(session.user.email)) return null;
  return session;
}

// GET /api/admin/lessons — list all lessons with AR/EN titles
export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const allLessons = await db.select().from(lessons).orderBy(lessons.agentId, lessons.order);

  if (allLessons.length === 0) return NextResponse.json({ lessons: [] });

  const ids = allLessons.map(l => l.id);
  const trans = await db
    .select()
    .from(translations)
    .where(and(eq(translations.entityType, 'lesson'), inArray(translations.entityId, ids)));

  const byId = new Map<number, Record<string, string>>();
  for (const t of trans) {
    if (!byId.has(t.entityId)) byId.set(t.entityId, {});
    byId.get(t.entityId)![`${t.locale}_${t.field}`] = t.value;
  }

  const allAgents = await db.select({ id: agents.id, slug: agents.slug }).from(agents);
  const agentMap = new Map(allAgents.map(a => [a.id, a.slug]));

  const result = allLessons.map(l => {
    const t = byId.get(l.id) ?? {};
    return {
      id: l.id,
      agentId: l.agentId,
      agentSlug: agentMap.get(l.agentId) ?? '',
      order: l.order,
      xpReward: l.xpReward,
      estimatedMinutes: l.estimatedMinutes,
      titleAr: t['ar_title'] ?? '',
      titleEn: t['en_title'] ?? '',
      descriptionAr: t['ar_description'] ?? '',
      descriptionEn: t['en_description'] ?? '',
    };
  });

  return NextResponse.json({ lessons: result });
}

// POST /api/admin/lessons — create a new lesson with translations
export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json() as {
    agentId: number;
    order?: number;
    xpReward?: number;
    estimatedMinutes?: number;
    titleAr: string;
    titleEn: string;
    descriptionAr?: string;
    descriptionEn?: string;
  };

  if (!body.agentId || !body.titleAr || !body.titleEn) {
    return NextResponse.json({ error: 'agentId, titleAr, titleEn are required' }, { status: 400 });
  }

  const [agentRow] = await db.select({ id: agents.id }).from(agents).where(eq(agents.id, body.agentId)).limit(1);
  if (!agentRow) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

  const [lesson] = await db
    .insert(lessons)
    .values({
      agentId: body.agentId,
      order: body.order ?? 0,
      xpReward: body.xpReward ?? 50,
      estimatedMinutes: body.estimatedMinutes ?? 5,
    })
    .returning();

  const transRows = [
    { entityType: 'lesson', entityId: lesson.id, locale: 'ar', field: 'title', value: body.titleAr },
    { entityType: 'lesson', entityId: lesson.id, locale: 'en', field: 'title', value: body.titleEn },
  ];
  if (body.descriptionAr) transRows.push({ entityType: 'lesson', entityId: lesson.id, locale: 'ar', field: 'description', value: body.descriptionAr });
  if (body.descriptionEn) transRows.push({ entityType: 'lesson', entityId: lesson.id, locale: 'en', field: 'description', value: body.descriptionEn });

  await db.insert(translations).values(transRows);

  return NextResponse.json({ ok: true, lessonId: lesson.id }, { status: 201 });
}
