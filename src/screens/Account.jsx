import TopBar from '../components/TopBar'
import Summary from '../components/Summary'
import Why from '../components/Why'
import { classifyFunds } from '../lib/accounts'
import { diagnose } from '../lib/diagnosis'
import { TYPES } from '../data/results'
import {
  ACCOUNTS,
  ACCOUNT_ORDER,
  COMPARE,
  FUND_ORDER,
  FUND_TYPES,
  GUIDES,
  RULES,
} from '../data/accounts'

function FundScale({ current }) {
  const reach = FUND_ORDER.indexOf(current)
  return (
    <ol className="scale" aria-label="이 돈을 둘 수 있는 기간">
      {FUND_ORDER.map((key, i) => (
        <li key={key} className={i <= reach ? 'is-current' : undefined}>
          <span className="scale-seg" />
          <span className="scale-label">{FUND_TYPES[key].zone}</span>
        </li>
      ))}
    </ol>
  )
}

function Checklist({ title, items, tone }) {
  return (
    <div className={`checklist checklist-${tone}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function AccountCard({ id, focus }) {
  const a = ACCOUNTS[id]
  return (
    <article className={`account${focus ? ' is-focus' : ''}`}>
      <h3>
        {a.name}
        {a.fullName && <span className="account-full">{a.fullName}</span>}
      </h3>
      <p className="account-tagline">{a.tagline}</p>

      <Why title={`${a.name} 자세히 보기`}>
        <h4>좋은 점</h4>
        <ul className="bullets">
          {a.pros.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <h4>꼭 알아둘 점</h4>
        <ul className="bullets bullets-caution">
          {a.cautions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>

        {a.tiers && (
          <>
            <h4>일반형과 서민형</h4>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">구분</th>
                    <th scope="col">세금 없는 수익</th>
                    <th scope="col">자격</th>
                  </tr>
                </thead>
                <tbody>
                  {a.tiers.map((t) => (
                    <tr key={t.name}>
                      <th scope="row">{t.name}</th>
                      <td className="nowrap">{t.limit}</td>
                      <td>{t.who}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {a.tierNotes.map((n) => (
              <p key={n}>{n}</p>
            ))}
          </>
        )}

        {a.kinds && (
          <>
            <h4>세 가지 유형</h4>
            <dl className="facts">
              {a.kinds.map((k) => (
                <div key={k.name}>
                  <dt>{k.name}</dt>
                  <dd>{k.desc}</dd>
                </div>
              ))}
            </dl>
          </>
        )}

        {a.facts && (
          <>
            <h4>기본 조건</h4>
            <dl className="facts">
              {a.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </Why>
    </article>
  )
}

export default function Account({
  answers,
  funds,
  onBack,
  onRetry,
  onCalculate,
  onShowResult,
  onLearn,
}) {
  const { type, guideKey } = classifyFunds(funds)
  const fund = FUND_TYPES[type]
  const guide = GUIDES[guideKey]
  const others = ACCOUNT_ORDER.filter((id) => !guide.focus.includes(id))
  const investType = answers ? TYPES[diagnose(answers).type] : null

  return (
    <div className="screen">
      <TopBar onBack={onBack} />

      <section className="combo" aria-labelledby="combo-title">
        <h1 id="combo-title" className="combo-title">
          내 진단 결과
        </h1>
        <Summary answers={answers} funds={funds} onShowResult={onShowResult} />

        {investType && (
          <div className="combo-what">
            <h2>
              무엇을 담을까
              <span>{investType.name} 기준</span>
            </h2>
            <ul className="bullets">
              {investType.steps.slice(0, 2).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <button type="button" className="inline-link" onClick={onShowResult}>
              성향 결과 자세히 보기
            </button>
          </div>
        )}
      </section>

      <h2 className="where-title">어디에 담을까</h2>

      <section className="type-stage">
        <p className="type-caption">내 돈의 성격</p>
        <p className="type-name">{fund.name}</p>
        <p className="type-headline">{fund.label}</p>
        <FundScale current={type} />
      </section>

      <p className="type-body">{fund.body}</p>

      {!RULES.verified && (
        <p className="draft-badge">세금 관련 숫자는 아직 검증 전 초안이에요</p>
      )}

      <section className="guide">
        <h2>{guide.title}</h2>
        {guide.body.map((p) => (
          <p key={p}>{p}</p>
        ))}

        {guide.fit && (
          <div className="checklists">
            <Checklist title="이런 경우 맞아요" items={guide.fit} tone="fit" />
            <Checklist title="이런 경우 안 맞아요" items={guide.unfit} tone="unfit" />
          </div>
        )}

        {guide.views && <p className="note">{guide.views}</p>}
        {guide.note && <p className="note">{guide.note}</p>}
      </section>

      <section className="accounts">
        <h2>검토해볼 계좌</h2>
        {guide.focus.map((id) => (
          <AccountCard key={id} id={id} focus />
        ))}

        <h2>다른 선택지</h2>
        {others.map((id) => (
          <AccountCard key={id} id={id} />
        ))}
      </section>

      <section className="compare">
        <h2>한눈에 비교</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">항목</span>
                </th>
                {ACCOUNT_ORDER.map((id) => (
                  <th key={id} scope="col" className={guide.focus[0] === id ? 'is-focus' : undefined}>
                    {ACCOUNTS[id].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {ACCOUNT_ORDER.map((id) => (
                    <td key={id} className={guide.focus[0] === id ? 'is-focus' : undefined}>
                      {row[id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="basis">
          {RULES.asOf} 기준{RULES.verified ? '' : ' (검증 전 초안)'}. 확인처:{' '}
          {RULES.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && ', '}
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.name}
              </a>
            </span>
          ))}
        </p>
      </section>

      <div className="result-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={() => onCalculate(investType ? investType.rate : 5)}
        >
          얼마가 될지 계산해보기
          {investType && (
            <span className="btn-sub">
              {investType.name} 예시 수익률 연 {investType.rate}%로 시작해요
            </span>
          )}
        </button>
        <button type="button" className="btn-secondary" onClick={onLearn}>
          공부할 책과 사이트 보기
        </button>
        <button type="button" className="btn-link" onClick={onRetry}>
          3문항 다시 답하기
        </button>
      </div>

      <p className="disclaimer">
        제도 안내는 교육 목적이며 세무 상담이나 투자 자문이 아닙니다. 특정 금융회사나 상품을
        추천하지 않습니다. 세법은 해마다 바뀔 수 있으니, 실제 가입 전에 금융회사나 전문가에게
        꼭 확인하세요.
      </p>
    </div>
  )
}
