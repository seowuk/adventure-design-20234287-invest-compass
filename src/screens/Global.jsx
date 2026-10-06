import TopBar from '../components/TopBar'
import { usHoursKst } from '../lib/marketHours'
import Why from '../components/Why'
import {
  COUNTRIES,
  GLOBAL_RULES,
  HOURS_KR,
  HOURS_US,
  MIX_NOTE,
  TOP_US,
  WAYS,
  WAY_COMPARE,
  WAY_PROS_CONS,
  WHY_ABROAD,
  WHY_CAUTION,
} from '../data/global'

const LEVEL_TEXT = { 3: '매우 큼', 2: '큼', 1: '작음' }

function Meter({ level }) {
  return (
    <span className="meter" aria-label={`세계 영향력 ${LEVEL_TEXT[level]}`}>
      {[1, 2, 3].map((n) => (
        <i key={n} className={n <= level ? 'on' : undefined} />
      ))}
      <span className="meter-text">{LEVEL_TEXT[level]}</span>
    </span>
  )
}

function ProsCons({ data }) {
  return (
    <div className="proscons">
      <h3>{data.title}</h3>
      <div className="checklists">
        <div className="checklist checklist-fit">
          <h4>좋은 점</h4>
          <ul>
            {data.good.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
        <div className="checklist checklist-unfit">
          <h4>감당해야 할 것</h4>
          <ul>
            {data.bear.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function Global({ onBack }) {
  const us = usHoursKst()
  const cell = (row, key) =>
    row.key === 'hours' && key !== 'domEtf' ? `${us.text} (${us.label})` : row[key]

  return (
    <div className="screen">
      <TopBar onBack={onBack} />

      <h1 className="learn-title">해외 투자, 어떻게 볼까</h1>
      <p className="learn-lead">
        무엇을 사라는 게 아니라, 방식마다 무엇을 얻고 무엇을 감당해야 하는지 비교해드려요.
      </p>
      {!GLOBAL_RULES.verified && (
        <p className="draft-badge">세금 규정은 아직 검증 전 초안이에요</p>
      )}

      <section className="learn-section" aria-labelledby="why-title">
        <h2 id="why-title">왜 해외를 보나요</h2>
        <ol className="reasons">
          {WHY_ABROAD.map((w, i) => (
            <li key={w.title}>
              <span className="reason-num" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="caution-box">
          <h3>그래도 알아둘 것</h3>
          <ul className="bullets bullets-caution">
            {WHY_CAUTION.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="learn-section" aria-labelledby="countries-title">
        <h2 id="countries-title">나라별로 얼마나 영향을 주나요</h2>
        <p className="learn-lead">
          한국 경제와 주식시장은 다른 나라의 금리, 경기, 산업에 크게 영향을 받아요. 영향이 들어오는
          통로를 알면 뉴스를 볼 때 왜 한국 증시가 움직이는지 이해하기 쉬워져요.
        </p>
        <div className="countries">
          {COUNTRIES.map((c) => (
            <article key={c.key} className={`country${c.key === 'kr' ? ' is-home' : ''}`}>
              <div className="country-head">
                <h3>{c.name}</h3>
                <Meter level={c.level} />
              </div>
              <p className="country-weight">{c.weight}</p>
              <ul className="bullets">
                {c.channels.map((ch) => (
                  <li key={ch}>{ch}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="learn-section" aria-labelledby="ways-title">
        <h2 id="ways-title">ETF와 개별 주식, 무엇이 다른가요</h2>
        <ProsCons data={WAY_PROS_CONS.etf} />
        <ProsCons data={WAY_PROS_CONS.stock} />

        <h3 className="sub-title">세 가지 방식 한눈에 비교</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">항목</span>
                </th>
                {WAYS.map((w) => (
                  <th key={w.key} scope="col">
                    {w.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WAY_COMPARE.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {WAYS.map((w) => (
                    <td key={w.key}>{cell(row, w.key)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Why title="거래 시간 자세히">
          <p>
            <strong>한국</strong> {HOURS_KR}
          </p>
          <p>
            <strong>미국</strong> {HOURS_US} 오늘은 {us.label}이라 한국 시간 {us.text}에 열려요.
          </p>
        </Why>
        <p className="note">{MIX_NOTE}</p>
      </section>

      <section className="learn-section" aria-labelledby="top-title">
        <h2 id="top-title">미국 대표 기업 시가총액 상위 10곳</h2>
        <p className="learn-lead">{TOP_US.bridge}</p>
        <ol className="top-list">
          {TOP_US.list.map((c, i) => (
            <li key={c.en}>
              <span className="top-rank">{i + 1}</span>
              <div className="top-body">
                <p className="top-name">
                  {c.name}
                  <span>{c.en}</span>
                </p>
                <p className="top-what">{c.what}</p>
              </div>
              <span className="top-sector">{c.sector}</span>
            </li>
          ))}
        </ol>
        <p className="basis">
          {TOP_US.asOf}. {TOP_US.note}
        </p>
        <Why title="상위 기업 목록에서 보이는 것">
          <p>{TOP_US.concentration}</p>
          <p>{TOP_US.outside}</p>
          <p>
            지수 ETF를 사면 오르는 기업의 비중은 자연히 커지고 줄어드는 기업은 작아져요. 누가
            1위가 될지 맞히지 않아도 시장이 알아서 순서를 바꿔준다는 게 지수 투자의 장점이에요.
          </p>
        </Why>
      </section>

      <p className="disclaimer">
        이 화면은 교육용 정보이며 특정 국가, 기업, 상품에 대한 투자 추천이 아닙니다. 세금 규정과
        기업 순위는 바뀔 수 있으니 실제 투자 전에 금융회사와 공식 자료로 확인하세요.
      </p>
    </div>
  )
}
