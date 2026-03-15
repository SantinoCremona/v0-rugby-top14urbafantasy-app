"use client"

import { useState, useEffect } from "react"
import { MainHeader } from "@/components/main-header"
import { RugbyField } from "@/components/rugby-field"
import { PlayerSelectionPopup } from "@/components/player-selection-popup"
import { ShoppingCart, Save, Trash2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Player } from "@/components/player-card"
import { createClient } from "@/lib/supabase/client"

const INITIAL_BUDGET = 10000

// Extendemos la interfaz Player para asegurarnos de que acepte puntos_fecha
interface PlayerWithPoints extends Player {
  puntos_fecha?: { puntos: number; fecha_num: number }[]
}

interface DashboardClientProps {
  players: PlayerWithPoints[] // Usamos la interfaz extendida
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

  // Sincronizar el equipo guardado y sus puntos
  useEffect(() => {
    if (savedTeam && savedTeam.length > 0) {
      const newMap = new Map()
      savedTeam.forEach(item => {
        const player = players.find(p => p.id === item.jugador_id)
        if (player) {
          newMap.set(parseInt(item.posicion_en_campo), player)
        }
      })
      setSelectedPlayers(newMap)
    }
  }, [savedTeam, players])

  const totalSpent = Array.from(selectedPlayers.values()).reduce((sum, p) => sum + p.precio, 0)
  const remainingBudget = INITIAL_BUDGET - totalSpent
  const playersCount = selectedPlayers.size

  const clubCounts = Array.from(selectedPlayers.values()).reduce((acc, p) => {
    acc[p.club] = (acc[p.club] || 0) + 1
    return acc
  }, {} as Record<string, number>)

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
      setTargetPosition(null)
      setTargetPositionType("")
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

  const handleClearTeam = () => {
    if (!mercadoAbierto) return
    if (confirm("¿Estás seguro de que querés vaciar todo tu equipo?")) {
      setSelectedPlayers(new Map())
    }
  }

  const handleSaveTeam = async () => {
    if (!mercadoAbierto) return
    if (remainingBudget < 0) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert("Debes estar logueado para guardar")
      setLoading(false)
      return
    }

    try {
      await supabase
        .from('equipos_usuarios')
        .delete()
        .eq('user_id', user.id)
        .eq('fecha_num', fechaActiva)

      const updates = Array.from(selectedPlayers.entries()).map(([pos, player]) => ({
        user_id: user.id,
        jugador_id: player.id,
        posicion_en_campo: pos.toString(),
        fecha_num: fechaActiva
      }))

      const { error } = await supabase.from('equipos_usuarios').insert(updates)
      if (error) throw error
      alert("¡Equipo guardado con éxito!")
    } catch (error: any) {
      alert("Error al guardar: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedIds = new Set(Array.from(selectedPlayers.values()).map((p) => p.id))
  
  const availablePlayers = players.filter((p) => {
    const isNotSelected = !selectedIds.has(p.id)
    const clubLimitNotReached = (clubCounts[p.club] || 0) < 4
    return isNotSelected && clubLimitNotReached
  })

  return (
    <div className="min-h-screen bg-white">
      <MainHeader />
      <main className="max-w-5xl mx-auto px-4 py-6">
        
        {!mercadoAbierto && (
          <div className="bg-red-600 text-white p-3 mb-6 flex items-center justify-center gap-2 font-display italic uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Lock className="w-5 h-5" />
            Mercado Cerrado - Fecha {fechaActiva} en curso
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl tracking-tight text-black italic text-shadow-sm">MI EQUIPO</h1>
            <p className="text-sm text-gray-600 font-bold uppercase tracking-widest">FECHA {fechaActiva}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleClearTeam}
              variant="outline" 
              disabled={!mercadoAbierto}
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white h-10 px-4 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              LIMPIAR
            </Button>
            <Button 
              onClick={handleSaveTeam}
              disabled={loading || remainingBudget < 0 || !mercadoAbierto}
              variant="outline" 
              className="border-black text-black hover:bg-black hover:text-white h-10 px-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <Save className="w-4 h-4 mr-2" />
              {!mercadoAbierto ? "MERCADO CERRADO" : loading ? "GUARDANDO..." : "GUARDAR"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-400 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] text-black uppercase font-black mb-1">Puntos Fecha {fechaActiva}</p>
            <p className="font-display text-4xl text-black leading-none">{puntosFecha}</p>
          </div>
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] text-gray-600 uppercase font-black mb-1">Presupuesto</p>
            <p className={`font-display text-3xl leading-none ${remainingBudget < 0 ? 'text-red-600' : 'text-black'}`}>
              ${remainingBudget.toLocaleString('es-AR')}
            </p>
          </div>
          <div className="bg-black text-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest">Ranking Global</p>
            <p className="font-display text-4xl italic text-white leading-none">#{rankingPos}</p>
          </div>
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] text-gray-600 uppercase font-black mb-1">Titulares</p>
            <p className="font-display text-4xl text-black leading-none">{playersCount}/15</p>
          </div>
        </div>

        <RugbyField
          selectedPlayers={new Map(
            Array.from(selectedPlayers.entries()).map(([pos, player]) => {
              // BUSCAMOS LOS PUNTOS AQUÍ:
              // Filtramos los puntos de la fecha activa que vienen en el objeto player
              const puntosObj = player.puntos_fecha?.find(pf => pf.fecha_num === fechaActiva);
              const puntosFinales = puntosObj ? puntosObj.puntos : 0;

              return [
                pos,
                { 
                  id: player.id, 
                  nombre: player.nombre, 
                  club: player.club,
                  puntos: puntosFinales 
                },
              ]
            })
          )}
          onSlotClick={handleSlotClick}
          onRemovePlayer={handleRemovePlayer}
        />

        {/* REGLAS SECCION ... (se mantiene igual) */}
      </main>

      <PlayerSelectionPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        positionType={targetPositionType}
        players={availablePlayers}
        onSelectPlayer={handleSelectPlayer}
        remainingBudget={remainingBudget}
      />
    </div>
  )
}
