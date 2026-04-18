"use client"

import { useWallet } from "./WalletContext"
import { LogOut, Wallet } from "lucide-react"

export function Navbar() {
  const { displayAddress, usdcBalance, disconnect } = useWallet()

  return (
    <nav className="h-16 bg-[#FFFFFF] border-b border-[#E5E7EB] flex items-center justify-between px-8 shrink-0">
      
      {/* Left: Logo */}
      <div className="font-extrabold text-[20px] tracking-[-0.5px] text-[#111827] flex items-center">
        <div className="w-6 h-6 bg-[#2563EB] rounded-[4px] mr-2 flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
        </div>
        DraftFi
      </div>

      {/* Right: Balance + Wallet Address */}
      <div className="flex items-center gap-4">
        {/* USDC Balance */}
        <div className="bg-[#F3F4F6] px-3 py-1.5 rounded-[6px] text-[13px] font-semibold text-[#111827] border border-[#E5E7EB] flex items-center gap-1.5">
          <div className="w-4 h-4 bg-[#2563EB] rounded-full flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">$</span>
          </div>
          {usdcBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
        </div>

        {/* Wallet Address */}
        <div className="flex items-center gap-2 bg-[#111827] px-3 py-2 rounded-[6px]">
          <Wallet className="w-3.5 h-3.5 text-[#9CA3AF]" />
          <span className="text-[13px] font-medium text-[#FFFFFF]">
            {displayAddress}
          </span>
        </div>

        {/* Disconnect */}
        <button 
          onClick={disconnect}
          title="Disconnect wallet"
          className="bg-transparent hover:bg-[#FEE2E2] text-[#6B7280] hover:text-[#DC2626] p-2 rounded-[6px] border border-[#E5E7EB] hover:border-[#FECACA] cursor-pointer transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
      
    </nav>
  )
}
