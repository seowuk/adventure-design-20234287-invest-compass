import { useState } from 'react'
import TopBar from '../components/TopBar'
import Summary from '../components/Summary'
import QuickMenu from '../components/QuickMenu'
import { QUESTIONS } from '../data/questions'
import { formatDate } from '../lib/storage'

// 누르면 바늘이 몇 바퀴 돌다가 흔들리며 원래 방향으로 돌아온다
function CompassDial() {
  const [spin, setSpin] = useState({ n: 0, end: 35, dir: 1 })

  const turn = () => {
    const turns = 2 + Math.floor(Math.random() * 3) // 2~4바퀴
    const dir = Math.random() < 0.5 ? 1 : -1 // 시계 방향 또는 반대
    setSpin((s) => ({ n: s.n + 1, end: 35 + dir * 360 * turns, dir }))
  }

  return (
    <button type="button" className="dial-btn" onClick={turn} aria-label="나침반 돌리기">
      <svg className="dial" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="58" fill="var(--cobalt)" />
        {Array.from({ length: 24 }, (_, i) => (
          <line
            key={i}
            x1="60"
            y1="9"
            x2="60"
            y2={i % 6 === 0 ? 19 : 14}
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={i % 6 === 0 ? 2.2 : 1.2}
            strokeLinecap="round"
            transform={`rotate(${i * 15} 60 60)`}
          />
        ))}
        <g
          key={spin.n}
          className={spin.n ? 'dial-needle is-spinning' : 'dial-needle'}
          style={{ '--spin-end': `${spin.end}deg`, '--overshoot': `${spin.dir * 24}deg` }}
        >
          <path d="M60 22 L68 60 L52 60 Z" fill="var(--sun)" />
          <path d="M60 98 L68 60 L52 60 Z" fill="#fff" opacity="0.9" />
          <circle cx="60" cy="60" r="5" fill="var(--ink)" />
        </g>
      </svg>
    </button>
  )
}

export default function Start({
  diag,
  funds,
  onStart,
  onShowResult,
  onShowAccount,
  onFunds,
  onCalculator,
  onClear,
  onLearn,
  onWords,
  onGlobal,
  onBrokers,
  onDividend,
  onFeedback,
  onExtras,
  onSim,
}) {
  const date = diag ? formatDate(diag.at) : ''

  const menu = [
    { icon: 'calc', label: '복리 계산기', sub: '얼마가 될지 바로 계산', onClick: onCalculator },
    { icon: 'globe', label: '해외 투자', sub: 'ETF와 해외 주식 비교', onClick: onGlobal },
    { icon: 'words', label: '용어 사전', sub: '막히는 단어 쉽게 풀기', onClick: onWords },
    { icon: 'books', label: '책·사이트', sub: '수준별 공부 자료', onClick: onLearn },
    { icon: 'phone', label: '증권사 고르기', sub: '앱 특징과 비교 기준', onClick: onBrokers },
    { icon: 'coins', label: '배당 계산', sub: '배당만으로 살 수 있을까', onClick: onDividend },
  ]

  return (
    <div className="screen">
      <TopBar hideHome />

      <section className="start-hero">
        <CompassDial />
        <h1 className="start-title">
          종목은 고르지 않습니다.
          <br />
          방향만 알려드립니다.
        </h1>
        {!diag && (
          <p className="start-lead">몇 가지 질문에 답하면 나에게 맞는 투자 방향을 알려드려요.</p>
        )}
      </section>

      {diag ? (
        <section className="saved" aria-labelledby="saved-title">
          <h2 id="saved-title">
            다시 오셨네요
            {date && <span className="saved-date">{date} 진단</span>}
          </h2>
          <Summary
            answers={diag.answers}
            funds={funds?.answers}
            onShowResult={onShowResult}
            onShowAccount={onShowAccount}
            onFunds={onFunds}
          />
          <div className="start-actions">
            <button type="button" className="btn-primary" onClick={onShowResult}>
              내 결과 다시 보기
            </button>
            <button type="button" className="btn-secondary" onClick={onStart}>
              처음부터 다시 진단하기
            </button>
          </div>
          <button type="button" className="sim-cta" onClick={onSim}>
            <span className="sim-cta-kicker">모의투자 체험</span>
            <strong>가상의 1,000만원으로 3년을 버텨보세요</strong>
            <span>떨어질 때 내가 실제로 어떻게 움직이는지 확인해요</span>
          </button>
          <QuickMenu items={menu} />
          <button type="button" className="extra-cta" onClick={onExtras}>
            <span className="extra-badge">이런 것도 있어요</span>
            <span className="extra-text">
              <strong>금테크, 1g씩 모아 골드바로</strong>
              <span>증권사에서 금을 소액으로 사고파는 방법</span>
            </span>
          </button>
          <button type="button" className="fb-cta" onClick={onFeedback}>
            <span className="fb-cta-stars" aria-hidden="true">★★★★★</span>
            <span className="fb-cta-text">
              <strong>이 앱 어땠나요?</strong>
              <span>별점과 아쉬운 점을 남겨주세요</span>
            </span>
          </button>
          <p className="saved-note">
            결과는 이 기기의 이 브라우저에만 저장돼요. 서버로 보내지 않아요.{' '}
            <button type="button" className="inline-link" onClick={onClear}>
              이 기기에서 지우기
            </button>
          </p>
        </section>
      ) : (
        <>
          <ul className="promises">
            <li>로그인 없이 바로 써요</li>
            <li>개인정보를 모으지 않아요</li>
            <li>특정 종목을 추천하지 않아요</li>
          </ul>

          <div className="start-actions">
            <button type="button" className="btn-primary" onClick={onStart}>
              진단 시작하기
              <span className="btn-sub">{QUESTIONS.length}문항, 1분이면 끝나요</span>
            </button>
          </div>
          <button type="button" className="sim-cta" onClick={onSim}>
            <span className="sim-cta-kicker">모의투자 체험</span>
            <strong>가상의 1,000만원으로 3년을 버텨보세요</strong>
            <span>떨어질 때 내가 실제로 어떻게 움직이는지 확인해요</span>
          </button>
          <QuickMenu items={menu} />
          <button type="button" className="extra-cta" onClick={onExtras}>
            <span className="extra-badge">이런 것도 있어요</span>
            <span className="extra-text">
              <strong>금테크, 1g씩 모아 골드바로</strong>
              <span>증권사에서 금을 소액으로 사고파는 방법</span>
            </span>
          </button>
          <button type="button" className="fb-cta" onClick={onFeedback}>
            <span className="fb-cta-stars" aria-hidden="true">★★★★★</span>
            <span className="fb-cta-text">
              <strong>이 앱 어땠나요?</strong>
              <span>별점과 아쉬운 점을 남겨주세요</span>
            </span>
          </button>
        </>
      )}

      <p className="disclaimer">본 서비스는 교육 목적이며 투자 자문이 아닙니다.</p>
    </div>
  )
}
