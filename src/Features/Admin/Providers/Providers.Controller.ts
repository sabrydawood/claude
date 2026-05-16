import { NextRequest, NextResponse } from 'next/server';
import {
  CreateProviderSchema,
  UpdateProviderSchema,
  CreateModelSchema,
  ToggleSchema,
} from './Providers.Schemas';
import * as ProvidersService from './Providers.Service';

export async function GetProviders(_req: NextRequest) {
  const providers = await ProvidersService.ListProviders();
  return NextResponse.json({ Success: true, Data: providers });
}

export async function PostProvider(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateProviderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { Success: false, Error: { Code: 'VALIDATION_ERROR', Details: parsed.error } },
      { status: 400 },
    );
  }
  const provider = await ProvidersService.CreateProvider(parsed.data);
  return NextResponse.json({ Success: true, Data: provider }, { status: 201 });
}

export async function PatchProvider(req: NextRequest, id: string) {
  const body = await req.json();
  const parsed = UpdateProviderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { Success: false, Error: { Code: 'VALIDATION_ERROR' } },
      { status: 400 },
    );
  }
  const provider = await ProvidersService.UpdateProvider(id, parsed.data);
  return NextResponse.json({ Success: true, Data: provider });
}

export async function ToggleProviderStatus(req: NextRequest, id: string) {
  const body = await req.json();
  const parsed = ToggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { Success: false, Error: { Code: 'VALIDATION_ERROR' } },
      { status: 400 },
    );
  }
  const provider = await ProvidersService.ToggleProvider(id, parsed.data.IsActive);
  return NextResponse.json({ Success: true, Data: provider });
}

export async function GetModels(req: NextRequest, providerId: string) {
  const models = await ProvidersService.ListModels(providerId);
  return NextResponse.json({ Success: true, Data: models });
}

export async function PostModel(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateModelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { Success: false, Error: { Code: 'VALIDATION_ERROR', Details: parsed.error } },
      { status: 400 },
    );
  }
  const model = await ProvidersService.CreateModel(parsed.data);
  return NextResponse.json({ Success: true, Data: model }, { status: 201 });
}
