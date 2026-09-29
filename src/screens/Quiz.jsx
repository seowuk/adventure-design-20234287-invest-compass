import { useEffect, useRef, useState } from 'react'
import TopBar from '../components/TopBar'
import Why from '../components/Why'

function labelOf(question, value) {
  return question.options.find((o) => o.value === value)?.label ?? ''
}

// questions 배열을 받아 1문항 1화면으로 묻고, 마지막에 답변 확인
export default function Quiz({ questions, onExit, onDone }) {
  const TOTAL = questions.length
  // step 0~(TOTAL-1) = 문항, TOTAL = 답변 확인
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(() => Array(TOTAL).fill(null))
  const [editing, setEditing] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    const t = timer
    return () => clearTimeout(t.current)
  }, [])

  const isReview = step === TOTAL
  const progress = isReview ? 100 : ((step + 1) / TOTAL) * 100

  const choose = (value) => {
    const next = [...answers]
    next[step] = value
    setAnswers(next)

    // 고른 게 눈에 보이도록 잠깐 멈췄다가 넘어감
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (editing) {
        setEditing(false)
        setStep(TOTAL)
      } else {
        setStep(step + 1)
      }
    }, 260)
  }

  const goBack = () => {
    clearTimeout(timer.current)
    if (step === 0) onExit()
    else setStep(step - 1)
  }

  const edit = (index) => {
    setEditing(true)
    setStep(index)
  }

  return (
    <div className="screen">
      <TopBar onBack={goBack} />

      <div
        className="progress"
        role="progressbar"
        aria-label="진단 진행률"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <span style={{ width: `${progress}%` }} />
      </div>

      {isReview ? (
        <section className="quiz-step" key="review">
          <h1 className="quiz-title">이렇게 답하셨어요</h1>
          <ol className="review">
            {questions.map((q, i) => (
              <li key={q.id}>
                <button type="button" className="review-item" onClick={() => edit(i)}>
                  <span className="review-q">{q.short}</span>
                  <span className="review-a">{labelOf(q, answers[i])}</span>
                  <span className="review-edit">수정</span>
                </button>
              </li>
            ))}
          </ol>
          <button type="button" className="btn-primary" onClick={() => onDone(answers)}>
            결과 보기
          </button>
        </section>
      ) : (
        <section className="quiz-step" key={questions[step].id}>
          <p className="quiz-count">
            {step + 1} / {TOTAL}
          </p>
          <h1 className="quiz-title">{questions[step].title}</h1>

          <div className="options" role="group" aria-label="답변 선택">
            {questions[step].options.map((o) => (
              <button
                key={o.value}
                type="button"
                className="option"
                aria-pressed={answers[step] === o.value}
                onClick={() => choose(o.value)}
              >
                <span className="option-mark" aria-hidden="true" />
                {o.label}
              </button>
            ))}
          </div>

          <Why>{questions[step].why}</Why>
        </section>
      )}
    </div>
  )
}
