export function Navbar({ onLogout }: { onLogout?: () => void }) {
  return (
    <nav className="h-16 bg-[#FFFFFF] border-b border-[#E5E7EB] flex items-center justify-between px-8 shrink-0">
      
      {/* Left: Logo */}
      <div className="font-extrabold text-[20px] tracking-[-0.5px] text-[#111827] flex items-center">
        <div className="w-6 h-6 bg-[#2563EB] rounded-[4px] mr-2" />
        DraftFi
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        <div className="bg-[#F3F4F6] px-3 py-1.5 rounded-[6px] text-[13px] font-semibold text-[#111827] border border-[#E5E7EB]">
          4,800.00 USDC
        </div>
        <button 
          onClick={onLogout}
          title="Sign out"
          className="bg-[#111827] hover:bg-[#1f2937] text-[#FFFFFF] px-4 py-2 rounded-[6px] text-[13px] font-medium border-none cursor-pointer transition-colors"
        >
          GD4S...9K2E
        </button>
      </div>
      
    </nav>
  )
}
