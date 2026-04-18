"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/Navbar"
import { SellerDashboard } from "@/components/SellerDashboard"
import { LPMarketplace } from "@/components/LPMarketplace"
import { EscrowStatus } from "@/components/EscrowStatus"
import { AuthScreen } from "@/components/AuthScreen"
import { WalletProvider, useWallet } from "@/components/WalletContext"

function AppContent() {
  const { isConnected } = useWallet()

  if (!isConnected) {
    return <AuthScreen />
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#FAFAFA] text-[#111827] font-sans overflow-hidden">
      <Navbar />
      <main className="flex flex-grow overflow-hidden">
        <Tabs defaultValue="seller" orientation="vertical" className="flex flex-row w-full h-full gap-0 bg-[#FAFAFA]">
          {/* Sidebar */}
          <aside className="w-60 border-r border-[#E5E7EB] bg-[#FFFFFF] py-6 shrink-0 flex flex-col h-full z-10">
            <TabsList className="flex flex-col h-auto bg-transparent p-0 w-full rounded-none gap-0 items-stretch">
              <TabsTrigger 
                value="seller" 
                className="w-full justify-start px-6 py-3 text-[14px] font-medium text-[#6B7280] rounded-none border border-transparent border-r-2 data-active:bg-[#EFF6FF] data-active:text-[#2563EB] data-active:border-r-[#2563EB] data-active:shadow-none hover:bg-gray-50/50 transition-none"
              >
                Seller Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="lp" 
                className="w-full justify-start px-6 py-3 text-[14px] font-medium text-[#6B7280] rounded-none border border-transparent border-r-2 data-active:bg-[#EFF6FF] data-active:text-[#2563EB] data-active:border-r-[#2563EB] data-active:shadow-none hover:bg-gray-50/50 transition-none"
              >
                Marketplace
              </TabsTrigger>
              <TabsTrigger 
                value="escrow" 
                className="w-full justify-start px-6 py-3 text-[14px] font-medium text-[#6B7280] rounded-none border border-transparent border-r-2 data-active:bg-[#EFF6FF] data-active:text-[#2563EB] data-active:border-r-[#2563EB] data-active:shadow-none hover:bg-gray-50/50 transition-none"
              >
                Escrow Status
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="w-full justify-start px-6 py-3 text-[14px] font-medium text-[#6B7280] rounded-none border border-transparent border-r-2 data-active:bg-[#EFF6FF] data-active:text-[#2563EB] data-active:border-r-[#2563EB] data-active:shadow-none hover:bg-gray-50/50 transition-none"
              >
                History
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="w-full justify-start px-6 py-3 text-[14px] font-medium text-[#6B7280] rounded-none border border-transparent border-r-2 data-active:bg-[#EFF6FF] data-active:text-[#2563EB] data-active:border-r-[#2563EB] data-active:shadow-none hover:bg-gray-50/50 transition-none"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Network indicator at bottom of sidebar */}
            <div className="mt-auto px-6 pt-4 border-t border-[#F3F4F6]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                <span className="text-[11px] font-medium text-[#6B7280]">Stellar Testnet</span>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="seller" className="m-0 p-8 outline-none">
              <SellerDashboard />
            </TabsContent>
            <TabsContent value="lp" className="m-0 p-8 outline-none">
              <LPMarketplace />
            </TabsContent>
            <TabsContent value="escrow" className="m-0 p-8 outline-none">
              <EscrowStatus />
            </TabsContent>
            
            {/* Placeholder screens */}
            <TabsContent value="history" className="m-0 p-8 outline-none">
              <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto animate-in fade-in duration-500">
                <h1 className="text-[28px] font-bold tracking-tight text-[#111827]">History</h1>
                <p className="text-[#6B7280] mt-1 text-[16px]">View past funded invoices and settlements.</p>
                <div className="bg-[#FFFFFF] p-12 rounded-[10px] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] border-dashed mt-4">
                  Under Development (Demo Build)
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="m-0 p-8 outline-none">
              <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto animate-in fade-in duration-500">
                <h1 className="text-[28px] font-bold tracking-tight text-[#111827]">Settings</h1>
                <p className="text-[#6B7280] mt-1 text-[16px]">Manage your Stellar wallet and profile preferences.</p>
                <div className="bg-[#FFFFFF] p-12 rounded-[10px] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] border-dashed mt-4">
                  Under Development (Demo Build)
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  )
}
