import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function StockListSkeleton() {
  return (
    <Card className="bg-[#1C1C1C] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-8 w-40 bg-[#242424]" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-3 bg-[#242424] rounded-lg border border-[#2A2A2A]"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-[#2A2A2A]" />
                <Skeleton className="h-3 w-32 bg-[#2A2A2A]" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-16 bg-[#2A2A2A]" />
                <Skeleton className="h-3 w-12 bg-[#2A2A2A]" />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

