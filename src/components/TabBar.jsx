// 앱 아래 탭: 홈 / 계획 / 체험 / 공부 / 탐색(나침반)
const TABS = [
  { key: 'start', label: '홈', d: 'M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z' },
  { key: 'tab-plan', label: '계획', d: 'M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12z M15 3.9V9h5.1A8.6 8.6 0 0 0 15 3.9z' },
  { key: 'tab-try', label: '체험', d: 'M4 18l5-6 4 3 7-8 M15 7h5v5' },
  { key: 'tab-learn', label: '공부', d: 'M5 4.5h10.5a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z M5 17a3 3 0 0 1 3-3h10.5' },
  { key: 'tab-explore', label: '탐색', compass: true },
]

export default function TabBar({ current, onTab }) {
  return (
    <nav className="tabbar" aria-label="주요 메뉴">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`tab${current === t.key ? ' is-on' : ''}`}
          aria-current={current === t.key ? 'page' : undefined}
          onClick={() => onTab(t.key)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {t.compass ? (
              <>
                <circle cx="12" cy="12" r="9" />
                <path d="m15.5 8.5-2 5-5 2 2-5z" fill="currentColor" stroke="none" />
              </>
            ) : (
              <path d={t.d} />
            )}
          </svg>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
