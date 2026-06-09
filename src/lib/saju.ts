import KoreanLunarCalendar from 'korean-lunar-calendar';

const CHEONGAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const JIJI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

const CHEONGAN_OHAENG: Record<string, string> = {
  갑: '목', 을: '목',
  병: '화', 정: '화',
  무: '토', 기: '토',
  경: '금', 신: '금',
  임: '수', 계: '수',
};

const JIJI_OHAENG: Record<string, string> = {
  자: '수', 축: '토', 인: '목', 묘: '목',
  진: '토', 사: '화', 오: '화', 미: '토',
  신: '금', 유: '금', 술: '토', 해: '수',
};

const SIJU_MAP: Record<string, string> = {
  '23:00': '자', '00:00': '자', '01:00': '축', '02:00': '축',
  '03:00': '인', '04:00': '인', '05:00': '묘', '06:00': '묘',
  '07:00': '진', '08:00': '진', '09:00': '사', '10:00': '사',
  '11:00': '오', '12:00': '오', '13:00': '미', '14:00': '미',
  '15:00': '신', '16:00': '신', '17:00': '유', '18:00': '유',
  '19:00': '술', '20:00': '술', '21:00': '해', '22:00': '해',
};

function getYeonjuIndex(year: number): number {
  return ((year - 4) % 60 + 60) % 60;
}

function getStemBranchByIndex(index: number): string {
  return CHEONGAN[index % 10] + JIJI[index % 12];
}

function getMonthStemBranch(yearStemIndex: number, month: number): string {
  // 월지: 인(1월)부터 시작
  const monthBranchIndex = (month + 1) % 12; // 인=2월
  const adjustedBranchIndex = ((month - 1) + 2) % 12; // 인=index 2
  const jijiIndex = (month + 1) % 12;

  // 연간 기준으로 월간 계산
  const yearStem = yearStemIndex % 10;
  // 갑/기년: 인월=병인, 을/경년: 인월=무인, ...
  const monthStemBase = [2, 4, 6, 8, 0][Math.floor(yearStem / 2) % 5];
  const stemIndex = (monthStemBase + (month - 1)) % 10;
  const branchIndex = (month + 1) % 12;

  return CHEONGAN[stemIndex] + JIJI[branchIndex];
}

function getDayStemBranch(year: number, month: number, day: number): string {
  // 간단한 일주 계산 (율리우스력 기반)
  const a = Math.floor((14 - month) / 12);
  const y = year - a;
  const m = month + 12 * a - 2;
  const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const index = ((jd + 49) % 60 + 60) % 60;
  return CHEONGAN[index % 10] + JIJI[index % 12];
}

function getSijuStemBranch(dayStemIndex: number, birthTime: string): string | null {
  if (!birthTime || birthTime === '미상') return null;

  const [hourStr] = birthTime.split(':');
  const hour = parseInt(hourStr);
  const normalizedHour = `${String(hour).padStart(2, '0')}:00`;
  const sijuJiji = SIJU_MAP[normalizedHour];
  if (!sijuJiji) return null;

  const jijiIndex = JIJI.indexOf(sijuJiji);
  // 일간 기준 시간 계산
  const dayIndex = dayStemIndex % 10;
  const stemBase = [0, 2, 4, 6, 8][Math.floor(dayIndex / 2) % 5];
  // 자시(0)부터 시작
  const jijiOrder = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
  const jijiPos = jijiOrder.indexOf(sijuJiji);
  const stemIndex = (stemBase + jijiPos) % 10;

  return CHEONGAN[stemIndex] + sijuJiji;
}

export interface SajuData {
  yeonju: string;
  wolju: string;
  ilju: string;
  siju: string | null;
  ilgan: string;
  ohaeng: Record<string, number>;
  yongsin: string;
  gisin: string;
}

export function calculateSaju(
  year: number,
  month: number,
  day: number,
  birthTime: string | null,
  gender: string
): SajuData {
  const calendar = new KoreanLunarCalendar();
  calendar.setSolarDate(year, month, day);

  const yearIndex = getYeonjuIndex(year);
  const yeonju = getStemBranchByIndex(yearIndex);

  // 월주 계산
  const monthStemBranch = getMonthStemBranch(yearIndex, month);
  const wolju = monthStemBranch;

  // 일주 계산
  const ilju = getDayStemBranch(year, month, day);
  const ilyganChar = ilju[0];
  const ilganIndex = CHEONGAN.indexOf(ilyganChar);

  // 시주 계산
  const sijuVal = birthTime && birthTime !== '미상'
    ? getSijuStemBranch(ilganIndex, birthTime)
    : null;

  // 오행 분포
  const pillars = [yeonju, wolju, ilju];
  if (sijuVal) pillars.push(sijuVal);

  const ohaeng: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const pillar of pillars) {
    const stem = pillar[0];
    const branch = pillar[1];
    if (CHEONGAN_OHAENG[stem]) ohaeng[CHEONGAN_OHAENG[stem]]++;
    if (JIJI_OHAENG[branch]) ohaeng[JIJI_OHAENG[branch]]++;
  }

  // 용신/기신 (간단화: 가장 적은 오행 → 용신, 가장 많은 → 기신)
  const sorted = Object.entries(ohaeng).sort((a, b) => a[1] - b[1]);
  const yongsin = sorted[0][0];
  const gisin = sorted[sorted.length - 1][0];

  return {
    yeonju,
    wolju,
    ilju,
    siju: sijuVal,
    ilgan: ilyganChar + CHEONGAN_OHAENG[ilyganChar],
    ohaeng,
    yongsin,
    gisin,
  };
}
