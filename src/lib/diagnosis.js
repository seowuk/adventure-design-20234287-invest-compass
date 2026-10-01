// 투자 성향 판정 (03 기능명세서 4장, v1.1 재설계)
//
// 근거로 삼은 원칙
//  1. 의향과 능력을 따로 보고, 서로 다르면 더 조심스러운 쪽을 따른다
//  2. 의향은 형식이 다른 세 문항을 같은 무게로 더한다 (한 문항에 휘둘리지 않게)
//  3. 능력은 점수를 더하지 않고 '상한선'으로 쓴다
//     (비상금이 없거나 곧 쓸 돈이면, 마음이 아무리 대담해도 올라가지 않는다)
//  4. 투자 경험은 성향이 아니므로 점수에서 뺀다
import { QUESTIONS } from '../data/questions'

export const LEVELS = ['stable', 'balanced', 'active']

function toMap(answers) {
  return Object.fromEntries(QUESTIONS.map((q, i) => [q.id, answers[i]]))
}

// 의향 합계 3~12 → 안정 3~5 / 중립 6~8 / 적극 9~12 (문항 평균 2 미만 / 2~3 미만 / 3 이상)
function willingnessLevel(sum) {
  if (sum <= 5) return 0
  if (sum <= 8) return 1
  return 2
}

// 쓸 시점: 3년 안이면 안정까지만, 3~10년이면 중립까지, 10년 이상이면 제한 없음
function horizonCap(h) {
  if (h <= 2) return 0
  if (h === 3) return 1
  return 2
}

// 비상금: 없으면 안정까지만, 부족하면 중립까지, 몇 달치 이상이면 제한 없음
function cushionCap(c) {
  if (c === 1) return 0
  if (c === 2) return 1
  return 2
}

export function diagnose(answers) {
  const a = toMap(answers)

  const willSum = a.loss + a.choice + a.goal
  const will = willingnessLevel(willSum)
  const hCap = horizonCap(a.horizon)
  const cCap = cushionCap(a.cushion)
  const cap = Math.min(hCap, cCap)
  const level = Math.min(will, cap)

  // 무엇이 출발점을 끌어내렸나
  let limitedBy = null
  if (cap < will) {
    if (hCap === cCap) limitedBy = 'both'
    else limitedBy = hCap < cCap ? 'horizon' : 'cushion'
  }

  // 경계 점수: 한 칸 차이로 유형이 갈리는 경우 "OO형에 가까워요"
  // 위쪽으로 기우는 건 여건이 허락할 때만 알려준다
  let leaning = null
  if (!limitedBy) {
    if ((willSum === 5 || willSum === 8) && cap > will) leaning = LEVELS[will + 1]
    else if (willSum === 6 || willSum === 9) leaning = LEVELS[will - 1]
  }

  const warnings = []
  if (a.cushion === 1) warnings.push('emergency')
  if (a.horizon === 1) warnings.push('shortTerm')

  return {
    type: LEVELS[level],
    // 점수에는 안 쓰고, 설명·추천 자료 수준에만 쓴다
    exp: a.exp,
    willingness: LEVELS[will],
    capacity: LEVELS[cap],
    willSum,
    hCap,
    cCap,
    limitedBy,
    leaning,
    warnings,
    // 욕심은 크지만 실제 하락은 못 견디는 경우
    mismatch: a.goal - a.loss >= 2,
    // 적극적으로 답했지만 실제 하락을 겪어본 적 없는 경우
    untested: a.exp <= 2 && will === 2,
  }
}
