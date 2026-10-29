import { useEffect, useRef, useState } from 'react'

// 숫자가 올라가며 세어지는 효과 (움직임 줄이기 설정이면 바로 표시)
function useCountUp(target, ms = 700) {
  const [v, setV] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce || target === from.current) {
      from.current = target
      setV(target)
      return
    }
    const start = performance.now()
    const a = from.current
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms)
      const e = 1 - Math.pow(1 - t, 3)
      setV(a + (target - a) * e)
      if (t < 1) raf = requestAnimationFrame(tick)
      else from.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

function Amount({ value }) {
  const v = useCountUp(Math.round(value / 1e4))
  return <>{Math.round(v).toLocaleString('ko-KR')}만원</>
}

function Duration({ months, text }) {
  const v = useCountUp(months ?? 0, 900)
  if (months == null || !Number.isFinite(months)) return <>{text}</>
  const m = Math.round(v)
  const y = Math.floor(m / 12)
  const r = m % 12
  return <>약 {y === 0 ? `${r}개월` : r === 0 ? `${y}년` : `${y}년 ${r}개월`}</>
}

/**
 * 한 장 요약 카드. summary는 lib/plan.js의 summarize() 결과
 * 조건이 바뀌면 version이 바뀌어 단계가 다시 차례로 떠오른다
 */
export default function PlanCard({ summary, version }) {
  return (
    <article className="plan-card" aria-label="나만의 자금 계획 요약">
      <header className="pc-head">
        <span className="pc-brand">투자 나침반</span>
        <p className="pc-title">{summary.title}</p>
        <h2 className="pc-name">나만의 자금 계획</h2>
      </header>

      <ol className="pc-steps" key={version}>
        {summary.steps.map((s, i) => (
          <li key={s.key} className="pc-step" style={{ '--i': i, '--c': s.color }}>
            <span className={`pc-num${s.key === 'savings' ? ' is-light' : ''}`}>{i + 1}</span>
            <div className="pc-body">
              <div className="pc-row">
                <strong className="pc-step-name">{s.name}</strong>
                <span className="pc-amount">
                  <Amount value={s.amount} />
                </span>
              </div>
              <p className="pc-where">{s.where}</p>
              <p className="pc-line">{s.line}</p>
            </div>
          </li>
        ))}
      </ol>
      {summary.note && <p className="pc-note">{summary.note}</p>}

      <footer className="pc-outcome">
        <p className="pc-out-label">{summary.outcome.label}</p>
        <p className="pc-out-big">
          <Duration months={summary.monthsValue} text={summary.outcome.big} />
        </p>
        <p className="pc-out-sub">{summary.outcome.sub}</p>
      </footer>
    </article>
  )
}
