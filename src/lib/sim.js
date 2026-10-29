// 모의투자 (03 기능명세서 FR-16, v3: 실제 시장 데이터)
//
// 목적: "떨어지면 어떻게 하시겠어요?"라고 묻는 대신, 시장을 직접 겪게 하고
//       실제로 고른 행동으로 성향을 확인한다. (말로 답한 선호 ↔ 행동으로 드러난 선호)
//
// v3부터 시장은 실제로 있었던 3년이다. 한국(코스피 기반 OECD 주가지수)과 미국(S&P 500)에서
// 금융위기, 코로나19, 금리 인상기, 박스피, 상승장 등 10개 구간을 골라 시작=100으로 맞췄다.
// 어떤 시기였는지는 끝난 뒤에 공개한다. 데이터와 출처는 data/realMarkets.js
// 선택 순간의 제목("고점보다 18% 떨어졌어요")은 실제 숫자로 계산한다.

import { REAL_SCENARIOS } from '../data/realMarkets'

export const LAST_MONTH = 36
export const START_TOTAL = 10_000_000
export const START_PCTS = [30, 50, 70, 100] // 처음에 투자할 비중 선택지
export const DEFAULT_PCT = 70
// 예전 코드와의 호환용 (기본 70%)
export const START_INVESTED = 7_000_000
export const START_CASH = 3_000_000

// 매 순간 팔거나 살 때 고르는 비율
export const FRACTIONS = [
  { value: 0.25, label: '4분의 1' },
  { value: 0.5, label: '절반' },
  { value: 1, label: '전부' },
]

// 처음 비중이 보여주는 성향
export function pctLevel(pct) {
  if (pct <= 30) return 'stable'
  if (pct <= 50) return 'balanced'
  return 'active'
}

// kind: rise(올랐다) | drop(떨어졌다) | flat(제자리) | rebound(바닥에서 올라옴) | newHigh(최고점 돌파)
export const SCENARIOS = REAL_SCENARIOS

const UP = ['rise', 'rebound', 'newHigh']
export const moodOf = (kind) => (kind === 'drop' ? 'down' : kind === 'flat' ? 'flat' : 'up')

// 한 판 만들기: 시장 하나를 고르고(직전과 다른 것) 매달 작은 흔들림을 준다
// country: 'kr' | 'us' | 'all'. 직전과 같은 시기는 피한다
export const COUNTRIES = [
  { key: 'all', label: '아무 데나' },
  { key: 'kr', label: '한국' },
  { key: 'us', label: '미국' },
]

export function makeRun(lastKey, rand = Math.random, country = 'all', extra = []) {
  const inCountry = [...SCENARIOS, ...extra].filter((s) => country === 'all' || s.country === country)
  const pool = inCountry.filter((s) => s.key !== lastKey)
  const list = pool.length ? pool : inCountry
  const scenario = list[Math.floor(rand() * list.length)]
  // 실제 데이터라 흔들림을 더하지 않는다
  return { scenario, market: scenario.base.slice() }
}

// 선택 순간의 제목을 그 판의 실제 숫자로 만든다
export function headlineFor(market, month, kind) {
  const seen = market.slice(0, month + 1)
  const now = market[month]
  const peak = Math.max(...seen)
  const trough = Math.min(...seen)
  const r = (x) => Math.round(x)
  if (kind === 'drop') return `고점보다 ${r(((peak - now) / peak) * 100)}% 떨어졌어요`
  if (kind === 'rebound') return `바닥에서 ${r(((now - trough) / trough) * 100)}% 올라왔어요`
  if (kind === 'newHigh') return '예전 최고점을 넘어섰어요'
  if (kind === 'flat') return '몇 달째 제자리예요'
  return `시작보다 ${r(now - 100)}% 올랐어요`
}

export function advance(state, toMonth, market) {
  let invested = state.invested
  for (let m = state.month + 1; m <= toMonth; m++) {
    invested *= market[m] / market[m - 1]
  }
  return { ...state, month: toMonth, invested }
}

// action: 'hold' | { type: 'buy' | 'sell', frac: 0.25 | 0.5 | 1 }  (문자열 'buy'/'sell'은 전부)
export function normalize(action) {
  if (typeof action === 'string') return action === 'hold' ? { type: 'hold', frac: 0 } : { type: action, frac: 1 }
  return action
}

export function applyAction(state, action) {
  const a = normalize(action)
  if (a.type === 'buy') {
    const amount = state.cash * a.frac
    return { ...state, invested: state.invested + amount, cash: state.cash - amount }
  }
  if (a.type === 'sell') {
    const amount = state.invested * a.frac
    return { ...state, invested: state.invested - amount, cash: state.cash + amount }
  }
  return state
}

export function startState(run, pct = DEFAULT_PCT) {
  const invested = (START_TOTAL * pct) / 100
  return advance(
    { month: 0, invested, cash: START_TOTAL - invested },
    run.scenario.moments[0].month,
    run.market,
  )
}

export function benchmarks(market, pct = DEFAULT_PCT) {
  const growth = market[LAST_MONTH] / market[0]
  const invested = (START_TOTAL * pct) / 100
  return {
    nothing: invested * growth + (START_TOTAL - invested), // 처음 고른 비중 그대로 두었다면
    allIn: START_TOTAL * growth, // 처음부터 전부 넣었다면
  }
}

export const BEHAVIORS = {
  chased: {
    level: 'stable',
    title: '오를 때 사고, 떨어질 때 팔았어요',
    lesson:
      '가장 흔한 실수예요. 오를 때는 놓칠까 봐, 떨어질 때는 더 잃을까 봐 움직이다 보면 비쌀 때 사고 쌀 때 팔게 돼요. 미리 정한 금액을 매달 꾸준히 넣는 방식이 이런 감정을 막아줘요.',
  },
  panic: {
    level: 'stable',
    title: '떨어질 때 팔았어요',
    lesson:
      '자연스러운 반응이에요. 다만 판 순간 손실이 확정되고, 시장이 다시 오르면 그 구간을 놓치게 돼요. 이런 성향이라면 처음부터 채권이나 예금 비중을 넉넉히 두어, 떨어져도 버틸 수 있는 만큼만 투자하는 게 좋아요.',
  },
  takeProfit: {
    level: 'stable',
    title: '오를 때 일찍 팔고 나왔어요',
    lesson:
      '수익을 확정하고 싶은 마음은 자연스러워요. 하지만 지수 투자에서는 판 뒤에 더 오르는 구간을 놓치기 쉬워요. 전부 팔기보다, 정해둔 비율을 넘은 만큼만 덜어내는 리밸런싱이 수익도 지키고 기회도 남기는 방법이에요.',
  },
  trimmed: {
    level: 'balanced',
    title: '떨어질 때 조금만 덜어냈어요',
    lesson:
      '불안했지만 전부 팔지 않고 일부만 줄였어요. 흔들리면서도 중심을 지킨 거예요. 다만 떨어질 때 덜어내면 이후 오르는 구간에서 그만큼 덜 오르니, 처음부터 버틸 수 있는 비중으로 시작하는 게 더 편해요.',
  },
  splitBuy: {
    level: 'active',
    title: '떨어질 때 나눠서 더 샀어요',
    lesson:
      '한 번에 다 넣지 않고 나눠서 산 건 노련한 방법이에요. 바닥이 어디인지 모르니 조금씩 사면 평균 가격을 낮추면서 위험도 나눌 수 있어요. 매달 꾸준히 넣는 적립식이 바로 이 원리예요.',
  },
  steady: {
    level: 'balanced',
    title: '흔들려도 그대로 버텼어요',
    lesson:
      '지수 투자에서 가장 중요한 힘이에요. 시장이 흔들릴 때 아무것도 하지 않는 게 생각보다 어렵거든요. 다만 시장이 회복하는 데 몇 년이 걸릴 수도 있다는 점은 기억해두세요.',
  },
  contrarian: {
    level: 'active',
    title: '떨어질 때 오히려 더 샀어요',
    lesson:
      '하락을 기회로 본 거예요. 남겨둔 현금이 있었기에 가능했어요. 다만 가상 돈이라 대담해지기 쉬우니, 실제로는 생활비와 비상금을 건드리지 않는 범위에서만 이렇게 하세요.',
  },
}

// actions: { [month]: action }
// 하락 순간에 절반 이상 팔면 "크게 판 것", 그보다 적으면 "조금 덜어낸 것"으로 본다
export function classify(actions, moments) {
  const kindAt = Object.fromEntries(moments.map((m) => [m.month, m.kind]))
  const ordered = Object.keys(actions)
    .map(Number)
    .sort((a, b) => a - b)
  let boughtUp = false
  let chased = false
  let bigSellDown = false
  let smallSellDown = false
  let allInDown = false
  let partBuyDown = false
  let soldUp = false
  for (const m of ordered) {
    const a = normalize(actions[m])
    const up = UP.includes(kindAt[m])
    const down = kindAt[m] === 'drop'
    if (a.type === 'buy' && up) boughtUp = true
    if (a.type === 'sell' && down) {
      if (a.frac >= 0.5) {
        bigSellDown = true
        if (boughtUp) chased = true
      } else smallSellDown = true
    }
    if (a.type === 'buy' && down) {
      if (a.frac === 1) allInDown = true
      else partBuyDown = true
    }
    if (a.type === 'sell' && up) soldUp = true
  }
  if (chased) return 'chased'
  if (bigSellDown) return 'panic'
  if (smallSellDown) return 'trimmed'
  if (allInDown) return 'contrarian'
  if (partBuyDown) return 'splitBuy'
  if (soldUp) return 'takeProfit'
  return 'steady'
}

export function reentered(actions) {
  const months = Object.keys(actions)
    .map(Number)
    .sort((a, b) => a - b)
  let sold = false
  for (const m of months) {
    const a = normalize(actions[m])
    if (a.type === 'sell') sold = true
    else if (sold && a.type === 'buy') return true
  }
  return false
}

// 결과가 행동 유형의 일반적인 교훈과 반대로 나온 경우 덧붙이는 말
export function outcomeNote(kind, total, market, pct = DEFAULT_PCT) {
  const b = benchmarks(market, pct)
  const start = START_TOTAL
  const sold = ['panic', 'takeProfit', 'chased', 'trimmed'].includes(kind)
  if (sold && total > b.nothing) {
    return '이번에는 판 쪽이 그대로 둔 것보다 결과가 좋았어요. 이런 시장도 실제로 있어요. 다만 언제 팔아야 할지 미리 맞히기는 매우 어려워서, 다음에도 이렇게 될 거라고 기대하긴 어려워요.'
  }
  if (!sold && total < start) {
    return '팔지 않고 버텼는데도 3년 뒤에 손실이 남았어요. 시장이 회복하는 데는 3년보다 훨씬 오래 걸릴 수도 있어요. 그래서 오래 쓰지 않을 돈으로만 투자해야 해요.'
  }
  return null
}

// ---------- 최근 3년 (매일 갱신되는 코스피로 만드는 시장) ----------

const DETAIL = {
  rise: ['순조롭게 오르고 있어요. 지금이라도 더 넣어야 할까요?', '주변에서 "벌었다"는 이야기가 들려요.'],
  newHigh: [
    '주변에서 다시 투자 이야기가 많아져요. 지금 더 넣어도 될까요?',
    '기분 좋게 오르고 있어요. 조금 팔아서 수익을 챙길까요?',
    '계속 오르니 더 넣고 싶은 마음이 커져요.',
    '"지금 안 사면 늦는다"는 말이 들려요.',
  ],
  rebound: [
    '바닥에서 올라오고 있어요. 그래도 예전 최고점보다는 낮아요.',
    '조금씩 회복하고 있어요. 이번엔 진짜 오르는 걸까요?',
    '회복이 이어지고 있어요. 떨어질 때 판 사람들은 다시 사야 할지 고민이에요.',
  ],
  flat: ['몇 달째 오르지도 내리지도 않아요. 지루하고 답답해요.'],
}

function dropDetail(dd) {
  if (dd >= 0.35) return '주변에서 "다 팔았다"는 사람이 늘었어요. 넣은 돈이 눈에 띄게 줄었어요.'
  if (dd >= 0.2) return '"더 떨어질 수 있다"는 뉴스가 쏟아져요.'
  if (dd >= 0.1) return '뉴스에서 "조정"이라는 말이 자주 나와요. 잠깐 쉬어가는 걸까요?'
  return '조금씩 내려가고 있어요. 신경이 쓰이기 시작해요.'
}

// 실제 숫자로 그 달의 상황을 판정한다 (realMarkets.js를 만들 때와 같은 규칙)
function kindAt(b, m) {
  const now = b[m]
  const seen = b.slice(0, m + 1)
  const peak = Math.max(...seen)
  const trough = Math.min(...seen)
  const prevMax = Math.max(...b.slice(0, m))
  const dd = (peak - now) / peak
  const rb = (now - trough) / trough
  const recovering = seen.lastIndexOf(trough) > seen.indexOf(peak)
  if (dd >= 0.05) return { kind: rb >= 0.08 && recovering ? 'rebound' : 'drop', dd }
  if (rb >= 0.08 && recovering && now <= prevMax) return { kind: 'rebound', dd }
  if (now > prevMax && now - 100 >= 2) return { kind: 'newHigh', dd }
  if (now - 100 >= 2) return { kind: 'rise', dd }
  return { kind: 'flat', dd }
}

export function autoMoments(b) {
  const out = []
  const used = {}
  let last = -9
  for (const t of [4, 9, 14, 19, 25, 31]) {
    let best = null
    let bestScore = -1
    for (let m = Math.max(3, t - 2, last + 3); m <= Math.min(34, t + 2); m++) {
      const { dd } = kindAt(b, m)
      const trough = Math.min(...b.slice(0, m + 1))
      const score = Math.max(dd * 1.2, ((b[m] - trough) / trough) * 0.8, Math.abs(b[m] - b[m - 3]) / b[m - 3])
      if (score > bestScore) [best, bestScore] = [m, score]
    }
    const { kind, dd } = kindAt(b, best)
    let detail
    if (kind === 'drop') detail = dropDetail(dd)
    else {
      const i = used[kind] ?? 0
      detail = DETAIL[kind][i % DETAIL[kind].length]
      used[kind] = i + 1
    }
    out.push({ month: best, kind, detail })
    last = best
  }
  return out
}

const korDate = (d) => `${d.slice(0, 4)}년 ${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일`
const korMonth = (ym) => `${ym.slice(0, 4)}년 ${Number(ym.slice(5, 7))}월`

export function recentScenario(live) {
  const m = live?.kospi?.monthly
  if (!m || m.length < LAST_MONTH + 1) return null
  const pts = m.slice(-(LAST_MONTH + 1))
  const base = pts.map((p) => Math.round((p.close / pts[0].close) * 1000) / 10)
  const period = `${korMonth(pts[0].month)} ~ ${korMonth(pts[pts.length - 1].month)}`
  const end = base[base.length - 1]
  return {
    key: 'krRecent',
    country: 'kr',
    live: true,
    name: end >= 120 ? '최근의 상승장' : end <= 90 ? '최근의 하락장' : '최근 3년의 시장',
    label: '바로 지금까지의 3년',
    period,
    note: `가장 최근 3년(${period})의 실제 코스피예요. 공공데이터포털 자료로 평일마다 자동 갱신되고, 마지막 값은 ${korDate(live.kospi.latest.date)} 종가예요. 지금 시장이 앞으로도 같은 방향으로 간다는 뜻은 아니에요.`,
    base,
    moments: autoMoments(base),
  }
}
