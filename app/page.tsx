"use client"

import { useEffect, useState } from "react"
import Navbar from "./components/Navbar"
import StockList from "./components/StockList"
import StockListSkeleton from "./components/StockListSkeleton"
import type { StockData } from "./types/stock"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchStocks = async () => {
    try {
      const response = await fetch("/api/stocks")
      if (!response.ok) throw new Error("Failed to fetch stock data")
      
      const data: StockData = await response.json()
      setStockData(data)
      // console.log("data - ",data);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch stock data. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStocks()

    const interval = setInterval(fetchStocks, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [toast])

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Market Overview</h1>
              <p className="text-gray-400 mt-1">Real-time stock market data</p>
            </div>
            {stockData && <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <>
                <StockListSkeleton />
                <StockListSkeleton />
              </>
            ) : (
              stockData && (
                <>
                  <StockList title="Top Movers" stocks={stockData.topGainers} type="mover" />
                  <StockList title="Top Losers" stocks={stockData.topLosers} type="loser" />
                </>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  )
}