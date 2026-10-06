import { useState } from 'react'
import TopBar from '../components/TopBar'
import { GLOSSARY } from '../data/glossary'

// 띄어쓰기·대소문자 무시하고 찾기
const norm = (s) => s.toLowerCase().replace(/\s|·/g, '')

export default function Words({ onBack, onDividend }) {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')

  const q = norm(query)
  const groups = GLOSSARY.map((g) => ({
    ...g,
    terms: g.terms.filter((t) => {
      if (!q) return true
      return norm(`${t.term}${t.en ?? ''}${t.desc}`).includes(q)
    }),
  })).filter((g) => (q ? true : group === 'all' || g.key === group))
  const shown = groups.filter((g) => g.terms.length > 0)
  const count = shown.reduce((n, g) => n + g.terms.length, 0)

  return (
    <div className="screen">
      <TopBar onBack={onBack} />

      <h1 className="learn-title">투자 용어 사전</h1>
      <p className="learn-lead">뉴스나 상품 설명에서 막히는 단어를 쉬운 말로 풀었어요.</p>

      <label className="search">
        <span className="sr-only">용어 찾기</span>
        <input
          type="search"
          placeholder="찾는 용어 입력 (예: 코스피, 커버드콜)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      {!q && (
        <div className="chips" role="group" aria-label="묶음 고르기">
          <button
            type="button"
            className="chip"
            aria-pressed={group === 'all'}
            onClick={() => setGroup('all')}
          >
            전체
          </button>
          {GLOSSARY.map((g) => (
            <button
              key={g.key}
              type="button"
              className="chip"
              aria-pressed={group === g.key}
              onClick={() => setGroup(g.key)}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {q && (
        <p className="search-count" aria-live="polite">
          {count > 0 ? `${count}개 찾았어요` : '찾는 용어가 없어요. 다른 말로 찾아보세요.'}
        </p>
      )}

      {shown.map((g) => (
        <section key={g.key} className="word-group" aria-labelledby={`g-${g.key}`}>
          <h2 id={`g-${g.key}`}>
            {g.name}
            <span>{g.hint}</span>
          </h2>
          <dl className="words">
            {g.terms.map((t) => (
              <div key={t.term} className={t.term === '커버드콜' ? 'word is-highlight' : 'word'}>
                <dt>
                  {t.term}
                  {t.en && <span className="word-en">{t.en}</span>}
                </dt>
                <dd>
                  {t.desc}
                  {t.more === 'dividend' && (
                    <button type="button" className="inline-link word-more" onClick={onDividend}>
                      배당만으로 살 수 있을까?
                    </button>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <p className="disclaimer">
        용어 설명은 이해를 돕기 위해 단순화했어요. 세율과 기준 금액은 2026년 기준이며 바뀔 수
        있어요.
      </p>
    </div>
  )
}
