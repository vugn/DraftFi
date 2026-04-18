"use client"

import { useState, useEffect, useCallback } from "react"
import { Filter, Search, ArrowUpRight, Loader2 } from "lucide-react"
import { useWallet } from "./WalletContext"
import { getActiveListings, fundInvoice } from "@/lib/stellar"
import { type Listing, formatUSDC, fromStroops } from "@/lib/contracts"

// Mock data for demo when contracts aren't deployed
const MOCK_INVOICES = [
  {
    id: "INV-1024",
    industry: "Software Engineering",
    score: "A+",
    faceValue: "$5,000",
    cost: "$4,800",
    yield: "4.1%",
    days: "30 Days",
  },
  {
    id: "INV-1089",
    industry: "Digital Marketing",
    score: "A",
    faceValue: "$12,000",
    cost: "$11,200",
    yield: "7.1%",
    days: "60 Days",
  },
  {
    id: "INV-1092",
    industry: "Consulting",
    score: "B+",
    faceValue: "$3,500",
    cost: "$3,300",
    yield: "6.0%",
    days: "45 Days",
  },
  {
    id: "INV-1105",
    industry: "Design Agency",
    score: "A+",
    faceValue: "$8,000",
    cost: "$7,600",
    yield: "5.2%",
    days: "30 Days",
  },
]

function calculateYield(askingPrice: bigint, faceValue: bigint): string {
  const yieldPct = (Number(faceValue - askingPrice) / Number(askingPrice)) * 100
  return yieldPct.toFixed(1)
}

function calculateDays(dueDate: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = dueDate - now
  const days = Math.max(0, Math.ceil(diff / (24 * 60 * 60)))
  return `${days} Days`
}

export function LPMarketplace() {
  const { publicKey, isConnected } = useWallet()
  const [listings, setListings] = useState<Listing[]>([])
  const [useOnChain, setUseOnChain] = useState(false)
  const [fundingId, setFundingId] = useState<number | null>(null)

  const loadListings = useCallback(async () => {
    try {
      const result = await getActiveListings()
      if (result.length > 0) {
        setListings(result)
        setUseOnChain(true)
      }
    } catch {
      setUseOnChain(false)
    }
  }, [])

  useEffect(() => {
    if (isConnected) {
      loadListings()
    }
  }, [isConnected, loadListings])

  const handleFund = async (invoiceId: number) => {
    if (!publicKey) return
    setFundingId(invoiceId)
    try {
      await fundInvoice(publicKey, invoiceId)
      // Reload listings
      await loadListings()
    } catch (error) {
      console.error("Fund failed:", error)
    } finally {
      setFundingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 w-full max-w-[1200px] mx-auto">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FFFFFF] p-[16px] rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] overflow-hidden w-full sm:w-auto focus-within:ring-2 focus-within:ring-[#EFF6FF] transition-all">
          <div className="pl-3 flex items-center justify-center">
            <Search className="w-4 h-4 text-[#6B7280]" />
          </div>
          <input 
            type="text" 
            placeholder="Search industry or ID..." 
            className="bg-transparent border-none focus:outline-none text-[13px] px-[12px] py-[10px] w-full sm:w-64 text-[#111827] placeholder:text-[#6B7280]"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {useOnChain && (
            <div className="flex items-center gap-1.5 bg-[#EFF6FF] text-[#2563EB] px-3 h-[36px] rounded-[6px] text-[11px] font-semibold uppercase tracking-[0.5px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
              On-Chain
            </div>
          )}
          <button className="bg-[#FFFFFF] border border-[#E5E7EB] text-[#6B7280] h-[36px] px-[12px] rounded-[6px] text-[13px] font-medium flex items-center shadow-sm cursor-pointer hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Risk Score
          </button>
          <button className="bg-[#FFFFFF] border border-[#E5E7EB] text-[#6B7280] h-[36px] px-[12px] rounded-[6px] text-[13px] font-medium shadow-sm cursor-pointer hover:bg-gray-50">
            Yield %
          </button>
          <button className="bg-[#FFFFFF] border border-[#E5E7EB] text-[#6B7280] h-[36px] px-[12px] rounded-[6px] text-[13px] font-medium shadow-sm cursor-pointer hover:bg-gray-50">
            Duration
          </button>
        </div>
      </div>

      {/* Grid Layout (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
        {useOnChain && listings.length > 0 ? (
          // On-chain listings
          listings.map((listing) => (
            <div key={listing.invoiceId} className="border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-all duration-200 bg-[#FFFFFF] group rounded-[10px] overflow-hidden flex flex-col">
              <div className="p-[20px] pb-[16px] border-b border-[#F9FAFB] bg-[#F9FAFB]/50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="inline-flex items-center px-[8px] py-[4px] rounded-[4px] border border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] bg-[#FFFFFF] mb-[8px]">
                      Soroban Invoice
                    </div>
                    <p className="text-[11px] text-[#6B7280] font-semibold uppercase tracking-[0.5px]">INV-{listing.invoiceId}</p>
                  </div>
                  <div className={`px-[8px] py-[4px] rounded-[4px] border font-bold text-[13px] ${
                    listing.riskGrade.includes('A') ? 'bg-[#DCFCE7] border-[#15803D]/20 text-[#15803D]' : 'bg-[#FEF9C3] border-[#A16207]/20 text-[#A16207]'
                  }`}>
                    {listing.riskGrade}
                  </div>
                </div>
              </div>
              <div className="p-[20px] pt-[20px] pb-[16px] flex-grow">
                <div className="grid grid-cols-2 gap-y-[16px] gap-x-[8px]">
                  <div>
                    <p className="text-[12px] text-[#6B7280] font-medium mb-[4px]">Face Value</p>
                    <p className="font-bold text-[#111827] text-[15px]">{formatUSDC(listing.faceValue)}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#6B7280] font-medium mb-[4px]">Cost (USDC)</p>
                    <p className="font-bold text-[#2563EB] text-[15px]">{formatUSDC(listing.askingPrice)}</p>
                  </div>
                  <div className="col-span-2 bg-[#DCFCE7]/40 p-[12px] rounded-[8px] border border-[#DCFCE7] flex items-center justify-between mt-[4px]">
                    <div>
                      <p className="text-[11px] text-[#15803D] font-semibold uppercase tracking-[0.5px]">Expected Yield</p>
                      <p className="font-extrabold text-[#15803D] text-[18px] flex items-center mt-[2px]">
                        {calculateYield(listing.askingPrice, listing.faceValue)}% <span className="text-[13px] font-medium text-[#15803D]/80 ml-[6px]">in {calculateDays(listing.dueDate)}</span>
                      </p>
                    </div>
                    <div className="w-[32px] h-[32px] rounded-full bg-[#15803D]/10 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 text-[#15803D]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-[20px] pt-[12px] border-t border-[#F3F4F6]">
                <button 
                  className="w-full bg-[#111827] hover:bg-[#1f2937] text-[#FFFFFF] rounded-[6px] h-[40px] text-[14px] font-semibold transition-colors border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  onClick={() => handleFund(listing.invoiceId)}
                  disabled={fundingId === listing.invoiceId}
                >
                  {fundingId === listing.invoiceId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Funding...
                    </>
                  ) : (
                    "Fund this Invoice"
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          // Mock data fallback
          MOCK_INVOICES.map((inv) => (
            <div key={inv.id} className="border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-all duration-200 bg-[#FFFFFF] group rounded-[10px] overflow-hidden flex flex-col">
              <div className="p-[20px] pb-[16px] border-b border-[#F9FAFB] bg-[#F9FAFB]/50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="inline-flex items-center px-[8px] py-[4px] rounded-[4px] border border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] bg-[#FFFFFF] mb-[8px]">
                      {inv.industry}
                    </div>
                    <p className="text-[11px] text-[#6B7280] font-semibold uppercase tracking-[0.5px]">{inv.id}</p>
                  </div>
                  <div className={`px-[8px] py-[4px] rounded-[4px] border font-bold text-[13px] ${
                    inv.score.includes('A') ? 'bg-[#DCFCE7] border-[#15803D]/20 text-[#15803D]' : 'bg-[#FEF9C3] border-[#A16207]/20 text-[#A16207]'
                  }`}>
                    {inv.score}
                  </div>
                </div>
              </div>
              <div className="p-[20px] pt-[20px] pb-[16px] flex-grow">
                <div className="grid grid-cols-2 gap-y-[16px] gap-x-[8px]">
                  <div>
                    <p className="text-[12px] text-[#6B7280] font-medium mb-[4px]">Face Value</p>
                    <p className="font-bold text-[#111827] text-[15px]">{inv.faceValue}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#6B7280] font-medium mb-[4px]">Cost (USDC)</p>
                    <p className="font-bold text-[#2563EB] text-[15px]">{inv.cost}</p>
                  </div>
                  <div className="col-span-2 bg-[#DCFCE7]/40 p-[12px] rounded-[8px] border border-[#DCFCE7] flex items-center justify-between mt-[4px]">
                    <div>
                      <p className="text-[11px] text-[#15803D] font-semibold uppercase tracking-[0.5px]">Expected Yield</p>
                      <p className="font-extrabold text-[#15803D] text-[18px] flex items-center mt-[2px]">
                        {inv.yield} <span className="text-[13px] font-medium text-[#15803D]/80 ml-[6px]">in {inv.days}</span>
                      </p>
                    </div>
                    <div className="w-[32px] h-[32px] rounded-full bg-[#15803D]/10 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 text-[#15803D]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-[20px] pt-[12px] border-t border-[#F3F4F6]">
                <button className="w-full bg-[#111827] hover:bg-[#1f2937] text-[#FFFFFF] rounded-[6px] h-[40px] text-[14px] font-semibold transition-colors border-none cursor-pointer">
                  Fund this Invoice
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
