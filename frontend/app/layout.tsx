import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import PrivyProviderWrapper from '@/components/providers/privy-provider'
import { DashboardHeader } from '@/components/dashboard-header'
import './globals.css'

export const metadata: Metadata = {
  title: 'Voulti Payouts',
  description: 'Global payouts in PYUSD, settled instantly in local stablecoins',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <PrivyProviderWrapper>
          <div className="min-h-screen bg-background">
            <DashboardHeader />
            <main className="container mx-auto px-4 py-8 max-w-7xl">
              {children}
            </main>
          </div>
        </PrivyProviderWrapper>
        <Analytics />
      </body>
    </html>
  )
}
