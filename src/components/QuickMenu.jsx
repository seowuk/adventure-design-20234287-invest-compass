// 시작 화면의 앱형 바로가기 메뉴
const ICONS = {
  phone: (
    <>
      <rect x="6.5" y="3" width="11" height="18" rx="2.5" />
      <path d="M10.5 18h3M9.5 12.5l2 2 3.5-4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="10" cy="7" rx="6" ry="2.6" />
      <path d="M4 7v4c0 1.4 2.7 2.6 6 2.6M4 11v4c0 1.4 2.7 2.6 6 2.6" />
      <ellipse cx="15.5" cy="14" rx="5" ry="2.2" />
      <path d="M10.5 14v3.6c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2V14" />
    </>
  ),
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
