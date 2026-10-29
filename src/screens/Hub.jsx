import { useState } from 'react'
import TabBar from '../components/TabBar'
import { DESIGNS, applyDesign, getDesign } from '../lib/design'

// 탭마다 보여줄 목록. to는 App의 화면 이름
function sections(tab, has) {
  if (tab === 'tab-plan')
    return {
      strong: '계획',
      serif: '세우기',
      lead: '내 돈을 어디에, 얼마씩, 몇 년 동안',
      items: [
        { title: '나만의 자금 계획', sub: '비상금부터 적금, ISA, 연금까지 나눠 담기', to: 'plan', star: true },
        { title: '1억, 몇 년이면 될까', sub: '매달 넣는 돈별로 걸리는 시간', to: 'goal' },
        {
          title: '내 돈에 맞는 계좌',
          sub: has.funds ? 'ISA·연금저축·IRP 중 내 방향' : '3문항으로 내 돈의 성격 알아보기',
          to: has.funds ? 'account' : 'funds',
        },
        { title: has.diag ? '투자 성향 다시 진단하기' : '투자 성향 진단하기', sub: '6문항, 1분', to: 'quiz' },
      ],
    }
  if (tab === 'tab-try')
    return {
      strong: '직접',
      serif: '겪어보기',
      lead: '숫자를 바꿔보고, 떨어지는 시장도 미리 겪어봐요',
      items: [
        { title: '모의투자', sub: '실제 코스피·S&P 500의 3년을 가상의 1,000만원으로', to: 'sim', star: true },
        { title: '복리 계산기', sub: '매달·목돈 계산, 하락 시나리오', to: 'calc' },
        { title: '배당만으로 살 수 있을까', sub: '필요한 원금과 물가의 영향', to: 'dividend' },
      ],
    }
  if (tab === 'tab-learn')
    return {
      strong: '쉽게',
      serif: '공부하기',
      lead: '막히는 단어부터, 수준에 맞는 자료까지',
      items: [
        { title: '투자 용어 사전', sub: '코스피부터 커버드콜까지 46개', to: 'words', star: true },
        { title: '책과 공식 사이트', sub: '투자 경험에 맞춘 수준별 추천', to: 'learn' },
        { title: '이런 것도 있어요: 금테크', sub: '1g씩 모아 골드바로 받는 방법', to: 'extras' },
      ],
    }
  return {
    strong: '더',
    serif: '넓게 보기',
    lead: '해외 시장과 증권사, 그리고 설정',
    items: [
      { title: '해외 투자, 어떻게 볼까', sub: 'ETF와 개별 주식, 미국 대표 기업 10곳', to: 'global', star: true },
      { title: '증권사 앱 고르기', sub: '증권사와 운용사의 차이, 비교 기준', to: 'brokers' },
      { title: '이 앱 평가하기', sub: '별점과 아쉬운 점을 남겨주세요', to: 'feedback' },
    ],
  }
}

export default function Hub({ tab, onTab, go, has, onClear }) {
  const s = sections(tab, has)
  const [design, setDesign] = useState(getDesign)

  return (
    <div className="screen hub">
      <h1 className="page-title">
        <span className="t-strong">{s.strong}</span>
        <span className="t-serif">{s.serif}</span>
      </h1>
      <p className="page-lead">{s.lead}</p>

      <ul className="hub-list">
        {s.items.map((it) => (
          <li key={it.title}>
            <button type="button" className={`hub-row${it.star ? ' is-star' : ''}`} onClick={() => go(it.to)}>
              <span className="hub-text">
                <strong>{it.title}</strong>
                <span>{it.sub}</span>
              </span>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {tab === 'tab-explore' && (
        <section className="hub-settings" aria-label="설정">
          <h2>설정</h2>
          <div className="design-switch" role="group" aria-label="디자인">
            <span>디자인</span>
            {DESIGNS.map((d) => (
              <button
                key={d.key}
                type="button"
                aria-pressed={design === d.key}
                onClick={() => {
                  applyDesign(d.key)
                  setDesign(d.key)
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="hub-privacy">
            진단 결과와 계획은 이 기기의 이 브라우저에만 저장돼요. 서버로 보내지 않아요.{' '}
            <button type="button" className="inline-link" onClick={onClear}>
              이 기기에서 모두 지우기
            </button>
          </p>
        </section>
      )}

      <p className="disclaimer">교육 목적의 서비스이며 투자 자문이 아니에요.</p>
      <TabBar current={tab} onTab={onTab} />
    </div>
  )
}
