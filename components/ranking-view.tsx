"use client"

import { useState } from "react"
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
  currentUserId 
}: { 
  initialRanking: any[], 
  userClub: string,
  currentUserId?: string 
}) {
  const supabase = createClient()
  const [view, setView] = useState<"GENERAL" | "FECHA" | "CLUB">("GENERAL")
  const [selectedFecha, setSelectedFecha] = useState(1)
  const [ranking, setRanking] = useState(initialRanking)
  const [visibleCount, setVisibleCount] = useState(10)
  const [loading, setLoading] = useState(false)

  const getLogoPath = (clubName: string) => {
    const fileName = clubName?.toLowerCase().trim().replace(/\s+/g, '-') || 'casi'
    return `/escudos/${fileName}.png`
  }

  const fetchRankingFecha = async (num: number) => {
    setLoading(true)
    setSelectedFecha(num)
    
    try {
      const { data, error } = await supabase
        .from('puntos_usuario_fecha') 
        .select('nombre_equipo, puntos_fecha, user_id')
        .eq('fecha_num', num)
        .order('puntos_fecha', { ascending: false })

      if (error) {
        console.error("Error Supabase View:", error)
        setRanking([])
        return
      }

      if (data && data.length > 0) {
        const mapped = data.map(d => ({
          nombre_equipo: d.nombre_equipo,
          puntos_acumulados: d.puntos_fecha, 
          club: d.club,
          user_id: d.user_id
        }))
        setRanking(mapped)
      } else {
        setRanking([])
      }
    } catch (err) {
      console.error("Error inesperado:", err)
      setRanking([])
    } finally {
      setLoading(false)
    }
  }

  const toggleView = (newView: "GENERAL" | "FECHA" | "CLUB") => {
    setView(newView)
    setVisibleCount(10)
    if (newView === "GENERAL" || newView === "CLUB") {
        setRanking(initialRanking)
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
      <div className="flex flex-wrap justify-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit mx-auto mb-10">
        <button 
          onClick={() => toggleView("GENERAL")}
          className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            view === "GENERAL" ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
          }`}
        >
          General
        </button>
        <button 
          onClick={() => toggleView("CLUB")}
          className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            view === "CLUB" ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
          }`}
        >
          Mi Club
        </button>
        <button 
          onClick={() => toggleView("FECHA")}
          className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            view === "FECHA" ? "bg-emerald-500 text-black shadow-lg" : "text-gray-500 hover:text-white"
          }`}
        >
          Por Fecha
        </button>
      </div>

      {/* CABECERA DE CLUB */}
      {view === "CLUB" && (
        <div className="flex flex-col items-center mb-10 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 mb-4 bg-white/5 rounded-3xl p-4 border border-white/10 flex items-center justify-center">
            <img 
              src={getLogoPath(userClub)} 
              alt={userClub} 
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = "/escudos/default.png" }}
            />
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-center">
            Interna de <span className="text-emerald-400">{userClub}</span>
          </h2>
        </div>
      )}

      {/* SELECTOR DE FECHAS */}
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
        <div className="col-span-2">Posición</div>
        <div className="col-span-7 md:col-span-8">Equipo</div>
        <div className="col-span-3 md:col-span-2 text-right">Puntos {view === "FECHA" ? "Fecha" : "Totales"}</div>
      </div>

      {/* LISTADO */}
      <div className="space-y-3">
        {loading ? (
            <div className="text-center py-20 font-black text-emerald-500 animate-pulse uppercase text-xs tracking-widest">Cargando...</div>
        ) : visibleRanking.map((equipo, index) => {
          const esPrimero = index === 0;
          const esPodio = index < 3;
          const esMiUsuario = equipo.user_id === currentUserId;

          return (
            <div 
              key={index} 
              className={`grid grid-cols-12 items-center px-6 py-5 rounded-2xl border transition-all duration-300 ${
                esMiUsuario 
                  ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                  : esPrimero 
                    ? "bg-white border-white text-black shadow-[0_0_30px_rgba(255,255,255,0.1)]" 
                    : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <div className="col-span-2 flex items-center gap-3">
                <span className={`text-2xl font-black italic ${esMiUsuario ? "text-emerald-400" : esPrimero ? "text-black" : "text-white/40"}`}>
                  #{index + 1}
                </span>
                {esPrimero && <Trophy className="w-5 h-5 text-black fill-black" />}
                {esMiUsuario && !esPrimero && <Star className="w-4 h-4 text-emerald-400 fill-emerald-400 animate-pulse" />}
              </div>

              <div className="col-span-7 md:col-span-8 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  esMiUsuario ? "bg-emerald-500 border-emerald-500 text-black" : esPrimero ? "bg-black border-black text-white" : "bg-white/5 border-white/10 text-white/30"
                }`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-base md:text-xl font-black uppercase italic leading-none block ${
                    esMiUsuario ? "text-emerald-400" : esPrimero ? "text-black" : "text-white"
                  }`}>
                    {equipo.nombre_equipo || "XV SIN NOMBRE"} {esMiUsuario && "(VOS)"}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${
                    esMiUsuario ? "text-emerald-500/60" : esPrimero ? "text-black/50" : "text-gray-600"
                  }`}>
                    {view === "FECHA" ? `RESULTADO FECHA ${selectedFecha}` : (view === "CLUB" ? `HEAD COACH DE ${userClub}` : `HINCHA DE ${equipo.club || 'URBA'}`)}
                  </span>
                </div>
              </div>

              <div className="col-span-3 md:col-span-2 text-right">
                <p className={`text-2xl md:text-4xl font-black italic tracking-tighter ${
                  esMiUsuario ? "text-emerald-400" : esPrimero ? "text-black" : "text-emerald-400"
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
            className="w-full mt-6 py-6 border border-dashed border-white/10 rounded-[32px] text-[10px] font-black uppercase tracking-[0.3em] bg-white text-black hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 group"
          >
            Ver resto del ranking <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>
        )}

        {!loading && visibleRanking.length === 0 && (
          <div className="text-center py-20 text-gray-500 font-bold uppercase text-xs border border-dashed border-white/10 rounded-2xl">
            No hay datos para esta selección
          </div>
        )}
      </div>
    </div>
  )
}
