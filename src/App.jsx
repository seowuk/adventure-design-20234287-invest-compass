import { useEffect, useState } from 'react'
import Start from './screens/Start'
import Quiz from './screens/Quiz'
import Result from './screens/Result'
import Account from './screens/Account'
import Calculator from './screens/Calculator'
import Learn from './screens/Learn'
import Global from './screens/Global'
import Words from './screens/Words'
import Dividend from './screens/Dividend'
import Brokers from './screens/Brokers'
import Feedback from './screens/Feedback'
import Extras from './screens/Extras'
import { diagnose } from './lib/diagnosis'
import { QUESTIONS } from './data/questions'
import { FUND_QUESTIONS } from './data/fundQuestions'
import { clearSaved, loadAnswers, loadFunds, saveAnswers, saveFunds } from './lib/storage'
import { HomeContext } from './components/HomeContext'
import './App.css'

// 화면 흐름 (03 기능명세서 2장)
// 시작 → 성향 5문항 → 결과 → (선택) 자금 3문항 → 계좌 안내
//                         └────────────→ 계산기
function AppScreens({ screen, setScreen }) {
  // 저장된 진단 기록 { answers, at } — 다시 접속해도 그대로 불러온다
  const [diag, setDiag] = useState(() => loadAnswers())
  const [fundRec, setFundRec] = useState(() => loadFunds())
  const answers = diag?.answers ?? null
  const funds = fundRec?.answers ?? null
  const [calc, setCalc] = useState({ rate: 5, from: 'start' })
  const [learnFrom, setLearnFrom] = useState('start')
  const [globalFrom, setGlobalFrom] = useState('start')
  const [wordsFrom, setWordsFrom] = useState('start')
  const [dividendFrom, setDividendFrom] = useState('words')
  const [extrasFrom, setExtrasFrom] = useState('start')

  const openLearn = (from) => {
    setLearnFrom(from)
    setScreen('learn')
  }

  const openGlobal = (from) => {
    setGlobalFrom(from)
    setScreen('global')
  }

  const openWords = (from) => {
    setWordsFrom(from)
    setScreen('words')
  }

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
          setDiag(saveAnswers(result))
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
          setFundRec(saveFunds(result))
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
        onLearn={() => openLearn('result')}
        onGlobal={() => openGlobal('result')}
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
        onShowResult={() => setScreen('result')}
        onLearn={() => openLearn('account')}
      />
    )
  }

  if (screen === 'learn') {
    return (
      <Learn
        exp={answers ? diagnose(answers).exp : null}
        onBack={() => setScreen(learnFrom)}
        onGlobal={() => openGlobal('learn')}
        onWords={() => openWords('learn')}
        onExtras={() => {
          setExtrasFrom('learn')
          setScreen('extras')
        }}
      />
    )
  }

  if (screen === 'global') {
    return <Global onBack={() => setScreen(globalFrom)} />
  }

  if (screen === 'words') {
    return (
      <Words
        onBack={() => setScreen(wordsFrom)}
        onDividend={() => {
          setDividendFrom('words')
          setScreen('dividend')
        }}
      />
    )
  }

  if (screen === 'dividend') {
    return <Dividend onBack={() => setScreen(dividendFrom)} />
  }

  if (screen === 'extras') {
    return <Extras onBack={() => setScreen(extrasFrom)} />
  }

  if (screen === 'feedback') {
    return <Feedback onBack={() => setScreen('start')} />
  }

  if (screen === 'brokers') {
    return <Brokers onBack={() => setScreen('start')} />
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
      diag={diag}
      funds={fundRec}
      onStart={() => setScreen('quiz')}
      onShowResult={() => setScreen('result')}
      onShowAccount={() => setScreen('account')}
      onFunds={() => setScreen('funds')}
      onCalculator={() => openCalculator(5, 'start')}
      onLearn={() => openLearn('start')}
      onWords={() => openWords('start')}
      onGlobal={() => openGlobal('start')}
      onBrokers={() => setScreen('brokers')}
      onFeedback={() => setScreen('feedback')}
      onExtras={() => {
        setExtrasFrom('start')
        setScreen('extras')
      }}
      onDividend={() => {
        setDividendFrom('start')
        setScreen('dividend')
      }}
      onClear={() => {
        clearSaved()
        setDiag(null)
        setFundRec(null)
      }}
    />
  )
}

// 어느 화면에서든 상단의 홈 버튼으로 시작 화면(내 결과 + 모든 기능)에 갈 수 있다
export default function App() {
  const [screen, setScreen] = useState('start')

  // 화면이 바뀌면 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  return (
    <HomeContext.Provider value={() => setScreen('start')}>
      <AppScreens screen={screen} setScreen={setScreen} />
    </HomeContext.Provider>
  )
}
