"use client"

import { useState, useEffect } from "react"
import { MainHeader } from "@/components/main-header"
import { RugbyField } from "@/components/rugby-field"
import { PlayerSelectionPopup } from "@/components/player-selection-popup"
import { 
  Save, Trash2, Lock, ArrowUpRight, Trophy, Wallet, Users, 
  Activity, AlertTriangle, Loader2, Clock, DollarSign, CheckCircle2 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Player } from "@/components/player-card"
import { createClient } from "@/lib/supabase/client"

const INITIAL_BUDGET = 10000

interface PlayerWithPoints extends Player {
  puntos_actuales?: number
  es_capitan?: boolean // Agregado para el Capitán
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
  
  // Nuevo estado para el menú de gestión (Capitán/Quitar)
  const [managingPlayer, setManagingPlayer] = useState<{pos: number, player: PlayerWithPoints} | null>(null);

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
              es_capitan: item.es_capitan || false, // Cargamos estado del capitán
              puntos_actuales: puntosDeEsteJugador
            })
          }
        })
        setSelectedPlayers(newMap)
      }
    }
    cargarEquipoYVincularPuntos()
  }, [savedTeam, players, fechaActiva, supabase])

  const totalSpent = Array.from(selectedPlayers.values()).reduce((sum, p) => sum + p.precio, 0)
  const remainingBudget = INITIAL_BUDGET - totalSpent
  const playersCount = selectedPlayers.size
  
  // Cálculo total: los puntos del capitán valen x2
  const puntosEnCanchaTotal = Array.from(selectedPlayers.values())
    .reduce((sum, p) => sum + ((p.puntos_actuales || 0) * (p.es_capitan ? 2 : 1)), 0)

  const clubCounts = Array.from(selectedPlayers.values()).reduce((acc, p) => {
    acc[p.club] = (acc[p.club] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Función para manejar la capitanía
  const handleToggleCaptain = (position: number) => {
    setSelectedPlayers((prev) => {
      const newMap = new Map(prev);
      // Solo puede haber un capitán: quitamos a todos primero
      newMap.forEach((p, pos) => newMap.set(pos, { ...p, es_capitan: false }));
      
      const player = prev.get(position);
      if (player) {
        newMap.set(position, { ...player, es_capitan: true });
      }
      return newMap;
    });
    setManagingPlayer(null);
  }

  const handleClearField = async () => {
    if (!mercadoAbierto || loading) return
    if (!confirm("¿Estás seguro que querés vaciar tu XV? Esta acción se guardará automáticamente.")) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase
        .from('equipos_usuarios')
        .delete()
        .eq('user_id', user.id)
        .eq('fecha_num', fechaActiva)

      if (error) throw error
      setSelectedPlayers(new Map())
      alert("XV vaciado y guardado correctamente.")
    } catch (e) {
      console.error(e)
      alert("Hubo un error al intentar vaciar el equipo.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTeam = async () => {
    if (!mercadoAbierto || remainingBudget < 0 || loading) return
    setLoading(true)
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        alert("Sesión expirada. Por favor, reingresa.")
        return
      }

      const { error: deleteError } = await supabase
        .from('equipos_usuarios')
        .delete()
        .eq('user_id', user.id)
        .eq('fecha_num', fechaActiva)

      if (deleteError) throw deleteError

      const updates = Array.from(selectedPlayers.entries()).map(([pos, player]) => ({
        user_id: user.id,
        jugador_id: player.id,
        posicion_en_campo: pos.toString(),
        fecha_num: fechaActiva,
        es_capitan: player.es_capitan || false // Guardamos el estado del capitán
      }))

      if (updates.length > 0) {
        const { error: insertError } = await supabase
          .from('equipos_usuarios')
          .insert(updates)
        if (insertError) throw insertError
      }

      alert("¡XV Titular confirmado correctamente!");
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
    const existing = selectedPlayers.get(position);
    if (existing) {
      // Si el slot está ocupado, abrimos menú de Capitán/Quitar
      setManagingPlayer({ pos: position, player: existing });
    } else {
      // Si está vacío, abrimos selección normal
      setTargetPosition(position)
      setTargetPositionType(positionType)
      setIsPopupOpen(true)
    }
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
        <div className="mb-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="bg-white text-black px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              Fecha {fechaActiva}
            </span>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">URBA TOP 14</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">
            Mi XV <span className="text-white italic">Ideal</span>
          </h1>
        </div>

        {!mercadoAbierto && (
          <div className="bg-red-950/30 border border-red-500/50 text-red-200 p-4 rounded-2xl mb-8 flex items-center gap-3 text-sm">
            <Lock className="w-5 h-5 text-red-500" />
            <span>Mercado <span className="font-bold">CERRADO</span>. Los cambios no están disponibles.</span>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 mb-6 md:hidden">
          <div className="bg-[#1A3A2A] border border-white/10 rounded-2xl p-2 flex flex-col items-center justify-center text-center">
            <span className="text-[7px] font-black text-emerald-400 uppercase tracking-tighter mb-1 leading-none">Puntos</span>
            <span className="text-sm font-black text-white italic leading-none">{puntosEnCanchaTotal}</span>
          </div>
          <div className="bg-[#1A3A2A] border border-white/10 rounded-2xl p-2 flex flex-col items-center justify-center text-center">
            <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter mb-1 leading-none">Presup.</span>
            <span className="text-[10px] font-black text-white italic leading-none">${(remainingBudget / 1000).toFixed(0)}k</span>
          </div>
          <div className="bg-[#1A3A2A] border border-white/10 rounded-2xl p-2 flex flex-col items-center justify-center text-center">
            <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter mb-1 leading-none">Ranking</span>
            <span className="text-sm font-black text-white italic leading-none">#{rankingPos}</span>
          </div>
          <div className="bg-[#1A3A2A] border border-white/10 rounded-2xl p-2 flex flex-col items-center justify-center text-center">
            <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter mb-1 leading-none">Equipo</span>
            <span className="text-sm font-black text-emerald-400 italic leading-none">{playersCount}/15</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="bg-white p-6 rounded-[32px] text-black shadow-xl shadow-white/5 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <Trophy className="w-6 h-6" />
                <Activity className="w-4 h-4 animate-pulse text-gray-400" />
              </div>
              <p className="font-bold uppercase text-[10px] tracking-widest opacity-70 relative z-10">Puntos de la Fecha</p>
              <p className="text-6xl font-black tracking-tighter italic relative z-10">{puntosEnCanchaTotal}</p>
              <Trophy className="absolute -right-6 -bottom-6 w-28 h-28 text-black/5" />
            </div>
            <div className="bg-[#141416] border border-white/10 p-6 rounded-[32px]">
              <div className="flex items-center justify-between mb-6">
                <div className="p-2 bg-white/5 rounded-xl text-gray-400"><Wallet className="w-5 h-5" /></div>
                <span className="text-white font-black text-xs">{((remainingBudget/INITIAL_BUDGET)*100).toFixed(0)}% Disp.</span>
              </div>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Presupuesto</p>
              <p className={`text-3xl font-black ${remainingBudget < 0 ? 'text-red-500' : 'text-white'}`}>
                ${remainingBudget.toLocaleString('es-AR')}
              </p>
            </div>
          </div>

          <div className="lg:col-span-9">
            <div className="relative bg-[#141416] border border-white/10 rounded-[40px] p-2 md:p-4 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <RugbyField
                selectedPlayers={new Map(
                  Array.from(selectedPlayers.entries()).map(([pos, player]) => [
                    pos, { ...player, puntos: player.puntos_actuales || 0, es_capitan: player.es_capitan }
                  ])
                )}
                onSlotClick={handleSlotClick}
                onRemovePlayer={handleRemovePlayer}
              />
            </div>

            <div className="mt-6 flex flex-col md:flex-row gap-3">
              <Button onClick={handleSaveTeam} disabled={loading || !mercadoAbierto || remainingBudget < 0}
                className="flex-1 h-16 bg-emerald-500 hover:bg-emerald-600 text-black rounded-2xl font-black uppercase italic flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-[0_10px_20px_rgba(16,185,129,0.2)]">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                {loading ? "Guardando..." : "Confirmar XV Titular"}
              </Button>
              <Button onClick={handleClearField} disabled={!mercadoAbierto || loading}
                className="h-16 px-6 bg-red-600 hover:bg-red-700 text-white border-none rounded-2xl transition-all disabled:opacity-30 active:scale-95 flex items-center justify-center shadow-[0_10px_20px_rgba(220,38,38,0.2)]">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Trash2 className="w-6 h-6" />}
              </Button>
            </div>
            {remainingBudget < 0 && (
              <div className="mt-4 bg-red-950 border border-red-500 text-red-200 p-4 rounded-2xl flex items-center gap-3 text-sm animate-pulse">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Presupuesto excedido por ${Math.abs(remainingBudget).toLocaleString()}.</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* POPUP DE GESTIÓN (CAPITÁN / QUITAR) */}
      {managingPlayer && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6" onClick={() => setManagingPlayer(null)}>
          <div className="bg-[#141416] border-4 border-white/10 rounded-[40px] w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{managingPlayer.player.nombre}</h3>
              <p className="text-emerald-400 font-bold uppercase text-[10px] tracking-[0.2em]">{managingPlayer.player.posicion} | {managingPlayer.player.club}</p>
            </div>
            <div className="grid gap-4">
              <Button onClick={() => handleToggleCaptain(managingPlayer.pos)}
                className="h-16 bg-yellow-400 hover:bg-yellow-500 text-black font-black uppercase italic rounded-2xl border-b-4 border-yellow-700 active:border-b-0 transition-all">
                {managingPlayer.player.es_capitan ? "Quitar Capitanía" : "Hacer Capitán (x2 Puntos)"}
              </Button>
              <Button onClick={() => { handleRemovePlayer(managingPlayer.pos); setManagingPlayer(null); }}
                className="h-16 bg-white/5 hover:bg-red-600 hover:text-white text-gray-400 font-black uppercase italic rounded-2xl transition-all">
                Quitar del XV
              </Button>
              <button onClick={() => setManagingPlayer(null)} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">Volver</button>
            </div>
          </div>
        </div>
      )}

      <PlayerSelectionPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        positionType={targetPositionType}
        players={players.filter(p => !Array.from(selectedPlayers.values()).some(sp => sp.id === p.id))}
        onSelectPlayer={handleSelectPlayer}
        remainingBudget={remainingBudget}
        clubCounts={clubCounts} 
      />
    </div>
  )
}
