// "이번 달 넣었어요" 체크 (이 기기에만 저장)
// 앱은 실제 잔고를 모르므로, 체크한 달 수로 계획의 진행을 보여준다
const KEY = 'invest-compass:checkins'

export function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function loadCheckins() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function toggleThisMonth() {
  const now = monthKey()
  const list = loadCheckins()
  const next = list.includes(now) ? list.filter((m) => m !== now) : [...list, now].sort()
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // 저장이 막혀도 화면에는 반영된다
  }
  return next
}
