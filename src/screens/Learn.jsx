import { useState } from 'react'
import TopBar from '../components/TopBar'
import Why from '../components/Why'
import {
  BOOKS,
  CHANNEL_AVOID,
  CHANNEL_GOOD,
  CHANNEL_TIP,
  LEVELS,
  LEVEL_ORDER,
  SITES,
  bookSearchUrl,
  levelFor,
} from '../data/recommendations'

function Tags({ tags }) {
  return (
    <ul className="tags" aria-label="주제">
      {tags.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  )
}

export default function Learn({ exp, onBack, onGlobal, onWords }) {
  const mine = levelFor(exp)
  const [level, setLevel] = useState(mine)
  const books = BOOKS.filter((b) => b.level === level)

  return (
    <div className="screen">
      <TopBar onBack={onBack} />

      <h1 className="learn-title">더 알아보고 싶다면</h1>
      <p className="learn-lead">
        {exp
          ? `진단 때 답한 투자 경험에 맞춰 ${LEVELS[mine].name} 단계부터 보여드려요.`
          : '처음이라면 입문 단계부터 시작해보세요.'}
      </p>

      <button type="button" className="feature-link" onClick={onGlobal}>
        <span className="feature-link-title">해외 투자, 어떻게 볼까</span>
        <span className="feature-link-sub">
          ETF와 해외 개별 주식 비교, 미국·중국·대만의 영향력, 미국 상위 10개 기업
        </span>
      </button>

      <button type="button" className="feature-link feature-link-alt" onClick={onWords}>
        <span className="feature-link-title">투자 용어 사전</span>
        <span className="feature-link-sub">
          코스피·나스닥부터 커버드콜까지, 막히는 단어를 쉬운 말로. 배당만으로 살 수 있을지 계산도
          해봐요
        </span>
      </button>

      <section className="learn-section" aria-labelledby="books-title">
        <h2 id="books-title">책</h2>

        <div className="chips" role="group" aria-label="수준 고르기">
          {LEVEL_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              className="chip"
              aria-pressed={level === key}
              onClick={() => setLevel(key)}
            >
              {LEVELS[key].name}
              {key === mine && exp ? ' (내 수준)' : ''}
            </button>
          ))}
        </div>
        <p className="level-desc">{LEVELS[level].desc}</p>

        <div className="cards">
          {books.map((b) => (
            <article key={b.title} className="card">
              <h3>{b.title}</h3>
              {b.author && <p className="card-sub">{b.author}</p>}
              <p className="card-why">{b.why}</p>
              <Tags tags={b.tags} />
              <a className="card-link" href={bookSearchUrl(b)} target="_blank" rel="noreferrer">
                서점에서 찾아보기
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="learn-section" aria-labelledby="sites-title">
        <h2 id="sites-title">믿을 만한 공식 사이트</h2>
        <div className="cards">
          {SITES.map((s) => (
            <article key={s.url} className="card">
              <h3>{s.name}</h3>
              <p className="card-why">{s.why}</p>
              <Tags tags={s.tags} />
              <a className="card-link" href={s.url} target="_blank" rel="noreferrer">
                사이트 열기
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="learn-section" aria-labelledby="channels-title">
        <h2 id="channels-title">유튜브·뉴스레터 고르는 법</h2>
        <p className="learn-lead">
          특정 채널을 추천하는 대신, 좋은 채널과 피해야 할 채널을 가려내는 기준을 알려드려요.
        </p>
        <div className="checklists">
          <div className="checklist checklist-fit">
            <h3>이런 곳은 괜찮아요</h3>
            <ul>
              {CHANNEL_GOOD.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="checklist checklist-unfit">
            <h3>이런 곳은 피하세요</h3>
            <ul>
              {CHANNEL_AVOID.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
        <Why title="유사투자자문업이 뭔가요?">{CHANNEL_TIP}</Why>
      </section>

      <p className="disclaimer">
        추천 자료는 학습용이며 협찬이나 제휴가 없습니다. 책이나 사이트의 내용이 이 서비스의
        의견과 같다는 뜻은 아닙니다.
      </p>
    </div>
  )
}
