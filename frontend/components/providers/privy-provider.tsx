"use client"

import { PrivyProvider } from "@privy-io/react-auth"

export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID

  console.log("Privy Config:", {
    appId: appId ? "✓ Set" : "✗ Missing",
    clientId: clientId ? "✓ Set" : "✗ Missing",
  })

  if (!appId) {
    console.error("❌ NEXT_PUBLIC_PRIVY_APP_ID is not set")
    return <>{children}</>
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#676FFF",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        loginMethods: ["email", "wallet", "google"],
      }}
    >
      {children}
    </PrivyProvider>
  )
}

