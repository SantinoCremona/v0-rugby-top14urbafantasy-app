"use client"

import { useState, useEffect } from "react"
import { MainHeader } from "@/components/main-header"
import { RugbyField } from "@/components/rugby-field"
import { PlayerSelectionPopup } from "@/components/player-selection-popup"
import { ShoppingCart, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Player } from "@/components/player-card"
// Importamos el cliente de navegador de Supabase
import { createClient } from "@/lib/supabase/client"

const INITIAL_BUDGET = 10000

interface DashboardClientProps {
  players: Player[]
  savedTeam?: any[] // Nueva prop para recibir el equipo de la base de datos
}

export function DashboardClient({ players, savedTeam }: DashboardClientProps) {
  const supabase = createClient()
  const [selectedPlayers, setSelectedPlayers] = useState<Map<number, Player>>(new Map())
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [targetPosition, setTargetPosition] = useState<number | null>(null)
  const [targetPositionType, setTargetPositionType] = useState<string>("")
  const [loading, setLoading] = useState(false)

  // EFECTO PARA CARGAR EL EQUIPO GUARDADO AL ENTRAR
  useEffect(() => {
    if (savedTeam && savedTeam.length > 0) {
      const newMap = new Map()
      savedTeam.forEach(item => {
        const player = players.find(p => p.id === item.jugador_id)
        if (player) {
          // Convertimos la posición de texto a número para el Map
          newMap.set(parseInt(item.posicion_en_campo), player)
        }
      })
      setSelectedPlayers(newMap)
    }
  }, [savedTeam, players])

  const totalSpent = Array.from(selectedPlayers.values()).reduce((sum, p) => sum + p.precio, 0)
  const remainingBudget = INITIAL_BUDGET - totalSpent
  const totalPoints = Array.from(selectedPlayers.values()).reduce((sum, p) => sum + p.puntos_totales, 0)
  const playersCount = selectedPlayers.size
  const playersRemaining = 15 - playersCount

  const handleSlotClick = (position: number, positionType: string) => {
    setTargetPosition(position)
    setTargetPositionType(positionType)
    setIsPopupOpen(true)
  }

  const handleSelectPlayer = (player: Player) => {
    if (targetPosition && remainingBudget >= player.precio) {
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
    setSelectedPlayers((prev) => {
      const newMap = new Map(prev)
      newMap.delete(position)
      return newMap
    })
  }

  // FUNCIÓN PARA GUARDAR EN SUPABASE
  const handleSaveTeam = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert("Debes estar logueado para guardar")
      setLoading(false)
      return
    }

    try {
      // 1. Limpiar equipo anterior
      await supabase.from('equipos_usuarios').delete().eq('user_id', user.id)

      // 2. Preparar los 15 (o los que haya) para insertar
      const updates = Array.from(selectedPlayers.entries()).map(([pos, player]) => ({
        user_id: user.id,
        jugador_id: player.id,
        posicion_en_campo: pos.toString()
      }))

      // 3. Insertar en la tabla
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
  const availablePlayers = players.filter((p) => !selectedIds.has(p.id))

  return (
    <div className="min-h-screen bg-white">
      <MainHeader />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl md:text-4xl tracking-tight text-black italic">MI EQUIPO</h1>
            <p className="text-sm text-gray-600">Arma tu XV ideal del Top 14 URBA</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-black text-white hover:bg-gray-800 h-10 px-4">
              <ShoppingCart className="w-4 h-4 mr-2" />
              MERCADO
            </Button>
            <Button 
              onClick={handleSaveTeam}
              disabled={loading}
              variant="outline" 
              className="border-black text-black hover:bg-black hover:text-white h-10 px-4"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "GUARDANDO..." : "GUARDAR"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-black p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-1">Puntos</p>
            <p className="font-display text-4xl md:text-5xl text-black">{totalPoints}</p>
          </div>
          <div className="bg-white border border-black p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-1">Presupuesto</p>
            <p className="font-display text-4xl md:text-5xl text-black">${remainingBudget.toLocaleString('es-AR')}</p>
            <div className="h-1 bg-black mt-2 w-full" />
          </div>
          <div className="bg-black text-white p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Ranking</p>
            <p className="font-display text-4xl md:text-5xl italic">#380</p>
          </div>
          <div className="bg-white border border-black p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-1">Jugadores</p>
            <p className="font-display text-4xl md:text-5xl text-black">{playersCount}/15</p>
          </div>
        </div>

        {playersRemaining > 0 && (
          <div className="flex justify-center mb-6">
            <div className="inline-block border border-black px-6 py-3">
              <p className="text-sm text-gray-700">
                Te faltan <span className="font-bold text-black">{playersRemaining}</span> jugadores para completar tu equipo
              </p>
            </div>
          </div>
        )}

       <RugbyField
  selectedPlayers={new Map(
    Array.from(selectedPlayers.entries()).map(([pos, player]) => [
      pos,
      { 
        id: player.id, 
        nombre: player.nombre, 
        club: player.club // <-- AGREGAMOS ESTA LÍNEA
      },
    ])
  )}
  onSlotClick={handleSlotClick}
  onRemovePlayer={handleRemovePlayer}
/>
        {/* Sección de Reglas y Guía */}
        <section className="mt-12 border-t-2 border-black pt-8 mb-12">
          <h2 className="font-display text-2xl mb-6 italic tracking-tight">REGLAS DEL JUEGO</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Regla 1: Presupuesto */}
            <div className="border border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-bold text-sm mb-2 uppercase tracking-wider flex items-center">
                <span className="bg-black text-white w-5 h-5 flex items-center justify-center mr-2 text-[10px]">1</span>
                Presupuesto Limitado
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Tu XV ideal debe valer <strong>$10.000</strong> o menos. Administrá tus recursos para tener cracks en todas las líneas.
              </p>
            </div>

            {/* Regla 2: Puntuación */}
            <div className="border border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-bold text-sm mb-2 uppercase tracking-wider flex items-center">
                <span className="bg-black text-white w-5 h-5 flex items-center justify-center mr-2 text-[10px]">2</span>
                Sumar Puntos
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Tus jugadores suman puntos reales cada fecha por <strong>tries, tackles realizados y victorias</strong> de sus respectivos clubes.
              </p>
            </div>

            {/* Regla 3: Guardado */}
            <div className="border border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-bold text-sm mb-2 uppercase tracking-wider flex items-center">
                <span className="bg-black text-white w-5 h-5 flex items-center justify-center mr-2 text-[10px]">3</span>
                Confirmar Equipo
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Una vez seleccionados tus 15 jugadores, es <strong>obligatorio</strong> apretar el botón <span className="font-bold">"GUARDAR"</span> para que tu formación quede registrada.
              </p>
            </div>

            {/* Regla 4: Cambios */}
            <div className="border border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-bold text-sm mb-2 uppercase tracking-wider flex items-center">
                <span className="bg-black text-white w-5 h-5 flex items-center justify-center mr-2 text-[10px]">4</span>
                Mercado de Pases
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                ¿Querés cambiar a alguien? Simplemente quitalo con la <span className="font-bold">"X"</span>, elegí al nuevo refuerzo y dale a <span className="font-bold">"GUARDAR"</span> nuevamente.
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
