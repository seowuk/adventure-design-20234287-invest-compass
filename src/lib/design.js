// 디자인 전환: 'night'(v4 밤하늘, 기본) | 'mono'(v3 Moto 레퍼런스) | 'color'(v2 인디고 그라디언트)
// 고른 값은 이 기기에만 저장하고, 화면을 그리기 전에 적용해서 깜빡임이 없게 한다
const KEY = 'invest-compass:design'
export const DESIGNS = [
  { key: 'night', label: '밤하늘' },
  { key: 'mono', label: '모노' },
  { key: 'color', label: '컬러' },
]

export function getDesign() {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'color' || v === 'mono' ? v : 'night'
  } catch {
    return 'night'
  }
}

export function applyDesign(d) {
  document.documentElement.dataset.design = d
  try {
    localStorage.setItem(KEY, d)
  } catch {
    // 저장이 막혀도 지금 화면에는 적용된다
  }
}
