"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, ShoppingCart, Trophy } from "lucide-react"

const navItems = [
  { href: "/dashboard", icon: Home, label: "INICIO" },
  { href: "/mi-equipo", icon: Users, label: "MI EQUIPO" },
  { href: "/mercado", icon: ShoppingCart, label: "MERCADO" },
  { href: "/torneos", icon: Trophy, label: "TORNEOS" },
]

export function DesktopSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="block">
          <h1 className="font-display text-2xl tracking-tight">GRAN DT</h1>
          <p className="text-xs text-sidebar-foreground/60 tracking-widest">URBA TOP 14</p>
        </Link>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wider transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" strokeWidth={2} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-[10px] text-sidebar-foreground/40 tracking-widest uppercase">
          Fantasy Rugby 2026
        </p>
      </div>
    </aside>
  )
}
