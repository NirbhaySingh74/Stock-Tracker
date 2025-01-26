import { LineChart } from "lucide-react"
import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="bg-[#1C1C1C] border-b border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <LineChart className="h-8 w-8 text-[#00FFA3]" />
              <div>
                <span className="text-white font-bold text-xl">ALPHA</span>
                <span className="text-gray-400 text-xl"> STOCKS</span>
              </div>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link
                href="#"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="#"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Markets
              </Link>
              <Link
                href="#"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Watchlist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

