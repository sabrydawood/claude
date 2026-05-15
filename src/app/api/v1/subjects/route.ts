import { type NextRequest } from 'next/server';
import { GetAllSubjects } from '@/Features/Subjects/Subjects.Controller';

export async function GET(Req: NextRequest) {
  return GetAllSubjects(Req);
}
