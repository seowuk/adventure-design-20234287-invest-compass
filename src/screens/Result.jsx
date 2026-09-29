import TopBar from '../components/TopBar'
import Why from '../components/Why'
import { diagnose } from '../lib/diagnosis'
import { MISMATCH, TYPES, TYPE_ORDER, WARNINGS } from '../data/results'

function WarningBlock({ warning }) {
  return (
    <section className="warning">
      <h2>{warning.title}</h2>
      {warning.body.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <Why title={warning.detail.title}>{warning.detail.content}</Why>
    </section>
  )
}

function TypeScale({ current }) {
  return (
    <ol className="scale" aria-label="성향 위치">
      {TYPE_ORDER.map((key) => (
        <li key={key} className={key === current ? 'is-current' : undefined}>
          <span className="scale-seg" />
          <span className="scale-label">{TYPES[key].name}</span>
        </li>
      ))}
    </ol>
  )
}

export default function Result({ answers, hasFunds, onHome, onRetry, onCalculate, onFunds, onShowAccount }) {
  const { type, warnings, mismatch } = diagnose(answers)
  const t = TYPES[type]

  return (
    <div className="screen">
      <TopBar onBack={onHome} backLabel="처음으로" />

      {warnings.map((key) => (
        <WarningBlock key={key} warning={WARNINGS[key]} />
      ))}

      <section className="type-stage">
        <p className="type-caption">나의 투자 성향</p>
        <p className="type-name">{t.name}</p>
        <p className="type-headline">{t.headline}</p>
        <TypeScale current={type} />
      </section>

      <p className="type-body">{t.body}</p>

      {mismatch && <p className="note">{MISMATCH}</p>}

      <section className="steps">
        <h2>어떻게 시작하면 좋을까</h2>
        <ul>
          {t.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section className="next-card">
        <h2>어떤 계좌에 담으면 좋을지도 알아볼까요?</h2>
        <p>
          3문항만 더 답하면 일반 계좌, ISA, 연금저축, IRP 중 내 돈에 맞는 방향을 알려드려요.
        </p>
        {hasFunds ? (
          <div className="next-actions">
            <button type="button" className="btn-primary" onClick={onShowAccount}>
              내 계좌 방향 보기
            </button>
            <button type="button" className="btn-link" onClick={onFunds}>
              3문항 다시 답하기
            </button>
          </div>
        ) : (
          <button type="button" className="btn-primary" onClick={onFunds}>
            계좌 방향 알아보기
            <span className="btn-sub">3문항, 30초면 끝나요</span>
          </button>
        )}
      </section>

      <div className="result-actions">
        <button type="button" className="btn-primary" onClick={() => onCalculate(t.rate)}>
          {t.name} 기준으로 계산해보기
          <span className="btn-sub">연 {t.rate}% 예시 수익률로 시작해요</span>
        </button>
        <button type="button" className="btn-secondary" onClick={onRetry}>
          다시 진단하기
        </button>
      </div>

      <p className="disclaimer">
        진단 결과는 교육용 자가진단이며, 금융기관의 공식 투자성향 진단이 아닙니다. 본 서비스는
        특정 상품이나 금융회사를 추천하지 않으며 투자 자문이 아닙니다. 투자 판단과 책임은
        본인에게 있습니다.
      </p>
    </div>
  )
}
