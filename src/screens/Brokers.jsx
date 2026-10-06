import TopBar from '../components/TopBar'
import {
  BRAND_TIP,
  BROKERS,
  BROKERS_AS_OF,
  BROKERS_DISCLAIMER,
  CRITERIA,
  ETF_BRANDS,
  FEE_POINTS,
  OFFICIAL_COMPARE,
  ROLES,
  ROLES_KEY,
} from '../data/brokers'

// 순위처럼 보이지 않도록 이름순
const SORTED = [...BROKERS].sort((a, b) => a.name.localeCompare(b.name, 'ko'))

export default function Brokers({ onBack }) {
  return (
    <div className="screen">
      <TopBar onBack={onBack} />

      <h1 className="learn-title">증권사 앱 고르기</h1>
      <p className="learn-lead">
        어디가 제일 좋다는 정답은 없어요. 무엇을 비교해야 하는지와, 주요 증권사 앱의 특징을
        모았어요.
      </p>

      <section className="learn-section" aria-labelledby="roles-title">
        <h2 id="roles-title">증권사와 운용사는 달라요</h2>
        <div className="countries">
          {ROLES.map((r) => (
            <article key={r.who} className="country">
              <h3>{r.who}</h3>
              <p className="country-weight">{r.example}</p>
              <p className="age-desc">{r.what}</p>
            </article>
          ))}
        </div>
        <p className="note">{ROLES_KEY}</p>

        <h3 className="sub-title">ETF 이름 앞의 브랜드와 운용사</h3>
        <div className="table-wrap">
          <table className="table brand-table">
            <thead>
              <tr>
                <th scope="col">ETF 브랜드</th>
                <th scope="col">만드는 곳 (운용사)</th>
              </tr>
            </thead>
            <tbody>
              {ETF_BRANDS.map((b) => (
                <tr key={b.brand}>
                  <th scope="row">{b.brand}</th>
                  <td>
                    {b.company}
                    {b.note && <span className="brand-note">{b.note}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="learn-lead">{BRAND_TIP}</p>
      </section>

      <section className="learn-section" aria-labelledby="fee-title">
        <h2 id="fee-title">수수료, 어디서 차이가 나나요</h2>
        <ol className="reasons">
          {FEE_POINTS.map((f, i) => (
            <li key={f.title}>
              <span className="reason-num" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <a className="official-link" href={OFFICIAL_COMPARE.url} target="_blank" rel="noreferrer">
          <span className="official-title">{OFFICIAL_COMPARE.name}에서 최신 수수료 비교</span>
          <span className="official-desc">{OFFICIAL_COMPARE.desc}</span>
        </a>
      </section>

      <section className="learn-section" aria-labelledby="criteria-title">
        <h2 id="criteria-title">고를 때 보는 기준</h2>
        <dl className="criteria">
          {CRITERIA.map((c) => (
            <div key={c.label}>
              <dt>{c.label}</dt>
              <dd>{c.why}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="learn-section" aria-labelledby="brokers-title">
        <h2 id="brokers-title">주요 증권사 앱</h2>
        <p className="learn-lead">
          이름순으로 정렬했어요. 순위가 아니에요. {BROKERS_AS_OF}
        </p>
        <div className="cards">
          {SORTED.map((b) => (
            <article key={b.name} className="card broker">
              <h3>
                {b.name}
                <span className="broker-app">{b.app}</span>
              </h3>
              <ul className="bullets broker-good">
                {b.good.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
              <ul className="bullets bullets-caution broker-note">
                {b.note.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <p className="disclaimer">{BROKERS_DISCLAIMER}</p>
    </div>
  )
}
