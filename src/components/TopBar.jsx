import BrandMark from './BrandMark'

export default function TopBar({ onBack, backLabel = '뒤로 가기' }) {
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
    </header>
  )
}
