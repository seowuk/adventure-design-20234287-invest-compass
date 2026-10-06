import { useState } from 'react'
import TopBar from '../components/TopBar'
import { koreanUnit } from '../lib/format'
import {
  BY_AGE,
  CHECKS,
  CLOSING,
  HIGH_YIELD,
  MIDDLE_PATH,
  TAX_LINE,
} from '../data/dividend'

const TARGETS = [1_000_000, 2_000_000, 3_000_000, 5_000_000]
const YEARS = [10, 20, 30]
const AFTER_TAX = 1 - 0.154

function Slider({ id, label, value, min, max, step, onChange, display }) {
  const fill = ((value - min) / (max - min)) * 100
  return (
    <div className="field">
      <div className="field-head">
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
        <span className="field-value">{display}</span>
      </div>
      <input
        id={id}
        className="slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--fill': `${fill}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="slider-scale">
        <span>
          {min}
          {'%'}
        </span>
        <span>
          {max}
          {'%'}
        </span>
      </div>
    </div>
  )
}

export default function Dividend({ onBack }) {
  const [target, setTarget] = useState(2_000_000)
  const [yieldPct, setYieldPct] = useState(4)
  const [inflation, setInflation] = useState(3)

  const annual = target * 12
  const gross = annual / (yieldPct / 100)
  const net = annual / AFTER_TAX / (yieldPct / 100)
  const overTax = annual > TAX_LINE
  const halfYears = Math.round(72 / inflation)
  const real = YEARS.map((y) => ({ y, value: target / Math.pow(1 + inflation / 100, y) }))

  return (
    <div className="screen">
      <TopBar onBack={onBack} />

      <h1 className="learn-title">배당만으로 살 수 있을까?</h1>
      <p className="learn-lead">
        매달 배당이 들어오는 삶은 누구나 꿈꿔요. 얼마가 있어야 하는지, 그리고 시간이 지나면 그
        돈의 가치가 어떻게 되는지 숫자로 확인해봐요.
      </p>

      <div className="field">
        <div className="field-head">
          <span className="field-label">매달 받고 싶은 배당</span>
          <span className="field-value">{koreanUnit(target)}</span>
        </div>
        <div className="chips" role="group" aria-label="매달 받고 싶은 배당">
          {TARGETS.map((t) => (
            <button
              key={t}
              type="button"
              className="chip"
              aria-pressed={target === t}
              onClick={() => setTarget(t)}
            >
              {koreanUnit(t).replace(/원$/, '')}
            </button>
          ))}
        </div>
      </div>

      <Slider
        id="yield"
        label="배당수익률 (1년)"
        value={yieldPct}
        min={2}
        max={10}
        step={0.5}
        onChange={setYieldPct}
        display={`${yieldPct}%`}
      />
      {yieldPct > HIGH_YIELD && (
        <p className="warn">
          배당수익률이 이렇게 높다면 커버드콜처럼 오를 때 이익을 포기하는 구조이거나, 주가가
          떨어져서 수익률이 높아 보이는 경우일 수 있어요.
        </p>
      )}

      <Slider
        id="inflation"
        label="물가 상승률 (1년)"
        value={inflation}
        min={1}
        max={5}
        step={0.5}
        onChange={setInflation}
        display={`${inflation}%`}
      />

      <section className="type-stage div-stage" aria-label="필요한 원금">
        <p className="type-caption">매달 {koreanUnit(target)}을 받으려면</p>
        <p className="type-name div-amount">{koreanUnit(gross)}</p>
        <p className="type-headline">
          세금 떼기 전, 배당수익률 {yieldPct}% 기준이에요. 배당소득세 15.4%를 떼고도{' '}
          {koreanUnit(target)}을 받으려면 약 {koreanUnit(net)}이 필요해요.
        </p>
      </section>

      {overTax && (
        <div className="caution-box div-tax">
          <h3>이 금액이면 세금 계산이 달라져요</h3>
          <p>
            1년 배당 {koreanUnit(annual)}은 2,000만원을 넘어요. 넘는 부분은 다른 소득과 합쳐 최고
            49.5%(지방소득세 포함)까지 과세될 수 있고, 건강보험 피부양자 자격을 잃을 수도 있어요.
            실제로 손에 쥐는 돈은 위 계산보다 적을 수 있어요.
          </p>
        </div>
      )}

      <section className="div-real" aria-labelledby="real-title">
        <h2 id="real-title">배당이 늘지 않는다면, 지금의 {koreanUnit(target)}은</h2>
        <ul className="real-rows">
          {real.map((r) => (
            <li key={r.y}>
              <span className="real-year">{r.y}년 뒤</span>
              <span className="real-bar" aria-hidden="true">
                <span style={{ width: `${(r.value / target) * 100}%` }} />
              </span>
              <span className="real-value">{koreanUnit(r.value)}어치</span>
            </li>
          ))}
        </ul>
        <p className="real-note">
          물가가 연 {inflation}%씩 오르면 돈의 가치는 약 {halfYears}년 만에 절반이 돼요. 30대에
          배당 생활을 시작하면 50년 넘게 받아야 할 수도 있어서, 이 영향이 특히 커요.
        </p>
      </section>

      <section className="learn-section" aria-labelledby="checks-title">
        <h2 id="checks-title">따져봐야 할 네 가지</h2>
        <ol className="reasons">
          {CHECKS.map((c, i) => (
            <li key={c.title}>
              <span className="reason-num" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="learn-section" aria-labelledby="age-title">
        <h2 id="age-title">그래서 나이에 따라 달라요</h2>
        <div className="countries">
          {BY_AGE.map((a) => (
            <article key={a.who} className="country">
              <h3>{a.who}</h3>
              <p className="age-desc">{a.desc}</p>
            </article>
          ))}
        </div>
        <p className="note">{MIDDLE_PATH}</p>
        <p className="note">{CLOSING}</p>
      </section>

      <p className="disclaimer">
        이 계산은 배당수익률과 물가 상승률이 매년 같다고 가정한 단순 계산이며 투자 자문이
        아닙니다. 세금과 건강보험료 기준은 2026년 기준이고, 개인의 다른 소득과 재산에 따라
        달라질 수 있어요.
      </p>
    </div>
  )
}
