import { useEffect, useRef, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer } from 'recharts'
import TopBar from '../components/TopBar'
import Why from '../components/Why'
import { koreanUnit } from '../lib/format'
import { diagnose } from '../lib/diagnosis'
import { TYPES } from '../data/results'
import { SOURCES } from '../data/realMarkets'
import { LIVE_SOURCE, loadLiveMarket } from '../lib/liveMarket'
import {
  BEHAVIORS,
  DEFAULT_PCT,
  FRACTIONS,
  START_PCTS,
  pctLevel,
  LAST_MONTH,
  COUNTRIES,
  recentScenario,
  START_CASH,
  START_INVESTED,
  advance,
  applyAction,
  benchmarks,
  classify,
  headlineFor,
  makeRun,
  moodOf,
  outcomeNote,
  reentered,
  startState,
} from '../lib/sim'

const LEVEL_RANK = { stable: 0, balanced: 1, active: 2 }
const START_TOTAL = START_INVESTED + START_CASH
const LAST_KEY = 'invest-compass:sim-last'

// 직전에 나온 시장은 이어서 나오지 않게 기억해둔다
function loadLast() {
  try {
    return localStorage.getItem(LAST_KEY)
  } catch {
    return null
  }
}

function saveLast(key) {
  try {
    localStorage.setItem(LAST_KEY, key)
  } catch {
    // 저장이 막혀도 게임은 그대로 진행된다
  }
}

// 나침반 눈금처럼 36칸으로 지난 달을 보여준다
function MonthTicks({ month, moments }) {
  return (
    <div className="sim-ticks" aria-hidden="true">
      {Array.from({ length: LAST_MONTH }, (_, i) => (
        <i
          key={i}
          className={[
            i < month ? 'on' : '',
            moments.some((m) => m.month === i + 1) ? 'moment' : '',
          ].join(' ')}
        />
      ))}
    </div>
  )
}

const DIR_COLOR = { up: '#2e9e6b', down: '#c2410c', flat: '#9aa0bf' }

// 두 시점 사이 시장이 어느 쪽으로 움직였는지 (1% 넘게 변해야 오름·내림으로 본다)
function directionOf(market, fromMonth, toMonth) {
  const change = (market[toMonth] - market[fromMonth]) / market[fromMonth]
  if (change > 0.01) return { dir: 'up', change }
  if (change < -0.01) return { dir: 'down', change }
  return { dir: 'flat', change }
}

// 마지막 점에 붙는 방향 화살표
function EndDot({ cx, cy, dir }) {
  if (cx == null || cy == null) return null
  const color = DIR_COLOR[dir]
  // 오르면 점 위에 ▲, 내리면 점 아래에 ▼, 제자리면 오른쪽에 ▶
  const arrow =
    dir === 'up'
      ? `M${cx} ${cy - 22} l7 10 h-14 z`
      : dir === 'down'
        ? `M${cx} ${cy + 22} l7 -10 h-14 z`
        : `M${cx + 20} ${cy} l-10 7 v-14 z`
  return (
    <g>
      <circle cx={cx} cy={cy} r={9} fill={color} opacity={0.18} />
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />
      <path d={arrow} fill={color} className={`dot-arrow dot-${dir}`} />
    </g>
  )
}

const FX_TEXT = { up: '올랐어요', down: '떨어졌어요', flat: '제자리예요' }
const FX_MARK = { up: '▲', down: '▼', flat: '→' }

function MarketChart({ market, month, baseMonth = 0, fx = null }) {
  const data = market.slice(0, month + 1).map((v, i) => ({ m: i, v }))
  const { dir } = fx ?? directionOf(market, baseMonth, month)
  const last = data.length - 1
  const renderDot = (props) =>
    props.index === last ? (
      <EndDot key="end" cx={props.cx} cy={props.cy} dir={dir} />
    ) : (
      <g key={props.index} />
    )

  return (
    <div className={`sim-chart${fx ? ` fx-${fx.dir}` : ''}`} aria-hidden="true">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 26, right: 26, left: 4, bottom: 26 }}>
          <XAxis dataKey="m" type="number" domain={[0, LAST_MONTH]} hide />
          <YAxis
            domain={[Math.floor(Math.min(...market) * 0.9), Math.ceil(Math.max(...market) * 1.06)]}
            hide
          />
          <ReferenceLine y={100} stroke="#9aa0bf" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="v"
            stroke="#3346f5"
            strokeWidth={3}
            fill="#3346f5"
            fillOpacity={0.12}
            dot={renderDot}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      {fx && (
        <div className="sim-fx">
          <span className="fx-mark m1">{FX_MARK[fx.dir]}</span>
          <span className="fx-mark m2">{FX_MARK[fx.dir]}</span>
          <span className="fx-mark m3">{FX_MARK[fx.dir]}</span>
          <span className="fx-chip">
            {FX_MARK[fx.dir]} {fx.dir === 'flat' ? '' : `${Math.abs(Math.round(fx.change * 100))}% `}
            {FX_TEXT[fx.dir]}
          </span>
        </div>
      )}
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
  const [run, setRun] = useState(null)
  const [state, setState] = useState(null)
  const [actions, setActions] = useState({})
  const [startPct, setStartPct] = useState(DEFAULT_PCT) // 처음 투자 비중
  const [country, setCountry] = useState('all') // 어느 나라 시장에서
  const [live, setLive] = useState(null) // 매일 갱신되는 코스피 (없으면 null)
  useEffect(() => {
    let alive = true
    loadLiveMarket().then((j) => alive && setLive(j))
    return () => {
      alive = false
    }
  }, [])
  const recent = live ? recentScenario(live) : null
  const [pending, setPending] = useState(null) // 'sell' | 'buy' : 비율 고르는 중
  // 선택한 뒤 다음 순간까지 그래프가 이어지는 동안의 상태
  const [anim, setAnim] = useState(null) // { shown: 지금까지 그린 달, fx: 오름·내림 효과 }
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // 시작할 때마다 새 시장을 고른다 (직전과 다른 유형, 숫자는 매번 조금씩 다름)
  const restart = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setAnim(null)
    const next = makeRun(run ? run.scenario.key : loadLast(), Math.random, country, recent ? [recent] : [])
    saveLast(next.scenario.key)
    setRun(next)
    setState(startState(next, startPct))
    setPending(null)
    setActions({})
    setStep(0)
    setPhase('play')
  }

  const choose = (action) => {
    if (anim) return // 효과가 도는 동안은 다시 누르지 않게
    setPending(null)
    const moments = run.scenario.moments
    const moment = moments[step]
    const acted = applyAction(state, action)
    const isLast = step === moments.length - 1
    const nextMonth = isLast ? LAST_MONTH : moments[step + 1].month
    const nextState = advance(acted, nextMonth, run.market)
    const fx = directionOf(run.market, moment.month, nextMonth)
    setActions({ ...actions, [moment.month]: action })

    const commit = () => {
      setState(nextState)
      setAnim(null)
      if (isLast) setPhase('done')
      else setStep(step + 1)
    }

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      // 움직임 줄이기: 그래프는 한 번에, 결과 표시는 잠깐만
      setAnim({ shown: nextMonth, fx })
      timers.current.push(setTimeout(commit, 600))
      return
    }

    // 한 달씩 그래프를 이어 그린 뒤, 효과를 잠깐 보여주고 다음 순간으로
    const STEP_MS = 90
    const HOLD_MS = 950
    const months = nextMonth - moment.month
    setAnim({ shown: moment.month, fx: null })
    for (let i = 1; i <= months; i++) {
      timers.current.push(
        setTimeout(() => setAnim({ shown: moment.month + i, fx: i === months ? fx : null }), i * STEP_MS),
      )
    }
    timers.current.push(setTimeout(commit, months * STEP_MS + HOLD_MS))
  }

  if (phase === 'intro') {
    return (
      <div className="screen">
        <TopBar onBack={onBack} />
        <p className="sim-kicker">모의투자</p>
        <h1 className="page-title">
        <span className="t-strong">가상의 1,000만원으로</span>
        <span className="t-serif">3년을 버텨보세요</span>
      </h1>
        <p className="learn-lead">
          "떨어지면 어떻게 하시겠어요?"라는 질문에 답하는 것과, 실제로 떨어지는 걸 보는 건
          달라요. 실제로 있었던 시장을 가상의 돈으로 겪어보고, 내가 어떻게 움직이는지 확인해봐요.
        </p>
        {live && (
          <div className="sim-live" aria-label="최신 코스피">
            <span className="sim-live-dot" aria-hidden="true" />
            <span className="sim-live-text">
              {Number(live.kospi.latest.date.slice(5, 7))}월 {Number(live.kospi.latest.date.slice(8, 10))}일 코스피{' '}
              <strong>{live.kospi.latest.close.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}</strong>{' '}
              <em className={live.kospi.latest.changePct >= 0 ? 'is-up' : 'is-down'}>
                {live.kospi.latest.changePct >= 0 ? '▲' : '▼'} {Math.abs(live.kospi.latest.changePct).toFixed(2)}%
              </em>
            </span>
            {recent && <span className="sim-live-sub">최근 3년 시장도 함께 나와요 · 공공데이터포털 자료</span>}
          </div>
        )}
        <fieldset className="sim-pct">
          <legend>어느 시장에서 해볼까요?</legend>
          <div className="sim-country-row">
            {COUNTRIES.map((c) => (
              <button
                key={c.key}
                type="button"
                className="sim-pct-btn"
                aria-pressed={country === c.key}
                onClick={() => setCountry(c.key)}
              >
                <strong>{c.label}</strong>
                <span>{c.key === 'kr' ? '코스피' : c.key === 'us' ? 'S&P 500' : '한국·미국'}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="sim-pct">
          <legend>1,000만원 중 얼마를 투자하고 시작할까요?</legend>
          <div className="sim-pct-row">
            {START_PCTS.map((p) => (
              <button
                key={p}
                type="button"
                className="sim-pct-btn"
                aria-pressed={startPct === p}
                onClick={() => setStartPct(p)}
              >
                <strong>{p}%</strong>
                <span>{koreanUnit((START_TOTAL * p) / 100)}</span>
              </button>
            ))}
          </div>
          <p className="sim-pct-note">
            나머지는 현금으로 두고 시작해요. 이 선택도 성향을 보여주는 단서가 돼요.
          </p>
        </fieldset>
        <ol className="sim-rules">
          <li>
            <span>3년 동안 6번, 팔지 버틸지 더 살지, 그리고 얼마나 할지 골라요</span>
          </li>
          <li>
            <span>
              실제로 있었던 3년이 나와요. 금융위기, 코로나19, 상승장 중 어느 때였는지는 끝난 뒤에 알려드려요
            </span>
          </li>
          <li>
            <span>종목이 아니라 시장 전체(지수)의 움직임이에요. 진짜 돈은 오가지 않아요</span>
          </li>
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
    const b = benchmarks(run.market, startPct)
    const kind = classify(actions, run.scenario.moments)
    const extra = outcomeNote(kind, total, run.market, startPct)
    const endPct = Math.round((state.invested / total) * 100)
    const startLevel = pctLevel(startPct)
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
            <dt>처음 비중({startPct}%) 그대로 뒀다면</dt>
            <dd>{koreanUnit(b.nothing)}</dd>
          </div>
          <div>
            <dt>처음부터 전부 넣고 그대로 뒀다면</dt>
            <dd>{koreanUnit(b.allIn)}</dd>
          </div>
        </dl>

        <section className="sim-reveal" aria-labelledby="reveal-title">
          <p className="sim-kicker">이번 시장은</p>
          <h2 id="reveal-title">{run.scenario.label}</h2>
          <p className="sim-reveal-when">
            {run.scenario.country === 'kr' ? '한국' : '미국'} · {run.scenario.period} · {run.scenario.name}
          </p>
          <MarketChart market={run.market} month={LAST_MONTH} baseMonth={0} />
          <p>{run.scenario.note}</p>
          <p className="sim-source">
            실제 데이터:{' '}
            <a href={(run.scenario.live ? LIVE_SOURCE : SOURCES[run.scenario.country]).url} target="_blank" rel="noreferrer">
              {(run.scenario.live ? LIVE_SOURCE : SOURCES[run.scenario.country]).name}
            </a>
            . {run.scenario.live ? '달마다 마지막 날 종가' : '월평균 값'}이라 하루 중 가장 낮았던 때보다는 덜 떨어져 보여요.
          </p>
        </section>

        <section className="sim-behavior" aria-labelledby="beh-title">
          <p className="sim-kicker">내 행동</p>
          <h2 id="beh-title">{behavior.title}</h2>
          <p className="sim-ratio">
            투자 비중 <strong>{startPct}%</strong>로 시작해서 <strong>{endPct}%</strong>로 끝났어요
          </p>
          <p>{behavior.lesson}</p>
          {extra && <p className="sim-extra">{extra}</p>}
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
            <p className="sim-vs-start">
              처음 고른 비중 {startPct}%는 <strong>{TYPES[startLevel].name}</strong>에 가까운
              선택이었어요.
            </p>
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
            한국과 미국에서 실제로 있었던 3년 10개 구간 중 하나를 골라요. 실제 시장이지만 월평균
            값이라 하루 중 가장 크게 떨어졌던 순간보다는 덜 무섭게 보이고, 과거와 똑같은 일이
            앞으로 일어난다는 보장도 없어요. 시장 전체(지수)라서 개별 종목은 훨씬 더 크게 흔들릴 수
            있어요.
          </p>
          <p>
            또 진짜 돈이 아니라서, 실제보다 대담하게 움직이기 쉬워요. 결과는 내 반응을 돌아보는
            참고로만 봐주세요.
          </p>
        </Why>

        <div className="result-actions sim-actions">
          <button type="button" className="btn-primary" onClick={restart}>
            다른 시장에서 다시 하기
            <span className="btn-sub">처음 비중 {startPct}% 그대로</span>
          </button>
          <button type="button" className="btn-secondary" onClick={() => setPhase('intro')}>
            비중 바꿔서 다시 하기
          </button>
          <button type="button" className="btn-link" onClick={onBack}>
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
  const moments = run.scenario.moments
  const moment = moments[step]
  const mood = moodOf(moment.kind)
  const total = state.invested + state.cash
  const allCash = state.invested < 1
  const marketChange = pct(run.market[moment.month], run.market[0])

  return (
    <div className="screen">
      <TopBar onBack={onBack} />

      <div className="sim-progress">
        <p className="sim-month">
          <strong>{moment.month}개월째</strong> / 36개월
          <span className="sim-step">
            선택 {step + 1} / {moments.length}
          </span>
        </p>
        <MonthTicks month={moment.month} moments={moments} />
      </div>

      <section key={moment.month} className={`sim-moment mood-${mood}`} aria-live="polite">
        <h1 className="sim-headline">{headlineFor(run.market, moment.month, moment.kind)}</h1>
        <p className="sim-detail">{moment.detail}</p>
      </section>

      <MarketChart
        market={run.market}
        month={anim ? anim.shown : moment.month}
        baseMonth={anim ? moment.month : step > 0 ? moments[step - 1].month : 0}
        fx={anim?.fx ?? null}
      />

      <dl className="sim-numbers">
        <div>
          <dt>내 돈 전체</dt>
          <dd className="sim-big">{koreanUnit(total)}</dd>
          <dd className="sim-delta">시작보다 {pct(total, START_TOTAL)}</dd>
        </div>
        <div>
          <dt>투자 중</dt>
          <dd>{koreanUnit(state.invested)}</dd>
          <dd className="sim-delta">비중 {Math.round((state.invested / total) * 100)}%</dd>
        </div>
        <div>
          <dt>현금</dt>
          <dd>{koreanUnit(state.cash)}</dd>
        </div>
      </dl>
      <p className="sr-only">시장은 시작보다 {marketChange} 움직였어요.</p>

      <div
        className={`sim-choices${anim ? ' is-busy' : ''}`}
        role="group"
        aria-label="어떻게 할까요"
        aria-busy={anim ? 'true' : undefined}
      >
        {pending ? (
          <div className="sim-amount">
            <p className="sim-amount-q">
              {pending === 'sell' ? '투자한 돈 중 얼마를 팔까요?' : '남은 현금 중 얼마를 넣을까요?'}
            </p>
            <div className="sim-amount-row">
              {FRACTIONS.map((f) => {
                const base = pending === 'sell' ? state.invested : state.cash
                return (
                  <button
                    key={f.value}
                    type="button"
                    className={`sim-amount-btn ${pending === 'sell' ? 'is-sell' : 'is-buy'}`}
                    onClick={() => choose({ type: pending, frac: f.value })}
                  >
                    <strong>{f.label}</strong>
                    <span>{koreanUnit(base * f.value)}</span>
                  </button>
                )
              })}
            </div>
            <button type="button" className="btn-link" onClick={() => setPending(null)}>
              다른 걸 고를래요
            </button>
          </div>
        ) : allCash ? (
          <>
            <button type="button" className="sim-choice" onClick={() => setPending('buy')}>
              <strong>다시 사기</strong>
              <span>현금 {koreanUnit(state.cash)} 중 얼마를 넣을지 골라요</span>
            </button>
            <button type="button" className="sim-choice" onClick={() => choose('hold')}>
              <strong>현금으로 두기</strong>
              <span>조금 더 지켜봐요</span>
            </button>
          </>
        ) : (
          <>
            <button type="button" className="sim-choice is-sell" onClick={() => setPending('sell')}>
              <strong>팔기</strong>
              <span>투자한 돈 중 얼마를 팔지 골라요</span>
            </button>
            <button type="button" className="sim-choice" onClick={() => choose('hold')}>
              <strong>그대로 두기</strong>
              <span>아무것도 하지 않아요</span>
            </button>
            <button
              type="button"
              className="sim-choice is-buy"
              onClick={() => setPending('buy')}
              disabled={state.cash < 1}
            >
              <strong>더 사기</strong>
              <span>
                {state.cash >= 1
                  ? `남은 현금 ${koreanUnit(state.cash)} 중 얼마를 넣을지 골라요`
                  : '남은 현금이 없어요'}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
