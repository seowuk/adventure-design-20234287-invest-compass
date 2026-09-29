import { useEffect, useState } from 'react'
import Start from './screens/Start'
import Quiz from './screens/Quiz'
import Result from './screens/Result'
import Account from './screens/Account'
import Calculator from './screens/Calculator'
import { QUESTIONS } from './data/questions'
import { FUND_QUESTIONS } from './data/fundQuestions'
import { loadAnswers, loadFunds, saveAnswers, saveFunds } from './lib/storage'
import './App.css'

// 화면 흐름 (03 기능명세서 2장)
// 시작 → 성향 5문항 → 결과 → (선택) 자금 3문항 → 계좌 안내
//                         └────────────→ 계산기
export default function App() {
  const [screen, setScreen] = useState('start')
  const [answers, setAnswers] = useState(() => loadAnswers())
  const [funds, setFunds] = useState(() => loadFunds())
  const [calc, setCalc] = useState({ rate: 5, from: 'start' })

  // 화면이 바뀌면 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  const openCalculator = (rate, from) => {
    setCalc({ rate, from })
    setScreen('calc')
  }

  if (screen === 'quiz') {
    return (
      <Quiz
        key="quiz"
        questions={QUESTIONS}
        onExit={() => setScreen('start')}
        onDone={(result) => {
          setAnswers(result)
          saveAnswers(result)
          setScreen('result')
        }}
      />
    )
  }

  if (screen === 'funds') {
    return (
      <Quiz
        key="funds"
        questions={FUND_QUESTIONS}
        onExit={() => setScreen(answers ? 'result' : 'start')}
        onDone={(result) => {
          setFunds(result)
          saveFunds(result)
          setScreen('account')
        }}
      />
    )
  }

  if (screen === 'result' && answers) {
    return (
      <Result
        answers={answers}
        hasFunds={Boolean(funds)}
        onHome={() => setScreen('start')}
        onRetry={() => setScreen('quiz')}
        onCalculate={(rate) => openCalculator(rate, 'result')}
        onFunds={() => setScreen('funds')}
        onShowAccount={() => setScreen('account')}
      />
    )
  }

  if (screen === 'account' && funds) {
    return (
      <Account
        answers={answers}
        funds={funds}
        onBack={() => setScreen(answers ? 'result' : 'start')}
        onRetry={() => setScreen('funds')}
        onCalculate={(rate) => openCalculator(rate, 'account')}
      />
    )
  }

  if (screen === 'calc') {
    return (
      <Calculator
        key={calc.rate}
        initialRate={calc.rate}
        onBack={() => setScreen(calc.from)}
      />
    )
  }

  return (
    <Start
      hasResult={Boolean(answers)}
      onStart={() => setScreen('quiz')}
      onShowResult={() => setScreen('result')}
      onCalculator={() => openCalculator(5, 'start')}
    />
  )
}
