import { useState } from 'react'
import { BUCKETS, makePlan, summarize } from '../lib/plan'
import { duration } from '../lib/goal'
import { loadCheckins, monthKey, toggleThisMonth } from '../lib/checkin'

// 12.5만원처럼 소수 한 자리까지 (반올림 때문에 합이 어긋나지 않게)
const man = (won) => `${(Math.round(won / 1e3) / 10).toLocaleString('ko-KR')}만원`

// 아이콘 둘레의 진행률 고리
function Ring({ value, color, children }) {
  const r = 22
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <span className="hp-ring">
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <circle cx="26" cy="26" r={r} className="hp-ring-track" />
        <circle
          cx="26"
          cy="26"
          r={r}
          className="hp-ring-fill"
          style={{ stroke: color, strokeDasharray: c, strokeDashoffset: c * (1 - v) }}
        />
      </svg>
      <span className="hp-ring-icon">{children}</span>
    </span>
  )
}

const ICON = {
  in: <path d="M4 12h12m-4-4 4 4-4 4M20 5v14" />,
  emergency: <path d="M12 3a8 8 0 0 1 8 8H4a8 8 0 0 1 8-8Zm0 8v7a2 2 0 0 1-4 0" />,
  savings: (
    <>
      <rect x="4" y="7" width="16" height="12" rx="2" />
      <path d="M8 7V5h8v2M12 11v4" />
    </>
  ),
  isa: <path d="M4 18 9 12l4 3 7-8M15 7h5v5" />,
  pension: (
    <>
      <path d="M5 21V10l7-5 7 5v11" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
}

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON[name]}
    </svg>
  )
}

/**
 * planInput: 저장된 계획 조건 (없으면 예시)
 * demo: 소개 화면용 예시 (체크 기능 없음)
 */
export default function HomePlanCard({ planInput, onOpen, demo = false }) {
  const [checks, setChecks] = useState(() => (demo ? [] : loadCheckins()))
  const input = planInput ?? { monthly: 70, cushion: 'some', purpose: 'mid', tax: 'yes', style: 'balanced' }
  const plan = makePlan({ ...input, monthly: input.monthly * 10_000 })
  const summary = summarize(plan, input)
  const first = plan.phases[0]
  const last = plan.phases[plan.phases.length - 1]
  const done = demo ? 4 : checks.length
  // 지금 단계: 비상금을 채우는 중이면 첫 단계, 다 채웠으면 그다음 단계 (합계가 항상 매달 저축액과 같다)
  const filling = Boolean(first.split.emergency) && done < first.months
  const phase = filling ? first : last
  const ORDER = ['emergency', 'savings', 'isa', 'pension']
  const steps = ORDER.filter((k) => phase.split[k] > 0).map((k) => ({
    key: k,
    name: k === 'emergency' ? '비상금' : BUCKETS[k].name,
    amount: phase.split[k],
  }))
  const thisMonth = monthKey()
  const checked = checks.includes(thisMonth)

  // 비상금: 체크한 달만큼 채워짐 / 나머지: 매달 저축액 중 몫
  const share = (key) => (phase.split[key] ?? 0) / (input.monthly * 10_000)
  const ringValue = (s) =>
    s.key === 'emergency' ? (plan.emergencyNeed ? (done * s.amount) / plan.emergencyNeed : 1) : share(s.key)
  const ringNote = (s) => {
    if (s.key === 'emergency') {
      const filled = Math.min(plan.emergencyNeed, done * s.amount)
      return `${man(plan.emergencyNeed)} 중 ${man(filled)}`
    }
    return `매달의 ${Math.round(share(s.key) * 100)}%`
  }
  // 홈 카드는 1억 진행을 보여준다 (3년 안에 쓸 돈만 그 시기에 모이는 돈으로)
  const total = Number.isFinite(plan.months) && input.purpose !== 'short' ? plan.months : null

  return (
    <article className={`hp-card${demo ? ' is-demo' : ''}`} aria-label="나만의 자금 계획">
      <ol className="hp-flow">
        <li className="hp-row">
          <span className="hp-ring is-plain">
            <span className="hp-ring-icon">
              <Icon name="in" />
            </span>
          </span>
          <span className="hp-text">
            <strong>월급에서</strong>
            <span>매달 모으는 돈</span>
          </span>
          <span className="hp-amt is-in">+{input.monthly}만원</span>
        </li>
        {steps.map((s) => (
          <li key={s.key} className="hp-row">
            <Ring value={ringValue(s)} color={BUCKETS[s.key].color}>
              <Icon name={s.key} />
            </Ring>
            <span className="hp-text">
              <strong>{s.name}</strong>
              <span>{ringNote(s)}</span>
            </span>
            <span className="hp-amt">{man(s.amount)}</span>
          </li>
        ))}
      </ol>
      {filling && (
        <p className="hp-next">
          비상금을 다 채우면({first.months}개월) 그 몫이{' '}
          {Object.keys(last.split)
            .filter((k) => k !== 'emergency')
            .map((k) => `${BUCKETS[k].name} ${man(last.split[k])}`)
            .join(', ')}
          으로 바뀌어요
        </p>
      )}

      <div className="hp-goal">
        <div className="hp-goal-head">
          <span>{total ? '1억까지' : summary.outcome.label}</span>
          <strong>{total ? `약 ${duration(total)}` : summary.outcome.big}</strong>
        </div>
        {total && (
          <>
            <div className="hp-bar" aria-hidden="true">
              <i style={{ width: `${Math.max(2, Math.min(100, (done / total) * 100))}%` }} />
            </div>
            <p className="hp-goal-note">
              {done ? `계획대로 넣은 달 ${done}번` : '이번 달부터 체크해 보세요'}
            </p>
          </>
        )}
      </div>

      {!demo && (
        <>
          <div className="hp-actions">
            <button
              type="button"
              className={`hp-check${checked ? ' is-on' : ''}`}
              aria-pressed={checked}
              onClick={() => setChecks(toggleThisMonth())}
            >
              {checked ? `✓ ${Number(thisMonth.slice(5))}월 넣었어요` : '이번 달 넣었어요'}
            </button>
            <button type="button" className="hp-more" onClick={onOpen}>
              계획 자세히
            </button>
          </div>
          <p className="hp-fine">앱은 실제 잔고를 몰라서, 체크한 달로 진행을 보여줘요</p>
        </>
      )}
    </article>
  )
}
