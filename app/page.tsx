"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Navbar from "./components/Navbar"
import StockList from "./components/StockList"
import StockListSkeleton from "./components/StockListSkeleton"
import CompareModal from "./components/CompareModal"
import type { StockData, Stock } from "./types/stock"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function Home() {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStocks, setSelectedStocks] = useState<Stock[]>([])
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const lastFetchRef = useRef<number>(0)
  const MIN_FETCH_INTERVAL = 60000 // 1 minute minimum between fetches

  const fetchStocks = useCallback(
    async (force = false) => {
      const now = Date.now()
      if (!force && now - lastFetchRef.current < MIN_FETCH_INTERVAL) {
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/stocks")
        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        setStockData(data)
        lastFetchRef.current = now

        if (data.fromCache && data.stale) {
          toast({
            title: "Using stale data",
            description: "Showing last available data. Will update soon.",
            variant: "default",
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch stock data"
        setError(message)
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    fetchStocks(true)
    const interval = setInterval(() => fetchStocks(), MIN_FETCH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchStocks])

  // const handleManualRefresh = () => {
  //   fetchStocks(true)
  // }

  const handleSelectStock = (stock: Stock, isSelected: boolean) => {
    setSelectedStocks((prev) =>
      isSelected ? [...prev, stock].slice(0, 2) : prev.filter((s) => s.symbol !== stock.symbol),
    )
  }

  const handleCompare = () => {
    if (selectedStocks.length === 2) {
      setIsCompareModalOpen(true)
    } else {
      toast({
        title: "Select two stocks",
        description: "Please select exactly two stocks to compare.",
        variant: "default",
      })
    }
  }

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
            <div className="flex items-center gap-4">
              {stockData && (
                <p className="text-sm text-gray-400">Last updated: {new Date(stockData.timestamp).toLocaleString()}</p>
              )}
              {/* <Button
                onClick={handleManualRefresh}
                variant="outline"
                size="sm"
                disabled={loading || Date.now() - lastFetchRef.current < MIN_FETCH_INTERVAL}
              >
                Refresh
              </Button> */}
            </div>
          </div>

          {error && (
            <Alert className="mb-6 bg-red-900/20 border-red-600/50 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading && !stockData ? (
              <>
                <StockListSkeleton />
                <StockListSkeleton />
              </>
            ) : (
              stockData && (
                <>
                  <StockList
                    title="Top Movers"
                    stocks={stockData.topGainers}
                    type="mover"
                    onSelectStock={handleSelectStock}
                    selectedStocks={selectedStocks}
                  />
                  <StockList
                    title="Top Losers"
                    stocks={stockData.topLosers}
                    type="loser"
                    onSelectStock={handleSelectStock}
                    selectedStocks={selectedStocks}
                  />
                </>
              )
            )}
          </div>
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleCompare}
              disabled={selectedStocks.length !== 2}
              className="bg-[#00FFA3] text-black hover:bg-[#00CC82]"
            >
              Compare Selected Stocks
            </Button>
          </div>
        </div>
      </main>
      {isCompareModalOpen && <CompareModal stocks={selectedStocks} onClose={() => setIsCompareModalOpen(false)} />}
    </div>
  )
}

