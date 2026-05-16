import { NextRequest, NextResponse } from 'next/server';
import { UpsertRoutingRuleSchema, ToggleRuleSchema } from './RoutingRules.Schemas';
import * as RoutingRulesService from './RoutingRules.Service';

export async function GetRoutingRules(_req: NextRequest) {
  const rules = await RoutingRulesService.ListRoutingRules();
  return NextResponse.json({ Success: true, Data: rules });
}

export async function PostRoutingRule(req: NextRequest) {
  const body = await req.json();
  const parsed = UpsertRoutingRuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { Success: false, Error: { Code: 'VALIDATION_ERROR', Details: parsed.error } },
      { status: 400 },
    );
  }
  const rule = await RoutingRulesService.UpsertRoutingRule(parsed.data);
  return NextResponse.json({ Success: true, Data: rule }, { status: 201 });
}

export async function PatchRoutingRule(req: NextRequest, id: string) {
  const body = await req.json();
  const parsed = ToggleRuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { Success: false, Error: { Code: 'VALIDATION_ERROR' } },
      { status: 400 },
    );
  }
  const rule = await RoutingRulesService.ToggleRule(id, parsed.data.IsActive);
  return NextResponse.json({ Success: true, Data: rule });
}
