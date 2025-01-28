import { NextResponse } from "next/server"
import { cache } from "../utils/cache"

const FINANCIAL_MODELING_PREP_API_KEY = process.env.FINANCIAL_MODELING_PREP_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
  }

  // Check cache first
  const cacheKey = `historical_${symbol}`
  const cachedData = cache.get(cacheKey)
  if (cachedData) {
    return NextResponse.json(cachedData)
  }

  try {
    console.log(`Fetching historical data for ${symbol}`)

    // Explicitly request 365 days of data
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?timeseries=365&apikey=${FINANCIAL_MODELING_PREP_API_KEY}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.historical || !Array.isArray(data.historical)) {
      throw new Error("Invalid data structure received from API")
    }

    // Transform and validate the data
    // Ensure we only get the last 365 days and sort by date
    const historicalData = data.historical
      .slice(0, 365)
      .map((item: any) => ({
        date: item.date,
        close: Number(item.close),
      }))
      .filter((item: any) => !isNaN(item.close))
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (historicalData.length === 0) {
      throw new Error("No valid historical data found")
    }

    // Cache the data for 1 hour
    cache.set(cacheKey, historicalData, 3600000)

    return NextResponse.json(historicalData)
  } catch (error) {
    console.error("Error fetching historical stock data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch historical stock data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

