import { useState } from 'react'
import TopBar from '../components/TopBar'
import Why from '../components/Why'
import { diagnose } from '../lib/diagnosis'
import {
  CAP_TEXT,
  EXPERIENCED,
  FUTURE_INCOME,
  HOW_IT_WORKS,
  MISMATCH,
  TYPES,
  TYPE_ORDER,
  UNTESTED,
  WARNINGS,
  WILL_TEXT,
} from '../data/results'

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
    <ol className="scale" aria-label="출발점 위치">
      {TYPE_ORDER.map((key) => (
        <li key={key} className={key === current ? 'is-current' : undefined}>
          <span className="scale-seg" />
          <span className="scale-label">{TYPES[key].name}</span>
        </li>
      ))}
    </ol>
  )
}

// 여건 설명: 더 발목을 잡는 쪽의 이유를 보여준다
function capacityReason(d) {
  if (d.hCap === 2 && d.cCap === 2) return '쓸 시점과 비상금 모두 여유가 있어요'
  return d.hCap <= d.cCap ? CAP_TEXT.horizon[d.hCap] : CAP_TEXT.cushion[d.cCap]
}

function Reasoning({ d }) {
  return (
    <section className="reasoning">
      <h2>왜 이렇게 나왔나요</h2>
      <dl className="axes">
        <div>
          <dt>감수할 마음</dt>
          <dd>
            <strong>{TYPES[d.willingness].name}</strong>
            <span>{WILL_TEXT[d.willingness]}</span>
          </dd>
        </div>
        <div>
          <dt>감당할 여건</dt>
          <dd>
            <strong>{TYPES[d.capacity].name}</strong>
            <span>{capacityReason(d)}</span>
          </dd>
        </div>
      </dl>
      <p className="axes-rule">
        {d.limitedBy
          ? `마음은 ${TYPES[d.willingness].name}에 가깝지만, 지금 여건에서는 ${TYPES[d.type].name}으로 시작하는 게 안전해요. 둘이 다를 때는 더 조심스러운 쪽을 출발점으로 삼아요.`
          : '마음과 여건 중 더 조심스러운 쪽을 출발점으로 삼았어요.'}
      </p>
    </section>
  )
}

export default function Result({
  answers,
  hasFunds,
  onHome,
  onRetry,
  onCalculate,
  onFunds,
  onShowAccount,
  onLearn,
  onGlobal,
}) {
  const d = diagnose(answers)
  const [picked, setPicked] = useState(null)
  const shown = picked ?? d.type
  const t = TYPES[shown]

  return (
    <div className="screen">
      <TopBar onBack={onHome} backLabel="처음으로" />

      {d.warnings.map((key) => (
        <WarningBlock key={key} warning={WARNINGS[key]} />
      ))}

      <section className="type-stage">
        <p className="type-caption">{picked ? '직접 고른 출발점' : '지금 답변으로 본 출발점'}</p>
        <p className="type-name">{t.name}</p>
        <p className="type-headline">{t.headline}</p>
        <TypeScale current={shown} />
        {!picked && d.leaning && (
          <p className="type-leaning">경계에 있어요. {TYPES[d.leaning].name}에 가까운 편이에요.</p>
        )}
      </section>

      {!picked && <Reasoning d={d} />}

      {!picked && (
        <div className="future">
          <Why title="아직 모은 돈이 적어도 괜찮은 이유">
            {FUTURE_INCOME.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Why>
        </div>
      )}

      <p className="type-body">{t.body}</p>

      {!picked && d.mismatch && <p className="note">{MISMATCH}</p>}
      {!picked && d.untested && <p className="note">{UNTESTED}</p>}
      {!picked && d.exp === 4 && <p className="note">{EXPERIENCED}</p>}

      <section className="steps">
        <h2>어떻게 시작하면 좋을까</h2>
        <ul>
          {t.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section className="pick">
        <h2>결과가 나와 다르게 느껴진다면</h2>
        <p>다른 출발점을 골라서 어떻게 달라지는지 볼 수 있어요.</p>
        <div className="chips" role="group" aria-label="출발점 직접 고르기">
          {TYPE_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              className="chip"
              aria-pressed={shown === key}
              onClick={() => setPicked(key === d.type ? null : key)}
            >
              {TYPES[key].name}
              {key === d.type && ' (진단 결과)'}
            </button>
          ))}
        </div>
        <Why title="이 진단은 얼마나 믿을 만한가요?">
          {HOW_IT_WORKS.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Why>
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
        <button type="button" className="btn-secondary" onClick={onLearn}>
          공부할 책과 사이트 보기
        </button>
        <button type="button" className="btn-secondary" onClick={onGlobal}>
          해외 투자, 어떻게 볼까
        </button>
        <button type="button" className="btn-link" onClick={onRetry}>
          다시 진단하기
        </button>
      </div>

      <p className="disclaimer">
        진단 결과는 교육용 자가점검이며, 금융기관의 공식 투자성향 진단이 아닙니다. 본 서비스는
        특정 상품이나 금융회사를 추천하지 않으며 투자 자문이 아닙니다. 투자 판단과 책임은
        본인에게 있습니다.
      </p>
    </div>
  )
}
