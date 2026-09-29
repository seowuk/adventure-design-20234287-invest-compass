export default function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="18" height="18">
        <g transform="rotate(35 12 12)">
          <path d="M12 2 L15.5 12 L8.5 12 Z" fill="var(--sun)" />
          <path d="M12 22 L15.5 12 L8.5 12 Z" fill="#fff" opacity="0.85" />
        </g>
      </svg>
    </span>
  )
}
