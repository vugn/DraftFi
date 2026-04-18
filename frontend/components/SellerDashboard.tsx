"use client"

import { useState, useEffect, useCallback } from "react"
import { UploadInvoiceModal } from "./UploadInvoiceModal"
import { useWallet } from "./WalletContext"
import { getSellerInvoiceIds, getInvoice } from "@/lib/stellar"
import { type Invoice, InvoiceStatus, formatUSDC, fromStroops } from "@/lib/contracts"
import { RefreshCw } from "lucide-react"

// Mock invoices for demo when no contracts are deployed
const MOCK_INVOICES = [
  {
    id: 1024,
    client: "TechCorp Inc.",
    amount: "$5,000.00",
    dueDate: "Oct 30, 2026",
    status: "AI Reviewing",
  },
  {
    id: 1025,
    client: "Acme Logistics",
    amount: "$2,450.00",
    dueDate: "Nov 15, 2026",
    status: "Listed on Market",
  },
  {
    id: 1026,
    client: "Global Web Dev",
    amount: "$8,000.00",
    dueDate: "Oct 05, 2026",
    status: "Funded",
  },
  {
    id: 1027,
    client: "Design Flow Lab",
    amount: "$1,200.00",
    dueDate: "Dec 10, 2026",
    status: "Listed on Market",
  },
]

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

function statusLabel(status: InvoiceStatus): string {
  switch (status) {
    case InvoiceStatus.PendingReview: return "AI Reviewing"
    case InvoiceStatus.Approved: return "Approved"
    case InvoiceStatus.Listed: return "Listed on Market"
    case InvoiceStatus.Funded: return "Funded"
    case InvoiceStatus.InEscrow: return "In Escrow"
    case InvoiceStatus.Settled: return "Settled"
    case InvoiceStatus.Defaulted: return "Defaulted"
    default: return "Unknown"
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "Funded":
    case "Settled":
      return "bg-[#DCFCE7] text-[#15803D]"
    case "AI Reviewing":
    case "PendingReview":
    case "Approved":
      return "bg-[#FEF9C3] text-[#A16207]"
    case "Defaulted":
      return "bg-[#FEE2E2] text-[#DC2626]"
    default:
      return "bg-[#EFF6FF] text-[#2563EB]"
  }
}

export function SellerDashboard() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const { publicKey, usdcBalance, isConnected } = useWallet()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoadingOnChain, setIsLoadingOnChain] = useState(false)
  const [useOnChain, setUseOnChain] = useState(false)

  const loadOnChainInvoices = useCallback(async () => {
    if (!publicKey) return
    setIsLoadingOnChain(true)
    try {
      const ids = await getSellerInvoiceIds(publicKey)
      const loaded: Invoice[] = []
      for (const id of ids) {
        const inv = await getInvoice(id)
        if (inv) loaded.push(inv)
      }
      setInvoices(loaded)
      setUseOnChain(true)
    } catch (err) {
      console.error("Failed to load on-chain invoices:", err)
      setUseOnChain(false)
    } finally {
      setIsLoadingOnChain(false)
    }
  }, [publicKey])

  // Try loading on-chain data first
  useEffect(() => {
    if (isConnected) {
      loadOnChainInvoices()
    }
  }, [isConnected, loadOnChainInvoices])

  // Calculate stats
  const totalFunded = useOnChain
    ? invoices.filter(i => i.status === InvoiceStatus.Funded || i.status === InvoiceStatus.Settled).reduce((sum, i) => sum + fromStroops(i.offeredAmount), 0)
    : 4800
  const totalInReview = useOnChain
    ? invoices.filter(i => i.status === InvoiceStatus.PendingReview || i.status === InvoiceStatus.Approved).reduce((sum, i) => sum + fromStroops(i.amount), 0)
    : 12500

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="flex justify-between items-end">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#111827]">
            Unlock Your Cash Flow
          </h1>
          <p className="text-[#6B7280] mt-1 text-[16px]">
            Convert unpaid B2B invoices into instant liquidity on Stellar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] p-[12px] rounded-[6px] text-[14px] font-semibold border border-[#E5E7EB] cursor-pointer transition-colors"
            onClick={loadOnChainInvoices}
            disabled={isLoadingOnChain}
            title="Refresh from blockchain"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingOnChain ? "animate-spin" : ""}`} />
          </button>
          <button 
            className="bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] px-[20px] py-[12px] rounded-[6px] text-[14px] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors border-none cursor-pointer"
            onClick={() => setIsUploadModalOpen(true)}
          >
            + Upload New Invoice
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-3 gap-[20px]">
        <div className="bg-[#FFFFFF] p-[20px] rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="text-[12px] font-medium text-[#6B7280] uppercase tracking-[0.5px]">Available Funds</div>
            <div className="text-[20px] font-bold text-[#111827] mt-[8px]">
              {useOnChain
                ? `${usdcBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} USDC`
                : "$4,800.00 USDC"
              }
            </div>
        </div>
        <div className="bg-[#FFFFFF] p-[20px] rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="text-[12px] font-medium text-[#6B7280] uppercase tracking-[0.5px]">In Review</div>
            <div className="text-[20px] font-bold text-[#111827] mt-[8px]">
              ${totalInReview.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
        </div>
        <div className="bg-[#FFFFFF] p-[20px] rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="text-[12px] font-medium text-[#6B7280] uppercase tracking-[0.5px]">Estimated Yield (LPs)</div>
            <div className="text-[20px] font-bold text-[#111827] mt-[8px]">4.2% APY</div>
        </div>
      </section>

      {/* Active Invoices Table */}
      <section className="bg-[#FFFFFF] rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* On-chain indicator */}
        {useOnChain && (
          <div className="bg-[#EFF6FF] px-[20px] py-[8px] flex items-center gap-2 border-b border-[#DBEAFE]">
            <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-[0.5px]">
              Live On-Chain Data
            </span>
          </div>
        )}
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="bg-[#F9FAFB] py-[12px] px-[20px] text-[11px] uppercase font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Client Name</th>
              <th className="bg-[#F9FAFB] py-[12px] px-[20px] text-[11px] uppercase font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Invoice Amount</th>
              <th className="bg-[#F9FAFB] py-[12px] px-[20px] text-[11px] uppercase font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Due Date</th>
              <th className="bg-[#F9FAFB] py-[12px] px-[20px] text-[11px] uppercase font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Status</th>
              <th className="bg-[#F9FAFB] py-[12px] px-[20px] text-[11px] uppercase font-semibold text-[#6B7280] border-b border-[#E5E7EB]">Action</th>
            </tr>
          </thead>
          <tbody>
            {useOnChain && invoices.length > 0 ? (
              invoices.map((invoice, index) => {
                const label = statusLabel(invoice.status)
                return (
                  <tr key={invoice.id}>
                    <td className={`py-[16px] px-[20px] text-[14px] ${index !== invoices.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
                      <strong className="font-bold text-[#111827]">{invoice.clientName}</strong>
                    </td>
                    <td className={`py-[16px] px-[20px] text-[14px] text-[#111827] ${index !== invoices.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
                      {formatUSDC(invoice.amount)}
                    </td>
                    <td className={`py-[16px] px-[20px] text-[14px] text-[#111827] ${index !== invoices.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className={`py-[16px] px-[20px] ${index !== invoices.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
                      <span className={`px-[8px] py-[4px] rounded-[4px] text-[11px] font-semibold ${statusColor(label)}`}>
                        {label}
                      </span>
                    </td>
                    <td className={`py-[16px] px-[20px] ${index !== invoices.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
                      {invoice.status === InvoiceStatus.Funded || invoice.status === InvoiceStatus.Settled ? (
                        <a href="#" className="text-[#2563EB] font-semibold text-[13px] no-underline hover:underline">Withdraw USDC</a>
                      ) : invoice.status === InvoiceStatus.Listed ? (
                        <a href="#" className="text-[#2563EB] font-semibold text-[13px] no-underline hover:underline">View Listing</a>
                      ) : (
                        <span className="text-[#6B7280] text-[14px]">Processing...</span>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              // Fallback to mock data
              MOCK_INVOICES.map((invoice, index) => (
                <tr key={invoice.id}>
                  <td className={`py-[16px] px-[20px] text-[14px] ${index !== MOCK_INVOICES.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
                    <strong className="font-bold text-[#111827]">{invoice.client}</strong>
                  </td>
                  <td className={`py-[16px] px-[20px] text-[14px] text-[#111827] ${index !== MOCK_INVOICES.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>{invoice.amount}</td>
                  <td className={`py-[16px] px-[20px] text-[14px] text-[#111827] ${index !== MOCK_INVOICES.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>{invoice.dueDate}</td>
                  <td className={`py-[16px] px-[20px] ${index !== MOCK_INVOICES.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
                    <span 
                      className={`px-[8px] py-[4px] rounded-[4px] text-[11px] font-semibold ${statusColor(invoice.status)}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className={`py-[16px] px-[20px] ${index !== MOCK_INVOICES.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
                    {invoice.status === 'Funded' ? (
                      <a href="#" className="text-[#2563EB] font-semibold text-[13px] no-underline hover:underline">Withdraw USDC</a>
                    ) : invoice.status === 'Listed on Market' ? (
                      <a href="#" className="text-[#2563EB] font-semibold text-[13px] no-underline hover:underline">View Listing</a>
                    ) : (
                      <span className="text-[#6B7280] text-[14px]">Processing...</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Upload Modal */}
      <UploadInvoiceModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </div>
  )
}
