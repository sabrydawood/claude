/**
 * Mastery.Controller.ts
 * HTTP handlers for the Student Mastery feature.
 *
 * GET  /api/v1/mastery             — full mastery profile
 * POST /api/v1/mastery             — record a learning signal
 * GET  /api/v1/mastery/[conceptId] — mastery for a single concept
 */
import { NextRequest, NextResponse } from 'next/server';
import { GetSessionOrUnauthorized } from '@/Shared/Middleware/Auth.Middleware';
import { ParseBodyOrBadRequest } from '@/Shared/Middleware/Validation.Middleware';
import { RecordSignalSchema } from './Mastery.Schemas';
import {
  RecordSignal,
  GetStudentMasteryProfile,
  GetConceptMastery,
} from './Mastery.Service';

// Simple UUID-v4/v7 regex — any standard UUID format accepted.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/v1/mastery
 * Returns the authenticated user's full mastery profile.
 */
export async function GetMasteryProfile(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Profile = await GetStudentMasteryProfile(Session.user.id);

  return NextResponse.json({ Success: true, Data: Profile });
}

/**
 * POST /api/v1/mastery
 * Records a learning signal and returns the updated concept mastery score.
 */
export async function RecordMasterySignal(Req: NextRequest): Promise<NextResponse> {
  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Body = await ParseBodyOrBadRequest(Req, RecordSignalSchema);
  if (Body instanceof NextResponse) return Body;

  const UserId = Session.user.id;

  await RecordSignal(UserId, Body.ConceptId, Body.SignalType, Body.Value);

  // Return the updated mastery score for the concept so callers can reflect changes.
  const Updated = await GetConceptMastery(UserId, Body.ConceptId);

  return NextResponse.json({ Success: true, Data: Updated }, { status: 201 });
}

/**
 * GET /api/v1/mastery/[conceptId]
 * Returns mastery for a single concept. 404 if the user has no record.
 */
export async function GetConceptMasteryHandler(
  Req: NextRequest,
  ConceptId: string,
): Promise<NextResponse> {
  // Validate ConceptId is a UUID before hitting the DB.
  if (!UUID_REGEX.test(ConceptId)) {
    return NextResponse.json(
      { Success: false, Error: { Code: 'INVALID_CONCEPT_ID' } },
      { status: 400 },
    );
  }

  const Session = await GetSessionOrUnauthorized(Req);
  if (Session instanceof NextResponse) return Session;

  const Result = await GetConceptMastery(Session.user.id, ConceptId);

  if (!Result) {
    return NextResponse.json(
      { Success: false, Error: { Code: 'MASTERY_NOT_FOUND' } },
      { status: 404 },
    );
  }

  return NextResponse.json({ Success: true, Data: Result });
}
