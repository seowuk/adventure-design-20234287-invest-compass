// 자금 성격 판정 (03 기능명세서 5장)
// funds: [a1, a2, a3]
//   a1 3년 안 사용?     'yes' | 'no' | 'unknown'
//   a2 55세 전 인출?    'yes' | 'no' | 'unknown'
//   a3 소득 신고 방식   'salary' | 'business' | 'none' | 'unknown'
// "잘 모르겠어요"는 항상 더 유동적인 쪽으로 해석한다.

export function classifyFunds([a1, a2, a3]) {
  let type = 'long'
  if (a1 !== 'no') type = 'free'
  else if (a2 !== 'no') type = 'mid'

  const deduction = a3 === 'salary' || a3 === 'business'

  // 오래 둘 돈이어도 세액공제를 못 받으면 연금계좌를 앞세우지 않는다
  const guideKey = type === 'long' && !deduction ? 'longNoDeduction' : type

  return { type, deduction, guideKey }
}
