import { useState } from 'react'
import TopBar from '../components/TopBar'

// 앱 평가 (Netlify Forms로 익명 전송, 사이트 주인만 Netlify 관리 화면에서 볼 수 있음)
// index.html에 같은 이름(feedback)의 숨은 폼이 있어야 Netlify가 배포할 때 폼을 인식한다.

const LABELS = ['', '별로예요', '아쉬워요', '보통이에요', '좋아요', '최고예요']
const SENT_KEY = 'invest-compass:feedback-at'

// 글을 쓰지 않아도 누르기만 하면 남길 수 있는 선택지
const HELPFUL = ['성향 진단', '계좌 안내', '복리 계산기', '하락 시나리오', '모의투자', '해외 투자', '용어 사전', '금테크']
const CONFUSING = ['용어가 어려웠어요', '화면이 너무 많아요', '결과가 나와 안 맞았어요', '숫자가 많아 복잡해요', '딱히 없었어요']

const QUESTIONS = [
  { name: 'lacking', label: '부족했던 점', placeholder: '이해하기 어려웠거나 정보가 모자랐던 부분' },
  { name: 'regret', label: '아쉬웠던 점', placeholder: '불편했거나 기대와 달랐던 부분' },
  { name: 'wish', label: '있으면 좋겠는 기능', placeholder: '이런 게 있으면 더 쓸 것 같다' },
]

const isLocal = () => ['localhost', '127.0.0.1', ''].includes(window.location.hostname)

function Star({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
      <path
        d="M12 3.2l2.6 5.5 6 .7-4.4 4.1 1.2 5.9L12 16.5l-5.4 2.9 1.2-5.9L3.4 9.4l6-.7z"
        fill={filled ? 'var(--sun)' : 'none'}
        stroke={filled ? 'var(--sun)' : 'var(--muted)'}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Feedback({ onBack }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [texts, setTexts] = useState({ lacking: '', regret: '', wish: '' })
  const [helpful, setHelpful] = useState([])
  const [confusing, setConfusing] = useState([])

  const toggle = (list, setList, item) =>
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item])
  const [status, setStatus] = useState('idle') // idle | sending | done | local | offline | rejected
  const [code, setCode] = useState(null)
  const [sentBefore] = useState(() => {
    try {
      return Boolean(localStorage.getItem(SENT_KEY))
    } catch {
      return false
    }
  })

  const shown = hover || rating

  const submit = async (e) => {
    e.preventDefault()
    if (!rating) return

    // 내 컴퓨터(로컬)에서는 Netlify가 없어서 저장되지 않는다
    if (isLocal()) {
      setStatus('local')
      return
    }

    setStatus('sending')
    try {
      const body = new URLSearchParams({
        'form-name': 'feedback',
        rating: String(rating),
        helpful: helpful.join(', '),
        confusing: confusing.join(', '),
        ...texts,
        'bot-field': '',
      })
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      if (!res.ok) {
        // 서버가 거절함: 대부분 Netlify가 아직 폼을 모르는 경우(404)
        setCode(res.status)
        setStatus('rejected')
        return
      }
      try {
        localStorage.setItem(SENT_KEY, new Date().toISOString())
      } catch {
        // 저장이 막혀도 전송은 끝났다
      }
      setStatus('done')
    } catch {
      // 요청 자체가 나가지 못함: 실제 인터넷 문제
      setStatus('offline')
    }
  }

  if (status === 'done') {
    return (
      <div className="screen">
        <TopBar onBack={onBack} />
        <section className="type-stage fb-done">
          <p className="type-caption">평가를 보냈어요</p>
          <p className="type-name">고마워요!</p>
          <p className="type-headline">남겨주신 의견은 이 앱을 만드는 데 큰 도움이 됩니다.</p>
        </section>
        <button type="button" className="btn-secondary" onClick={onBack}>
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="screen">
      <TopBar onBack={onBack} />

      <h1 className="learn-title">이 앱, 어땠나요?</h1>
      <p className="learn-lead">
        {sentBefore
          ? '지난번에도 남겨주셨네요. 고마워요. 달라진 점이 있으면 또 알려주세요.'
          : '별점과 함께 아쉬웠던 점을 남겨주시면 이 앱을 만드는 데 큰 도움이 됩니다.'}
      </p>

      <form className="fb" onSubmit={submit}>
        <fieldset className="fb-stars">
          <legend className="field-label">별점</legend>
          <div className="stars" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="star-btn"
                aria-label={`별 ${n}개, ${LABELS[n]}`}
                aria-pressed={rating === n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onFocus={() => setHover(n)}
                onBlur={() => setHover(0)}
              >
                <Star filled={n <= shown} />
              </button>
            ))}
          </div>
          <p className="stars-label" aria-live="polite">
            {shown ? `${shown}점, ${LABELS[shown]}` : '별을 눌러 점수를 골라주세요'}
          </p>
        </fieldset>

        <fieldset className="fb-pick">
          <legend className="field-label">
            가장 도움이 된 기능 <span className="fb-optional">(여러 개 선택 가능)</span>
          </legend>
          <div className="chips">
            {HELPFUL.map((h) => (
              <button
                key={h}
                type="button"
                className="chip"
                aria-pressed={helpful.includes(h)}
                onClick={() => toggle(helpful, setHelpful, h)}
              >
                {h}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="fb-pick">
          <legend className="field-label">
            헷갈렸던 부분 <span className="fb-optional">(여러 개 선택 가능)</span>
          </legend>
          <div className="chips">
            {CONFUSING.map((c) => (
              <button
                key={c}
                type="button"
                className="chip"
                aria-pressed={confusing.includes(c)}
                onClick={() => toggle(confusing, setConfusing, c)}
              >
                {c}
              </button>
            ))}
          </div>
        </fieldset>

        {QUESTIONS.map((q) => (
          <label key={q.name} className="fb-field">
            <span className="field-label">
              {q.label} <span className="fb-optional">(선택)</span>
            </span>
            <textarea
              name={q.name}
              rows={3}
              maxLength={1000}
              placeholder={q.placeholder}
              value={texts[q.name]}
              onChange={(e) => setTexts({ ...texts, [q.name]: e.target.value })}
            />
          </label>
        ))}

        {/* 스팸 방지용. 사람에게는 보이지 않는다 */}
        <input type="text" name="bot-field" className="sr-only" tabIndex={-1} autoComplete="off" aria-hidden="true" />

        <p className="fb-privacy">
          이름이나 연락처는 받지 않아요. 다만 스팸을 막기 위해 접속 정보(IP 주소)가 사이트 운영
          서비스(Netlify)에 함께 기록돼요. 남긴 내용은 이 앱을 만든 사람만 볼 수 있어요. 개인정보는
          적지 말아주세요.
        </p>

        {status === 'local' && (
          <p className="warn">
            지금은 내 컴퓨터에서 실행 중이라 저장되지 않아요. Netlify 주소에서 남겨주세요.
          </p>
        )}
        {status === 'offline' && (
          <p className="warn">보내지 못했어요. 인터넷 연결을 확인하고 다시 눌러주세요.</p>
        )}
        {status === 'rejected' && (
          <p className="warn">
            지금은 평가를 받을 준비가 안 됐어요 (오류 {code}). 잠시 후 다시 시도해주세요.
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={!rating || status === 'sending'}>
          {status === 'sending' ? '보내는 중' : '평가 보내기'}
          {!rating && <span className="btn-sub">별점을 먼저 골라주세요</span>}
        </button>
      </form>
    </div>
  )
}
