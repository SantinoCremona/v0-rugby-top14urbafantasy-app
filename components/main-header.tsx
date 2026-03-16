"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { User, LogOut, ChevronDown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/dashboard", label: "MI EQUIPO" },
  { href: "/ranking", label: "RANKING" },
  { href: "/torneos", label: "TORNEOS" },
]

export function MainHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const [nombreDT, setNombreDT] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

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
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center justify-between h-16 px-4 md:px-8 max-w-7xl mx-auto">
        
        {/* LOGO: Tipografía Pesada */}
        <Link href="/dashboard" className="flex flex-col group">
          <span className="font-black text-xl md:text-2xl tracking-tighter leading-none group-hover:text-gray-300 transition-colors">
            GRAN<span className="text-white not-italic"> DT</span>
          </span>
          <span className="text-[9px] text-gray-500 font-bold tracking-[0.3em] uppercase">
            URBA TOP 14
          </span>
        </Link>

        {/* NAVEGACIÓN: Minimalista */}
        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[11px] font-black tracking-[0.2em] transition-all relative py-2 ${
                  isActive ? "text-white" : "text-gray-500 hover:text-white"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full animate-in fade-in zoom-in duration-300" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* SECCIÓN USUARIO */}
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex items-center gap-3 pl-4 pr-2 py-2 rounded-full border transition-all ${
              menuOpen ? "bg-white border-white" : "bg-white/5 border-white/10 hover:border-white/30"
            }`}
          >
            <span className={`hidden md:block text-[10px] font-black tracking-widest uppercase ${
              menuOpen ? "text-black" : "text-gray-400"
            }`}>
              {nombreDT ? nombreDT : "MI PERFIL"}
            </span>
            <div className={`p-1 rounded-full ${menuOpen ? "bg-black text-white" : "bg-white text-black"}`}>
              <User className="w-4 h-4" />
            </div>
          </button>

          {/* MENÚ DESPLEGABLE: Estética Dark Premium */}
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />
              
              <div className="absolute right-0 mt-3 w-56 bg-[#141416] border border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-white/5 mb-1">
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Director Técnico</p>
                  <p className="text-sm font-bold text-white truncate italic">
                    {nombreDT ? nombreDT.toUpperCase() : "CARGANDO..."}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all uppercase tracking-wider mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
