import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from 'recharts'
import TopBar from '../components/TopBar'
import Why from '../components/Why'
import { koreanUnit } from '../lib/format'
import { diagnose } from '../lib/diagnosis'
import { TYPES } from '../data/results'
import {
  BEHAVIORS,
  LAST_MONTH,
  MARKET,
  MOMENTS,
  START_CASH,
  START_INVESTED,
  advance,
  applyAction,
  benchmarks,
  classify,
  reentered,
  startState,
} from '../lib/sim'

const LEVEL_RANK = { stable: 0, balanced: 1, active: 2 }
const START_TOTAL = START_INVESTED + START_CASH

// 나침반 눈금처럼 36칸으로 지난 달을 보여준다
function MonthTicks({ month }) {
  return (
    <div className="sim-ticks" aria-hidden="true">
      {Array.from({ length: LAST_MONTH }, (_, i) => (
        <i
          key={i}
          className={[
            i < month ? 'on' : '',
            MOMENTS.some((m) => m.month === i + 1) ? 'moment' : '',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

function MarketChart({ month }) {
  const data = MARKET.slice(0, month + 1).map((v, i) => ({ m: i, v }))
  return (
    <div className="sim-chart" aria-hidden="true">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <XAxis dataKey="m" type="number" domain={[0, LAST_MONTH]} hide />
          <YAxis domain={[70, 135]} hide />
          <ReferenceLine y={100} stroke="#9aa0bf" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="v"
            stroke="#3346f5"
            strokeWidth={3}
            fill="#3346f5"
            fillOpacity={0.12}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="sim-chart-legend">점선은 시작했을 때의 시장</p>
    </div>
  )
}

function pct(now, base) {
  const p = ((now - base) / base) * 100
  return `${p >= 0 ? '+' : ''}${p.toFixed(0)}%`
}

export default function Sim({ answers, onBack }) {
  const [phase, setPhase] = useState('intro') // intro | play | done
  const [step, setStep] = useState(0)
  const [state, setState] = useState(startState)
  const [actions, setActions] = useState({})

  const restart = () => {
    setPhase('play')
    setStep(0)
    setState(startState())
    setActions({})
  }

  const choose = (action) => {
    const moment = MOMENTS[step]
    const nextActions = { ...actions, [moment.month]: action }
    const acted = applyAction(state, action)
    const isLast = step === MOMENTS.length - 1
    const nextMonth = isLast ? LAST_MONTH : MOMENTS[step + 1].month
    setActions(nextActions)
    setState(advance(acted, nextMonth))
    if (isLast) setPhase('done')
    else setStep(step + 1)
  }

  if (phase === 'intro') {
    return (
      <div className="screen">
        <TopBar onBack={onBack} />
        <p className="sim-kicker">모의투자</p>
        <h1 className="sim-title">
          가상의 1,000만원으로
          <br />
          3년을 버텨보세요
        </h1>
        <p className="learn-lead">
          "떨어지면 어떻게 하시겠어요?"라는 질문에 답하는 것과, 실제로 떨어지는 걸 보는 건
          달라요. 가상의 시장에서 직접 겪어보고, 내가 어떻게 움직이는지 확인해봐요.
        </p>
        <ol className="sim-rules">
          <li>
            <strong>700만원</strong>은 투자한 상태로, <strong>300만원</strong>은 현금으로
            시작해요
          </li>
          <li>3년 동안 6번, 시장 상황을 보고 팔지, 버틸지, 더 살지 골라요</li>
          <li>실제 종목이 아닌 가상의 시장이에요. 진짜 돈은 오가지 않아요</li>
        </ol>
        <button type="button" className="btn-primary" onClick={restart}>
          시작하기
          <span className="btn-sub">2분이면 끝나요</span>
        </button>
      </div>
    )
  }

  if (phase === 'done') {
    const total = state.invested + state.cash
    const b = benchmarks()
    const kind = classify(actions)
    const behavior = BEHAVIORS[kind]
    const cameBack = reentered(actions)
    const will = answers ? diagnose(answers).willingness : null
    const diff = will ? LEVEL_RANK[behavior.level] - LEVEL_RANK[will] : null

    return (
      <div className="screen">
        <TopBar onBack={onBack} />
        <p className="sim-kicker">3년 뒤 결과</p>
        <p className="sim-final">{koreanUnit(total)}</p>
        <p className="sim-final-sub">시작한 1,000만원보다 {pct(total, START_TOTAL)}</p>

        <dl className="sim-compare">
          <div className="is-me">
            <dt>내 선택대로</dt>
            <dd>{koreanUnit(total)}</dd>
          </div>
          <div>
            <dt>아무것도 안 했다면</dt>
            <dd>{koreanUnit(b.nothing)}</dd>
          </div>
          <div>
            <dt>처음부터 전부 넣고 그대로 뒀다면</dt>
            <dd>{koreanUnit(b.allIn)}</dd>
          </div>
        </dl>

        <section className="sim-behavior" aria-labelledby="beh-title">
          <p className="sim-kicker">내 행동</p>
          <h2 id="beh-title">{behavior.title}</h2>
          <p>{behavior.lesson}</p>
          {cameBack && (
            <p>
              판 뒤에 다시 들어온 건 좋은 선택이었어요. 다만 바닥에서 다시 오르는 동안 쉬고 있던
              만큼은 놓쳤어요.
            </p>
          )}
        </section>

        {will && (
          <section className="sim-vs" aria-labelledby="vs-title">
            <h2 id="vs-title">진단 결과와 비교하면</h2>
            <div className="sim-vs-row">
              <span>
                말로 답한 마음 <strong>{TYPES[will].name}</strong>
              </span>
              <span aria-hidden="true">→</span>
              <span>
                실제 행동 <strong>{TYPES[behavior.level].name}</strong>
              </span>
            </div>
            <p>
              {diff === 0 &&
                '말과 행동이 같았어요. 진단 결과를 믿고 그에 맞게 시작해도 좋아요.'}
              {diff < 0 &&
                '말로 답한 것보다 실제로는 더 조심스럽게 움직였어요. 처음에는 생각보다 안정적인 비중으로 시작하는 게 좋아요.'}
              {diff > 0 &&
                '말보다 행동이 더 대담했어요. 다만 가상 돈이라 쉬웠을 수도 있으니, 실제 돈으로는 조금 더 조심스럽게 시작해보세요.'}
            </p>
          </section>
        )}

        <Why title="이 모의투자의 한계">
          <p>
            이 시장은 모두가 같은 상황을 겪도록 미리 만들어둔 가상 시나리오예요. 3년 안에 회복하도록
            설계했지만, 실제 시장은 회복에 훨씬 오래 걸리거나 회복하지 못할 수도 있어요. 개별
            종목은 더더욱 그래요.
          </p>
          <p>
            또 진짜 돈이 아니라서, 실제보다 대담하게 움직이기 쉬워요. 결과는 내 반응을 돌아보는
            참고로만 봐주세요.
          </p>
        </Why>

        <div className="result-actions sim-actions">
          <button type="button" className="btn-primary" onClick={restart}>
            다르게 해보기
          </button>
          <button type="button" className="btn-secondary" onClick={onBack}>
            돌아가기
          </button>
        </div>

        <p className="disclaimer">
          모의투자는 교육용 가상 체험이며 실제 투자 수익과 관계없어요. 투자 자문이 아닙니다.
        </p>
      </div>
    )
  }

  // 진행 중
  const moment = MOMENTS[step]
  const total = state.invested + state.cash
  const allCash = state.invested === 0
  const marketChange = pct(MARKET[moment.month], MARKET[0])

  return (
    <div className="screen">
      <TopBar onBack={onBack} />

      <div className="sim-progress">
        <p className="sim-month">
          <strong>{moment.month}개월째</strong> / 36개월
          <span className="sim-step">
            선택 {step + 1} / {MOMENTS.length}
          </span>
        </p>
        <MonthTicks month={moment.month} />
      </div>

      <section className={`sim-moment mood-${moment.mood}`} aria-live="polite">
        <h1 className="sim-headline">{moment.headline}</h1>
        <p className="sim-detail">{moment.detail}</p>
      </section>

      <MarketChart month={moment.month} />

      <dl className="sim-numbers">
        <div>
          <dt>내 돈 전체</dt>
          <dd className="sim-big">{koreanUnit(total)}</dd>
          <dd className="sim-delta">시작보다 {pct(total, START_TOTAL)}</dd>
        </div>
        <div>
          <dt>투자 중</dt>
          <dd>{koreanUnit(state.invested)}</dd>
        </div>
        <div>
          <dt>현금</dt>
          <dd>{koreanUnit(state.cash)}</dd>
        </div>
      </dl>
      <p className="sr-only">시장은 시작보다 {marketChange} 움직였어요.</p>

      <div className="sim-choices" role="group" aria-label="어떻게 할까요">
        {allCash ? (
          <>
            <button type="button" className="sim-choice" onClick={() => choose('buy')}>
              <strong>다시 사기</strong>
              <span>현금 {koreanUnit(state.cash)}을 다시 넣어요</span>
            </button>
            <button type="button" className="sim-choice" onClick={() => choose('hold')}>
              <strong>현금으로 두기</strong>
              <span>조금 더 지켜봐요</span>
            </button>
          </>
        ) : (
          <>
            <button type="button" className="sim-choice is-sell" onClick={() => choose('sell')}>
              <strong>팔기</strong>
              <span>투자한 돈을 전부 현금으로 바꿔요</span>
            </button>
            <button type="button" className="sim-choice" onClick={() => choose('hold')}>
              <strong>그대로 두기</strong>
              <span>아무것도 하지 않아요</span>
            </button>
            <button
              type="button"
              className="sim-choice is-buy"
              onClick={() => choose('buy')}
              disabled={state.cash === 0}
            >
              <strong>더 사기</strong>
              <span>
                {state.cash > 0 ? `남은 현금 ${koreanUnit(state.cash)}을 넣어요` : '남은 현금이 없어요'}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
