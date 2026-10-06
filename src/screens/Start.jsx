import TopBar from '../components/TopBar'
import Summary from '../components/Summary'
import QuickMenu from '../components/QuickMenu'
import { QUESTIONS } from '../data/questions'
import { formatDate } from '../lib/storage'

function CompassDial() {
  return (
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
      <g className="dial-needle">
        <path d="M60 22 L68 60 L52 60 Z" fill="var(--sun)" />
        <path d="M60 98 L68 60 L52 60 Z" fill="#fff" opacity="0.9" />
        <circle cx="60" cy="60" r="5" fill="var(--ink)" />
      </g>
    </svg>
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
}) {
  const date = diag ? formatDate(diag.at) : ''

  const menu = [
    { icon: 'calc', label: '복리 계산기', sub: '얼마가 될지 바로 계산', onClick: onCalculator },
    { icon: 'globe', label: '해외 투자', sub: 'ETF와 해외 주식 비교', onClick: onGlobal },
    { icon: 'words', label: '용어 사전', sub: '막히는 단어 쉽게 풀기', onClick: onWords },
    { icon: 'books', label: '책·사이트', sub: '수준별 공부 자료', onClick: onLearn },
  ]

  return (
    <div className="screen">
      <TopBar />

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
          <QuickMenu items={menu} />
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
          <QuickMenu items={menu} />
        </>
      )}

      <p className="disclaimer">본 서비스는 교육 목적이며 투자 자문이 아닙니다.</p>
    </div>
  )
}
