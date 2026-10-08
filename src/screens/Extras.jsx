import TopBar from '../components/TopBar'
import Why from '../components/Why'
import {
  EXTRAS_DISCLAIMER,
  EXTRAS_LEAD,
  GOLD,
  GOLD_COMPARE,
  GOLD_TIP,
  GOLD_WAYS,
} from '../data/extras'

function GoldBar({ size }) {
  // 크기가 커질수록 골드바도 커 보이게
  const w = { '1g': 18, '100g': 34, '1kg': 54 }[size]
  return (
    <svg viewBox="0 0 60 40" width={w * 1.4} height={w * 0.95} aria-hidden="true">
      <path d="M10 30 L16 12 H44 L50 30 Z" fill="#f5c542" />
      <path d="M16 12 H44 L41 18 H19 Z" fill="#ffe08a" />
      <path d="M10 30 H50" stroke="#c9971c" strokeWidth="2" />
    </svg>
  )
}

export default function Extras({ onBack }) {
  return (
    <div className="screen">
      <TopBar onBack={onBack} />

      <h1 className="learn-title">이런 것도 있어요</h1>
      <p className="learn-lead">{EXTRAS_LEAD}</p>

      <section className="learn-section" aria-labelledby="gold-title">
        <h2 id="gold-title">
          {GOLD.title}
          <span className="h2-sub">{GOLD.sub}</span>
        </h2>
        <p className="learn-lead">{GOLD.what}</p>

        <ol className="gold-steps" aria-label="금을 모아 실물로 받기까지">
          {GOLD.steps.map((s) => (
            <li key={s.amount}>
              <span className="gold-visual">
                <GoldBar size={s.amount} />
              </span>
              <strong className="gold-amount">{s.amount}</strong>
              <span className="gold-label">{s.label}</span>
              <span className="gold-desc">{s.desc}</span>
            </li>
          ))}
        </ol>

        <dl className="criteria">
          {GOLD.facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="caution-box gold-withdraw">
          <h3>실물로 받기 전에</h3>
          <p>{GOLD.withdrawNote}</p>
        </div>

        <div className="checklists">
          <div className="checklist checklist-fit">
            <h3>좋은 점</h3>
            <ul>
              {GOLD.good.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
          <div className="checklist checklist-unfit">
            <h3>감당해야 할 것</h3>
            <ul>
              {GOLD.bear.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="sub-title">금에 투자하는 네 가지 방법</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">항목</span>
                </th>
                {GOLD_WAYS.map((w) => (
                  <th key={w.key} scope="col" className={w.key === 'krx' ? 'is-focus' : undefined}>
                    {w.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GOLD_COMPARE.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {GOLD_WAYS.map((w) => (
                    <td key={w.key} className={w.key === 'krx' ? 'is-focus' : undefined}>
                      {row[w.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">{GOLD_TIP}</p>
        <Why title="금에는 왜 배당이 없나요?">
          <p>
            주식은 회사가 번 돈을, 채권은 이자를, 부동산은 임대료를 나눠줘요. 금은 그 자체로는 돈을
            벌어오지 않는 물건이라 나눠줄 게 없어요. 그래서 금의 수익은 오로지 금값이 오르는 데서만
            나와요.
          </p>
          <p>
            대신 경제가 불안할 때 사람들이 금을 찾는 경우가 많아서, 주식이 흔들릴 때 버팀목 역할을
            하기도 해요. 그래서 수익을 내는 주력보다는 흔들림을 줄이는 보조로 많이 써요.
          </p>
        </Why>
      </section>

      <p className="disclaimer">{EXTRAS_DISCLAIMER}</p>
    </div>
  )
}
