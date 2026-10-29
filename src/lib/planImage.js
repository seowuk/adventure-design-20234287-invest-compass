// 한 장 요약을 인스타 스토리 크기(1080×1920) 이미지로 그린다
// 외부 라이브러리 없이 캔버스로 직접 그려서 어떤 환경에서도 같은 모양이 나온다
import { APP_URL } from './plan'

const W = 1080
const H = 1920
const FONT = `'Pretendard Variable', Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif`
const f = (size, weight = 700) => `${weight} ${size}px ${FONT}`

function round(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function compass(ctx, cx, cy, r) {
  ctx.fillStyle = '#3346F5'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  const a = (35 * Math.PI) / 180
  const pt = (dx, dy) => [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)]
  const L = r * 0.66
  const w = r * 0.16
  ctx.fillStyle = '#FFD84D'
  ctx.beginPath()
  ctx.moveTo(...pt(0, -L)); ctx.lineTo(...pt(w, 0)); ctx.lineTo(...pt(-w, 0)); ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.moveTo(...pt(0, L)); ctx.lineTo(...pt(w, 0)); ctx.lineTo(...pt(-w, 0)); ctx.fill()
  ctx.fillStyle = '#14172B'
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.12, 0, Math.PI * 2)
  ctx.fill()
}

export async function drawPlanImage(summary) {
  if (document.fonts?.ready) await document.fonts.ready
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')

  // 배경: 남색 + 은은한 빛
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#14172B')
  bg.addColorStop(1, '#22264A')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  const glow = (x, y, r, color) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, color)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }
  glow(180, 160, 520, 'rgba(51,70,245,0.35)')
  glow(940, 1700, 560, 'rgba(139,92,246,0.25)')

  const X = 90
  // 머리
  compass(ctx, X + 26, 150, 26)
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = f(34)
  ctx.textBaseline = 'middle'
  ctx.fillText('투자 나침반', X + 70, 152)

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#9FB4FF'
  ctx.font = f(64, 800)
  ctx.fillText(summary.title, X, 300)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = f(92, 800)
  ctx.fillText('나만의 자금 계획', X, 410)

  // 단계 카드 + 결과를 머리와 바닥 사이 가운데에 모은다
  const n = summary.steps.length
  const gap = 26
  const ch = 232
  const noteH = summary.note ? 48 : 0
  const outGap = 60
  const outH = 250
  const block = n * ch + (n - 1) * gap + noteH + outGap + outH
  const areaTop = 480
  const areaBottom = H - 150
  const top = areaTop + Math.max(0, (areaBottom - areaTop - block) / 2)
  summary.steps.forEach((s, i) => {
    const y = top + i * (ch + gap)
    ctx.fillStyle = 'rgba(255,255,255,0.07)'
    round(ctx, X, y, W - X * 2, ch, 36)
    ctx.fill()
    ctx.fillStyle = s.color
    round(ctx, X, y, 12, ch, 6)
    ctx.fill()
    // 번호
    ctx.fillStyle = s.color
    ctx.beginPath()
    ctx.arc(X + 92, y + ch / 2, 44, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = s.key === 'savings' ? '#14172B' : '#FFFFFF'
    ctx.font = f(48, 800)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(i + 1), X + 92, y + ch / 2 + 2)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    // 글
    const tx = X + 168
    ctx.fillStyle = '#FFFFFF'
    ctx.font = f(50, 800)
    ctx.fillText(s.name, tx, y + ch / 2 - 30)
    ctx.fillStyle = '#FFD84D'
    ctx.font = f(50, 800)
    ctx.textAlign = 'right'
    ctx.fillText(`${Math.round(s.amount / 1e4).toLocaleString('ko-KR')}만원`, W - X - 40, y + ch / 2 - 30)
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.62)'
    ctx.font = f(32, 600)
    ctx.fillText(s.where, tx, y + ch / 2 + 20)
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = f(34, 600)
    ctx.fillText(s.line, tx, y + ch / 2 + 68)
  })

  let y = top + n * ch + (n - 1) * gap
  if (summary.note) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = f(28, 500)
    ctx.fillText(summary.note, X + 8, y + 40)
    y += noteH
  }

  // 결과
  const oy = y + outGap
  ctx.fillStyle = 'rgba(255,216,77,0.12)'
  round(ctx, X, oy, W - X * 2, 250, 40)
  ctx.fill()
  ctx.fillStyle = '#9FB4FF'
  ctx.font = f(38, 700)
  ctx.fillText(summary.outcome.label, X + 50, oy + 70)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = f(96, 800)
  ctx.fillText(summary.outcome.big, X + 46, oy + 170)
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.font = f(32, 600)
  ctx.fillText(summary.outcome.sub, X + 50, oy + 222)

  // 바닥
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = f(28, 500)
  ctx.textAlign = 'center'
  ctx.fillText(`예시 계획 · 투자 자문 아님 · ${APP_URL}`, W / 2, H - 70)
  ctx.textAlign = 'left'

  return new Promise((res) => c.toBlob(res, 'image/png'))
}

// 폰에서는 공유 창(인스타 등), 안 되면 파일로 저장
export async function savePlanImage(summary) {
  const blob = await drawPlanImage(summary)
  if (!blob) throw new Error('image')
  const file = new File([blob], '투자나침반_내계획.png', { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '나만의 자금 계획' })
      return 'shared'
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled'
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
  return 'downloaded'
}
