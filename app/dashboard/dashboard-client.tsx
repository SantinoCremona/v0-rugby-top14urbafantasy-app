// dashboard/dashboard-client.tsx
"use client"

import { useState, useEffect } from "react"
import { MainHeader } from "@/components/main-header"
import { RugbyField } from "@/components/rugby-field"
import { PlayerSelectionPopup } from "@/components/player-selection-popup"
import { Save, Trash2, Lock, Trophy, Wallet, Activity, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Player } from "@/components/player-card"
import { createClient } from "@/lib/supabase/client"

const INITIAL_BUDGET = 10000

interface PlayerWithPoints extends Player {
  puntos_actuales?: number
  is_captain?: boolean
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
              is_captain: item.is_captain || false,
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
  
  // Cálculo total con multiplicador de capitán
  const puntosEnCanchaTotal = Array.from(selectedPlayers.values())
    .reduce((sum, p) => sum + ((p.puntos_actuales || 0) * (p.is_captain ? 2 : 1)), 0)

  const clubCounts = Array.from(selectedPlayers.values()).reduce((acc, p) => {
    acc[p.club] = (acc[p.club] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const handleToggleCaptain = (position: number) => {
    setSelectedPlayers((prev) => {
      const newMap = new Map(prev);
      // Solo un capitán: reseteamos todos primero
      newMap.forEach((p, pos) => newMap.set(pos, { ...p, is_captain: false }));
      
      const player = prev.get(position);
      if (player) newMap.set(position, { ...player, is_captain: true });
      return newMap;
    });
    setManagingPlayer(null);
  }

  const handleSaveTeam = async () => {
    if (!mercadoAbierto || remainingBudget < 0 || loading) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('equipos_usuarios').delete().eq('user_id', user.id).eq('fecha_num', fechaActiva)

      const updates = Array.from(selectedPlayers.entries()).map(([pos, player]) => ({
        user_id: user.id,
        jugador_id: player.id,
        posicion_en_campo: pos.toString(),
        fecha_num: fechaActiva,
        is_captain: player.is_captain || false
      }))

      if (updates.length > 0) {
        await supabase.from('equipos_usuarios').insert(updates)
      }
      alert("¡XV Titular confirmado con capitán!");
      window.location.reload()
    } catch (e) {
      console.error(e)
      alert("Error al guardar.")
    } finally {
      setLoading(false)
    }
  }

  const handleSlotClick = (position: number, positionType: string) => {
    if (!mercadoAbierto) return 
    const existing = selectedPlayers.get(position);
    if (existing) {
      setManagingPlayer({ pos: position, player: existing });
    } else {
      setTargetPosition(position);
      setTargetPositionType(positionType);
      setIsPopupOpen(true);
    }
  }

  const handleRemovePlayer = (position: number) => {
    setSelectedPlayers((prev) => {
      const newMap = new Map(prev)
      newMap.delete(position)
      return newMap
    })
  }

  const handleSelectPlayer = (player: PlayerWithPoints) => {
    if (targetPosition && remainingBudget >= player.precio) {
      setSelectedPlayers((prev) => {
        const newMap = new Map(prev)
        newMap.set(targetPosition, player)
        return newMap
      })
      setIsPopupOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <MainHeader />
      <main className="max-w-7xl mx-auto px-4 py-10 pb-24">
        {/* ENCABEZADO Y DASHBOARD (Igual al tuyo) */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
            Mi XV <span className="italic">Ideal</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="bg-white p-6 rounded-[32px] text-black shadow-xl relative overflow-hidden">
              <p className="font-bold uppercase text-[10px] tracking-widest opacity-70">Puntos con Capitán</p>
              <p className="text-6xl font-black tracking-tighter italic">{puntosEnCanchaTotal}</p>
              <Trophy className="absolute -right-6 -bottom-6 w-28 h-28 text-black/5" />
            </div>
          </div>

          <div className="lg:col-span-9">
            <div className="relative bg-[#141416] border border-white/10 rounded-[40px] p-4">
              <RugbyField
                selectedPlayers={new Map(
                  Array.from(selectedPlayers.entries()).map(([pos, p]) => [
                    pos, { ...p, puntos: p.puntos_actuales || 0, is_captain: p.is_captain }
                  ])
                )}
                onSlotClick={handleSlotClick}
                onRemovePlayer={handleRemovePlayer}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={handleSaveTeam} disabled={loading || !mercadoAbierto} className="flex-1 h-16 bg-emerald-500 text-black font-black uppercase italic rounded-2xl">
                {loading ? <Loader2 className="animate-spin" /> : <Save />} Confirmar Equipo
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* POPUP DE GESTIÓN (Capitán/Quitar) */}
      {managingPlayer && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6" onClick={() => setManagingPlayer(null)}>
          <div className="bg-[#141416] border-4 border-white/10 rounded-[40px] w-full max-w-sm p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{managingPlayer.player.nombre}</h3>
              <p className="text-emerald-400 font-bold text-[10px] tracking-widest uppercase">{managingPlayer.player.posicion}</p>
            </div>
            <div className="grid gap-4">
              <Button onClick={() => handleToggleCaptain(managingPlayer.pos)} className="h-16 bg-yellow-400 text-black font-black uppercase italic rounded-2xl shadow-[0_5px_0_0_#a16207]">
                {managingPlayer.player.is_captain ? "Quitar Capitán" : "Hacer Capitán (x2)"}
              </Button>
              <Button onClick={() => { handleRemovePlayer(managingPlayer.pos); setManagingPlayer(null); }} className="h-16 bg-white/5 hover:bg-red-600 text-gray-400 hover:text-white font-black uppercase italic rounded-2xl">
                Quitar del XV
              </Button>
              <button onClick={() => setManagingPlayer(null)} className="text-[10px] font-bold text-gray-500 uppercase mt-2">Cerrar</button>
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
