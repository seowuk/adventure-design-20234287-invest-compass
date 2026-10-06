// 금액 표시 도우미 (계산기 밖 화면에서 공용으로 사용)
export function comma(value) {
  return Math.round(value).toLocaleString('ko-KR')
}

// 1억 1,058만원 형식
export function koreanUnit(value) {
  const n = Math.round(value)
  if (n < 10000) return comma(n) + '원'
  const eok = Math.floor(n / 100_000_000)
  const man = Math.floor((n % 100_000_000) / 10000)
  const parts = []
  if (eok > 0) parts.push(`${eok}억`)
  if (man > 0) parts.push(`${comma(man)}만`)
  return parts.join(' ') + '원'
}
