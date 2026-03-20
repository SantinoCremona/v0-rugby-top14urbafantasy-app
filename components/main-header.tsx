"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { User, LogOut, Menu, X, Shield, Trophy, Users, LayoutDashboard, ArrowRight, BookOpen } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/dashboard", label: "MI EQUIPO", icon: LayoutDashboard },
  { href: "/ranking", label: "RANKING", icon: Trophy },
  { href: "/torneos", label: "TORNEOS", icon: Users },
  { href: "/dashboard#reglas", label: "REGLAS", icon: BookOpen }, // <-- NUEVO ITEM
]

export function MainHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const [nombreDT, setNombreDT] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false) // Menú de usuario (Dropdown)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false) // Menú lateral (Mobile)

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
    <>
      <header className="sticky top-0 z-[100] bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5 h-20">
        <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
          
          {/* LOGO */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex flex-col">
              <span className="font-black text-xl  tracking-tighter leading-none text-white">
                HEAD<span className="text-white/20">COACH</span>
              </span>
              <span className="text-[8px] text-gray-500 font-bold tracking-[0.3em] uppercase">
                URBA 2026
              </span>
            </div>
          </Link>

          {/* NAVEGACIÓN DESKTOP */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all uppercase ${
                    isActive 
                    ? "bg-white text-black shadow-lg" 
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* ACCIONES / MOBILE TOGGLE */}
          <div className="flex items-center gap-4">
            {/* Desktop User Dropdown */}
            <div className="relative hidden md:block">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className={`flex items-center gap-3 pl-4 pr-2 py-2 rounded-2xl border transition-all ${
                  menuOpen ? "bg-white border-white text-black" : "bg-white/5 border-white/10 text-white"
                }`}
              >
                <span className="text-[10px] font-black tracking-widest uppercase">
                  {nombreDT || "MANAGER"}
                </span>
                <div className={`p-1.5 rounded-lg ${menuOpen ? "bg-black text-white" : "bg-white text-black"}`}>
                  <User className="w-3.5 h-3.5" />
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#141416] border border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-white/5 mb-1">
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Head Coach</p>
                    <p className="text-sm font-bold text-white truncate italic">{nombreDT || "Cargando..."}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all uppercase tracking-wider mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-3 bg-white/5 border border-white/10 rounded-2xl text-white active:scale-95 transition-transform"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* MENÚ MOBILE (OVERLAY) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[110] bg-[#0A0A0B] animate-in fade-in slide-in-from-right duration-300 md:hidden flex flex-col p-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <span className="font-black italic text-2xl uppercase tracking-tighter text-white">Menú</span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-4 bg-white/5 rounded-2xl text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-6 rounded-[32px] border transition-all ${
                    isActive 
                    ? "bg-white border-white text-black shadow-2xl" 
                    : "bg-white/5 border-white/5 text-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon className={`w-6 h-6 ${isActive ? "text-black" : "text-gray-500"}`} />
                    <span className="text-2xl font-black italic uppercase tracking-tighter">{item.label}</span>
                  </div>
                  <ArrowRight className={`w-5 h-5 ${isActive ? "text-black" : "text-gray-800"}`} />
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto pt-8 border-t border-white/5">
            <div className="flex items-center gap-4 mb-6 px-4">
               <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white">
                  <User className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Head Coach</p>
                  <p className="text-lg font-black italic text-white leading-none uppercase">{nombreDT || "Sin Equipo"}</p>
               </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full p-6 flex items-center justify-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-[24px] font-black uppercase italic tracking-widest text-[10px]"
            >
              <LogOut className="w-5 h-5" /> Cerrar Sesión de HC
            </button>
          </div>
        </div>
      )}
    </>
  )
}
