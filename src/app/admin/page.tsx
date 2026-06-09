'use client';

import { useState, useRef, useEffect } from 'react';

const PRODUCTS = ['종합사주', '연애운', '직업운', '재물운', '신년운세'];
const TIME_OPTIONS = [
  { label: '시간 미상', value: '' },
  { label: '자시 (23:00~01:00)', value: '00:00' },
  { label: '축시 (01:00~03:00)', value: '02:00' },
  { label: '인시 (03:00~05:00)', value: '04:00' },
  { label: '묘시 (05:00~07:00)', value: '06:00' },
  { label: '진시 (07:00~09:00)', value: '08:00' },
  { label: '사시 (09:00~11:00)', value: '10:00' },
  { label: '오시 (11:00~13:00)', value: '12:00' },
  { label: '미시 (13:00~15:00)', value: '14:00' },
  { label: '신시 (15:00~17:00)', value: '16:00' },
  { label: '유시 (17:00~19:00)', value: '18:00' },
  { label: '술시 (19:00~21:00)', value: '20:00' },
  { label: '해시 (21:00~23:00)', value: '22:00' },
];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');

  const [form, setForm] = useState({
    name: '',
    gender: '여',
    birthDate: '',
    birthTime: '',
    question: '',
    product: '종합사주',
  });

  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [streamText, setStreamText] = useState('');
  const [resultId, setResultId] = useState('');
  const [copied, setCopied] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [streamText]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin1234') {
      setAuthenticated(true);
    } else {
      fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.ok) setAuthenticated(true);
          else setPwError('비밀번호가 틀렸습니다.');
        })
        .catch(() => setPwError('오류가 발생했습니다.'));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.birthDate) return;

    setStatus('generating');
    setStreamText('');
    setResultId('');

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'text') {
            setStreamText(prev => prev + data.text);
          } else if (data.type === 'done') {
            setResultId(data.id);
            setStatus('done');
          } else if (data.type === 'error') {
            setStatus('error');
          }
        } catch {}
      }
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/result/${resultId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#faf8f2] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm border border-[#ebe6f5]">
          <h1 className="text-2xl font-bold text-[#3a2a5a] mb-2 text-center">사주한장</h1>
          <p className="text-[#9080b0] text-sm text-center mb-6">운영자 대시보드</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-[#ebe6f5] rounded-lg px-4 py-3 text-[#3a2a5a] focus:outline-none focus:border-[#5a3abf]"
            />
            {pwError && <p className="text-red-500 text-sm">{pwError}</p>}
            <button
              type="submit"
              className="w-full bg-[#5a3abf] text-white rounded-lg py-3 font-semibold hover:bg-[#4a2aaf] transition"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f2] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#5a3abf]">사주한장</h1>
          <p className="text-[#9080b0] text-sm mt-1">운영자 대시보드</p>
        </div>

        <div className="bg-white rounded-2xl shadow border border-[#ebe6f5] p-6 mb-6">
          <h2 className="text-lg font-bold text-[#3a2a5a] mb-4">고객 정보 입력</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3a2a5a] mb-1">이름 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="홍길동"
                  required
                  className="w-full border border-[#ebe6f5] rounded-lg px-3 py-2.5 text-[#3a2a5a] focus:outline-none focus:border-[#5a3abf]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3a2a5a] mb-1">성별 *</label>
                <div className="flex gap-2">
                  {['남', '여'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm({ ...form, gender: g })}
                      className={`flex-1 py-2.5 rounded-lg border font-medium transition ${
                        form.gender === g
                          ? 'bg-[#5a3abf] text-white border-[#5a3abf]'
                          : 'border-[#ebe6f5] text-[#9080b0] hover:border-[#5a3abf]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3a2a5a] mb-1">생년월일 *</label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={e => setForm({ ...form, birthDate: e.target.value })}
                  required
                  className="w-full border border-[#ebe6f5] rounded-lg px-3 py-2.5 text-[#3a2a5a] focus:outline-none focus:border-[#5a3abf]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3a2a5a] mb-1">태어난 시간</label>
                <select
                  value={form.birthTime}
                  onChange={e => setForm({ ...form, birthTime: e.target.value })}
                  className="w-full border border-[#ebe6f5] rounded-lg px-3 py-2.5 text-[#3a2a5a] focus:outline-none focus:border-[#5a3abf]"
                >
                  {TIME_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3a2a5a] mb-1">상품 선택</label>
              <div className="flex flex-wrap gap-2">
                {PRODUCTS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, product: p })}
                    className={`px-3 py-1.5 rounded-full text-sm border font-medium transition ${
                      form.product === p
                        ? 'bg-[#5a3abf] text-white border-[#5a3abf]'
                        : 'border-[#ebe6f5] text-[#9080b0] hover:border-[#5a3abf]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3a2a5a] mb-1">고객 질문 (선택)</label>
              <textarea
                value={form.question}
                onChange={e => setForm({ ...form, question: e.target.value })}
                placeholder="올해 이직해도 될까요?"
                rows={2}
                className="w-full border border-[#ebe6f5] rounded-lg px-3 py-2.5 text-[#3a2a5a] focus:outline-none focus:border-[#5a3abf] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'generating'}
              className="w-full bg-[#5a3abf] text-white rounded-xl py-3.5 font-bold text-lg hover:bg-[#4a2aaf] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'generating' ? '사주 분석 중...' : '사주 생성하기'}
            </button>
          </form>
        </div>

        {(status === 'generating' || status === 'done') && (
          <div className="bg-white rounded-2xl shadow border border-[#ebe6f5] p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-[#3a2a5a]">
                {status === 'generating' ? '생성 중...' : '생성 완료'}
              </h2>
              {status === 'generating' && (
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#5a3abf] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {status === 'done' && resultId && (
              <div className="mb-4 p-4 bg-[#f0ebff] rounded-xl border border-[#c5b8ee]">
                <p className="text-sm text-[#5a3abf] font-medium mb-2">결과 링크가 생성되었습니다</p>
                <div className="flex gap-2 items-center">
                  <code className="flex-1 text-xs bg-white px-3 py-2 rounded-lg border border-[#ebe6f5] text-[#3a2a5a] truncate">
                    {typeof window !== 'undefined' ? `${window.location.origin}/result/${resultId}` : `/result/${resultId}`}
                  </code>
                  <button
                    onClick={copyLink}
                    className="px-4 py-2 bg-[#5a3abf] text-white text-sm rounded-lg font-medium hover:bg-[#4a2aaf] transition whitespace-nowrap"
                  >
                    {copied ? '복사됨!' : '링크 복사'}
                  </button>
                </div>
                <a
                  href={`/result/${resultId}`}
                  target="_blank"
                  className="inline-block mt-2 text-xs text-[#9080b0] hover:text-[#5a3abf] underline"
                >
                  결과 페이지 열기 →
                </a>
              </div>
            )}

            <div
              ref={streamRef}
              className="h-64 overflow-y-auto text-sm text-[#3a2a5a] leading-relaxed whitespace-pre-wrap bg-[#faf8f2] rounded-lg p-4 font-mono"
            >
              {streamText || '생성 시작 중...'}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">
            오류가 발생했습니다. 다시 시도해주세요.
          </div>
        )}
      </div>
    </div>
  );
}
