/**
 * Graph.Controller.ts
 * HTTP handlers for the Knowledge Graph API.
 *
 * All endpoints require authentication.
 * Locale is read from the ?locale= query param (defaults to 'ar').
 */
import { NextRequest, NextResponse } from 'next/server';
import { GetSessionOrUnauthorized } from '@/Shared/Middleware/Auth.Middleware';
import {
  GetConceptById,
  GetFullGraph,
  GetStudentGraphState,
} from '@/lib/Graph/Graph.Service';
import { TLocale } from '@/Shared/Types/Common.Types';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function GetLocale(Req: NextRequest): TLocale {
  const Raw = new URL(Req.url).searchParams.get('locale');
  return Raw === 'en' ? 'en' : 'ar';
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/graph — full Knowledge Graph (all concepts + edges).
 * Requires authentication.
 */
export async function GetFullGraphHandler(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Locale = GetLocale(Req);
  const Graph = await GetFullGraph(Locale);

  return NextResponse.json({ Success: true, Data: Graph });
}

/**
 * GET /api/v1/graph?student=true — graph with student mastery overlay.
 * Requires authentication.
 */
export async function GetStudentGraphHandler(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Locale = GetLocale(Req);
  const State = await GetStudentGraphState(Session.user.id, Locale);

  return NextResponse.json({ Success: true, Data: State });
}

/**
 * GET /api/v1/graph/concept/:id — single concept node.
 * Requires authentication.
 */
export async function GetConceptHandler(Req: NextRequest, ConceptId: string): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Concept = await GetConceptById(ConceptId);

  if (!Concept) {
    return NextResponse.json(
      { Success: false, Error: { Code: 'CONCEPT_NOT_FOUND' } },
      { status: 404 },
    );
  }

  return NextResponse.json({ Success: true, Data: { Concept } });
}
