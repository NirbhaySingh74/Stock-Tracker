export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changesPercentage: number
}

export interface StockData {
  topGainers: Stock[]
  topLosers: Stock[]
  timestamp: string
  fromCache?: boolean
  stale?: boolean
}

