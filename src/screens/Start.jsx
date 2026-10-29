import TopBar from '../components/TopBar'
import TabBar from '../components/TabBar'
import Onboarding from '../components/Onboarding'
import HomePlanCard from '../components/HomePlanCard'
import { loadPlanInput } from '../lib/plan'
import { formatDate } from '../lib/storage'
import { classifyFunds } from '../lib/accounts'
import { diagnose } from '../lib/diagnosis'
import { TYPES } from '../data/results'
import { FUND_TYPES } from '../data/accounts'

// 홈: 처음 온 사람은 소개 4장, 그다음부터는 "나만의 자금 계획"이 메인
export default function Start({
  diag,
  funds,
  onboarded,
  onStart,
  onBrowse,
  onShowResult,
  onShowAccount,
  onFunds,
  onPlan,
  onSim,
  onGoal,
  onTab,
}) {
  const savedPlan = loadPlanInput()

  if (!onboarded && !diag && !savedPlan) {
    return <Onboarding onStart={onStart} onBrowse={onBrowse} />
  }

  const type = diag ? TYPES[diagnose(diag.answers).type] : null
  const fund = funds ? FUND_TYPES[classifyFunds(funds.answers).type] : null
  const date = diag ? formatDate(diag.at) : ''

  return (
    <div className="screen home">
      <TopBar hideHome />

      <p className="home-greet">{diag ? `다시 오셨네요 · ${date} 진단` : '반가워요'}</p>
      <h1 className="page-title">
        <span className="t-strong">나만의</span>
        <span className="t-serif">자금 계획</span>
      </h1>

      {savedPlan ? (
        <HomePlanCard planInput={savedPlan} onOpen={onPlan} />
      ) : (
        <div className="hp-empty">
          <div className="hp-empty-preview" aria-hidden="true">
            <HomePlanCard demo />
          </div>
          <div className="hp-empty-cta">
            <p>매달 모으는 돈을 어디에 얼마씩 나눌지, 1분이면 내 계획이 생겨요</p>
            <button type="button" className="ob-primary" onClick={onPlan}>
              내 계획 만들기
            </button>
          </div>
        </div>
      )}

      <div className="home-chips">
        {type ? (
          <button type="button" className="home-chip" onClick={onShowResult}>
            <span>내 출발점</span>
            <strong>{type.name}</strong>
          </button>
        ) : (
          <button type="button" className="home-chip is-cta" onClick={onStart}>
            <span>1분 진단</span>
            <strong>투자 성향 알아보기</strong>
          </button>
        )}
        {fund ? (
          <button type="button" className="home-chip" onClick={onShowAccount}>
            <span>내 돈</span>
            <strong>{fund.name}</strong>
          </button>
        ) : (
          type && (
            <button type="button" className="home-chip is-cta" onClick={onFunds}>
              <span>3문항 더</span>
              <strong>내 돈의 성격</strong>
            </button>
          )
        )}
      </div>

      <h2 className="home-sub">이어서 해볼 것</h2>
      <ul className="hub-list">
        <li>
          <button type="button" className="hub-row" onClick={onSim}>
            <span className="hub-text">
              <strong>떨어질 때의 나를 미리 만나기</strong>
              <span>모의투자 · 가상의 1,000만원으로 3년</span>
            </span>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </li>
        <li>
          <button type="button" className="hub-row" onClick={onGoal}>
            <span className="hub-text">
              <strong>1억, 몇 년이면 될까</strong>
              <span>매달 넣는 돈별로 걸리는 시간</span>
            </span>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </li>
      </ul>

      <p className="disclaimer">교육 목적의 서비스이며 투자 자문이 아니에요.</p>
      <TabBar current="start" onTab={onTab} />
    </div>
  )
}
