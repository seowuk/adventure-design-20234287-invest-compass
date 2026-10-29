// 1억까지 얼마나 걸릴까 (03 기능명세서 FR-17, 신규)
//
// 가정 (화면에도 그대로 밝힌다)
//   - 투자: 연 수익률을 "1년 뒤 정확히 그만큼"으로 보고 매달 복리 (계산기와 같은 방식)
//     비관 3%, 보통 5%, 낙관 7%. 세금·수수료는 빼지 않음
//   - 적금: 연 3% 적금을 매년 다시 드는 것으로 단순화하고, 이자 세금 15.4%를 뺀 2.54%로 계산
//   - 저축은 매달 말에 넣는다

export const TARGET = 100_000_000
export const AMOUNTS = [50, 60, 70, 80, 100, 150, 200] // 만원
export const RATES = { low: 3, mid: 5, high: 7 }
export const SAVINGS_RATE = 3 * (1 - 0.154) // 적금 세후
export const INFLATION = 3
export const MILESTONES = [10_000_000, 30_000_000, 50_000_000, 100_000_000]
export const CRASH = { month: 60, pct: 30 } // 5년째에 30% 하락 한 번
export const GROW = 3 // 저축액을 매년 늘리는 비율 (%)

const MAX_MONTHS = 1200

/**
 * 목표 금액까지 걸리는 개월 수
 * @param {number} target 목표 (원)
 * @param {number} monthly 매달 넣는 돈 (원)
 * @param {number} annualPct 연 수익률 (%)
 * @param {{ grow?: boolean, crash?: boolean }} opts
 */
export function monthsTo(target, monthly, annualPct, opts = {}) {
  if (monthly <= 0) return Infinity
  const r = Math.pow(1 + annualPct / 100, 1 / 12) - 1
  let balance = 0
  let pay = monthly
  for (let m = 1; m <= MAX_MONTHS; m++) {
    balance = balance * (1 + r) + pay
    if (opts.crash && m === CRASH.month) balance *= 1 - CRASH.pct / 100
    if (balance >= target) return m
    if (opts.grow && m % 12 === 0) pay *= 1 + GROW / 100
  }
  return Infinity
}

export function duration(months) {
  if (!Number.isFinite(months)) return '100년 넘게'
  const y = Math.floor(months / 12)
  const m = months % 12
  if (y === 0) return `${m}개월`
  if (m === 0) return `${y}년`
  return `${y}년 ${m}개월`
}

// 두 기간의 차이를 "1년 3개월 빨라져요 / 늦어져요"로
export function diffText(base, other) {
  const d = other - base
  if (d === 0) return '차이가 없어요'
  return `${duration(Math.abs(d))} ${d < 0 ? '빨라져요' : '늦어져요'}`
}

// 그때의 목표 금액이 지금 돈으로 얼마인지
export function presentValue(amount, months) {
  return amount / Math.pow(1 + INFLATION / 100, months / 12)
}

// 1억이 되었을 때 1년·한 달에 벌어오는 돈 (세금 전)
export function earnings(amount, annualPct) {
  const year = amount * (annualPct / 100)
  return { year, month: year / 12 }
}
