"use client"

import { Button } from "@/components/ui/button"
import { Wallet, LogIn, LogOut } from "lucide-react"
import { usePrivy } from "@privy-io/react-auth"

export function DashboardHeader() {
  const { ready, authenticated, login, logout, user } = usePrivy()

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Voulti</h1>
              <p className="text-sm text-muted-foreground">Instant Payouts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {authenticated && user && (
              <div className="text-sm text-muted-foreground">
                {user.email?.address || user.wallet?.address?.slice(0, 6) + "..." + user.wallet?.address?.slice(-4)}
              </div>
            )}

            <Button
              onClick={authenticated ? logout : login}
              size="lg"
              variant={authenticated ? "outline" : "default"}
              className="gap-2"
              disabled={!ready}
            >
              {authenticated ? (
                <>
                  <LogOut className="w-5 h-5" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {ready ? "Login" : "Loading..."}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
