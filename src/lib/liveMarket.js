// 매일 자동 갱신되는 코스피 데이터 읽기 (scripts/update-market.mjs가 만든 파일)
//
// 파일은 GitHub 저장소에 저장되므로, 어디에 배포된 앱이든 같은 주소에서 최신 파일을 읽는다.
// 못 읽으면 null을 돌려주고, 앱은 기존 실제 시장 10개로 그대로 동작한다.

const REMOTE =
  'https://raw.githubusercontent.com/seowuk/adventure-design-20234287-invest-compass/main/public/data/market.json'

export const LIVE_SOURCE = {
  name: '금융위원회_지수시세정보 (공공데이터포털)',
  url: 'https://www.data.go.kr/data/15094807/openapi.do',
}

function valid(j) {
  const k = j?.kospi
  return (
    k &&
    k.latest &&
    Number.isFinite(k.latest.close) &&
    Array.isArray(k.monthly) &&
    k.monthly.every((m) => typeof m.month === 'string' && Number.isFinite(m.close))
  )
}

export async function loadLiveMarket() {
  for (const url of [REMOTE, '/data/market.json']) {
    try {
      const res = await fetch(url, { cache: 'no-cache', signal: AbortSignal.timeout(5000) })
      if (!res.ok) continue
      const json = await res.json()
      if (valid(json)) return json
    } catch {
      // 다음 주소로
    }
  }
  return null
}
