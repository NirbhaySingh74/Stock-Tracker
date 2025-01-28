import { NextResponse } from "next/server"
import { cache } from "../utils/cache"

const FINANCIAL_MODELING_PREP_API_KEY = process.env.FINANCIAL_MODELING_PREP_API_KEY
const CACHE_KEY = "stock_market_data"
const CACHE_TTL = 60000 // 1 minute cache

export async function GET() {
  try {
    // Check cache first
    const cachedData = cache.get(CACHE_KEY)
    if (cachedData) {
      return NextResponse.json({ ...cachedData, fromCache: true })
    }

    // Fetch new data
    const [gainersResponse, losersResponse] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`),
      fetch(`https://financialmodelingprep.com/api/v3/stock_market/losers?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`),
    ])

    // Check for rate limiting or errors
    if (!gainersResponse.ok || !losersResponse.ok) {
      throw new Error("API request failed")
    }

    const [gainers, losers] = await Promise.all([gainersResponse.json(), losersResponse.json()])

    // Transform and limit to top 10 for each category
    const data = {
      topGainers: gainers.slice(0, 10).map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changesPercentage: stock.changesPercentage,
      })),
      topLosers: losers.slice(0, 10).map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changesPercentage: stock.changesPercentage,
      })),
      timestamp: new Date().toISOString(),
    }

    // Cache the successful response
    cache.set(CACHE_KEY, data, CACHE_TTL)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching stock market movers:", error)

    // Try to return cached data if available
    const cachedFallback = cache.get(CACHE_KEY)
    if (cachedFallback) {
      return NextResponse.json({ ...cachedFallback, fromCache: true, stale: true })
    }

    return NextResponse.json(
      {
        error: "Failed to fetch stock market data",
      },
      { status: 500 },
    )
  }
}

