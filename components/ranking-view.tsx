"use client"

import { useState, useEffect } from "react"
import { Trophy, Shield, Medal, ChevronDown, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface RankingItem {
  user_id: string
  nombre_equipo: string
  puntos_acumulados: number
  club: string
}

export function RankingView({ 
  initialRanking, 
  userClub, 
  currentUserId,
  fechaActiva = 1 // Agregamos prop para saber qué fecha cargar por default
}: { 
  initialRanking: any[], 
  userClub: string,
  currentUserId?: string,
  fechaActiva?: number
}) {
  const supabase = createClient()
  
  // ESTRATEGIA: Cambiamos el default a "FECHA"
  const [view, setView] = useState<"GENERAL" | "FECHA" | "CLUB">("FECHA")
  const [selectedFecha, setSelectedFecha] = useState(fechaActiva)
  const [ranking, setRanking] = useState(initialRanking)
  const [visibleCount, setVisibleCount] = useState(10)
  const [loading, setLoading] = useState(false)

  // Efecto para cargar la fecha por defecto al entrar
  useEffect(() => {
    if (view === "FECHA") {
      fetchRankingFecha(selectedFecha)
    }
  }, [])

  const getLogoPath = (clubName: string) => {
    const fileName = clubName?.toLowerCase().trim().replace(/\s+/g, '-') || 'urba'
    return `/escudos/${fileName}.png`
  }

  const fetchRankingFecha = async (num: number) => {
    setLoading(true)
    setSelectedFecha(num)
    
    try {
      const { data, error } = await supabase
        .from('puntos_usuario_fecha') 
        .select('nombre_equipo, puntos_fecha, user_id, club')
        .eq('fecha_num', num)
        .order('puntos_fecha', { ascending: false })

      if (error) throw error

      if (data) {
        const mapped = data.map(d => ({
          nombre_equipo: d.nombre_equipo,
          puntos_acumulados: d.puntos_fecha, 
          club: d.club,
          user_id: d.user_id
        }))
        setRanking(mapped)
      }
    } catch (err) {
      console.error("Error cargando ranking de fecha:", err)
      setRanking([])
    } finally {
      setLoading(false)
    }
  }

  const toggleView = (newView: "GENERAL" | "FECHA" | "CLUB") => {
    setView(newView)
    setVisibleCount(10)
    if (newView === "GENERAL" || newView === "CLUB") {
        setRanking(initialRanking) // El inicial que viene del server suele ser el General
    } else {
        fetchRankingFecha(selectedFecha)
    }
  }

  const filteredRanking = view === "CLUB" 
    ? ranking.filter(item => item.club?.toUpperCase() === userClub?.toUpperCase())
    : ranking

  const visibleRanking = filteredRanking.slice(0, visibleCount)

  return (
    <div className="space-y-6">
      {/* SELECTOR DE MODO */}
      <div className="flex flex-row overflow-x-auto no-scrollbar gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-full max-w-md mx-auto mb-10">
        <button 
          onClick={() => toggleView("FECHA")}
          className={`flex-1 min-w-fit px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
            view === "FECHA" ? "bg-emerald-500 text-black shadow-lg" : "text-gray-500 hover:text-white"
          }`}
        >
          De la Fecha
        </button>
        <button 
          onClick={() => toggleView("GENERAL")}
          className={`flex-1 min-w-fit px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
            view === "GENERAL" ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
          }`}
        >
          General
        </button>
        <button 
          onClick={() => toggleView("CLUB")}
          className={`flex-1 min-w-fit px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
            view === "CLUB" ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
          }`}
        >
          Mi Club
        </button>
      </div>

      {/* CABECERA DE CLUB (Solo si aplica) */}
      {view === "CLUB" && (
        <div className="flex flex-col items-center mb-10 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 mb-4 bg-white/5 rounded-3xl p-4 border border-white/10 flex items-center justify-center">
            <img 
              src={getLogoPath(userClub)} 
              alt={userClub} 
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = "/escudos/urba.png" }}
            />
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-center leading-none">
            Interna de <span className="text-emerald-400 block mt-1">{userClub}</span>
          </h2>
        </div>
      )}

      {/* SELECTOR DE FECHAS (Visible solo en modo FECHA) */}
      {view === "FECHA" && (
        <div className="flex flex-wrap justify-center gap-3 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => fetchRankingFecha(num)}
              className={`w-12 h-12 rounded-2xl border-2 font-black italic transition-all ${
                selectedFecha === num 
                ? "border-emerald-500 text-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                : "border-white/5 text-gray-600 hover:border-white/20"
              }`}
            >
              F{num}
            </button>
          ))}
        </div>
      )}

      {/* HEADER COLUMNAS */}
      <div className="grid grid-cols-12 px-8 mb-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
        <div className="col-span-2">Pos</div>
        <div className="col-span-7 md:col-span-8">Equipo</div>
        <div className="col-span-3 md:col-span-2 text-right">PTS {view === "FECHA" ? "FECHA" : "TOTAL"}</div>
      </div>

      {/* LISTADO */}
      <div className="space-y-3 pb-10">
        {loading ? (
            <div className="text-center py-20 font-black text-emerald-500 animate-pulse uppercase text-xs tracking-widest">Sincronizando Ranking...</div>
        ) : visibleRanking.map((equipo, index) => {
          const pos = index + 1;
          const esMiUsuario = equipo.user_id === currentUserId;
          const esPodio = pos <= 3;

          return (
            <div 
              key={index} 
              className={`grid grid-cols-12 items-center px-6 py-5 rounded-2xl border transition-all duration-300 ${
                esMiUsuario 
                  ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] z-10 relative" 
                  : esPodio 
                    ? "bg-white/[0.04] border-white/10"
                    : "bg-white/[0.01] border-white/5 hover:border-white/10"
              }`}
            >
              <div className="col-span-2 flex items-center gap-3">
                <span className={`text-2xl font-black italic ${
                  esMiUsuario ? "text-emerald-400" : 
                  pos === 1 ? "text-yellow-500" : 
                  pos === 2 ? "text-slate-300" :
                  pos === 3 ? "text-orange-500" : "text-white/20"
                }`}>
                  #{pos}
                </span>
                {pos === 1 && <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500 hidden md:block" />}
              </div>

              <div className="col-span-7 md:col-span-8 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  esMiUsuario ? "bg-emerald-500 text-black border-emerald-500" : "bg-white/5 border-white/10 text-white/30"
                }`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className={`text-base md:text-xl font-black uppercase italic leading-none block truncate ${
                    esMiUsuario ? "text-emerald-400" : "text-white"
                  }`}>
                    {equipo.nombre_equipo || "XV TITULAR"}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
                    {equipo.club || "URBA"}
                  </span>
                </div>
              </div>

              <div className="col-span-3 md:col-span-2 text-right">
                <p className={`text-2xl md:text-4xl font-black italic tracking-tighter ${
                  esMiUsuario ? "text-emerald-400" : "text-white"
                }`}>
                  {equipo.puntos_acumulados || 0}
                </p>
              </div>
            </div>
          )
        })}

        {filteredRanking.length > visibleCount && !loading && (
          <button 
            onClick={() => setVisibleCount(prev => prev + 20)} 
            className="w-full mt-6 h-16 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 group shadow-xl"
          >
            Ver más posiciones <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  )
}
