// 미국 정규장(현지 09:30~16:00, 뉴욕 시간)을 한국 시간으로
// 미국 서머타임: 3월 둘째 일요일 ~ 11월 첫째 일요일
//   서머타임 중  → 한국 시간 22:30 ~ 다음날 05:00
//   서머타임 아님 → 한국 시간 23:30 ~ 다음날 06:00

function nthSunday(year, month, n) {
  // month: 0=1월
  const first = new Date(Date.UTC(year, month, 1))
  const offset = (7 - first.getUTCDay()) % 7
  return new Date(Date.UTC(year, month, 1 + offset + (n - 1) * 7))
}

export function isUsDst(now = new Date()) {
  const y = now.getUTCFullYear()
  // 뉴욕 새벽 2시 기준으로 바뀌지만, 화면 안내용이라 날짜 단위로 판단한다
  const start = nthSunday(y, 2, 2) // 3월 둘째 일요일
  const end = nthSunday(y, 10, 1) // 11월 첫째 일요일
  return now >= start && now < end
}

export function usHoursKst(now = new Date()) {
  const dst = isUsDst(now)
  return {
    dst,
    text: dst ? '22:30 ~ 다음날 05:00' : '23:30 ~ 다음날 06:00',
    label: dst ? '서머타임 기간' : '서머타임 아닌 기간',
  }
}
