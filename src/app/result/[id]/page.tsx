import { getResult } from '@/lib/kv';
import { notFound } from 'next/navigation';
import ResultClient from './ResultClient';

export const dynamic = 'force-dynamic';

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getResult(id);

  if (!data) notFound();

  return <ResultClient data={data} />;
}
