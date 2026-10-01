import { classifyFunds } from '../lib/accounts'
import { diagnose } from '../lib/diagnosis'
import { TYPES } from '../data/results'
import { FUND_TYPES } from '../data/accounts'

// 투자 출발점과 돈의 성격을 나란히 보여주는 요약 타일
export default function Summary({ answers, funds, onShowResult, onShowAccount, onFunds }) {
  const type = answers ? TYPES[diagnose(answers).type] : null
  const fund = funds ? FUND_TYPES[classifyFunds(funds).type] : null

  return (
    <div className="summary">
      <button
        type="button"
        className="summary-tile"
        onClick={onShowResult}
        disabled={!onShowResult || !type}
      >
        <span className="summary-label">투자 출발점</span>
        <span className="summary-value">{type ? type.name : '아직 안 함'}</span>
        <span className="summary-hint">무엇을 담을까</span>
      </button>

      {fund ? (
        <button
          type="button"
          className="summary-tile"
          onClick={onShowAccount}
          disabled={!onShowAccount}
        >
          <span className="summary-label">내 돈의 성격</span>
          <span className="summary-value">{fund.name}</span>
          <span className="summary-hint">어디에 담을까</span>
        </button>
      ) : (
        <button
          type="button"
          className="summary-tile is-empty"
          onClick={onFunds}
          disabled={!onFunds}
        >
          <span className="summary-label">내 돈의 성격</span>
          <span className="summary-value">3문항 더</span>
          <span className="summary-hint">계좌 방향 알아보기</span>
        </button>
      )}
    </div>
  )
}
