"use client"

import { useState, useEffect } from "react"
import { UploadCloud, FileText, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

type UploadState = "idle" | "analyzing" | "approved"

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function UploadInvoiceModal({ isOpen, onClose }: Props) {
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState("Extracting metadata...")

  // Simulated AI Underwriting Flow
  useEffect(() => {
    let timer1: NodeJS.Timeout
    let timer2: NodeJS.Timeout
    let timer3: NodeJS.Timeout

    if (uploadState === "analyzing") {
      timer1 = setTimeout(() => {
        setProgress(35)
        setLoadingText("Verifying client domain via OSINT...")
      }, 1500)
      
      timer2 = setTimeout(() => {
        setProgress(75)
        setLoadingText("Calculating Risk Score...")
      }, 3000)
      
      timer3 = setTimeout(() => {
        setProgress(100)
        setUploadState("approved")
      }, 4500)
    }

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [uploadState])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setProgress(0)
    setUploadState("analyzing")
  }

  const handleUploadClick = () => {
    setProgress(0)
    setUploadState("analyzing")
  }

  const handleClose = () => {
    setProgress(0)
    setUploadState("idle")
    setLoadingText("Extracting metadata...")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
       <DialogContent className="sm:max-w-[360px] p-[24px] bg-[#111827] text-[#FFFFFF] border-0 rounded-[12px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] [&>button]:text-[#9CA3AF] [&>button:hover]:text-[#FFFFFF]">
          {/* STATE 1: Idle (Drag & Drop) */}
          {uploadState === "idle" && (
            <div className="pt-2">
              <h2 className="text-[18px] font-bold text-[#FFFFFF] mb-[6px]">Upload Invoice</h2>
              <p className="text-[13px] text-[#9CA3AF] mb-[24px]">Our AI Edge-backend will instantly underwrite your invoice.</p>
              <div 
                className="border-2 border-dashed border-[#374151] hover:border-[#4ADE80] hover:bg-[#1F2937] bg-[#1F2937]/50 rounded-[10px] p-[32px] flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <div className="w-[48px] h-[48px] bg-[#374151] rounded-full flex items-center justify-center mb-[16px] group-hover:scale-110 group-hover:bg-[#4ADE80]/20 transition-all">
                  <UploadCloud className="w-6 h-6 text-[#9CA3AF] group-hover:text-[#4ADE80]" />
                </div>
                <h3 className="text-[14px] font-semibold text-[#FFFFFF] mb-[4px]">Drop your PDF Invoice here</h3>
                <p className="text-[12px] text-[#9CA3AF]">or click to browse your files</p>
              </div>
            </div>
          )}

          {/* STATE 2: Analyzing */}
          {uploadState === "analyzing" && (
            <div className="py-[32px] flex flex-col items-center text-center animate-in fade-in zoom-in-95">
              <div className="relative mb-[24px]">
                <div className="w-[64px] h-[64px] bg-[#1F2937] rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-[#4ADE80] animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-[#4ADE80]/20 animate-ping"></div>
              </div>
              <h3 className="text-[16px] font-semibold text-[#FFFFFF] mb-[8px]">Analyzing Invoice...</h3>
              <p className="text-[13px] text-[#9CA3AF] mb-[24px] h-[20px]">{loadingText}</p>
              <div className="w-full">
                <div className="h-[4px] bg-[#374151] rounded-[2px] overflow-hidden">
                    <div className="h-full bg-[#4ADE80] transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: Approved */}
          {uploadState === "approved" && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 pt-2">
              <div className="flex items-center gap-[12px] mb-[20px]">
                <div className="text-[28px] font-extrabold text-[#4ADE80]">A+</div>
                <div>
                    <div className="text-[15px] font-bold leading-tight">Underwriting Complete</div>
                    <div className="text-[12px] opacity-60 text-[#9CA3AF] mt-1">Invoice #1024 - TechCorp</div>
                </div>
              </div>

              <div className="space-y-[12px] mb-[24px]">
                <div>
                    <div className="flex justify-between text-[12px] text-[#9CA3AF] mb-[6px]">
                        <span>OSINT Verification</span>
                        <span className="font-semibold text-[#FFFFFF]">PASSED</span>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-[12px] text-[#9CA3AF] mb-[6px]">
                        <span>Domain Legitimacy</span>
                        <span className="font-semibold text-[#FFFFFF]">PASSED</span>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-[12px] text-[#9CA3AF] mb-[6px]">
                        <span>Calculated Risk Score</span>
                        <span className="font-semibold text-[#FFFFFF]">98/100</span>
                    </div>
                </div>
                <div className="h-[4px] bg-[#374151] rounded-[2px] overflow-hidden mt-1">
                    <div className="h-full bg-[#4ADE80] w-[98%]"></div>
                </div>
              </div>

              <div className="text-[13px] mb-[24px] text-[#D1D5DB] bg-[#1F2937] p-4 rounded-lg border border-[#374151] leading-relaxed">
                  Offer: <strong className="text-[#FFFFFF]"> $4,800.00 USDC</strong> instant payout. <br/> $200.00 held in Soroban Escrow.
              </div>

              <button 
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] h-[44px] text-[14px] font-semibold rounded-[6px] transition-colors border-none cursor-pointer flex items-center justify-center gap-2 group"
                onClick={handleClose}
              >
                Mint & List to Market
              </button>
            </div>
          )}
      </DialogContent>
    </Dialog>
  )
}
