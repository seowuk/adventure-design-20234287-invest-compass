// 진단 답변을 이 브라우저에만 저장 (서버로 보내지 않음)
function load(key, length) {
  try {
    const raw = localStorage.getItem(key)
    const value = raw ? JSON.parse(raw) : null
    return Array.isArray(value) && value.length === length ? value : null
  } catch {
    return null
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 저장이 막힌 브라우저에서는 조용히 넘어간다
  }
}

const ANSWERS = 'invest-compass:answers'
const FUNDS = 'invest-compass:funds'

export const loadAnswers = () => load(ANSWERS, 5)
export const saveAnswers = (v) => save(ANSWERS, v)
export const loadFunds = () => load(FUNDS, 3)
export const saveFunds = (v) => save(FUNDS, v)
