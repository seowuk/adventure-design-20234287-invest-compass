// 학습 자료 추천 (03 기능명세서 9장, FR-07)
//
// ⚠ 책 제목·저자와 사이트 주소는 기억에 의존해 적은 초안이다.
//   서점과 각 사이트에서 직접 확인한 뒤 틀린 것은 고치거나 지운다.
//   추천은 학습용이며 협찬·제휴가 없다. 상품 판매 링크는 넣지 않는다.

// 투자 경험 답(1~4) → 먼저 보여줄 수준
export function levelFor(exp) {
  if (!exp || exp <= 2) return 'intro'
  if (exp === 3) return 'basic'
  return 'deeper'
}

export const LEVEL_ORDER = ['intro', 'basic', 'deeper']

export const LEVELS = {
  intro: { name: '입문', desc: '투자를 처음 시작한다면' },
  basic: { name: '기초', desc: 'ETF와 자산배분을 알고 싶다면' },
  deeper: { name: '한 걸음 더', desc: '왜 이렇게 투자하는지 원리가 궁금하다면' },
}

export const BOOKS = [
  {
    title: '돈의 심리학',
    author: '모건 하우절',
    level: 'intro',
    why: '숫자보다 돈을 대하는 태도를 다뤄요. 떨어질 때 왜 팔고 싶어지는지 이해하는 데 도움이 돼요.',
    tags: ['마음가짐'],
  },
  {
    title: '박곰희 투자법',
    author: '박곰희',
    level: 'intro',
    why: '예적금만 해본 사람 눈높이에서 ETF, 연금계좌, ISA를 쉽게 풀어줘요.',
    tags: ['ETF', '계좌'],
  },
  {
    title: '마법의 돈 굴리기',
    author: '김성일',
    level: 'basic',
    why: 'ETF로 여러 자산에 나눠 담는 자산배분을 숫자와 예시로 보여줘요.',
    tags: ['ETF', '자산배분'],
  },
  {
    title: '마법의 연금 굴리기',
    author: '김성일',
    level: 'basic',
    why: '연금저축과 IRP 안에서 ETF를 어떻게 굴리는지 다뤄요. 계좌 안내를 읽고 더 알고 싶다면 좋아요.',
    tags: ['연금', '계좌'],
  },
  {
    title: '모든 주식을 소유하라',
    author: '존 보글',
    level: 'deeper',
    why: '인덱스 펀드를 처음 만든 사람이 왜 시장 전체를 사는 게 유리한지 설명해요. 지수 추종 ETF의 뿌리예요.',
    tags: ['인덱스'],
  },
  {
    title: '랜덤워크 투자수업',
    author: '버턴 말키엘',
    level: 'deeper',
    why: '시장을 이기려는 시도가 왜 어려운지, 오래 나눠 담는 투자의 근거를 다뤄요.',
    tags: ['투자 원리'],
  },
]

// 서점 검색 링크 (판매 링크가 아니라 검색 결과로 보낸다)
export function bookSearchUrl(book) {
  const q = encodeURIComponent(`${book.title} ${book.author}`)
  return `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=Book&SearchWord=${q}`
}

export const SITES = [
  {
    name: '금융감독원 파인',
    url: 'https://fine.fss.or.kr',
    why: '금융상품 비교, 예금자보호 여부, 금융 용어까지. 이 앱에서 "확인하세요"라고 한 내용은 대부분 여기서 볼 수 있어요.',
    tags: ['상품 비교', '용어'],
  },
  {
    name: '금융감독원 금융교육센터',
    url: 'https://edu.fss.or.kr',
    why: '무료 금융교육 영상과 자료가 수준별로 정리돼 있어요.',
    tags: ['교육'],
  },
  {
    name: '한국은행 경제교육',
    url: 'https://www.bok.or.kr',
    why: '금리, 물가 같은 경제 기초를 쉽게 풀어주는 자료가 있어요.',
    tags: ['경제 기초'],
  },
  {
    name: 'KRX 정보데이터시스템',
    url: 'https://data.krx.co.kr',
    why: '국내 상장 ETF의 기초지수, 총보수, 거래량 같은 실제 정보를 볼 수 있어요. 기초를 익힌 뒤에 보세요.',
    tags: ['ETF 정보'],
  },
  {
    name: '국세청 홈택스',
    url: 'https://www.hometax.go.kr',
    why: 'ISA 서민형 가입에 필요한 소득확인증명서를 발급받고, 연말정산 세액공제 내용을 확인할 수 있어요.',
    tags: ['세금'],
  },
]

// 유튜브·뉴스레터·커뮤니티를 고를 때
export const CHANNEL_GOOD = [
  '원리와 구조를 설명하고, 정보의 출처를 밝혀요',
  '손실 가능성과 단점도 같이 말해요',
  '"언제 무엇을 사라"보다 "어떻게 생각하면 되는지"를 알려줘요',
]

export const CHANNEL_AVOID = [
  '특정 종목을 지금 사라고 하거나 목표 수익률을 약속해요',
  '수익 인증을 앞세우고 유료 리딩방, 단톡방 가입을 권해요',
  '"원금 보장", "무조건", "지금 아니면 늦는다"처럼 서두르게 만들어요',
]

export const CHANNEL_TIP =
  '돈을 받고 종목을 알려주는 곳은 금융감독원에 유사투자자문업으로 신고해야 해요. 신고했다고 믿을 만하다는 뜻은 아니지만, 신고도 안 했다면 더 조심해야 해요.'
