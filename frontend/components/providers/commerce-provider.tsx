"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { authService, ApiError, type Commerce } from "@/services"

interface CommerceContextType {
  commerce: Commerce | null
  loading: boolean
  error: string | null
  needsRegistration: boolean
  registerCommerce: (data: {
    name: string
    description_spanish: string
    description_english: string
    email: string
  }) => Promise<void>
}

const CommerceContext = createContext<CommerceContextType | undefined>(undefined)

export function CommerceProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user } = usePrivy()
  const [commerce, setCommerce] = useState<Commerce | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsRegistration, setNeedsRegistration] = useState(false)

  // Check if commerce exists when user authenticates
  useEffect(() => {
    // Wait for Privy to be ready
    if (!ready || !authenticated || !user?.wallet?.address) {
      setCommerce(null)
      setNeedsRegistration(false)
      return
    }

    console.log("Checking commerce for wallet:", user.wallet.address)

    const checkCommerce = async () => {
      setLoading(true)
      setError(null)

      try {
        const walletAddress = user.wallet?.address
        if (!walletAddress) {
          setError("No wallet address found")
          return
        }

        const commerceData = await authService.getCommerce(walletAddress)
        console.log("Commerce found:", commerceData)
        console.log("Email:", commerceData.email)
        console.log("Description English:", commerceData.description_english)
        console.log("Description Spanish:", commerceData.description_spanish)
        setCommerce(commerceData)
        setNeedsRegistration(false)
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          // Commerce doesn't exist, needs registration
          console.log("Commerce not found (404), showing registration modal")
          setNeedsRegistration(true)
        } else if (err instanceof TypeError && err.message.includes("fetch")) {
          // Network error - backend not available
          console.error("Backend connection error. Make sure the backend is running.")
          setError("Unable to connect to backend. Please check your connection and try again.")
        } else {
          // Other error
          console.error("Error checking commerce:", err)
          setError(err instanceof Error ? err.message : "Failed to check commerce")
        }
      } finally {
        setLoading(false)
      }
    }

    checkCommerce()
  }, [ready, authenticated, user?.wallet?.address])

  const registerCommerce = async (data: {
    name: string
    description_spanish: string
    description_english: string
    email: string
  }) => {
    if (!user?.wallet?.address) {
      throw new Error("No wallet address found")
    }

    setLoading(true)
    setError(null)

    try {
      const payload = {
        wallet: user.wallet.address,
        name: data.name,
        description_spanish: data.description_spanish,
        description_english: data.description_english,
        email: data.email,
        // Default values
        currency: "USD",
        currencySymbol: "$",
        minAmount: 1,
        maxAmount: 100000,
        spread: 0,
        icon_url: "https://firebasestorage.googleapis.com/v0/b/deramp-68fb3.firebasestorage.app/o/icons%2Ftrutix_icon%20(2).png?alt=media&token=9cf9645e-d049-47bd-9d52-5bb0fdd8bc82",
        confirmation_url: undefined, // Will be null in backend
      }

      console.log("Registering commerce with payload:", payload)

      const newCommerce = await authService.registerCommerce(payload)

      console.log("Commerce registered successfully:", newCommerce)
      setCommerce(newCommerce)
      setNeedsRegistration(false)
    } catch (err) {
      console.error("Failed to register commerce:", err)
      if (err instanceof ApiError) {
        setError(`Error ${err.status}: ${err.message}`)
      } else {
        setError(err instanceof Error ? err.message : "Failed to register commerce")
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <CommerceContext.Provider
      value={{
        commerce,
        loading,
        error,
        needsRegistration,
        registerCommerce,
      }}
    >
      {children}
    </CommerceContext.Provider>
  )
}

export function useCommerce() {
  const context = useContext(CommerceContext)
  if (context === undefined) {
    throw new Error("useCommerce must be used within a CommerceProvider")
  }
  return context
}

