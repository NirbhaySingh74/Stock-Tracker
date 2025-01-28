"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Stock } from "../types/stock"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface CompareModalProps {
  stocks: Stock[]
  onClose: () => void
}

interface HistoricalDataPoint {
  date: string
  close: number
}

interface ChartDataPoint {
  date: string
  [key: string]: number | string
}

export default function CompareModal({ stocks, onClose }: CompareModalProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true)
      setError(null)

      try {
        const responses = await Promise.all(
          stocks.map((stock) =>
            fetch(`/api/historical?symbol=${stock.symbol}`)
              .then((res) => res.json())
              .then((data) => {
                if (data.error) throw new Error(data.error)
                return { symbol: stock.symbol, data }
              }),
          ),
        )

        // Validate responses
        responses.forEach(({ symbol, data }) => {
          if (!Array.isArray(data)) {
            throw new Error(`Invalid data received for ${symbol}`)
          }
        })

        const [stock1Data, stock2Data] = responses

        // Create a map of dates for easier lookup
        const dateMap = new Map<string, { [key: string]: number }>()

        // Process first stock's data
        stock1Data.data.forEach((point: HistoricalDataPoint) => {
          dateMap.set(point.date, {
            [stock1Data.symbol]: point.close,
          })
        })

        // Process second stock's data and find matching dates
        const matchingData: ChartDataPoint[] = []
        stock2Data.data.forEach((point: HistoricalDataPoint) => {
          const existingPoint = dateMap.get(point.date)
          if (existingPoint) {
            matchingData.push({
              date: point.date,
              [stock1Data.symbol]: existingPoint[stock1Data.symbol],
              [stock2Data.symbol]: point.close,
            })
          }
        })

        if (matchingData.length === 0) {
          throw new Error("No matching data points found for comparison")
        }

        // Sort by date and normalize to base 100
        const sortedData = matchingData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Get initial values for normalization
        const initialValues = {
          [stock1Data.symbol]: sortedData[0][stock1Data.symbol] as number,
          [stock2Data.symbol]: sortedData[0][stock2Data.symbol] as number,
        }

        // Calculate relative performance starting from 100
        const normalizedData = sortedData.map((point) => ({
          date: new Date(point.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          [stock1Data.symbol]: ((point[stock1Data.symbol] as number) / initialValues[stock1Data.symbol]) * 100,
          [stock2Data.symbol]: ((point[stock2Data.symbol] as number) / initialValues[stock2Data.symbol]) * 100,
        }))

        setChartData(normalizedData)
      } catch (error) {
        console.error("Error processing historical data:", error)
        setError(error instanceof Error ? error.message : "Failed to load comparison data")
      } finally {
        setLoading(false)
      }
    }

    fetchHistoricalData()
  }, [stocks])

  const formatXAxis = useCallback(
    (value: string) => {
      if (isMobile) {
        // On mobile, show only month
        return new Date(value).toLocaleDateString("en-US", { month: "short" })
      }
      // On desktop, show month and year
      return new Date(value).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    },
    [isMobile],
  )

  const formatTooltipValue = useCallback((value: number) => {
    return [`₹${value.toFixed(2)}`, "Value"]
  }, [])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] overflow-y-auto bg-[#1C1C1C] border-[#2A2A2A] text-white">
        <DialogHeader>
          <DialogTitle className="text-white text-base sm:text-lg">
            Stock Comparison: {stocks.map((s) => s.symbol).join(" vs ")}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center h-[300px] sm:h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-[#00FFA3]" />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-600/50 text-red-500">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && (
          <div className="p-2 sm:p-4">
            <p className="text-gray-400 mb-4 text-sm sm:text-base">
              Showing relative performance of ₹100 invested in each stock over the past 12 months
            </p>
            <div className="w-full h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 5,
                    left: isMobile ? 0 : 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    tick={{ fill: "#666", fontSize: isMobile ? 10 : 12 }}
                    tickFormatter={formatXAxis}
                    interval={isMobile ? 2 : 1}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 50 : 30}
                  />
                  <YAxis
                    stroke="#666"
                    tick={{ fill: "#666", fontSize: isMobile ? 10 : 12 }}
                    label={
                      !isMobile
                        ? {
                            value: "Value of ₹100 invested (₹)",
                            angle: -90,
                            position: "insideLeft",
                            fill: "#666",
                            fontSize: 12,
                          }
                        : undefined
                    }
                    width={isMobile ? 35 : 60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#242424",
                      border: "1px solid #2A2A2A",
                      color: "#fff",
                      fontSize: isMobile ? "12px" : "14px",
                      padding: isMobile ? "4px 8px" : "8px 12px",
                    }}
                    formatter={formatTooltipValue}
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                  <Legend
                    verticalAlign={isMobile ? "bottom" : "top"}
                    height={36}
                    wrapperStyle={{
                      paddingTop: isMobile ? "20px" : "0px",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                  />
                  {stocks.map((stock, index) => (
                    <Line
                      key={stock.symbol}
                      type="monotone"
                      dataKey={stock.symbol}
                      stroke={index === 0 ? "#00FFA3" : "#FF6B6B"}
                      strokeWidth={2}
                      dot={false}
                      name={`${stock.symbol} (₹100)`}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

