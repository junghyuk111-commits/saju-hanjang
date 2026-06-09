'use client';

import { ResultData } from '@/lib/kv';

const OHAENG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  목: { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
  화: { bg: '#fce4ec', text: '#c62828', border: '#ef9a9a' },
  토: { bg: '#fff8e1', text: '#e65100', border: '#ffcc80' },
  금: { bg: '#f3e5f5', text: '#6a1b9a', border: '#ce93d8' },
  수: { bg: '#e3f2fd', text: '#1565c0', border: '#90caf9' },
};

const SECTION_ICONS: Record<string, string> = {
  '01': '命', '02': '性', '03': '業', '04': '財',
  '05': '愛', '06': '婚', '07': '健', '08': '運',
  '09': '歲', '10': '月', '11': '言', '12': '問',
};

const SECTION_NAMES: Record<string, string> = {
  '01': '기본 명식', '02': '성격과 기질', '03': '직업운', '04': '재물운',
  '05': '연애운', '06': '결혼운', '07': '건강운', '08': '대운 흐름',
  '09': '2026년 세운', '10': '2026년 월별 운세', '11': '실천 조언', '12': '고객 질문 답변',
};

const KEYWORD_COLORS = [
  'bg-[#ede9fc] text-[#5a3abf]',
  'bg-[#fce4ec] text-[#c62828]',
  'bg-[#e3f2fd] text-[#1565c0]',
  'bg-[#e8f5e9] text-[#2e7d32]',
  'bg-[#fff8e1] text-[#e65100]',
];

function extractKeywords(text: string): string[] {
  // 첫 문장에서 주요 단어 추출
  const first = text.split(/[.。\n]/)[0] || '';
  const words = first.match(/[가-힣]{2,4}/g) || [];
  return words.slice(0, 4);
}

function SectionCard({ num, content }: { num: string; content: string }) {
  const keywords = extractKeywords(content);
  const name = SECTION_NAMES[num] || '';
  const icon = SECTION_ICONS[num] || '◆';

  return (
    <div className="bg-white rounded-2xl border border-[#ebe6f5] overflow-hidden shadow-sm">
      <div className="px-5 pt-5 pb-4 border-b border-[#f0ebff]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5a3abf] flex items-center justify-center text-[#c9a84c] font-bold text-lg leading-none">
            {icon}
          </div>
          <div>
            <div className="text-xs text-[#9080b0] font-medium">Section {num}</div>
            <div className="text-base font-bold text-[#3a2a5a]">{name}</div>
          </div>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {keywords.map((kw, i) => (
              <span key={i} className={`text-xs px-2.5 py-1 rounded-full font-medium ${KEYWORD_COLORS[i % KEYWORD_COLORS.length]}`}>
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="px-5 py-4 text-[#3a2a5a] text-sm leading-[1.9] whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

function PillarCard({ label, stemBranch }: { label: string; stemBranch: string | null }) {
  const stem = stemBranch ? stemBranch[0] : '?';
  const branch = stemBranch ? stemBranch[1] : '?';

  return (
    <div className="flex flex-col items-center bg-[#1a1035]/40 rounded-xl py-3 px-2 border border-white/10">
      <div className="text-xs text-[#c9a84c]/70 mb-2">{label}</div>
      <div className="text-2xl font-bold text-white mb-1">{stem}</div>
      <div className="w-px h-3 bg-white/20 mb-1" />
      <div className="text-xl font-bold text-[#c9a84c]">{branch}</div>
    </div>
  );
}

export default function ResultClient({ data }: { data: ResultData }) {
  const { name, gender, birthDate, birthTime, product, sajuData, sections } = data;
  const sectionKeys = Object.keys(sections).sort();

  const birthFormatted = birthDate.replace(/-/g, '. ');
  const timeLabel = birthTime || '시간 미상';

  return (
    <div className="min-h-screen bg-[#faf8f2]">
      {/* Hero */}
      <div className="bg-[#1a1035] px-4 pt-12 pb-10">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-[#c9a84c] text-xs font-bold tracking-[0.3em] uppercase mb-1">SAJU HANJANG</div>
          <div className="text-white/30 text-xs mb-6">사주한장</div>

          <h1 className="text-3xl font-bold text-white mb-2">
            {name} 님의 사주
          </h1>
          <div className="text-[#c9a84c] text-sm mb-1">{product}</div>
          <div className="text-white/50 text-sm mb-6">
            {birthFormatted} · {gender}성 · {timeLabel}
          </div>

          {/* 오행 뱃지 */}
          <div className="flex justify-center gap-2 flex-wrap mb-6">
            {Object.entries(sajuData.ohaeng).map(([element, count]) => {
              const c = OHAENG_COLORS[element];
              return (
                <div
                  key={element}
                  className="w-12 h-12 rounded-full flex flex-col items-center justify-center border-2 text-xs font-bold"
                  style={{ backgroundColor: c.bg + '33', borderColor: c.border + '66', color: c.text + 'cc' }}
                >
                  <span className="text-base">{element}</span>
                  <span className="text-[10px] opacity-70">{count}</span>
                </div>
              );
            })}
          </div>

          {/* 명식 4기둥 */}
          <div className="grid grid-cols-4 gap-2">
            <PillarCard label="연주" stemBranch={sajuData.yeonju} />
            <PillarCard label="월주" stemBranch={sajuData.wolju} />
            <PillarCard label="일주" stemBranch={sajuData.ilju} />
            <PillarCard label="시주" stemBranch={sajuData.siju} />
          </div>

          {!sajuData.siju && (
            <p className="text-white/40 text-xs mt-3">※ 출생 시간 미상으로 시주는 제외되었습니다</p>
          )}

          <div className="flex justify-center gap-6 mt-5 text-xs">
            <div className="text-center">
              <div className="text-[#9080b0]">용신</div>
              <div className="text-[#c9a84c] font-bold text-base">{sajuData.yongsin}</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="text-[#9080b0]">기신</div>
              <div className="text-white/60 font-bold text-base">{sajuData.gisin}</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="text-[#9080b0]">일간</div>
              <div className="text-white font-bold text-base">{sajuData.ilgan}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {sectionKeys.map(key => (
          <SectionCard key={key} num={key} content={sections[key]} />
        ))}

        <div className="text-center pt-4 pb-8">
          <div className="text-[#c9a84c] text-xs font-bold tracking-[0.3em] uppercase">SAJU HANJANG</div>
          <div className="text-[#9080b0] text-xs mt-1">사주한장 — 당신의 운명을 한 장에</div>
        </div>
      </div>
    </div>
  );
}
