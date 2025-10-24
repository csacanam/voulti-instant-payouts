"use client"

import { usePrivy } from "@privy-io/react-auth"
import { RecipientProvider } from "@/components/providers/recipient-provider"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function RecipientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { authenticated, user, logout, ready } = usePrivy()

  return (
    <RecipientProvider>
      <div className="min-h-screen bg-background">
        {/* Minimal Header - Only for recipient portal */}
        {authenticated && (
          <header className="border-b bg-card sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">Voulti</h1>
                  <p className="text-xs text-muted-foreground">Your Business, Unchained.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {user?.email?.address}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    disabled={!ready}
                    className="gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Content */}
        <main>{children}</main>
      </div>
    </RecipientProvider>
  )
}

