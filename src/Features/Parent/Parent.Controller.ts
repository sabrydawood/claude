import { NextResponse } from 'next/server';
import {
  GetDailySummary,
  GetWeeklySummary,
  GetFullDashboard,
  GetChildrenForParent,
} from './Parent.Service';

export async function GetChildren(parentId: string) {
  const children = await GetChildrenForParent(parentId);
  return NextResponse.json({ Success: true, Data: children });
}

export async function GetDailyReport(childId: string) {
  const summary = await GetDailySummary(childId);
  return NextResponse.json({ Success: true, Data: summary });
}

export async function GetWeeklyReport(childId: string) {
  const summary = await GetWeeklySummary(childId);
  return NextResponse.json({ Success: true, Data: summary });
}

export async function GetDashboard(childId: string) {
  const dashboard = await GetFullDashboard(childId);
  return NextResponse.json({ Success: true, Data: dashboard });
}
