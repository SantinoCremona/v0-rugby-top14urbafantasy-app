"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { User, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/dashboard", label: "MI EQUIPO" },
  { href: "/torneos", label: "TORNEOS" },
]

export function MainHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const [nombreDT, setNombreDT] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // 1. Cargar el nombre del DT al entrar
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('perfiles')
          .select('nombre_equipo')
          .eq('id', user.id)
          .single()
        
        if (data) setNombreDT(data.nombre_equipo)
      }
    }
    getProfile()
  }, [])

  // 2. Función para cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 bg-black text-white border-b border-gray-800">
      <div className="flex items-center justify-between h-14 px-4 md:px-6 max-w-7xl mx-auto">
        
        {/* Logo */}
        <Link href="/dashboard" className="flex flex-col">
          <span className="font-display text-lg md:text-xl tracking-tight leading-none">GRAN DT</span>
          <span className="text-[10px] text-gray-400 tracking-widest uppercase">URBA TOP 14</span>
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
                  isActive ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User icon & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-2 transition-colors ${menuOpen ? "bg-gray-800" : "hover:bg-gray-800"}`}
          >
            <User className="w-5 h-5" />
          </button>

          {/* Menú desplegable manual */}
          {menuOpen && (
            <>
              {/* Fondo invisible para cerrar el menú al hacer clic fuera */}
              <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />
              
              <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">DT Logueado</p>
                  <p className="text-sm font-bold truncate">
                    {nombreDT ? nombreDT.toUpperCase() : "CARGANDO..."}
                  </p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  CERRAR SESIÓN
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
