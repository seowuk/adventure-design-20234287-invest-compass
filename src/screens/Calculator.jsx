import { useEffect, useRef, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import TopBar from '../components/TopBar'
import './Calculator.css'

// 입력 상한 (03 기능명세서 8장)
const LIMITS = {
  initial: 1_000_000_000,
  monthly: 10_000_000,
}

const INITIAL_PRESETS = [0, 5_000_000, 10_000_000, 30_000_000]
const MONTHLY_PRESETS = [100_000, 300_000, 500_000, 1_000_000]
const RATE_PRESETS = [
  { label: '안정형', value: 3 },
  { label: '중립형', value: 5 },
  { label: '적극형', value: 7 },
]

// 월 복리 적립식 미래가치 (03 기능명세서 8장)
function calculate(initial, monthly, annualRate, years) {
  const n = years * 12
  const r = annualRate / 100 / 12

  if (r === 0) {
    return initial + monthly * n
  }
  const growth = Math.pow(1 + r, n)
  return initial * growth + monthly * ((growth - 1) / r)
}

// 1년차부터 N년차까지 넣은 돈·불어난 돈
function yearlyData(initial, monthly, annualRate, years) {
  return Array.from({ length: years }, (_, i) => {
    const y = i + 1
    const total = calculate(initial, monthly, annualRate, y)
    const principal = initial + monthly * y * 12
    return {
      year: `${y}년`,
      principal: Math.round(principal),
      profit: Math.max(0, Math.round(total - principal)),
    }
  })
}

// 숫자 → "300,000"
function comma(value) {
  return Math.round(value).toLocaleString('ko-KR')
}

// 숫자 → "300,000원"
function won(value) {
  return comma(value) + '원'
}

// 숫자 → "1억 1,058만원"
function koreanUnit(value) {
  const n = Math.round(value)
  if (n < 10000) return won(n)
  const eok = Math.floor(n / 100_000_000)
  const man = Math.floor((n % 100_000_000) / 10000)
  const parts = []
  if (eok > 0) parts.push(`${eok}억`)
  if (man > 0) parts.push(`${comma(man)}만`)
  return parts.join(' ') + '원'
}

// 빠른 선택 버튼용: 5000000 → "500만"
function shortUnit(value) {
  if (value === 0) return '없음'
  return koreanUnit(value).replace(/원$/, '')
}

// "300,000" → 300000 (숫자만 남기고 상한 적용)
function parseNumber(text, max) {
  const digits = text.replace(/[^0-9]/g, '')
  if (digits === '') return 0
  return Math.min(Number(digits), max)
}

// 숫자가 목표값까지 부드럽게 굴러가도록
function useTween(target, duration = 500) {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const from = fromRef.current
    const start = performance.now()
    let frame

    const tick = (now) => {
      const t = reduce ? 1 : Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = from + (target - from) * eased
      fromRef.current = current
      setValue(current)
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}

// 요소가 화면에 보이는지
function useInView(ref) {
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return inView
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const principal = payload.find((p) => p.dataKey === 'principal')?.value ?? 0
  const profit = payload.find((p) => p.dataKey === 'profit')?.value ?? 0
  return (
    <div className="tip">
      <strong>{label}</strong>
      <span>합계 {koreanUnit(principal + profit)}</span>
      <span className="tip-profit">불어난 돈 {koreanUnit(profit)}</span>
    </div>
  )
}

function MoneyField({ id, label, value, onChange, presets, max }) {
  return (
    <div className="field">
      <div className="field-head">
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
        <span className="field-hint">{value > 0 ? koreanUnit(value) : ''}</span>
      </div>
      <div className="money">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={comma(value)}
          onChange={(e) => onChange(parseNumber(e.target.value, max))}
        />
        <span className="money-unit">원</span>
      </div>
      <div className="chips" role="group" aria-label={`${label} 빠른 선택`}>
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            className="chip"
            aria-pressed={value === p}
            onClick={() => onChange(p)}
          >
            {shortUnit(p)}
          </button>
        ))}
      </div>
    </div>
  )
}

function SliderField({ id, label, display, value, min, max, step, onChange, scale, children }) {
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
        <span>{scale[0]}</span>
        <span>{scale[1]}</span>
      </div>
      {children}
    </div>
  )
}

export default function Calculator({ initialRate = 5, onBack }) {
  const [initial, setInitial] = useState(0)
  const [monthly, setMonthly] = useState(300_000)
  const [rate, setRate] = useState(initialRate)
  const [years, setYears] = useState(10)

  const total = calculate(initial, monthly, rate, years)
  const principal = initial + monthly * years * 12
  const profit = Math.max(0, total - principal)
  const data = yearlyData(initial, monthly, rate, years)
  const principalShare = total > 0 ? (principal / total) * 100 : 100
  const multiple = principal > 0 ? total / principal : 0

  const shownTotal = useTween(total)
  const stageRef = useRef(null)
  const stageVisible = useInView(stageRef)

  return (
    <div className="page">
      <TopBar onBack={onBack} />

      <div className="layout">
        <section className="controls" aria-labelledby="calc-title">
          <h1 id="calc-title">
            매달 꾸준히 넣으면
            <br />
            얼마가 될까요?
          </h1>

          <MoneyField
            id="initial"
            label="처음에 넣을 돈"
            value={initial}
            onChange={setInitial}
            presets={INITIAL_PRESETS}
            max={LIMITS.initial}
          />

          <MoneyField
            id="monthly"
            label="매달 넣을 돈"
            value={monthly}
            onChange={setMonthly}
            presets={MONTHLY_PRESETS}
            max={LIMITS.monthly}
          />

          <SliderField
            id="rate"
            label="1년 기대 수익률"
            display={`${rate}%`}
            value={rate}
            min={0}
            max={20}
            step={0.5}
            onChange={setRate}
            scale={['0%', '20%']}
          >
            <div className="chips" role="group" aria-label="성향별 예시 수익률">
              {RATE_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className="chip"
                  aria-pressed={rate === p.value}
                  onClick={() => setRate(p.value)}
                >
                  {p.label} {p.value}%
                </button>
              ))}
            </div>
            {rate >= 20 && (
              <p className="warn">장기간 연 20% 수익은 현실적으로 매우 드뭅니다.</p>
            )}
          </SliderField>

          <SliderField
            id="years"
            label="투자 기간"
            display={`${years}년`}
            value={years}
            min={1}
            max={40}
            step={1}
            onChange={setYears}
            scale={['1년', '40년']}
          />
        </section>

        <section className="stage" ref={stageRef} aria-label="계산 결과">
          <p className="stage-caption">{years}년 뒤 예상 금액</p>
          <p className="stage-amount">{koreanUnit(shownTotal)}</p>
          <p className="stage-exact">{won(total)}</p>

          {multiple >= 1.05 && (
            <p className="stage-badge">넣은 돈의 {multiple.toFixed(1)}배</p>
          )}

          <div className="split">
            <div className="split-bar" aria-hidden="true">
              <span className="split-principal" style={{ width: `${principalShare}%` }} />
              <span className="split-profit" style={{ width: `${100 - principalShare}%` }} />
            </div>
            <dl className="split-legend">
              <div>
                <dt>
                  <i className="dot dot-principal" />
                  넣은 돈
                </dt>
                <dd>{koreanUnit(principal)}</dd>
              </div>
              <div>
                <dt>
                  <i className="dot dot-profit" />
                  불어난 돈
                </dt>
                <dd>{koreanUnit(profit)}</dd>
              </div>
            </dl>
          </div>

          <div className="chart">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data} barCategoryGap="18%">
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.12)" />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  interval={Math.max(0, Math.ceil(years / 6) - 1)}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.08)' }} />
                <Bar dataKey="principal" stackId="a" fill="#9FB4FF" isAnimationActive={false} />
                <Bar
                  dataKey="profit"
                  stackId="a"
                  fill="#FFD84D"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <p className="disclaimer">
        이 숫자는 예시이며 보장된 수익률이 아닙니다. 세금과 수수료는 반영하지 않았습니다.
        본 서비스는 교육 목적의 참고 자료이며 투자 자문이 아닙니다.
      </p>

      <div className={`dock${stageVisible ? '' : ' is-visible'}`} aria-hidden="true">
        <span className="dock-label">{years}년 뒤</span>
        <span className="dock-amount">{koreanUnit(shownTotal)}</span>
      </div>
    </div>
  )
}

