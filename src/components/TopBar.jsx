import { useContext } from 'react'
import BrandMark from './BrandMark'
import { HomeContext } from './HomeContext'

export default function TopBar({ onBack, backLabel = '뒤로 가기', hideHome = false }) {
  const goHome = useContext(HomeContext)

  return (
    <header className="topbar">
      {onBack && (
        <button type="button" className="back" onClick={onBack} aria-label={backLabel}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M15 5 L8 12 L15 19"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      <span className="brand">
        <BrandMark />
        투자 나침반
      </span>
      {goHome && !hideHome && (
        <button type="button" className="home-btn" onClick={goHome} aria-label="홈으로">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <span>홈</span>
        </button>
      )}
    </header>
  )
}
