"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./WalletContext"
import { getUserEscrows } from "@/lib/stellar"
import { type EscrowRecord, formatUSDC, truncateAddress } from "@/lib/contracts"
import { Lock, Unlock, AlertTriangle, Clock, Shield, RefreshCw } from "lucide-react"

// Removed MOCK_ESCROWS

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

function daysUntil(timestamp: number): number {
  const now = Math.floor(Date.now() / 1000)
  return Math.max(0, Math.ceil((timestamp - now) / (24 * 60 * 60)))
}

export function EscrowStatus() {
  const { publicKey, isConnected } = useWallet()
  const [escrows, setEscrows] = useState<EscrowRecord[]>([])
  const [useOnChain, setUseOnChain] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadEscrows = useCallback(async () => {
    if (!publicKey) return
    setIsLoading(true)
    try {
      // Load escrows where user is seller
      const sellerEscrows = await getUserEscrows(publicKey, "seller")
      // Also load where user is LP
      const lpEscrows = await getUserEscrows(publicKey, "lp")
      
      // Merge and deduplicate
      const all = [...sellerEscrows]
      for (const e of lpEscrows) {
        if (!all.find(a => a.invoiceId === e.invoiceId)) {
          all.push(e)
        }
      }
      
      if (all.length > 0) {
        setEscrows(all)
        setUseOnChain(true)
      }
    } catch {
      setUseOnChain(false)
    } finally {
      setIsLoading(false)
    }
  }, [publicKey])

  useEffect(() => {
    if (isConnected) {
      loadEscrows()
    }
  }, [isConnected, loadEscrows])

  // Summary stats
  const totalLocked = escrows.filter(e => !e.isReleased).reduce((sum, e) => sum + Number(e.escrowHold), 0) / 10_000_000
  const activeCount = escrows.filter(e => !e.isReleased).length

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#111827]">Escrow Status</h1>
          <p className="text-[#6B7280] mt-1 text-[16px]">Track funds locked in Soroban smart contracts.</p>
        </div>
        <button
          onClick={loadEscrows}
          disabled={isLoading}
          className="bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] p-[12px] rounded-[6px] border border-[#E5E7EB] cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-[20px]">
        <div className="bg-[#FFFFFF] p-[20px] rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-[8px]">
            <Lock className="w-4 h-4 text-[#6B7280]" />
            <span className="text-[12px] font-medium text-[#6B7280] uppercase tracking-[0.5px]">Total Locked</span>
          </div>
          <div className="text-[20px] font-bold text-[#111827]">
            ${totalLocked.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC
          </div>
        </div>
        <div className="bg-[#FFFFFF] p-[20px] rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-[8px]">
            <Shield className="w-4 h-4 text-[#6B7280]" />
            <span className="text-[12px] font-medium text-[#6B7280] uppercase tracking-[0.5px]">Active Escrows</span>
          </div>
          <div className="text-[20px] font-bold text-[#111827]">{activeCount}</div>
        </div>
        <div className="bg-[#FFFFFF] p-[20px] rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-[8px]">
            <Clock className="w-4 h-4 text-[#6B7280]" />
            <span className="text-[12px] font-medium text-[#6B7280] uppercase tracking-[0.5px]">Next Release</span>
          </div>
          <div className="text-[20px] font-bold text-[#111827]">
            {escrows.filter(e => !e.isReleased).length > 0
                ? `${daysUntil(Math.min(...escrows.filter(e => !e.isReleased).map(e => e.releaseDate)))} days`
                : "—"
            }
          </div>
        </div>
      </div>

      {/* On-chain indicator */}
      {useOnChain && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
          <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-[0.5px]">
            Live On-Chain Data
          </span>
        </div>
      )}

      {/* Escrow Cards */}
      <div className="flex flex-col gap-4">
        {escrows.length > 0 ? (
          escrows.map((escrow) => {
            const days = daysUntil(escrow.releaseDate)
            const isReleasable = days === 0 && !escrow.isReleased
            
            return (
              <div
                key={escrow.invoiceId}
                className={`bg-[#FFFFFF] rounded-[10px] border shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden ${
                  escrow.isReleased ? "border-[#E5E7EB] opacity-60" : escrow.isDisputed ? "border-[#FCA5A5]" : "border-[#E5E7EB]"
                }`}
              >
                <div className="p-[20px]">
                  <div className="flex items-center justify-between mb-[16px]">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        escrow.isReleased ? "bg-[#DCFCE7]" : escrow.isDisputed ? "bg-[#FEE2E2]" : "bg-[#EFF6FF]"
                      }`}>
                        {escrow.isReleased ? (
                          <Unlock className="w-5 h-5 text-[#15803D]" />
                        ) : escrow.isDisputed ? (
                          <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
                        ) : (
                          <Lock className="w-5 h-5 text-[#2563EB]" />
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#111827]">Invoice #{escrow.invoiceId}</p>
                        <p className="text-[12px] text-[#6B7280]">
                          LP: {truncateAddress(escrow.lp)} → Seller: {truncateAddress(escrow.seller)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-[10px] py-[4px] rounded-full text-[11px] font-semibold ${
                      escrow.isReleased ? "bg-[#DCFCE7] text-[#15803D]" :
                      escrow.isDisputed ? "bg-[#FEE2E2] text-[#DC2626]" :
                      "bg-[#EFF6FF] text-[#2563EB]"
                    }`}>
                      {escrow.isReleased ? "Released" : escrow.isDisputed ? "Disputed" : "Locked"}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-[11px] text-[#6B7280] font-medium mb-1">Total Funded</p>
                      <p className="text-[14px] font-bold text-[#111827]">{formatUSDC(escrow.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#6B7280] font-medium mb-1">Seller Payout</p>
                      <p className="text-[14px] font-bold text-[#15803D]">{formatUSDC(escrow.sellerPayout)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#6B7280] font-medium mb-1">Escrow Hold</p>
                      <p className="text-[14px] font-bold text-[#2563EB]">{formatUSDC(escrow.escrowHold)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#6B7280] font-medium mb-1">Release Date</p>
                      <p className="text-[14px] font-bold text-[#111827]">
                        {formatDate(escrow.releaseDate)}
                        {!escrow.isReleased && (
                          <span className="text-[11px] font-normal text-[#6B7280] ml-1">({days}d)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar for time remaining */}
                  {!escrow.isReleased && !escrow.isDisputed && (
                    <div className="mt-4">
                      <div className="h-[4px] bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.max(5, 100 - (days / 90) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {isReleasable && (
                    <div className="mt-4">
                      <button className="bg-[#15803D] hover:bg-[#166534] text-white px-4 py-2 rounded-[6px] text-[13px] font-semibold border-none cursor-pointer transition-colors">
                        Claim Funds
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-[32px] px-[20px] text-center text-[#6B7280] text-[14px]">
             {isLoading ? "Loading your escrows..." : "You have no active or historical escrows on the blockchain yet."}
          </div>
        )}
      </div>
    </div>
  )
}
