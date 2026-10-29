// 예시 계획 (03 기능명세서 FR-18, 신규)
//
// 원칙
//   - "추천"이 아니라 공개된 규칙으로 만든 "예시 계획". 상품 이름 없이 그릇(계좌·상품 종류)까지만
//   - 뼈대는 순서: 비상금 먼저 → 돈을 쓸 시기에 맞는 그릇
//   - "쓸 돈"은 연금저축에 넣지 않는다 (55세 전에 꺼내면 불이익)
//   - 수익률은 약속이 아니라 가정. 화면에 그대로 밝힌다

import { diagnose } from './diagnosis'
import { classifyFunds } from './accounts'
import { QUESTIONS } from '../data/questions'

export const PLAN_KEY = 'invest-compass:plan'

// 이 기기에 저장된 계획 조건 (없거나 깨졌으면 null)
export function loadPlanInput() {
  try {
    const v = JSON.parse(localStorage.getItem(PLAN_KEY))
    return v && typeof v.monthly === 'number' ? v : null
  } catch {
    return null
  }
}

export const MONTHLY_PRESETS = [30, 50, 70, 100, 150, 200] // 만원

export const PURPOSES = [
  { key: 'short', label: '3년 안에 쓸 돈', sub: '여행, 차, 이사' },
  { key: 'mid', label: '3~10년 뒤 쓸 돈', sub: '결혼, 전세' },
  { key: 'retire', label: '노후 자금', sub: '55세 이후' },
]

export const CUSHIONS = [
  { key: 'none', label: '없어요' },
  { key: 'some', label: '조금 있어요' },
  { key: 'enough', label: '3개월치 이상' },
]

export const TAXES = [
  { key: 'yes', label: '해요' },
  { key: 'no', label: '안 해요' },
]

export const STYLES = [
  { key: 'stable', label: '안정형' },
  { key: 'balanced', label: '중립형' },
  { key: 'active', label: '적극형' },
]

// 비상금 목표: 생활비 3개월치. 생활비를 묻지 않으므로 예시로 월 100만원 기준
export const EMERGENCY = { none: 3_000_000, some: 1_500_000, enough: 0 }
export const EMERGENCY_SHARE = 0.5 // 비상금을 채우는 동안 매달 저축액의 절반

// 투자 그릇 안에서 지수 ETF(주식형) 비중
export const STOCK_RATIO = { stable: 0.3, balanced: 0.6, active: 0.8 }

// 수익률 가정 (연 %)
export const RATE = { parking: 2, savings: 3 * (1 - 0.154), stock: 6, bond: 3 }
export const investRate = (style) => STOCK_RATIO[style] * RATE.stock + (1 - STOCK_RATIO[style]) * RATE.bond

export const PENSION_MONTHLY_CAP = 500_000 // 연 600만원 세액공제 한도
export const DEDUCTION = { low: 0.132, high: 0.165 } // 총급여 5,500만원 초과 / 이하

export const BUCKETS = {
  emergency: { name: '비상금', where: '파킹통장·CMA', color: '#9AA0BF' },
  savings: { name: '적금·예금', where: '은행 적금·예금', color: '#9FB4FF' },
  isa: { name: 'ISA', where: 'ISA 중개형 계좌', color: '#3346F5' },
  pension: { name: '연금저축', where: '연금저축 계좌', color: '#8B5CF6' },
}

// 진단·자금 성격 답으로 기본값 채우기
export function defaultsFrom(answers, funds) {
  const out = { cushion: 'none', purpose: 'mid', tax: 'yes', style: 'balanced', from: [] }
  if (answers) {
    const idx = (id) => QUESTIONS.findIndex((q) => q.id === id)
    const cushion = answers[idx('cushion')]
    if (cushion != null) {
      out.cushion = cushion <= 1 ? 'none' : cushion === 2 ? 'some' : 'enough'
      out.from.push('cushion')
    }
    const horizon = answers[idx('horizon')]
    if (horizon != null) {
      out.purpose = horizon <= 2 ? 'short' : horizon === 3 ? 'mid' : 'retire'
      out.from.push('purpose')
    }
    out.style = diagnose(answers).type
    out.from.push('style')
  }
  if (funds) {
    const f = classifyFunds(funds)
    out.purpose = f.type === 'free' ? 'short' : f.type === 'mid' ? 'mid' : 'retire'
    out.tax = f.deduction ? 'yes' : 'no'
    if (!out.from.includes('purpose')) out.from.push('purpose')
    out.from.push('tax')
  }
  return out
}

// 매달 저축액을 그릇별로 나누는 비율 (비상금을 다 채운 뒤)
function mainSplit(monthly, { purpose, tax, style }) {
  if (purpose === 'short') return { savings: monthly }
  if (purpose === 'mid') {
    const savingsShare = { stable: 0.5, balanced: 0.3, active: 0.1 }[style]
    return { savings: monthly * savingsShare, isa: monthly * (1 - savingsShare) }
  }
  // 노후: 연말정산을 하면 연금저축 먼저(세액공제 한도까지), 나머지는 ISA
  if (tax === 'yes') {
    const pension = Math.min(monthly, PENSION_MONTHLY_CAP)
    return monthly > pension ? { pension, isa: monthly - pension } : { pension }
  }
  return { isa: monthly }
}

function scale(split, factor) {
  return Object.fromEntries(Object.entries(split).map(([k, v]) => [k, v * factor]))
}

/**
 * @param {{ monthly: number, cushion: string, purpose: string, tax: string, style: string }} input
 */
export function makePlan(input) {
  const { monthly, cushion, style } = input
  const need = EMERGENCY[cushion]
  const main = mainSplit(monthly, input)

  const phases = []
  if (need > 0) {
    const toEmergency = monthly * EMERGENCY_SHARE
    const months = Math.ceil(need / toEmergency)
    phases.push({ label: `처음 ${months}개월`, months, split: { emergency: toEmergency, ...scale(main, 1 - EMERGENCY_SHARE) } })
  }
  phases.push({ label: phases.length ? '그다음부터' : '매달', months: Infinity, split: main })

  // 1억까지: 비상금을 뺀 목표 그릇만 센다
  const rates = { savings: RATE.savings, isa: investRate(style), pension: investRate(style) }
  const monthsTo1eok = simulate(phases, rates, 100_000_000)
  const shifted = (d) => ({ ...rates, isa: rates.isa + d, pension: rates.pension + d })
  const fast = simulate(phases, shifted(RANGE), 100_000_000)
  const slow = simulate(phases, shifted(-RANGE), 100_000_000)

  const pensionMonthly = main.pension ?? 0
  const refund = pensionMonthly
    ? { low: pensionMonthly * 12 * DEDUCTION.low, high: pensionMonthly * 12 * DEDUCTION.high }
    : null

  // 목표 시기 안에 1억이 안 되면, 그 시기에 모이는 돈을 대신 보여준다
  const horizon = HORIZON[input.purpose]
  const atHorizon = horizon && monthsTo1eok > horizon ? balanceAt(phases, rates, horizon) : null

  return { phases, months: monthsTo1eok, fast, slow, refund, stockRatio: STOCK_RATIO[style], emergencyNeed: need, horizon, atHorizon }
}

export const HORIZON = { short: 36, mid: 120, retire: null }
export const RANGE = 2 // 빠르면·늦으면: 투자 그릇 수익률 ±2%p
export const APP_URL = 'seowuk.github.io/invest-compass'

function balanceAt(phases, rates, months) {
  const bal = { savings: 0, isa: 0, pension: 0 }
  const mr = Object.fromEntries(Object.entries(rates).map(([k, r]) => [k, Math.pow(1 + r / 100, 1 / 12) - 1]))
  let pi = 0
  let left = phases[0].months
  for (let m = 1; m <= months; m++) {
    const split = phases[pi].split
    for (const k of Object.keys(bal)) bal[k] = bal[k] * (1 + mr[k]) + (split[k] ?? 0)
    left -= 1
    if (left <= 0 && pi < phases.length - 1) {
      pi += 1
      left = phases[pi].months
    }
  }
  return bal.savings + bal.isa + bal.pension
}

function simulate(phases, rates, target) {
  const bal = { savings: 0, isa: 0, pension: 0 }
  const mr = Object.fromEntries(Object.entries(rates).map(([k, r]) => [k, Math.pow(1 + r / 100, 1 / 12) - 1]))
  let pi = 0
  let left = phases[0].months
  for (let m = 1; m <= 1200; m++) {
    const split = phases[pi].split
    for (const k of Object.keys(bal)) bal[k] = bal[k] * (1 + mr[k]) + (split[k] ?? 0)
    if (bal.savings + bal.isa + bal.pension >= target) return m
    left -= 1
    if (left <= 0 && pi < phases.length - 1) {
      pi += 1
      left = phases[pi].months
    }
  }
  return Infinity
}

// 3년 안에 1억을 모으려면 매달 얼마가 필요한지 (적금 기준)
export function monthlyNeeded(target, months, annualPct) {
  const r = Math.pow(1 + annualPct / 100, 1 / 12) - 1
  return (target * r) / (Math.pow(1 + r, months) - 1)
}

export const RULES = [
  '비상금이 생활비 3개월치(예시 300만원)가 될 때까지, 매달 저축액의 절반을 비상금에 넣어요',
  '3년 안에 쓸 돈은 떨어져도 기다릴 시간이 없어서, 원금이 지켜지는 적금·예금에 넣어요',
  '3~10년 뒤 쓸 돈은 세금 혜택이 있는 ISA를 중심으로, 성향이 조심스러울수록 적금 비중을 늘려요 (안정 5 : 5, 중립 3 : 7, 적극 1 : 9)',
  '노후 자금은 연말정산을 한다면 세액공제가 되는 연금저축에 월 50만원까지, 나머지는 ISA에 넣어요',
  '연금저축은 55세 전에 꺼내면 불이익이 커서, 그 전에 쓸 돈에는 넣지 않아요',
  'ISA·연금저축 안에서는 성향에 따라 넓은 지수 ETF와 채권형을 나눠요 (안정 3 : 7, 중립 6 : 4, 적극 8 : 2)',
]

// ---------- 한 장 요약 (화면 카드와 저장 이미지가 같은 내용을 쓴다) ----------

const won = (v) => `${Math.round(v / 1e4).toLocaleString('ko-KR')}만원`

function dur(months) {
  if (!Number.isFinite(months)) return '100년 넘게'
  const y = Math.floor(months / 12)
  const m = months % 12
  return y === 0 ? `${m}개월` : m === 0 ? `${y}년` : `${y}년 ${m}개월`
}

const ORDER = ['emergency', 'savings', 'isa', 'pension']

export function summarize(plan, input) {
  const first = plan.phases[0]
  const last = plan.phases[plan.phases.length - 1]
  const hasEmergency = Boolean(first.split.emergency)
  const ratio = Math.round(plan.stockRatio * 100)

  const line = {
    emergency: `처음 ${first.months}개월, ${won(plan.emergencyNeed)} 채우면 끝`,
    savings: '원금이 지켜지는 곳',
    isa: `세금 혜택 · 지수 ETF ${ratio} : 채권형 ${100 - ratio}`,
    pension: '연말정산 때 최대 16.5% 돌려받기',
  }

  const steps = ORDER.filter((k) => (k === 'emergency' ? hasEmergency : last.split[k] > 0)).map((k) => ({
    key: k,
    name: k === 'emergency' ? '비상금 먼저' : BUCKETS[k].name,
    where: BUCKETS[k].where,
    amount: k === 'emergency' ? first.split.emergency : last.split[k],
    line: line[k],
    color: BUCKETS[k].color,
  }))

  let outcome
  if (plan.atHorizon) {
    outcome = {
      label: `${plan.horizon / 12}년 뒤 모이는 돈`,
      big: `약 ${won(Math.round(plan.atHorizon / 1e5) * 1e5)}`,
      sub: `1억까지는 약 ${dur(plan.months)}`,
    }
  } else {
    outcome = {
      label: '이대로면 1억까지',
      big: `약 ${dur(plan.months)}`,
      sub: plan.fast === plan.slow ? '원금이 지켜지는 적금 기준' : `빠르면 ${dur(plan.fast)} · 늦으면 ${dur(plan.slow)}`,
    }
  }

  return {
    title: `매달 ${input.monthly}만원`,
    steps,
    note: hasEmergency ? '2단계부터는 비상금을 다 채운 뒤 금액이에요' : null,
    outcome,
    monthsValue: plan.atHorizon ? null : plan.months,
  }
}
