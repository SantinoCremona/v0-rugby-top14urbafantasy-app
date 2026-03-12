"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "MI EQUIPO" },
  { href: "/torneos", label: "TORNEOS" },
]

export function MainHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-black text-white border-b border-gray-800">
      <div className="flex items-center justify-between h-14 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/dashboard" className="flex flex-col">
          <span className="font-display text-lg md:text-xl tracking-tight leading-none">GRAN DT</span>
          <span className="text-[10px] text-gray-400 tracking-widest">URBA TOP 14</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 md:gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs md:text-sm font-medium tracking-wider transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User icon */}
        <button className="p-2 hover:bg-gray-800 transition-colors">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
