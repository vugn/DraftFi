"use client"

import { useWallet } from "./WalletContext"
import { ArrowRight, Wallet, Loader2, AlertCircle } from "lucide-react"

export function AuthScreen() {
  const { connect, isLoading, error } = useWallet()

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center items-center p-4 selection:bg-blue-100">
      <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-8 h-8 bg-[#2563EB] rounded-[6px] mr-3 flex items-center justify-center">
             <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <span className="font-extrabold text-[24px] tracking-[-0.5px] text-[#111827]">DraftFi</span>
        </div>

        {/* Auth Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-[32px]">
            <h1 className="text-[20px] font-bold text-[#111827] mb-2 text-center">
              Connect Your Wallet
            </h1>
            <p className="text-[14px] text-[#6B7280] text-center mb-8">
              Connect your Stellar wallet to access invoice factoring on DraftFi.
            </p>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-[6px] p-3 mb-4 flex items-start gap-2 text-[13px] animate-in fade-in duration-300">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Freighter Wallet Connect Button */}
            <div className="space-y-3">
              <button 
                onClick={connect}
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#93C5FD] text-[#FFFFFF] h-[52px] text-[14px] font-semibold rounded-[6px] transition-colors border-none cursor-pointer group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    Connect Freighter Wallet
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Help text */}
            <div className="mt-6 text-center">
              <p className="text-[12px] text-[#9CA3AF]">
                Don&apos;t have Freighter?{" "}
                <a 
                  href="https://freighter.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#2563EB] font-medium hover:underline"
                >
                  Download here →
                </a>
              </p>
            </div>
          </div>
          
          {/* Info footer */}
          <div className="bg-[#F9FAFB] border-t border-[#E5E7EB] px-[32px] py-[20px]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#EFF6FF] rounded-full flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4 text-[#2563EB]" />
              </div>
              <p className="text-[12px] text-[#6B7280] leading-relaxed">
                DraftFi uses <strong className="text-[#111827]">Soroban smart contracts</strong> on the Stellar network for trustless invoice settlement.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <p className="text-[12px] font-medium text-[#9CA3AF] uppercase tracking-[0.5px] mb-4">Secured by</p>
          <div className="flex justify-center items-center gap-6 opacity-50 grayscale">
            <span className="text-[14px] font-bold text-[#6B7280]">Stellar</span>
            <span className="text-[14px] font-bold text-[#6B7280]">Soroban</span>
            <span className="text-[14px] font-bold text-[#6B7280]">Freighter</span>
          </div>
        </div>

      </div>
    </div>
  )
}
