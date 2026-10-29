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
import Sim from './screens/Sim'
import Goal from './screens/Goal'
import Plan from './screens/Plan'
import { diagnose } from './lib/diagnosis'
import { QUESTIONS } from './data/questions'
import { FUND_QUESTIONS } from './data/fundQuestions'
import { clearSaved, loadAnswers, loadFunds, saveAnswers, saveFunds } from './lib/storage'
import { HomeContext } from './components/HomeContext'
import Hub from './screens/Hub'
import './App.css'
// 디자인 v2 덧씌우기. 이 줄을 지우면 원래 디자인으로 돌아간다
import './theme.css'
// 디자인 v3 모노 (data-design="mono"일 때만 적용)
import './theme-mono.css'
// 디자인 v4 밤하늘 (data-design="night"일 때만 적용, 기본)
import './theme-night.css'

// 화면 흐름 (03 기능명세서 2장)
// 시작 → 성향 5문항 → 결과 → (선택) 자금 3문항 → 계좌 안내
//                         └────────────→ 계산기
const ONBOARDED = 'invest-compass:onboarded'
const readOnboarded = () => {
  try {
    return localStorage.getItem(ONBOARDED) === '1'
  } catch {
    return false
  }
}

function AppScreens({ screen, setScreen, tab }) {
  const [onboarded, setOnboarded] = useState(readOnboarded)
  const markOnboarded = () => {
    try {
      localStorage.setItem(ONBOARDED, '1')
    } catch {
      // 저장이 막혀도 이번에는 넘어간다
    }
    setOnboarded(true)
  }
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
  const [simFrom, setSimFrom] = useState('start')
  const [plan, setPlan] = useState({ from: 'goal', monthly: null })

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

  // 계획 화면 열기: 계좌 안내처럼 위쪽에서 그려지는 화면도 쓰므로 모든 화면보다 먼저 정의한다
  const openPlan = (from, monthly = null) => {
    setPlan({ from, monthly })
    setScreen('plan')
  }

  if (screen === 'quiz') {
    return (
      <Quiz
        key="quiz"
        questions={QUESTIONS}
        onExit={() => setScreen(tab)}
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
        onSim={() => {
          setSimFrom('result')
          setScreen('sim')
        }}
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
        onPlan={() => openPlan('account')}
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

  if (screen === 'goal') {
    return <Goal onBack={() => setScreen(tab)} onPlan={(m) => openPlan('goal', m)} />
  }

  if (screen === 'plan') {
    return (
      <Plan
        key={`${plan.from}-${plan.monthly}`}
        answers={answers}
        funds={funds}
        initialMonthly={plan.monthly}
        onBack={() => setScreen(plan.from)}
      />
    )
  }

  if (screen === 'sim') {
    return <Sim answers={answers} onBack={() => setScreen(simFrom)} />
  }

  if (screen === 'extras') {
    return <Extras onBack={() => setScreen(extrasFrom)} />
  }

  if (screen === 'feedback') {
    return <Feedback onBack={() => setScreen(tab)} />
  }

  if (screen === 'brokers') {
    return <Brokers onBack={() => setScreen(tab)} />
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

  const clearAll = () => {
    clearSaved()
    setDiag(null)
    setFundRec(null)
    setOnboarded(false)
    setScreen('start')
  }

  // 목록에서 고른 화면으로 (돌아올 곳은 지금 탭)
  const go = (to) => {
    if (to === 'plan') return openPlan(tab)
    if (to === 'calc') return openCalculator(5, tab)
    if (to === 'learn') return openLearn(tab)
    if (to === 'words') return openWords(tab)
    if (to === 'global') return openGlobal(tab)
    if (to === 'sim') {
      setSimFrom(tab)
      return setScreen('sim')
    }
    if (to === 'extras') {
      setExtrasFrom(tab)
      return setScreen('extras')
    }
    if (to === 'dividend') {
      setDividendFrom(tab)
      return setScreen('dividend')
    }
    return setScreen(to)
  }

  if (screen.startsWith('tab-')) {
    return (
      <Hub
        tab={screen}
        onTab={setScreen}
        go={go}
        has={{ diag: Boolean(diag), funds: Boolean(fundRec) }}
        onClear={clearAll}
      />
    )
  }

  return (
    <Start
      diag={diag}
      funds={fundRec}
      onboarded={onboarded}
      onStart={() => {
        markOnboarded()
        setScreen('quiz')
      }}
      onBrowse={markOnboarded}
      onShowResult={() => setScreen('result')}
      onShowAccount={() => setScreen('account')}
      onFunds={() => setScreen('funds')}
      onPlan={() => openPlan('start')}
      onSim={() => go('sim')}
      onGoal={() => setScreen('goal')}
      onTab={setScreen}
    />
  )
}

// 어느 화면에서든 상단의 홈 버튼으로 시작 화면(내 결과 + 모든 기능)에 갈 수 있다
export default function App() {
  const [screen, setScreen] = useState('start')
  const [tab, setTab] = useState('start')
  // 홈이나 탭 화면에 오면 그 탭을 기억해서, 자세한 화면의 뒤로 가기가 그곳으로 돌아가게
  if ((screen === 'start' || screen.startsWith('tab-')) && screen !== tab) setTab(screen)

  // 화면이 바뀌면 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  return (
    <HomeContext.Provider value={() => setScreen('start')}>
      <AppScreens screen={screen} setScreen={setScreen} tab={tab} />
    </HomeContext.Provider>
  )
}
