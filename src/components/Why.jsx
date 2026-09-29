// "왜 물어보나요?" 접이식 설명 (03 기능명세서 FR-08)
export default function Why({ title = '왜 물어보나요?', children }) {
  return (
    <details className="why">
      <summary>{title}</summary>
      <div className="why-body">{typeof children === 'string' ? <p>{children}</p> : children}</div>
    </details>
  )
}
