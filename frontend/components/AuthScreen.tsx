"use client"

import { useState } from "react"
import { ArrowRight, Lock, Mail, User } from "lucide-react"

interface Props {
  onLogin: () => void
}

export function AuthScreen({ onLogin }: Props) {
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mocking authentication for UI purposes
    onLogin()
  }

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
              {isSignUp ? "Create an account" : "Welcome back"}
            </h1>
            <p className="text-[14px] text-[#6B7280] text-center mb-8">
              {isSignUp ? "Enter your details to get started" : "Enter your credentials to access your account"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-[12px] font-semibold text-[#111827] uppercase tracking-[0.5px] mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-[#9CA3AF]" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="block w-full pl-10 pr-3 py-[10px] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all bg-[#F9FAFB] focus:bg-[#FFFFFF]"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-semibold text-[#111827] uppercase tracking-[0.5px] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[#9CA3AF]" />
                  </div>
                  <input 
                    type="email" 
                    placeholder="you@company.com"
                    className="block w-full pl-10 pr-3 py-[10px] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all bg-[#F9FAFB] focus:bg-[#FFFFFF]"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[12px] font-semibold text-[#111827] uppercase tracking-[0.5px]">
                    Password
                  </label>
                  {!isSignUp && (
                    <a href="#" className="text-[12px] font-medium text-[#2563EB] hover:underline">
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#9CA3AF]" />
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-[10px] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all bg-[#F9FAFB] focus:bg-[#FFFFFF]"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] h-[44px] text-[14px] font-semibold rounded-[6px] transition-colors border-none cursor-pointer group"
                >
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
          
          {/* Footer toggle */}
          <div className="bg-[#F9FAFB] border-t border-[#E5E7EB] px-[32px] py-[20px] text-center">
            <p className="text-[13px] text-[#6B7280]">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-semibold text-[#2563EB] hover:underline bg-transparent border-none cursor-pointer"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>

        {/* Dummy Trust Indicators */}
        <div className="mt-8 text-center">
          <p className="text-[12px] font-medium text-[#9CA3AF] uppercase tracking-[0.5px] mb-4">Secured by</p>
          <div className="flex justify-center items-center gap-6 opacity-50 grayscale">
            <span className="text-[14px] font-bold text-[#6B7280]">Stellar</span>
            <span className="text-[14px] font-bold text-[#6B7280]">Soroban</span>
          </div>
        </div>

      </div>
    </div>
  )
}
