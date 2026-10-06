// 하락 시나리오 (03 기능명세서 FR-10 확장)
// 같은 돈을 같은 방식으로 넣되, 중간에 큰 하락이 한 번 왔을 때 세 가지 경우를 비교한다.
//   base : 하락이 없었을 때
//   hold : 하락이 와도 팔지 않고 계속 넣었을 때
//   sold : 하락한 바닥에서 팔고, 이후엔 예금으로만 모았을 때
//
// 단순화한 가정
//   - 하락은 지정한 해의 마지막 달에 한 번 온다
//   - 하락 뒤 반등은 따로 가정하지 않는다 (이후에도 같은 평균 수익률)
//   - 판 뒤의 돈과 이후 적립금은 예금 금리(연 DEPOSIT_RATE%)로만 불어난다
//   - 세금·수수료는 반영하지 않는다

export const DEPOSIT_RATE = 2

function monthlyRate(annualRate) {
  return Math.pow(1 + annualRate / 100, 1 / 12) - 1
}

export function simulateCrash({ initial, monthly, annualRate, years, crashYear, dropPct }) {
  const r = monthlyRate(annualRate)
  const rc = monthlyRate(DEPOSIT_RATE)
  const crashMonth = crashYear * 12
  const drop = dropPct / 100

  let base = initial
  let hold = initial
  let sold = initial
  let soldOut = false
  const rows = []

  for (let m = 1; m <= years * 12; m++) {
    base = base * (1 + r) + monthly
    hold = hold * (1 + r) + monthly

    if (soldOut) {
      sold = sold * (1 + rc) + monthly
    } else {
      sold = hold
    }

    if (m === crashMonth) {
      hold *= 1 - drop
      sold = hold // 바닥에서 판다
      soldOut = true
    }

    if (m % 12 === 0) {
      rows.push({
        year: `${m / 12}년`,
        base: Math.round(base),
        hold: Math.round(hold),
        sold: Math.round(sold),
      })
    }
  }

  const last = rows[rows.length - 1]
  return { rows, base: last.base, hold: last.hold, sold: last.sold }
}
