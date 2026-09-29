// 투자 성향 판정 (03 기능명세서 4장)
// answers: 5개 문항의 점수 배열 [q1, q2, q3, q4, q5]

export function diagnose(answers) {
  const [q1, q2, q3, q4, q5] = answers

  // Q2(손실 감내도)에 가중치 2. 총점 범위 6~24
  const total = q1 + q2 * 2 + q3 + q4 + q5

  let type = 'active'
  if (total <= 11) type = 'stable'
  else if (total <= 17) type = 'balanced'

  // 덮어쓰기 규칙: 총점과 무관하게 경고. 비상금 경고가 먼저
  const warnings = []
  if (q5 === 1) warnings.push('emergency')
  if (q3 === 1) warnings.push('shortTerm')

  // 욕심은 크지만 실제 하락은 못 견디는 경우
  const mismatch = q4 - q2 >= 2

  return { total, type, warnings, mismatch }
}
