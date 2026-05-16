import type { NextRequest } from 'next/server';
import { GetRoutingRules, PostRoutingRule } from '@/Features/Admin/RoutingRules/RoutingRules.Controller';

export async function GET(req: NextRequest) {
  return GetRoutingRules(req);
}

export async function POST(req: NextRequest) {
  return PostRoutingRule(req);
}
