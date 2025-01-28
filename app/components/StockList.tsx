"use client"

import { useState, useMemo } from "react"
import type { Stock } from "../types/stock"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react"

interface StockListProps {
  title: string
  stocks: Stock[]
  type: "mover" | "loser"
  onSelectStock: (stock: Stock, isSelected: boolean) => void
  selectedStocks: Stock[]
}

export default function StockList({ title, stocks = [], type, onSelectStock, selectedStocks }: StockListProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const sortedStocks = useMemo(() => {
    const safeStocks = Array.isArray(stocks) ? stocks : []
    return [...safeStocks].sort((a, b) => {
      const compareValue = Math.abs(b.changesPercentage) - Math.abs(a.changesPercentage)
      return sortOrder === "asc" ? -compareValue : compareValue
    })
  }, [stocks, sortOrder])

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"))
  }

  return (
    <Card className="bg-[#1C1C1C] border-[#2A2A2A]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {type === "mover" ? (
              <TrendingUp className="h-5 w-5 text-[#00FFA3]" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <CardTitle className="text-white">{title}</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="border-[#2A2A2A] text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
          >
            Sort
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {sortedStocks.map((stock) => (
            <li
              key={stock.symbol}
              className="flex justify-between items-center p-3 bg-[#242424] rounded-lg border border-[#2A2A2A] transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={`checkbox-${stock.symbol}`}
                  checked={selectedStocks.some((s) => s.symbol === stock.symbol)}
                  onCheckedChange={(checked) => onSelectStock(stock, checked as boolean)}
                />
                <div>
                  <p className="font-semibold text-white">{stock.symbol}</p>
                  <p className="text-sm text-gray-400">{stock.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">₹{stock.price.toFixed(2)}</p>
                <p
                  className={`text-sm flex items-center justify-end ${
                    stock.changesPercentage >= 0 ? "text-[#00FFA3]" : "text-red-500"
                  }`}
                >
                  {stock.changesPercentage >= 0 ? (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(stock.changesPercentage).toFixed(2)}%
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

