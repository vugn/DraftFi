"use client"

import { useState } from "react"
import { UploadInvoiceModal } from "./UploadInvoiceModal"

const INVOICES = [
  {
    id: "INV-1024",
    client: "TechCorp Inc.",
    amount: "$5,000.00",
    dueDate: "Oct 30, 2026",
    status: "AI Reviewing",
  },
  {
    id: "INV-1025",
    client: "Acme Logistics",
    amount: "$2,450.00",
    dueDate: "Nov 15, 2026",
    status: "Listed on Market",
  },
  {
    id: "INV-1026",
    client: "Global Web Dev",
    amount: "$8,000.00",
    dueDate: "Oct 05, 2026",
    status: "Funded",
  },
  {
    id: "INV-1027",
    client: "Design Flow Lab",
    amount: "$1,200.00",
    dueDate: "Dec 10, 2026",
    status: "Listed on Market",
  },
]

export function SellerDashboard() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

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
        <button 
          className="bg-[#2563EB] hover:bg-[#1d4ed8] text-[#FFFFFF] px-[20px] py-[12px] rounded-[6px] text-[14px] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors border-none cursor-pointer"
          onClick={() => setIsUploadModalOpen(true)}
        >
          + Upload New Invoice
        </button>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-3 gap-[20px]">
        <div className="bg-[#FFFFFF] p-[20px] rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="text-[12px] font-medium text-[#6B7280] uppercase tracking-[0.5px]">Available Funds</div>
            <div className="text-[20px] font-bold text-[#111827] mt-[8px]">$4,800.00 USDC</div>
        </div>
        <div className="bg-[#FFFFFF] p-[20px] rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="text-[12px] font-medium text-[#6B7280] uppercase tracking-[0.5px]">In Review</div>
            <div className="text-[20px] font-bold text-[#111827] mt-[8px]">$12,500.00</div>
        </div>
        <div className="bg-[#FFFFFF] p-[20px] rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="text-[12px] font-medium text-[#6B7280] uppercase tracking-[0.5px]">Estimated Yield (LPs)</div>
            <div className="text-[20px] font-bold text-[#111827] mt-[8px]">4.2% APY</div>
        </div>
      </section>

      {/* Active Invoices Table */}
      <section className="bg-[#FFFFFF] rounded-[10px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
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
            {INVOICES.map((invoice, index) => (
              <tr key={invoice.id}>
                <td className={`py-[16px] px-[20px] text-[14px] ${index !== INVOICES.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
                  <strong className="font-bold text-[#111827]">{invoice.client}</strong>
                </td>
                <td className={`py-[16px] px-[20px] text-[14px] text-[#111827] ${index !== INVOICES.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>{invoice.amount}</td>
                <td className={`py-[16px] px-[20px] text-[14px] text-[#111827] ${index !== INVOICES.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>{invoice.dueDate}</td>
                <td className={`py-[16px] px-[20px] ${index !== INVOICES.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
                  <span 
                    className={`px-[8px] py-[4px] rounded-[4px] text-[11px] font-semibold ${
                      invoice.status === 'Funded' ? 'bg-[#DCFCE7] text-[#15803D]' : 
                      invoice.status === 'AI Reviewing' ? 'bg-[#FEF9C3] text-[#A16207]' : 
                      'bg-[#EFF6FF] text-[#2563EB]'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className={`py-[16px] px-[20px] ${index !== INVOICES.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
                  {invoice.status === 'Funded' ? (
                    <a href="#" className="text-[#2563EB] font-semibold text-[13px] no-underline hover:underline">Withdraw USDC</a>
                  ) : invoice.status === 'Listed on Market' ? (
                    <a href="#" className="text-[#2563EB] font-semibold text-[13px] no-underline hover:underline">View Listing</a>
                  ) : (
                    <span className="text-[#6B7280] text-[14px]">Processing...</span>
                  )}
                </td>
              </tr>
            ))}
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
