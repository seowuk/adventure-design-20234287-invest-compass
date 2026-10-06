// 시작 화면의 앱형 바로가기 메뉴
const ICONS = {
  calc: (
    <path d="M5 19V11M10 19V7M15 19v-5M20 19V4" strokeLinecap="round" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5M12 3.5C9.4 5.9 8.2 8.7 8.2 12s1.2 6.1 3.8 8.5" />
    </>
  ),
  words: (
    <>
      <path d="M5 4.5h10.5a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z" strokeLinejoin="round" />
      <path d="M5 17a3 3 0 0 1 3-3h10.5M9 8.5h6" strokeLinecap="round" />
    </>
  ),
  books: (
    <>
      <path d="M4.5 5h4v14h-4zM10 5h4v14h-4z" strokeLinejoin="round" />
      <path d="m15.5 6.2 3.8-1 3.2 13.6-3.8 1z" strokeLinejoin="round" />
    </>
  ),
}

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}

export default function QuickMenu({ items }) {
  return (
    <nav className="quick" aria-label="바로가기">
      {items.map((it) => (
        <button key={it.label} type="button" className="quick-tile" onClick={it.onClick}>
          <span className="quick-icon">
            <Icon name={it.icon} />
          </span>
          <span className="quick-label">{it.label}</span>
          <span className="quick-sub">{it.sub}</span>
        </button>
      ))}
    </nav>
  )
}
