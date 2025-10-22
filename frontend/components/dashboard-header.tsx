"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wallet, LogIn, LogOut, User } from "lucide-react"
import { usePrivy } from "@privy-io/react-auth"
import { MainNav } from "@/components/main-nav"

export function DashboardHeader() {
  const { ready, authenticated, login, logout, user } = usePrivy()

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Voulti</h1>
              <p className="text-sm text-muted-foreground">Your Business, Unchained.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {authenticated && (
              <Link href="/account">
                <Button variant="outline" size="lg" className="gap-2">
                  <User className="w-5 h-5" />
                  Account
                </Button>
              </Link>
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
        
        {authenticated && <MainNav />}
      </div>
    </header>
  )
}
