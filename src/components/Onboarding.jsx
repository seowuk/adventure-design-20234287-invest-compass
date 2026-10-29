import { useRef, useState } from 'react'
import HomePlanCard from './HomePlanCard'
import { monthsTo, duration } from '../lib/goal'

// 2번째 장 곡선의 숫자: 매달 50만원, 연 5%
const M_HALF = monthsTo(50_000_000, 500_000, 5)
const M_FULL = monthsTo(100_000_000, 500_000, 5)

function DiagVisual() {
  return (
    <div className="ob-card ob-diag">
      <p className="ob-diag-cap">지금 답변으로 본 출발점</p>
      <p className="ob-diag-type">중립형</p>
      <div className="ob-meter" aria-hidden="true">
        <i className="on" />
        <i className="on" />
        <i />
      </div>
      <p className="ob-diag-sub">감수할 마음과 감당할 여건을 따로 봤어요</p>
    </div>
  )
}

function CurveVisual() {
  // 화면 아래를 가로지르는 곡선과 두 점
  return (
    <div className="ob-curve">
      <svg viewBox="0 0 360 220" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="obArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 190 C 90 165, 150 140, 200 105 S 300 40, 360 30 L 360 220 L 0 220 Z" fill="url(#obArea)" />
        <path d="M0 190 C 90 165, 150 140, 200 105 S 300 40, 360 30" fill="none" stroke="#fff" strokeWidth="2.5" />
        <circle cx="96" cy="162" r="6" fill="#fff" />
        <circle cx="262" cy="56" r="6" fill="#FFD84D" />
      </svg>
      <p className="ob-pt ob-pt-1">
        5천만원<span>{duration(M_HALF)}</span>
      </p>
      <p className="ob-pt ob-pt-2">
        1억원<span>{duration(M_FULL)}</span>
      </p>
    </div>
  )
}

function SimVisual() {
  return (
    <div className="ob-card ob-sim">
      <span className="ob-chip-down">▼ 18% 떨어졌어요</span>
      <svg viewBox="0 0 300 120" aria-hidden="true">
        <path d="M0 70 C 40 60, 70 40, 110 30 S 160 70, 190 95 S 260 80, 300 60" fill="none" stroke="#fff" strokeWidth="2.5" />
        <circle cx="190" cy="95" r="6" fill="#FF8A7A" />
      </svg>
      <div className="ob-sim-btns" aria-hidden="true">
        <span>팔기</span>
        <span className="on">그대로 두기</span>
        <span>더 사기</span>
      </div>
    </div>
  )
}

const SLIDES = [
  { strong: '방향을', serif: '찾아드려요', sub: '6문항, 1분이면 나의 출발점을 알 수 있어요', visual: <DiagVisual /> },
  { strong: '1억까지', serif: '얼마나 걸릴까', sub: '매달 50만원이면 이만큼 걸려요', visual: <CurveVisual /> },
  { strong: '월급이 들어오면', serif: '어디로 갈까', sub: '비상금부터 차례로, 내 계획을 한눈에', visual: <HomePlanCard demo /> },
  { strong: '떨어질 때의 나를', serif: '미리 만나봐요', sub: '가상의 1,000만원으로 하락장을 겪어봐요', visual: <SimVisual /> },
]

export default function Onboarding({ onStart, onBrowse }) {
  const [index, setIndex] = useState(0)
  const track = useRef(null)

  const onScroll = () => {
    const el = track.current
    if (!el) return
    setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  const goTo = (i) => {
    const el = track.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="ob">
      <div className="ob-brand">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#fff" fillOpacity="0.14" />
          <path d="M12 4 14 12h-4z" fill="#FFD84D" />
          <path d="M12 20 14 12h-4z" fill="#fff" />
        </svg>
        투자 나침반
      </div>

      <div
        className="ob-track"
        ref={track}
        onScroll={onScroll}
        aria-roledescription="carousel"
        aria-label="투자 나침반 소개"
      >
        {SLIDES.map((s, i) => (
          <section key={s.strong} className="ob-slide" aria-label={`${i + 1} / ${SLIDES.length}`}>
            <h1 className="ob-title">
              <span className="t-strong">{s.strong}</span>
              <span className="t-serif">{s.serif}</span>
            </h1>
            <p className="ob-sub">{s.sub}</p>
            <div className="ob-visual">{s.visual}</div>
          </section>
        ))}
      </div>

      <div className="ob-bottom">
        <div className="ob-dots" role="tablist" aria-label="소개 넘기기">
          {SLIDES.map((s, i) => (
            <button
              key={s.strong}
              type="button"
              role="tab"
              aria-selected={index === i}
              aria-label={`${i + 1}번째 소개`}
              className={index === i ? 'on' : ''}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button type="button" className="ob-primary" onClick={onStart}>
          진단 시작하기
        </button>
        <button type="button" className="ob-secondary" onClick={onBrowse}>
          둘러보기
        </button>
        <p className="ob-promise">로그인 없음 · 개인정보 수집 없음 · 종목 추천 없음</p>
      </div>
    </div>
  )
}
