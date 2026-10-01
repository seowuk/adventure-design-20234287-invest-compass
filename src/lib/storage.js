// 진단 답변을 이 브라우저에만 저장 (서버로 보내지 않음)
// 저장 형식: { answers: [...], at: "진단한 시각(ISO)" }
import { QUESTIONS } from '../data/questions'
import { FUND_QUESTIONS } from '../data/fundQuestions'

const ANSWERS = 'invest-compass:answers'
const FUNDS = 'invest-compass:funds'

function load(key, length) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const value = JSON.parse(raw)
    // 예전 형식(답변 배열만 저장)도 읽어준다
    const answers = Array.isArray(value) ? value : value?.answers
    // 문항 수가 바뀌면 예전 답변은 자동으로 무시된다
    if (!Array.isArray(answers) || answers.length !== length) return null
    return { answers, at: Array.isArray(value) ? null : (value.at ?? null) }
  } catch {
    return null
  }
}

function save(key, answers) {
  const record = { answers, at: new Date().toISOString() }
  try {
    localStorage.setItem(key, JSON.stringify(record))
  } catch {
    // 저장이 막힌 브라우저에서는 이번 방문 동안만 유지된다
  }
  return record
}

export const loadAnswers = () => load(ANSWERS, QUESTIONS.length)
export const saveAnswers = (answers) => save(ANSWERS, answers)
export const loadFunds = () => load(FUNDS, FUND_QUESTIONS.length)
export const saveFunds = (answers) => save(FUNDS, answers)

// 공용 컴퓨터 등에서 내 결과를 지울 때
export function clearSaved() {
  try {
    localStorage.removeItem(ANSWERS)
    localStorage.removeItem(FUNDS)
  } catch {
    // 무시
  }
}

// "9월 30일" 형식
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}
