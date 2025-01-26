import { NextResponse } from "next/server"

const FINANCIAL_MODELING_PREP_API_KEY = process.env.FINANCIAL_MODELING_PREP_API_KEY

export async function GET() {
 try {
   // Fetch gainers and losers simultaneously
   const [gainersResponse, losersResponse] = await Promise.all([
     fetch(`https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`),
     fetch(`https://financialmodelingprep.com/api/v3/stock_market/losers?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`)
   ])

   const gainers = await gainersResponse.json()
   const losers = await losersResponse.json()

   // Transform and limit to top 10 for each category
   const topGainers = gainers.slice(0, 10).map((stock: { 
    symbol: string;
    name: string; 
    price: number;
    change: number;
    changesPercentage: number;
  }) => ({
    symbol: stock.symbol,
    name: stock.name, 
    price: stock.price,
    change: stock.change,
    changesPercentage: stock.changesPercentage
  }))
  
  const topLosers = losers.slice(0, 10).map((stock: {
    symbol: string;
    name: string;
    price: number; 
    change: number;
    changesPercentage: number;
  }) => ({
    symbol: stock.symbol,
    name: stock.name,
    price: stock.price,
    change: stock.change,
    changesPercentage: stock.changesPercentage
  }))

   return NextResponse.json({
     topGainers,
     topLosers
   })
 } catch (error) {
   console.error("Error fetching stock market movers:", error)
   return NextResponse.json({
     error: "Failed to fetch stock market data"
   }, { status: 500 })
 }
}