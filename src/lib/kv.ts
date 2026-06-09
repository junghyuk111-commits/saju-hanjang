import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return redis;
}

export interface ResultData {
  id: string;
  createdAt: string;
  name: string;
  gender: string;
  birthDate: string;
  birthTime: string | null;
  question: string | null;
  product: string;
  sajuData: {
    yeonju: string;
    wolju: string;
    ilju: string;
    siju: string | null;
    ilgan: string;
    ohaeng: Record<string, number>;
    yongsin: string;
    gisin: string;
  };
  result: string;
  sections: Record<string, string>;
}

export async function saveResult(data: ResultData): Promise<void> {
  const kv = getRedis();
  await kv.set(`saju:${data.id}`, JSON.stringify(data), { ex: 60 * 60 * 24 * 365 });
}

export async function getResult(id: string): Promise<ResultData | null> {
  const kv = getRedis();
  const raw = await kv.get<string>(`saju:${id}`);
  if (!raw) return null;
  if (typeof raw === 'string') return JSON.parse(raw);
  return raw as ResultData;
}
