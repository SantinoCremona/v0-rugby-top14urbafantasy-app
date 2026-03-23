"use client"

import { useState, useEffect } from "react"
import { X, TrendingUp, TrendingDown, Minus, Wallet, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Player } from "@/components/player-card"
import { createClient } from "@/lib/supabase/client"

interface PlayerSelectionPopupProps {
  isOpen: boolean
  onClose: () => void
  positionType: string
  players: Player[]
  onSelectPlayer: (player: Player) => void
  remainingBudget: number
}

interface Match {
  local: string
  visitante: string
  fecha_num: number
}

const CLUBS = [
  "CASI", "SIC", "HINDU", "BELGRANO", "ALUMNI", "CUBA", 
  "NEWMAN", "BIEI", "ATLÉTICO DEL ROSARIO", "LOS MATREROS", 
  "REGATAS", "CHAMPAGNAT", "LA PLATA", "LOS TILOS"
].sort()

export function PlayerSelectionPopup({
  isOpen,
  onClose,
  positionType,
  players,
  onSelectPlayer,
  remainingBudget
}: PlayerSelectionPopupProps) {
  const supabase = createClient()
  const [fixture, setFixture] = useState<Match[]>([])
  const [loadingFixture, setLoadingFixture] = useState(true)
  const [clubFilter, setClubFilter] = useState<string>("TODOS")

  // Función para normalizar el nombre del club para la imagen
  const getLogoPath = (clubName: string) => {
    // Convierte "La Plata" en "la-plata" y "SIC" en "sic"
    const fileName = clubName.toLowerCase().trim().replace(/\s+/g, '-')
    return `/escudos/${fileName}.png`
  }

  useEffect(() => {
    if (isOpen) {
      async function fetchFixture() {
        setLoadingFixture(true)
        const { data } = await supabase
          .from('fixture')
          .select('local, visitante, fecha_num')
          .eq('fecha_num', 3) 
        
        if (data) setFixture(data)
        setLoadingFixture(false)
      }
      fetchFixture()
    }
  }, [isOpen, supabase])

  if (!isOpen) return null

  const filteredPlayers = players.filter(p => 
    p.posicion === positionType && 
    (clubFilter === "TODOS" || p.club.toUpperCase() === clubFilter.toUpperCase())
  )

  const getTrendIcon = (tendencia: string) => {
    switch (tendencia) {
      case "subiendo": return <TrendingUp className="h-3 w-3 text-emerald-400" />
      case "bajando": return <TrendingDown className="h-3 w-3 text-rose-500" />
      default: return <Minus className="h-3 w-3 text-gray-600" />
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#0A0A0B] border border-white/10 rounded-[32px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                 {positionType}
               </span>
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Mercado</span>
            </div>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Elegir <span className="text-gray-500">Jugador</span></h2>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presupuesto */}
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gray-500" />
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Presupuesto</p>
          </div>
          <p className="text-lg font-black text-white italic">
            ${remainingBudget.toLocaleString('es-AR')}
          </p>
        </div>

        {/* Filtro por Club */}
        <div className="px-6 py-3 bg-white/[0.01] border-b border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            <button
              onClick={() => setClubFilter("TODOS")}
              className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                clubFilter === "TODOS" 
                ? "bg-white text-black border-white" 
                : "bg-transparent text-gray-500 border-white/10 hover:border-white/20"
              }`}
            >
              Todos
            </button>
            {CLUBS.map(club => (
              <button
                key={club}
                onClick={() => setClubFilter(club)}
                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                  clubFilter === club 
                  ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                  : "bg-transparent text-gray-500 border-white/10 hover:border-white/20"
                }`}
              >
                {club}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Jugadores */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-black">
          {loadingFixture ? (
            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>
          ) : filteredPlayers.length === 0 ? (
            <div className="p-12 text-center text-gray-500 uppercase font-black text-xs tracking-widest">No hay disponibles en {clubFilter}</div>
          ) : (
            <div className="space-y-1">
              {filteredPlayers.sort((a,b) => b.precio - a.precio).map((player) => {
                const canAfford = player.precio <= remainingBudget
                const estado = player.estado?.toUpperCase() || 'TITULAR'

                const match = fixture.find(m => 
                  m.local.toUpperCase() === player.club.toUpperCase() || 
                  m.visitante.toUpperCase() === player.club.toUpperCase()
                )
                const esLocal = match?.local.toUpperCase() === player.club.toUpperCase()
                const nombreRival = esLocal ? match?.visitante : match?.local
                const prefijo = esLocal ? "vs" : "@"

                return (
                  <button
                    key={player.id}
                    onClick={() => canAfford && onSelectPlayer(player)}
                    disabled={!canAfford}
                    className={`w-full group flex items-center gap-4 p-4 rounded-2xl transition-all border border-transparent ${
                      canAfford ? "hover:bg-white/5 hover:border-white/5 text-white" : "opacity-30 cursor-not-allowed"
                    }`}
                  >
                    {/* ESCUDO DEL CLUB */}
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent rounded-xl border border-white/5 overflow-hidden group-hover:border-emerald-500/30 transition-all duration-500">
                      <img 
                        src={getLogoPath(player.club)} 
                        alt={player.club}
                        className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.15)] group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          // Si falla la imagen, ocultamos el img y mostramos el texto del club
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.fallback-text');
                          if (fallback) (fallback as HTMLElement).style.display = 'block';
                        }}
                      />
                      <span className="fallback-text hidden text-[10px] font-black text-gray-600 uppercase">
                        {player.club.substring(0,3)}
                      </span>
                    </div>
                      
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-sm uppercase tracking-tight italic truncate">
                          {player.nombre}
                        </p>
                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border ${
                          estado === 'TITULAR' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {estado}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/5 rounded border border-emerald-500/10">
                          <span className="text-[7px] font-black text-emerald-500/40 uppercase italic">{prefijo}</span>
                          <span className="text-[9px] font-black text-emerald-400 uppercase italic truncate max-w-[80px]">
                            {nombreRival || "BYE"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-display italic font-black text-white/90">
                            {player.puntos_totales || 0} <span className="text-[7px] text-gray-500 not-italic">PTS</span>
                          </span>
                          {getTrendIcon(player.tendencia)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4 flex-shrink-0">
                      <p className={`text-base font-black italic tracking-tighter ${canAfford ? 'text-white' : 'text-gray-600'}`}>
                        ${player.precio.toLocaleString()}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/50">
          <Button onClick={onClose} className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] border border-white/10">
            Volver al campo
          </Button>
        </div>
      </div>
    </div>
  )
}
