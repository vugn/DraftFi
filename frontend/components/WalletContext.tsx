"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { connectWallet, checkWalletConnection, getUSDCBalance, getXLMBalance } from "@/lib/stellar"
import { truncateAddress } from "@/lib/contracts"

interface WalletState {
  /** Whether a wallet is currently connected */
  isConnected: boolean
  /** The connected Stellar public key (full) */
  publicKey: string
  /** Truncated address for display */
  displayAddress: string
  /** USDC balance */
  usdcBalance: number
  /** XLM balance */
  xlmBalance: string
  /** Whether a wallet operation is in progress */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Connect the Freighter wallet */
  connect: () => Promise<void>
  /** Disconnect the wallet */
  disconnect: () => void
  /** Refresh balances */
  refreshBalances: () => Promise<void>
}

const WalletContext = createContext<WalletState | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const demoBypassWallet = process.env.NEXT_PUBLIC_BYPASS_WALLET_FOR_DEMO === "true"
  const [publicKey, setPublicKey] = useState(
    demoBypassWallet ? "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF" : ""
  )
  const [usdcBalance, setUsdcBalance] = useState(0)
  const [xlmBalance, setXlmBalance] = useState("0")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isConnected = !!publicKey

  const refreshBalances = useCallback(async () => {
    if (!publicKey) return
    try {
      const [usdc, xlm] = await Promise.all([
        getUSDCBalance(publicKey),
        getXLMBalance(publicKey),
      ])
      setUsdcBalance(usdc)
      setXlmBalance(xlm)
    } catch (err) {
      console.error("Failed to refresh balances:", err)
    }
  }, [publicKey])

  const connect = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const key = await connectWallet()
      setPublicKey(key)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setPublicKey("")
    setUsdcBalance(0)
    setXlmBalance("0")
    setError(null)
  }, [])

  // Refresh balances when connected
  useEffect(() => {
    if (publicKey) {
      refreshBalances()
      // Poll every 15 seconds
      const interval = setInterval(refreshBalances, 15000)
      return () => clearInterval(interval)
    }
  }, [publicKey, refreshBalances])

  // Check if wallet was previously connected
  useEffect(() => {
    if (demoBypassWallet) return

    checkWalletConnection().then((connected) => {
      if (connected) {
        connect()
      }
    })
  }, [connect, demoBypassWallet])

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        publicKey,
        displayAddress: truncateAddress(publicKey),
        usdcBalance,
        xlmBalance,
        isLoading,
        error,
        connect,
        disconnect,
        refreshBalances,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
