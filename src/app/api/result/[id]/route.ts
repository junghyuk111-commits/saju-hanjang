import { NextRequest } from 'next/server';
import { getResult } from '@/lib/kv';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await getResult(id);
  if (!data) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  return Response.json(data);
}
