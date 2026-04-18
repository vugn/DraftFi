"use client"

import { Filter, Search, ArrowUpRight } from "lucide-react"

const OPEN_INVOICES = [
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

export function LPMarketplace() {
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
        {OPEN_INVOICES.map((inv) => (
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
        ))}
      </div>
    </div>
  )
}
