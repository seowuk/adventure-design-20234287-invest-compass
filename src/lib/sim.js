// 모의투자 (03 기능명세서 FR-16, 신규 — 사용자 평가에서 나온 제안)
//
// 목적: "떨어지면 어떻게 하시겠어요?"라고 묻는 대신, 가상의 하락을 직접 겪게 하고
//       실제로 고른 행동으로 성향을 확인한다. (말로 답한 선호 ↔ 행동으로 드러난 선호)
//
// 가상 시장: 실제 지수나 종목이 아니다. 오름 → 큰 하락 → 횡보 → 회복 → 신고가 흐름을
//           일부러 담았고, 모두가 같은 시장을 겪어야 행동을 비교할 수 있어 무작위가 아니다.

// 시장 지수 (시작 = 100), 0~36개월
export const MARKET = [
  100, 101, 103, 104, 107, 109, 112, 115, 118, // 0~8   천천히 오름
  112, 104, 97, 90, 84, 80, // 9~14  고점 대비 약 32% 하락
  82, 79, 83, 81, // 15~18 바닥에서 횡보
  85, 88, 92, 95, 99, 102, 104, 108, 111, 113, 116, 118, // 19~30 회복
  120, 123, 121, 125, 127, 130, // 31~36 예전 고점을 넘어섬
]

export const LAST_MONTH = MARKET.length - 1 // 36
export const START_INVESTED = 7_000_000
export const START_CASH = 3_000_000

// 선택하는 순간 6번
export const MOMENTS = [
  {
    month: 6,
    mood: 'up',
    headline: '시장이 꾸준히 오르고 있어요',
    detail: '주변에서 "벌었다"는 이야기가 들려요. 지금이라도 더 넣어야 할까요?',
  },
  {
    month: 11,
    mood: 'down',
    headline: '고점보다 18% 떨어졌어요',
    detail: '"더 떨어질 수 있다"는 뉴스가 쏟아져요.',
  },
  {
    month: 14,
    mood: 'down',
    headline: '고점보다 32% 떨어졌어요',
    detail: '주변에서 "다 팔았다"는 사람이 늘었어요. 넣은 돈이 눈에 띄게 줄었어요.',
  },
  {
    month: 18,
    mood: 'flat',
    headline: '반년째 제자리예요',
    detail: '오르지도 내리지도 않아서 지루하고 답답해요.',
  },
  {
    month: 24,
    mood: 'up',
    headline: '바닥에서 꽤 올라왔어요',
    detail: '그래도 아직 예전 고점보다는 낮아요.',
  },
  {
    month: 30,
    mood: 'up',
    headline: '드디어 예전 최고점까지 돌아왔어요',
    detail: '처음 떨어지기 시작한 지 2년 가까이 걸렸어요.',
  },
]

// 다음 선택 순간(또는 끝)까지 시장을 따라 돈을 움직인다. 현금은 그대로 둔다.
export function advance(state, toMonth) {
  let invested = state.invested
  for (let m = state.month + 1; m <= toMonth; m++) {
    invested *= MARKET[m] / MARKET[m - 1]
  }
  return { ...state, month: toMonth, invested }
}

export function applyAction(state, action) {
  if (action === 'buy') return { ...state, invested: state.invested + state.cash, cash: 0 }
  if (action === 'sell') return { ...state, invested: 0, cash: state.cash + state.invested }
  return state // hold
}

export function startState() {
  return advance({ month: 0, invested: START_INVESTED, cash: START_CASH }, MOMENTS[0].month)
}

// 비교 기준
export function benchmarks() {
  const growth = MARKET[LAST_MONTH] / MARKET[0]
  return {
    nothing: START_INVESTED * growth + START_CASH, // 아무것도 안 했다면
    allIn: (START_INVESTED + START_CASH) * growth, // 처음부터 다 넣었다면
  }
}

// 행동 유형: 하락 구간(11·14개월)에서 무엇을 했는지가 핵심
export const BEHAVIORS = {
  chased: {
    level: 'stable',
    title: '오를 때 사고, 떨어질 때 팔았어요',
    lesson:
      '가장 흔한 실수예요. 오를 때는 놓칠까 봐, 떨어질 때는 더 잃을까 봐 움직이다 보면 비쌀 때 사고 쌀 때 팔게 돼요. 미리 정한 금액을 매달 꾸준히 넣는 방식이 이런 감정을 막아줘요.',
  },
  panic: {
    level: 'stable',
    title: '크게 떨어질 때 팔았어요',
    lesson:
      '자연스러운 반응이에요. 다만 판 순간 손실이 확정되고, 이후 회복에는 올라타지 못했어요. 이런 성향이라면 처음부터 채권이나 예금 비중을 넉넉히 두어, 떨어져도 버틸 수 있는 만큼만 투자하는 게 좋아요.',
  },
  steady: {
    level: 'balanced',
    title: '흔들려도 그대로 버텼어요',
    lesson:
      '지수 투자에서 가장 중요한 힘이에요. 하락장에서 아무것도 하지 않는 게 생각보다 어렵거든요. 이 시나리오에선 회복했지만, 실제로는 회복에 더 오래 걸릴 수도 있다는 점도 기억해두세요.',
  },
  contrarian: {
    level: 'active',
    title: '떨어질 때 오히려 더 샀어요',
    lesson:
      '하락을 기회로 본 거예요. 남겨둔 현금이 있었기에 가능했어요. 다만 가상 돈이라 대담해지기 쉬우니, 실제로는 생활비와 비상금을 건드리지 않는 범위에서만 이렇게 하세요.',
  },
}

export function classify(actions) {
  // actions: { [month]: 'buy' | 'hold' | 'sell' }
  const crash = [actions[11], actions[14]]
  const soldInCrash = crash.includes('sell')
  const boughtInCrash = crash.includes('buy')
  if (actions[6] === 'buy' && soldInCrash) return 'chased'
  if (soldInCrash) return 'panic'
  if (boughtInCrash) return 'contrarian'
  return 'steady'
}

// 판 뒤 다시 들어왔는지
export function reentered(actions) {
  const months = Object.keys(actions).map(Number).sort((a, b) => a - b)
  let sold = false
  for (const m of months) {
    if (actions[m] === 'sell') sold = true
    else if (sold && actions[m] === 'buy') return true
  }
  return false
}
