"use client"

import { useState, useEffect } from "react"
import { X, TrendingUp, TrendingDown, Minus, Wallet, Search, Loader2, Sword } from "lucide-react"
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

  // Cargar Fixture al abrir el popup
  useEffect(() => {
    if (isOpen) {
      async function fetchFixture() {
        const { data } = await supabase
          .from('fixture')
          .select('local, visitante, fecha_num')
          .eq('fecha_num', 2) // Ajustar a la fecha activa
        
        if (data) setFixture(data)
        setLoadingFixture(false)
      }
      fetchFixture()
    }
  }, [isOpen, supabase])

  if (!isOpen) return null

  const filteredPlayers = players.filter(p => p.posicion === positionType)

  // Helper para encontrar el rival
  const getRival = (clubName: string) => {
    const match = fixture.find(m => m.local === clubName || m.visitante === clubName)
    if (!match) return null
    return match.local === clubName ? match.visitante : match.local
  }

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

        {/* Fondos */}
        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gray-500" />
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Presupuesto</p>
          </div>
          <p className="text-lg font-black text-white italic">
            ${remainingBudget.toLocaleString('es-AR')}
          </p>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {loadingFixture ? (
            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-white/10" /></div>
          ) : filteredPlayers.length === 0 ? (
            <div className="p-12 text-center text-gray-500 uppercase font-black text-xs tracking-widest">No hay disponibles</div>
          ) : (
            <div className="space-y-1">
              {filteredPlayers.sort((a,b) => b.precio - a.precio).map((player) => {
                const canAfford = player.precio <= remainingBudget
                const rival = getRival(player.club)
                
                return (
                  <button
                    key={player.id}
                    onClick={() => canAfford && onSelectPlayer(player)}
                    disabled={!canAfford}
                    className={`w-full group flex items-center justify-between p-4 rounded-2xl transition-all ${
                      canAfford ? "hover:bg-white/5 text-white" : "opacity-30 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-[10px] transition-colors ${
                        canAfford ? "bg-white text-black group-hover:bg-emerald-400" : "bg-white/5 text-gray-600"
                      }`}>
                        {player.club.substring(0, 3).toUpperCase()}
                      </div>
                      
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight italic group-hover:translate-x-1 transition-transform">
                          {player.nombre}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          {/* INFORMACIÓN DEL RIVAL DINÁMICA */}
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
                            <span className="text-[8px] font-black text-gray-600 uppercase italic">vs</span>
                            <span className="text-[9px] font-black text-emerald-400 uppercase italic">{rival || "BYE"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-black text-white">{player.puntos_totales} pts.</span>
                            {getTrendIcon(player.tendencia)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-lg font-black italic tracking-tighter ${canAfford ? 'text-white' : 'text-gray-600'}`}>
                        ${player.precio}
                      </p>
                      {!canAfford && (
                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter bg-rose-500/10 px-1.5 py-0.5 rounded">Sin Fondos</span>
                      )}
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
            Volver
          </Button>
        </div>
      </div>
    </div>
  )
}
