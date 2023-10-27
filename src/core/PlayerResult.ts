export interface Result {
  winner?: boolean
  busted?: boolean
  total: number
}

export interface DealerResult extends Result {
  dealer: true
}

export interface PlayerResult extends Result {
  name: string
}

export function isDealerResult(result: Result): result is DealerResult {
  return !!(result as DealerResult).dealer
}
export function isPlayerResult(result: Result): result is PlayerResult {
  return !isDealerResult(result)
}

export function resultsHasBlackjack(results: Result[]) {
  return results.some((result) => result.winner)
}
export function findBlackjackResult(results: Result[]) {
  return results.find((result) => result.winner)
}
export function resultsBusted(results: Result[]) {
  return results.every((result) => result.busted)
}
export function getMaximumTotal(results: Result[]) {
  return results.reduce((max, result) => {
    return result.busted ? max : Math.max(max, result.total)
  }, 0)
}
