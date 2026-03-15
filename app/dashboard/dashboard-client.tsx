"use client"

import { useState, useEffect } from "react"
import { MainHeader } from "@/components/main-header"
import { RugbyField } from "@/components/rugby-field"
import { PlayerSelectionPopup } from "@/components/player-selection-popup"
import { ShoppingCart, Save, Trash2, Lock } from "lucide-react" // Agregamos Lock
import { Button } from "@/components/ui/button"
import type { Player } from "@/components/player-card"
import { createClient } from "@/lib/supabase/client"

const INITIAL_BUDGET = 10000

interface DashboardClientProps {
  players: Player[]
  savedTeam?: any[]
  rankingPos: number
  mercadoAbierto: boolean // <-- Nueva prop
  fechaActiva: number     // <-- Nueva prop
  puntosFecha: number    // <-- NUEVA PROP sugerida para puntos de la fecha
}

export function DashboardClient({ players, savedTeam, rankingPos, mercadoAbierto, fechaActiva, puntosFecha }: DashboardClientProps) {
  const supabase = createClient()
  const [selectedPlayers, setSelectedPlayers] = useState<Map<number, Player>>(new Map())
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [targetPosition, setTargetPosition] = useState<number | null>(null)
  const [targetPositionType, setTargetPositionType] = useState<string>("")
  const [loading, setLoading] = useState(false)

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
  // Mantenemos totalPoints por si lo usas en otro lado, pero en el cartel usaremos puntosFecha
  const totalPoints = Array.from(selectedPlayers.values()).reduce((sum, p) => sum + p.puntos_totales, 0)
  const playersCount = selectedPlayers.size
  const playersRemaining = 15 - playersCount

  const clubCounts = Array.from(selectedPlayers.values()).reduce((acc, p) => {
    acc[p.club] = (acc[p.club] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const handleSlotClick = (position: number, positionType: string) => {
    // Bloqueamos la apertura del popup si el mercado está cerrado
    if (!mercadoAbierto) return 
    setTargetPosition(position)
    setTargetPositionType(positionType)
    setIsPopupOpen(true)
  }

  const handleSelectPlayer = (player: Player) => {
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
    if (!mercadoAbierto) return // Bloqueamos eliminar si el mercado está cerrado
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
    if (!mercadoAbierto) {
      alert("El mercado está cerrado.")
      return
    }
    if (remainingBudget < 0) {
      alert("No podés guardar un equipo que exceda el presupuesto.")
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert("Debes estar logueado para guardar")
      setLoading(false)
      return
    }

    try {
      // 1. Borramos el equipo anterior del usuario para la fecha específica
      await supabase
        .from('equipos_usuarios')
        .delete()
        .eq('user_id', user.id)
        .eq('fecha_num', fechaActiva)

      // 2. Preparamos los nuevos datos incluyendo la fecha_num
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
        
        {/* BANNER DE MERCADO CERRADO */}
        {!mercadoAbierto && (
          <div className="bg-red-600 text-white p-3 mb-6 flex items-center justify-center gap-2 font-display italic uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Lock className="w-5 h-5" />
            Mercado Cerrado - Fecha {fechaActiva} en curso
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl tracking-tight text-black italic">MI EQUIPO</h1>
            <p className="text-sm text-gray-600">Arma tu XV ideal - Fecha {fechaActiva}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleClearTeam}
              variant="outline" 
              disabled={!mercadoAbierto}
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white h-10 px-4 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] disabled:opacity-30 disabled:grayscale"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              LIMPIAR
            </Button>
            <Button 
              onClick={handleSaveTeam}
              disabled={loading || remainingBudget < 0 || !mercadoAbierto}
              variant="outline" 
              className="border-black text-black hover:bg-black hover:text-white h-10 px-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:shadow-none"
            >
              <Save className="w-4 h-4 mr-2" />
              {!mercadoAbierto ? "MERCADO CERRADO" : remainingBudget < 0 ? "EXCESO $" : loading ? "GUARDANDO..." : "GUARDAR"}
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-1">Puntos Fecha {fechaActiva}</p>
            <p className="font-display text-4xl text-black">{puntosFecha}</p>
          </div>
          <div className="bg-white border border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-1">Presupuesto</p>
            <p className={`font-display text-4xl ${remainingBudget < 0 ? 'text-red-600' : 'text-black'}`}>
              ${remainingBudget.toLocaleString('es-AR')}
            </p>
          </div>
          
          <div className="bg-black text-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Ranking</p>
            <p className="font-display text-4xl italic text-white leading-none">
              #{rankingPos}
            </p>
            <p className="text-[10px] text-gray-500 mt-1 uppercase">Puesto Global</p>
          </div>

          <div className="bg-white border border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-1">Jugadores</p>
            <p className="font-display text-4xl text-black">{playersCount}/15</p>
          </div>
        </div>

        <RugbyField
  selectedPlayers={new Map(
    Array.from(selectedPlayers.entries()).map(([pos, player]) => [
      pos,
      { 
        id: player.id, 
        nombre: player.nombre, 
        club: player.club,
        // Agregamos los puntos aquí (buscando en el array de la relación)
        puntos: player.puntos_fecha?.[0]?.puntos || 0 
      },
    ])
  )}
  onSlotClick={handleSlotClick}
  onRemovePlayer={handleRemovePlayer}
/>

        <section className="mt-12 border-t-2 border-black pt-8 mb-12">
          <h2 className="font-display text-2xl mb-6 italic tracking-tight uppercase">Reglas del Juego</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-bold text-sm mb-2 uppercase tracking-wider flex items-center">
                <span className="bg-black text-white w-5 h-5 flex items-center justify-center mr-2 text-[10px]">1</span>
                Armado del Plantel
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Presupuesto máximo: <strong>$10.000</strong>.</li>
                <li>• Límite por club: Máximo <strong>4 jugadores</strong> de un mismo equipo de la URBA.</li>
              </ul>
            </div>
            <div className="border border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-bold text-sm mb-2 uppercase tracking-wider flex items-center">
                <span className="bg-black text-white w-5 h-5 flex items-center justify-center mr-2 text-[10px]">2</span>
                Sumar Puntos
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Tus jugadores suman puntos por <strong>tries, tackles y victorias</strong> reales de la fecha.
              </p>
            </div>
            <div className="border border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-bold text-sm mb-2 uppercase tracking-wider flex items-center">
                <span className="bg-black text-white w-5 h-5 flex items-center justify-center mr-2 text-[10px]">3</span>
                Confirmar Equipo
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Es <strong>obligatorio</strong> apretar el botón <span className="font-bold uppercase text-xs border border-black px-1 ml-1">Guardar</span> para registrar tus cambios.
              </p>
            </div>
            <div className="border border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-bold text-sm mb-2 uppercase tracking-wider flex items-center">
                <span className="bg-black text-white w-5 h-5 flex items-center justify-center mr-2 text-[10px]">4</span>
                Mercado de Pases
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {mercadoAbierto 
                  ? "Podés quitar jugadores con la X y elegir nuevos refuerzos en cualquier momento."
                  : "El mercado se encuentra CERRADO. No se pueden realizar cambios hasta la próxima fecha."
                }
              </p>
            </div>
          </div>
        </section>
      </main>

      <PlayerSelectionPopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false)
          setTargetPosition(null)
          setTargetPositionType("")
        }}
        positionType={targetPositionType}
        players={availablePlayers}
        onSelectPlayer={handleSelectPlayer}
        remainingBudget={remainingBudget}
      />
    </div>
  )
}
