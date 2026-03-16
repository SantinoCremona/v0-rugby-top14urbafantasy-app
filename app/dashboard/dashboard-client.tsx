"use client"

import { useState, useEffect } from "react"
import { MainHeader } from "@/components/main-header"
import { RugbyField } from "@/components/rugby-field"
import { PlayerSelectionPopup } from "@/components/player-selection-popup"
import { Save, Trash2, Lock, ArrowUpRight, Trophy, Wallet, Users, Activity, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Player } from "@/components/player-card"
import { createClient } from "@/lib/supabase/client"

const INITIAL_BUDGET = 10000

interface PlayerWithPoints extends Player {
  puntos_actuales?: number
}

interface DashboardClientProps {
  players: PlayerWithPoints[]
  savedTeam?: any[]
  rankingPos: number
  mercadoAbierto: boolean
  fechaActiva: number
  puntosFecha: number
}

export function DashboardClient({ players, savedTeam, rankingPos, mercadoAbierto, fechaActiva, puntosFecha }: DashboardClientProps) {
  const supabase = createClient()
  const [selectedPlayers, setSelectedPlayers] = useState<Map<number, PlayerWithPoints>>(new Map())
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [targetPosition, setTargetPosition] = useState<number | null>(null)
  const [targetPositionType, setTargetPositionType] = useState<string>("")
  const [loading, setLoading] = useState(false)

  // Sincronizar equipo guardado y puntos
  useEffect(() => {
    async function cargarEquipoYVincularPuntos() {
      if (savedTeam && savedTeam.length > 0) {
        const { data: puntosData } = await supabase
          .from("puntos_fecha")
          .select("jugador_id, puntos")
          .eq("fecha_num", fechaActiva)

        const newMap = new Map()
        savedTeam.forEach(item => {
          const playerInfo = players.find(p => p.id === item.jugador_id)
          if (playerInfo) {
            const puntosDeEsteJugador = puntosData?.find(pd => pd.jugador_id === playerInfo.id)?.puntos || 0
            newMap.set(parseInt(item.posicion_en_campo), {
              ...playerInfo,
              puntos_actuales: puntosDeEsteJugador
            })
          }
        })
        setSelectedPlayers(newMap)
      }
    }
    cargarEquipoYVincularPuntos()
  }, [savedTeam, players, fechaActiva, supabase])

  // Cálculos de interfaz
  const totalSpent = Array.from(selectedPlayers.values()).reduce((sum, p) => sum + p.precio, 0)
  const remainingBudget = INITIAL_BUDGET - totalSpent
  const playersCount = selectedPlayers.size
  const puntosEnCanchaTotal = Array.from(selectedPlayers.values())
    .reduce((sum, p) => sum + (p.puntos_actuales || 0), 0)

  const clubCounts = Array.from(selectedPlayers.values()).reduce((acc, p) => {
    acc[p.club] = (acc[p.club] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Lógica de guardado corregida para evitar el error de Vercel
  const handleSaveTeam = async () => {
    if (!mercadoAbierto || remainingBudget < 0 || loading) return
    setLoading(true)
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        alert("Sesión expirada. Por favor, reingresa.")
        return
      }

      // 1. Eliminar selección previa
      const { error: deleteError } = await supabase
        .from('equipos_usuarios')
        .delete()
        .eq('user_id', user.id)
        .eq('fecha_num', fechaActiva)

      if (deleteError) throw deleteError

      // 2. Insertar nuevo equipo
      const updates = Array.from(selectedPlayers.entries()).map(([pos, player]) => ({
        user_id: user.id,
        jugador_id: player.id,
        posicion_en_campo: pos.toString(),
        fecha_num: fechaActiva
      }))

      if (updates.length > 0) {
        const { error: insertError } = await supabase
          .from('equipos_usuarios')
          .insert(updates)
        if (insertError) throw insertError
      }

      alert("¡XV Titular confirmado correctamente!")
      
      // Forzar refresco controlado para sincronizar estados
      window.location.reload()

    } catch (e: any) {
      console.error("Error al guardar:", e)
      alert("Hubo un problema al guardar. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleSlotClick = (position: number, positionType: string) => {
    if (!mercadoAbierto) return 
    setTargetPosition(position)
    setTargetPositionType(positionType)
    setIsPopupOpen(true)
  }

  const handleSelectPlayer = (player: PlayerWithPoints) => {
    if (targetPosition && remainingBudget >= player.precio && mercadoAbierto) {
      setSelectedPlayers((prev) => {
        const newMap = new Map(prev)
        newMap.set(targetPosition, player)
        return newMap
      })
      setIsPopupOpen(false)
    }
  }

  const handleRemovePlayer = (position: number) => {
    if (!mercadoAbierto) return 
    setSelectedPlayers((prev) => {
      const newMap = new Map(prev)
      newMap.delete(position)
      return newMap
    })
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-white selection:text-black">
      <MainHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10 pb-24 md:pb-12">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white text-black px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                Fecha {fechaActiva} en Vivo
              </span>
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">URBA TOP 14</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">
              Mi Equipo <span className="text-white italic">Ideal</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => { if(confirm("¿Vaciar campo?")) setSelectedPlayers(new Map()) }}
              variant="outline"
              disabled={!mercadoAbierto || loading}
              className="h-14 border-white/10 bg-white/5 hover:bg-red-500/20 hover:border-red-500/50 text-white rounded-2xl transition-all disabled:opacity-30"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
            <Button 
              onClick={handleSaveTeam} 
              disabled={loading || !mercadoAbierto || remainingBudget < 0}
              className="h-14 bg-white hover:bg-gray-200 text-black px-8 rounded-2xl font-bold uppercase italic flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {loading ? "Guardando..." : "Confirmar XV"}
            </Button>
          </div>
        </div>

        {/* ALERTAS DE ESTADO */}
        {!mercadoAbierto && (
          <div className="bg-red-950/30 border border-red-500/50 text-red-200 p-4 rounded-2xl mb-8 flex items-center gap-3 text-sm">
            <Lock className="w-5 h-5 text-red-500" />
            <span>Mercado <span className="font-bold">CERRADO</span>. Los cambios no están disponibles.</span>
          </div>
        )}
        {remainingBudget < 0 && (
          <div className="bg-red-950 border border-red-500 text-red-200 p-4 rounded-2xl mb-8 flex items-center gap-3 text-sm animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Presupuesto excedido. Ajusta tu equipo para poder confirmar.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PANEL LATERAL: ESTADÍSTICAS */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white p-6 rounded-[32px] text-black shadow-xl shadow-white/5 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <Trophy className="w-6 h-6" />
                <Activity className="w-4 h-4 animate-pulse text-gray-400" />
              </div>
              <p className="font-bold uppercase text-[10px] tracking-widest opacity-70 relative z-10">Puntos de la Fecha</p>
              <p className="text-6xl font-black tracking-tighter italic relative z-10">{puntosEnCanchaTotal}</p>
              <Trophy className="absolute -right-6 -bottom-6 w-28 h-28 text-black/5 group-hover:rotate-12 transition-transform duration-500" />
            </div>

            <div className="bg-[#141416] border border-white/10 p-6 rounded-[32px]">
              <div className="flex items-center justify-between mb-6">
                <div className="p-2 bg-white/5 rounded-xl text-gray-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-white font-black text-xs">
                  {((remainingBudget/INITIAL_BUDGET)*100).toFixed(0)}% Disp.
                </span>
              </div>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Presupuesto</p>
              <p className={`text-3xl font-black ${remainingBudget < 0 ? 'text-red-500' : 'text-white'}`}>
                ${remainingBudget.toLocaleString('es-AR')}
              </p>
              <div className="mt-4 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full transition-all duration-700" style={{ width: `${Math.min(100, (totalSpent / INITIAL_BUDGET) * 100)}%` }}></div>
              </div>
            </div>

            <div className="bg-[#141416] border border-white/10 p-6 rounded-[32px] flex items-center justify-between hover:border-white/30 transition-all">
              <div>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-1">Ranking Global</p>
                <p className="text-3xl font-black">#{rankingPos}</p>
              </div>
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#141416] border border-white/10 p-6 rounded-[32px]">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-gray-400" />
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Alineación</p>
              </div>
              <p className="text-4xl font-black">{playersCount} <span className="text-gray-600 text-2xl">/ 15</span></p>
            </div>
          </div>

          {/* CAMPO DE JUEGO */}
          <div className="lg:col-span-9">
            <div className="relative bg-[#141416] border border-white/10 rounded-[40px] p-4 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <RugbyField
                selectedPlayers={new Map(
                  Array.from(selectedPlayers.entries()).map(([pos, player]) => [
                    pos, { id: player.id, nombre: player.nombre, club: player.club, puntos: player.puntos_actuales || 0 }
                  ])
                )}
                onSlotClick={handleSlotClick}
                onRemovePlayer={handleRemovePlayer}
              />
            </div>
          </div>
        </div>

        {/* REGLAMENTO RÁPIDO */}
        <section className="mt-20">
          <h2 className="text-xl font-bold uppercase tracking-tight italic mb-8 border-l-2 border-white pl-4 text-gray-300">
            Reglamento y Puntuación
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { t: "Presupuesto", d: "$10.000" },
              { t: "Límite Club", d: "Máximo 4" },
              { t: "Cierre", d: "1h previa" },
              { t: "Try", d: "5 Pts" },
              { t: "Patada", d: "2/3 Pts" },
              { t: "Victoria", d: "2 Pts Bonus" },
            ].map((r, i) => (
              <div key={i} className="bg-[#141416] p-5 rounded-[20px] border border-white/5 text-center transition-hover hover:border-white/20">
                <h3 className="font-black uppercase text-[11px] mb-1 italic text-white">{r.t}</h3>
                <p className="text-[10px] font-medium text-gray-500 tracking-tighter">{r.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PlayerSelectionPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        positionType={targetPositionType}
        players={players.filter(p => !Array.from(selectedPlayers.values()).some(sp => sp.id === p.id) && (clubCounts[p.club] || 0) < 4)}
        onSelectPlayer={handleSelectPlayer}
        remainingBudget={remainingBudget}
      />
    </div>
  )
}
