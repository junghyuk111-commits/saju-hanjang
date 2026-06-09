import { SajuData } from './saju';

const PRODUCT_SECTIONS: Record<string, string[]> = {
  '종합사주': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'],
  '연애운': ['01', '02', '05', '06', '09', '11'],
  '직업운': ['01', '02', '03', '08', '09', '11'],
  '재물운': ['01', '03', '04', '08', '09', '11'],
  '신년운세': ['01', '09', '10', '11'],
};

const SECTION_NAMES: Record<string, string> = {
  '01': '기본 명식',
  '02': '성격과 기질',
  '03': '직업운',
  '04': '재물운',
  '05': '연애운',
  '06': '결혼운',
  '07': '건강운',
  '08': '대운 흐름',
  '09': '2026년 세운',
  '10': '2026년 월별 운세',
  '11': '실천 조언',
  '12': '고객 질문 답변',
};

export function buildSystemPrompt(): string {
  return `당신은 사주명리학 전문 상담가입니다. 20년 이상의 경력을 가진 실력 있는 역술가로, 고객에게 정확하고 솔직한 사주 분석을 제공합니다.

상담 원칙:
- 좋은 것은 좋다고 말하고, 나쁜 것은 나쁘다고 직접 말한다
- 두루뭉술하게 얼버무리지 않는다
- 반드시 현실적인 해결책과 행동 지침으로 마무리한다
- 고객의 이름을 자연스럽게 본문 안에 섞어 쓴다 (예: "지수 씨는", "지수님의 경우")
- 각 섹션을 정확한 형식으로 시작한다
- 마크다운 기호(*, #, **, _ 등) 절대 사용 금지
- 번호 매기기나 불릿 기호 대신 자연스러운 문단으로 작성
- 각 섹션은 풍부하고 구체적으로 700자 이상 작성
- 한자와 전문 용어는 괄호 안에 뜻을 설명한다

섹션 형식:
[SECTION_번호: 섹션명]
내용...
[/SECTION]`;
}

export function buildUserPrompt(
  name: string,
  gender: string,
  birthDate: string,
  birthTime: string | null,
  question: string | null,
  product: string,
  sajuData: SajuData
): string {
  const sections = PRODUCT_SECTIONS[product] || PRODUCT_SECTIONS['종합사주'];
  const hasSections = question ? [...sections, '12'] : sections;

  const sectionList = hasSections
    .map(s => `${s}. ${SECTION_NAMES[s]}`)
    .join('\n');

  const ohaengStr = Object.entries(sajuData.ohaeng)
    .map(([k, v]) => `${k}${v}`)
    .join(' ');

  return `다음 고객의 사주를 분석해주세요.

이름: ${name}
성별: ${gender}
생년월일: ${birthDate}
태어난 시간: ${birthTime || '미상'}

사주 명식 (만세력 계산 결과):
  연주: ${sajuData.yeonju}
  월주: ${sajuData.wolju}
  일주: ${sajuData.ilju}
  시주: ${sajuData.siju || '미상'}

오행 분포: ${ohaengStr}
용신: ${sajuData.yongsin}
기신: ${sajuData.gisin}
일간: ${sajuData.ilgan}

상품: ${product}
고객 질문: ${question || '없음'}

작성할 섹션:
${sectionList}

각 섹션을 [SECTION_번호: 섹션명] 형식으로 시작하고 [/SECTION]으로 끝내주세요.
모든 섹션을 빠짐없이 작성해주세요.`;
}

export function parseSections(result: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const regex = /\[SECTION_(\d+):[^\]]*\]([\s\S]*?)\[\/SECTION\]/g;
  let match;
  while ((match = regex.exec(result)) !== null) {
    sections[match[1]] = match[2].trim();
  }
  return sections;
}

export { SECTION_NAMES, PRODUCT_SECTIONS };
