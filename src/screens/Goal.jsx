import { useState } from 'react'
import TopBar from '../components/TopBar'
import Why from '../components/Why'
import { koreanUnit } from '../lib/format'
import {
  AMOUNTS,
  CRASH,
  GROW,
  INFLATION,
  MILESTONES,
  RATES,
  SAVINGS_RATE,
  TARGET,
  diffText,
  duration,
  earnings,
  monthsTo,
  presentValue,
} from '../lib/goal'

const won = (man) => man * 10_000

function Switch({ checked, onChange, label, sub }) {
  return (
    <button type="button" className="switch goal-switch" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
      <span className="switch-track" aria-hidden="true">
        <span className="switch-thumb" />
      </span>
      <span className="switch-text">
        {label}
        <span className="switch-sub">{sub}</span>
      </span>
    </button>
  )
}

export default function Goal({ onBack, onPlan }) {
  const [selected, setSelected] = useState(50) // 만원
  const [custom, setCustom] = useState('')
  const [grow, setGrow] = useState(false)
  const [crash, setCrash] = useState(false)

  const rows = AMOUNTS.includes(selected) ? AMOUNTS : [...AMOUNTS, selected].sort((a, b) => a - b)
  const monthly = won(selected)

  // 기본 (보통 5%, 조건 없음)
  const base = monthsTo(TARGET, monthly, RATES.mid)
  // 조건을 켰을 때
  const opts = { grow, crash }
  const withOpts = monthsTo(TARGET, monthly, RATES.mid, opts)
  const fast = monthsTo(TARGET, monthly, RATES.high, opts)
  const slow = monthsTo(TARGET, monthly, RATES.low, opts)
  const savings = monthsTo(TARGET, monthly, SAVINGS_RATE, opts)
  const crashApplies = crash && base > CRASH.month

  const milestones = MILESTONES.map((t) => ({ t, m: monthsTo(t, monthly, RATES.mid, opts) }))
  const lastM = milestones[milestones.length - 1].m
  const pv = presentValue(TARGET, withOpts)
  const earn = earnings(TARGET, RATES.mid)
  const earnRatio = Math.round((earn.month / monthly) * 100)
  const earnMan = Math.round(earn.month / 1e4)
  const barMax = Math.max(selected, earnMan)

  // 첫 1억은 수익률보다 저축액: 월 50→100만원 vs 적금→투자 (월 50만원 기준)
  const lessonSave = monthsTo(TARGET, won(50), RATES.mid) - monthsTo(TARGET, won(100), RATES.mid)
  const lessonRate = monthsTo(TARGET, won(50), SAVINGS_RATE) - monthsTo(TARGET, won(50), RATES.mid)

  const applyCustom = () => {
    const n = Math.round(Number(custom))
    if (n >= 10 && n <= 1000) setSelected(n)
  }

  return (
    <div className="screen">
      <TopBar onBack={onBack} />

      <p className="sim-kicker">1억 목표</p>
      <h1 className="page-title">
        <span className="t-strong">1억, 한 달에 얼마씩</span>
        <span className="t-serif">몇 년이면 될까요?</span>
      </h1>
      <p className="learn-lead">
        매달 넣는 돈에 따라 1억까지 걸리는 시간을 투자와 적금으로 나란히 보여드려요. 금액을 눌러
        자세히 보세요.
      </p>

      {/* 기간표 */}
      <section aria-labelledby="table-title">
        <div className="goal-head" id="table-title">
          <span>매달</span>
          <span>투자 (연 5%)</span>
          <span>적금</span>
        </div>
        <ul className="goal-rows">
          {rows.map((a) => {
            const inv = monthsTo(TARGET, won(a), RATES.mid)
            const sav = monthsTo(TARGET, won(a), SAVINGS_RATE)
            const mine = a === selected
            return (
              <li key={a}>
                <button
                  type="button"
                  className={`goal-row${mine ? ' is-selected' : ''}`}
                  aria-pressed={mine}
                  onClick={() => setSelected(a)}
                >
                  <span className="goal-amount">
                    {a}만원{!AMOUNTS.includes(a) && <em>직접 입력</em>}
                  </span>
                  <span className="goal-inv">{duration(inv)}</span>
                  <span className="goal-sav">{duration(sav)}</span>
                </button>
              </li>
            )
          })}
        </ul>
        <div className="goal-custom">
          <label htmlFor="goal-custom">다른 금액</label>
          <div className="goal-custom-row">
            <input
              id="goal-custom"
              type="number"
              inputMode="numeric"
              min={10}
              max={1000}
              placeholder="예: 45"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyCustom()}
            />
            <span>만원</span>
            <button type="button" className="chip" onClick={applyCustom}>
              보기
            </button>
          </div>
        </div>
      </section>

      {/* 고른 금액 자세히 */}
      <section className="goal-detail" aria-labelledby="detail-title" aria-live="polite">
        <p className="goal-detail-kicker" id="detail-title">
          매달 {selected}만원이면
        </p>
        <p className="goal-big">약 {duration(withOpts)}</p>
        <p className="goal-range">
          투자 연 5% 기준 · 빠르면 {duration(fast)} (연 7%) · 늦으면 {duration(slow)} (연 3%)
        </p>

        {/* 중간 이정표 */}
        <div className="goal-track" aria-label="중간 이정표">
          <div className="goal-line" />
          {milestones.map(({ t, m }) => (
            <div key={t} className="goal-stop" style={{ left: `${Math.min(100, (m / lastM) * 100)}%` }}>
              <i />
              <strong>{koreanUnit(t).replace('원', '')}</strong>
              <span>{duration(m)}</span>
            </div>
          ))}
        </div>

        {/* 조건 바꿔보기 */}
        <div className="goal-switches">
          <Switch
            checked={grow}
            onChange={setGrow}
            label={`월급 오를 때 저축도 매년 ${GROW}%씩 늘리기`}
            sub={grow ? diffText(monthsTo(TARGET, monthly, RATES.mid, { crash }), withOpts) : '켜면 얼마나 빨라지는지 보여요'}
          />
          <Switch
            checked={crash}
            onChange={setCrash}
            label={`5년째에 시장이 ${CRASH.pct}% 떨어지면`}
            sub={
              !crash
                ? '켜면 얼마나 늦어지는지 보여요'
                : crashApplies
                  ? diffText(monthsTo(TARGET, monthly, RATES.mid, { grow }), withOpts) + '. 늦어질 뿐, 끝이 아니에요'
                  : '5년이 되기 전에 1억에 닿아서 영향이 없어요'
            }
          />
        </div>

        {/* 숫자 요약 */}
        <dl className="goal-facts">
          <div>
            <dt>같은 돈을 적금에 넣으면</dt>
            <dd>
              {duration(savings)}
              <span>{savings > withOpts ? `투자보다 ${duration(savings - withOpts)} 더` : ''}</span>
            </dd>
          </div>
          <div>
            <dt>그때의 1억, 지금 돈으로는</dt>
            <dd>
              약 {koreanUnit(Math.round(pv / 1e6) * 1e6)}
              <span>물가가 연 {INFLATION}%씩 오른다면</span>
            </dd>
          </div>
        </dl>
      </section>

      {/* 1억의 효과 */}
      <section className="goal-power" aria-labelledby="power-title">
        <p className="sim-kicker">1억이 되면 생기는 일</p>
        <h2 id="power-title">돈이 나만큼 일하기 시작해요</h2>
        <p>
          1억이 연 {RATES.mid}%로 불어나면 1년에 {koreanUnit(earn.year)}, 매달 약{' '}
          <strong>{koreanUnit(Math.round(earn.month / 1e4) * 1e4)}</strong>을 돈이 벌어와요.
          {earnRatio >= 100
            ? ` 지금 매달 넣는 ${selected}만원보다 많아요.`
            : ` 지금 매달 넣는 ${selected}만원의 ${earnRatio}%예요.`}
        </p>
        <div className="goal-bars" aria-hidden="true">
          <div>
            <span>내가 매달 넣는 돈</span>
            <i style={{ width: `${(selected / barMax) * 100}%` }} className="bar-me" />
            <em>{selected}만원</em>
          </div>
          <div>
            <span>1억이 매달 벌어오는 돈</span>
            <i style={{ width: `${(earnMan / barMax) * 100}%` }} className="bar-money" />
            <em>약 {earnMan}만원</em>
          </div>
        </div>
        <p className="goal-power-note">
          그래서 1억은 "부자가 되는 숫자"가 아니라, <strong>돈이 나를 도와주기 시작하는 숫자</strong>예요.
        </p>
      </section>

      {/* 핵심 교훈 */}
      <section className="goal-lesson" aria-labelledby="lesson-title">
        <h2 id="lesson-title">첫 1억은 수익률보다 저축액</h2>
        <ul>
          <li>
            매달 <strong>50만원 → 100만원</strong>으로 늘리면 <strong>{duration(lessonSave)}</strong> 빨라져요
          </li>
          <li>
            같은 50만원을 <strong>적금 → 투자</strong>로 바꾸면 <strong>{duration(lessonRate)}</strong> 빨라져요
          </li>
        </ul>
        <p>
          처음엔 높은 수익률을 찾는 것보다 <strong>꾸준히 넣는 금액을 늘리는 것</strong>이 훨씬 커요. 그리고 같은 30% 하락도 1천만원일 땐 300만원, 1억일 땐 3천만원이라,
          <strong> 금액이 작을 때 시작해서 흔들림에 익숙해지는 게</strong> 가장 싸게 배우는 방법이에요.
        </p>
      </section>

      <button type="button" className="sim-cta goal-to-plan" onClick={() => onPlan(selected)}>
        <span className="sim-cta-kicker">다음 단계</span>
        <strong>매달 {selected}만원, 어디에 어떻게 나눌까요?</strong>
        <span>비상금, 적금, ISA, 연금저축으로 나누는 예시 계획 보기</span>
      </button>

      <Why title="어떻게 계산했나요?">
        <p>
          투자는 연 수익률을 "1년 뒤 정확히 그만큼 불어난다"로 보고 매달 복리로 계산했어요. 보통 {RATES.mid}%, 빠르면 {RATES.high}%, 늦으면 {RATES.low}%로 범위를 보여드려요. 세금과 수수료는 빼지 않았어요.
        </p>
        <p>
          적금은 연 3% 적금을 매년 다시 든다고 단순화하고, 이자에 붙는 세금 15.4%를 뺐어요. 실제 적금은 상품마다 금리와 이자 계산 방식이 달라요.
        </p>
        <p>미래 수익률은 아무도 약속할 수 없어서, 위 기간은 "이 정도 걸릴 수 있다"는 참고용이에요.</p>
      </Why>

      <p className="disclaimer">교육용 계산이며 투자 자문이 아닙니다. 실제 결과는 시장 상황에 따라 달라질 수 있어요.</p>
    </div>
  )
}
