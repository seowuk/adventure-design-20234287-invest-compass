// 코스피 데이터 자동 갱신 (GitHub Actions에서 하루 한 번 실행)
//
// 공공데이터포털 "금융위원회_지수시세정보"에서 최근 3년+ 코스피 일별 종가를 받아
//   - 어제(가장 최근 영업일) 종가와 전일 대비
//   - 달마다 마지막 영업일 종가 (모의투자 "최근 3년" 시장용)
// 를 public/data/market.json에 저장한다.
//
// 인증키는 환경변수 DATA_GO_KR_KEY로만 받는다 (GitHub Secrets). 코드와 파일에는 절대 남기지 않는다.
// 받기에 실패하면 기존 파일을 그대로 두고 실패로 끝난다 (앱은 예전 데이터나 기존 시장으로 동작).
//
// 테스트: MOCK_FILE=응답.json node scripts/update-market.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises'

const KEY = process.env.DATA_GO_KR_KEY
const MOCK = process.env.MOCK_FILE
const OUT = new URL('../public/data/market.json', import.meta.url)
const BASE = 'https://apis.data.go.kr/1160100/GetMarketIndexInfoService_V2'
// 활용자가이드 확인 전이라, 가능한 기능 이름을 차례로 시도한다
const OPERATIONS = ['getStockMarketIndex', 'getStockMarketIndex_V2']
const INDEX_NAME = '코스피'

const ymd = (d) => d.toISOString().slice(0, 10).replaceAll('-', '')

async function fetchPage(op, params) {
  const url = new URL(`${BASE}/${op}`)
  url.search = new URLSearchParams({ serviceKey: KEY, resultType: 'json', ...params }).toString()
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  const text = await res.text()
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`JSON이 아닌 응답: ${text.slice(0, 200)}`)
  }
  return json
}

// 응답 모양이 조금 달라도 항목 배열을 찾아낸다
function itemsOf(json) {
  const body = json?.response?.body ?? json?.body
  const header = json?.response?.header ?? json?.header
  if (header && header.resultCode && !['00', '0'].includes(String(header.resultCode))) {
    throw new Error(`API 오류 ${header.resultCode}: ${header.resultMsg}`)
  }
  let items = body?.items?.item ?? body?.items ?? []
  if (!Array.isArray(items)) items = items ? [items] : []
  return { items, total: Number(body?.totalCount ?? items.length) }
}

const num = (v) => (v == null || v === '' ? NaN : Number(String(v).replaceAll(',', '')))

async function loadAll() {
  if (MOCK) return itemsOf(JSON.parse(await readFile(MOCK, 'utf8'))).items
  if (!KEY) throw new Error('DATA_GO_KR_KEY가 없어요 (GitHub Secrets 확인)')
  const end = new Date()
  const begin = new Date(end)
  begin.setFullYear(begin.getFullYear() - 3)
  begin.setDate(begin.getDate() - 45)
  let lastErr
  for (const op of OPERATIONS) {
    try {
      const all = []
      for (let page = 1; page <= 10; page++) {
        const json = await fetchPage(op, {
          idxNm: INDEX_NAME,
          beginBasDt: ymd(begin),
          endBasDt: ymd(new Date(end.getTime() + 86_400_000)),
          numOfRows: '1000',
          pageNo: String(page),
        })
        const { items, total } = itemsOf(json)
        if (page === 1) {
          console.log(`기능 ${op}: 전체 ${total}건`)
          if (items[0]) console.log('첫 항목 모양:', JSON.stringify(items[0]))
        }
        all.push(...items)
        if (all.length >= total || items.length === 0) break
      }
      if (all.length) return all
      lastErr = new Error(`${op}: 결과 0건`)
    } catch (e) {
      console.log(`기능 ${op} 실패: ${e.message}`)
      lastErr = e
    }
  }
  throw lastErr ?? new Error('받은 데이터가 없어요')
}

function build(rows) {
  const days = rows
    .filter((r) => !r.idxNm || String(r.idxNm).trim() === INDEX_NAME)
    .map((r) => ({
      date: String(r.basDt),
      close: num(r.clpr ?? r.clsPrc ?? r.closePrice),
      change: num(r.vs),
      changePct: num(r.fltRt),
    }))
    .filter((d) => /^\d{8}$/.test(d.date) && Number.isFinite(d.close) && d.close > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
  // 같은 날짜가 여러 번 오면 하나만
  const uniq = [...new Map(days.map((d) => [d.date, d])).values()]
  if (uniq.length < 200) throw new Error(`일별 데이터가 너무 적어요 (${uniq.length}일)`)

  // 달마다 마지막 영업일 종가
  const byMonth = new Map()
  for (const d of uniq) byMonth.set(`${d.date.slice(0, 4)}-${d.date.slice(4, 6)}`, d.close)
  const monthly = [...byMonth.entries()].map(([month, close]) => ({ month, close }))

  const last = uniq[uniq.length - 1]
  const prev = uniq[uniq.length - 2]
  const change = Number.isFinite(last.change) ? last.change : last.close - prev.close
  const changePct = Number.isFinite(last.changePct) ? last.changePct : (change / prev.close) * 100
  const iso = (s) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`

  return {
    updatedAt: new Date().toISOString(),
    source: '금융위원회_지수시세정보 (공공데이터포털, 한국거래소 전일 종가 기준)',
    kospi: {
      latest: { date: iso(last.date), close: last.close, change, changePct },
      monthly: monthly.slice(-37),
    },
  }
}

const rows = await loadAll()
const data = build(rows)
await mkdir(new URL('../public/data/', import.meta.url), { recursive: true })
await writeFile(OUT, JSON.stringify(data, null, 2) + '\n')
console.log(`저장: ${data.kospi.latest.date} 코스피 ${data.kospi.latest.close} (${data.kospi.monthly.length}개월)`)
