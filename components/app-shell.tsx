"use client"

import { DesktopSidebar } from "./desktop-sidebar"
import { BottomNav } from "./bottom-nav"
import { MobileHeader } from "./mobile-header"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col md:ml-0">
        <MobileHeader />
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
