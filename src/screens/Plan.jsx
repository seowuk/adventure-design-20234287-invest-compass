import { useEffect, useMemo, useState } from 'react'
import TopBar from '../components/TopBar'
import Why from '../components/Why'
import PlanCard from '../components/PlanCard'
import { savePlanImage } from '../lib/planImage'
import {
  BUCKETS,
  CUSHIONS,
  MONTHLY_PRESETS,
  PLAN_KEY,
  PURPOSES,
  RATE,
  RULES,
  STYLES,
  TAXES,
  defaultsFrom,
  investRate,
  loadPlanInput,
  makePlan,
  monthlyNeeded,
  summarize,
} from '../lib/plan'

const man = (won) => `${Math.round(won / 1e4).toLocaleString('ko-KR')}만원`

function Choice({ legend, options, value, onChange, auto }) {
  return (
    <fieldset className="plan-q">
      <legend>
        {legend}
        {auto && <span className="plan-auto">진단 답으로 채움</span>}
      </legend>
      <div className="plan-opts">
        {options.map((o) => (
          <button key={o.key} type="button" className="plan-opt" aria-pressed={value === o.key} onClick={() => onChange(o.key)}>
            <strong>{o.label}</strong>
            {o.sub && <span>{o.sub}</span>}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function SplitBar({ split, total }) {
  const entries = Object.entries(split).filter(([, v]) => v > 0)
  return (
    <div className="plan-bar" aria-hidden="true">
      {entries.map(([k, v]) => (
        <i key={k} style={{ width: `${(v / total) * 100}%`, background: BUCKETS[k].color }} />
      ))}
    </div>
  )
}

const WHY = {
  emergency: '갑자기 돈이 필요할 때 투자한 돈을 손해 보고 팔지 않도록, 가장 먼저 채워요',
  savings: '원금이 지켜져서, 쓸 날짜가 정해진 돈을 안전하게 모아요',
  isa: '이익에 세금 혜택이 있어서, 몇 년 뒤 쓸 돈을 굴리기 좋아요. 3년이 지나면 꺼낼 수 있어요',
  pension: '넣은 돈의 13.2~16.5%를 연말정산 때 돌려받아요. 대신 55세 전에 꺼내면 불이익이 커요',
}

export default function Plan({ answers, funds, initialMonthly, onBack }) {
  const auto = useMemo(() => defaultsFrom(answers, funds), [answers, funds])
  const [input, setInput] = useState(() => {
    const saved = loadPlanInput()
    return {
      monthly: initialMonthly ?? saved?.monthly ?? 50,
      cushion: saved?.cushion ?? auto.cushion,
      purpose: saved?.purpose ?? auto.purpose,
      tax: saved?.tax ?? auto.tax,
      style: saved?.style ?? auto.style,
    }
  })
  const set = (k) => (v) => setInput((s) => ({ ...s, [k]: v }))

  // 고른 값은 이 기기에만 저장
  useEffect(() => {
    try {
      localStorage.setItem(PLAN_KEY, JSON.stringify(input))
    } catch {
      // 저장이 막혀도 계획은 그대로 보인다
    }
  }, [input])

  const monthly = input.monthly * 10_000
  const plan = makePlan({ ...input, monthly })
  const ratio = Math.round(plan.stockRatio * 100)
  const isAuto = (k) => auto.from.includes(k) && input[k] === auto[k]
  const buckets = [...new Set(plan.phases.flatMap((ph) => Object.keys(ph.split)))]
  const summary = summarize(plan, input)
  const [saving, setSaving] = useState('idle') // idle | busy | done | error

  const onSave = async () => {
    setSaving('busy')
    try {
      const r = await savePlanImage(summary)
      setSaving(r === 'cancelled' ? 'idle' : 'done')
    } catch {
      setSaving('error')
    }
  }

  return (
    <div className="screen">
      <TopBar onBack={onBack} />

      <p className="sim-kicker">예시 계획</p>
      <h1 className="page-title">
        <span className="t-strong">매달 모으는 돈,</span>
        <span className="t-serif">어디에 어떻게 나눌까요?</span>
      </h1>
      <p className="learn-lead">
        {auto.from.length
          ? '진단 답으로 만든 내 계획이에요. 아래에서 조건을 바꾸면 바로 바뀌어요.'
          : '아래에서 조건을 고르면 바로 바뀌어요. 투자 성향 진단을 하면 자동으로 채워져요.'}
      </p>

      <PlanCard summary={summary} version={JSON.stringify(input)} />

      <button type="button" className="btn-primary plan-save" onClick={onSave} disabled={saving === 'busy'}>
        {saving === 'busy' ? '이미지 만드는 중' : '이미지로 저장하기'}
        <span className="btn-sub">
          {saving === 'done'
            ? '저장했어요. 사진첩이나 다운로드 폴더를 확인하세요'
            : saving === 'error'
              ? '저장하지 못했어요. 다시 눌러주세요'
              : '인스타 스토리 크기 · 폰에서는 바로 공유할 수 있어요'}
        </span>
      </button>

      <h2 className="plan-section-title">조건 바꾸기</h2>
      <section className="plan-inputs" aria-label="계획 조건">
        <fieldset className="plan-q">
          <legend>매달 모을 수 있는 돈</legend>
          <div className="chips">
            {MONTHLY_PRESETS.map((m) => (
              <button key={m} type="button" className="chip" aria-pressed={input.monthly === m} onClick={() => set('monthly')(m)}>
                {m}만원
              </button>
            ))}
            {!MONTHLY_PRESETS.includes(input.monthly) && (
              <button type="button" className="chip" aria-pressed="true">
                {input.monthly}만원
              </button>
            )}
          </div>
        </fieldset>
        <Choice legend="이 돈은 언제 쓸 돈인가요?" options={PURPOSES} value={input.purpose} onChange={set('purpose')} auto={isAuto('purpose')} />
        <Choice legend="비상금이 있나요?" options={CUSHIONS} value={input.cushion} onChange={set('cushion')} auto={isAuto('cushion')} />
        <Choice legend="연말정산을 하나요?" options={TAXES} value={input.tax} onChange={set('tax')} auto={isAuto('tax')} />
        <Choice legend="투자 성향" options={STYLES} value={input.style} onChange={set('style')} auto={isAuto('style')} />
      </section>

      {/* 계획 결과 */}
      <section className="plan-result" aria-labelledby="plan-title" aria-live="polite">
        <p className="goal-detail-kicker" id="plan-title">
          매달 {input.monthly}만원을 단계별로 나누면
        </p>

        {plan.phases.map((ph) => (
          <div key={ph.label} className="plan-phase">
            <p className="plan-phase-label">{ph.label}</p>
            <SplitBar split={ph.split} total={monthly} />
            <ul className="plan-legend">
              {Object.entries(ph.split)
                .filter(([, v]) => v > 0)
                .map(([k, v]) => (
                  <li key={k}>
                    <i style={{ background: BUCKETS[k].color }} />
                    {BUCKETS[k].name} <strong>{man(v)}</strong>
                  </li>
                ))}
            </ul>
          </div>
        ))}

      </section>

      {/* 그릇별 설명 */}
      <section className="plan-buckets" aria-labelledby="buckets-title">
        <h2 id="buckets-title">그릇마다 왜 여기에</h2>
        {buckets.map((k) => (
          <article key={k} className="plan-bucket" style={{ '--b': BUCKETS[k].color }}>
            <div className="plan-bucket-head">
              <i />
              <h3>{BUCKETS[k].name}</h3>
              <span>{BUCKETS[k].where}</span>
            </div>
            <p>{WHY[k]}</p>
            {(k === 'isa' || k === 'pension') && (
              <p className="plan-inside">
                그 안에서는 넓은 지수 ETF {ratio} : 채권형 {100 - ratio} (예시, 기대 수익 연 {investRate(input.style).toFixed(1)}% 가정)
              </p>
            )}
            {k === 'emergency' && <p className="plan-inside">목표 {man(plan.emergencyNeed)} (생활비 3개월치 예시), 다 채우면 이 몫은 다른 그릇으로 넘어가요</p>}
          </article>
        ))}

        {plan.refund && (
          <p className="plan-note plan-note-good">
            연금저축에 매달 {man(plan.phases.at(-1).split.pension)}을 넣으면, 연말정산 때 1년에 약 {man(plan.refund.low)}~{man(plan.refund.high)}을 돌려받아요. 이 돈을 다시 넣으면 더 빨라져요.
          </p>
        )}
        {plan.atHorizon && input.purpose === 'short' && (
          <p className="plan-note">
            3년 안에 1억을 모으려면 적금으로 매달 약 {man(monthlyNeeded(1e8, 36, RATE.savings))}이 필요해요. 목표 금액을 줄이거나 쓸 시기를 늦추는 것도 방법이에요.
          </p>
        )}
        {plan.atHorizon && input.purpose === 'mid' && (
          <p className="plan-note">이대로면 1억까지 10년이 넘게 걸려요. 저축액을 조금씩 늘리면 더 빨라져요.</p>
        )}
        {input.purpose !== 'retire' && (
          <p className="plan-note">이 돈은 55세 전에 쓸 돈이라 연금저축에는 넣지 않았어요. 노후 자금은 따로 계획하는 게 좋아요.</p>
        )}
        {input.purpose === 'retire' && input.tax === 'no' && (
          <p className="plan-note">연말정산을 하지 않으면 연금저축의 세액공제를 받기 어려워서 ISA로 모았어요. 나중에 ISA 만기 자금을 연금계좌로 옮기는 방법도 있어요.</p>
        )}
      </section>

      <Why title="이 계획은 이런 규칙으로 만들었어요">
        <ol className="plan-rules">
          {RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
        <p>
          수익률은 적금 연 3%(세후 약 {RATE.savings.toFixed(1)}%), 지수 ETF 연 {RATE.stock}%, 채권형 연 {RATE.bond}%, 파킹통장 연 {RATE.parking}%로 가정했어요. 약속이 아니라 계산을 위한 가정이에요.
        </p>
      </Why>

      <p className="plan-next">다음 업데이트에서 비율을 직접 바꿔 나만의 계획을 세울 수 있어요.</p>

      <p className="disclaimer">
        규칙으로 만든 예시 계획이며 투자 자문이 아니에요. 특정 상품이나 금융회사를 추천하지 않아요. 고른 값은 이 기기에만 저장돼요.
      </p>
    </div>
  )
}
