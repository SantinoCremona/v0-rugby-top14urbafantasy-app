"use client"

import { useState } from "react"
import { MainHeader } from "@/components/main-header"
import { RugbyField } from "@/components/rugby-field"
import { PlayerSelectionPopup } from "@/components/player-selection-popup"
import { ShoppingCart, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Player } from "@/components/player-card"

const INITIAL_BUDGET = 10000

interface DashboardClientProps {
  players: Player[]
}

export function DashboardClient({ players }: DashboardClientProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Map<number, Player>>(new Map())
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [targetPosition, setTargetPosition] = useState<number | null>(null)
  const [targetPositionType, setTargetPositionType] = useState<string>("")

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

  // Get available players (not already selected)
  const selectedIds = new Set(Array.from(selectedPlayers.values()).map((p) => p.id))
  const availablePlayers = players.filter((p) => !selectedIds.has(p.id))

  return (
    <div className="min-h-screen bg-white">
      <MainHeader />
      
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Page header */}
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
            <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white h-10 px-4">
              <Save className="w-4 h-4 mr-2" />
              GUARDAR
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Puntos */}
          <div className="bg-white border border-black p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-1">Puntos</p>
            <p className="font-display text-4xl md:text-5xl text-black">{totalPoints}</p>
          </div>
          
          {/* Presupuesto */}
          <div className="bg-white border border-black p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-1">Presupuesto</p>
            <p className="font-display text-4xl md:text-5xl text-black">${remainingBudget.toLocaleString('es-AR')}</p>
            <div className="h-1 bg-black mt-2 w-full" />
          </div>
          
          {/* Ranking */}
          <div className="bg-black text-white p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Ranking</p>
            <p className="font-display text-4xl md:text-5xl italic">#380</p>
          </div>
          
          {/* Jugadores */}
          <div className="bg-white border border-black p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wider font-bold mb-1">Jugadores</p>
            <p className="font-display text-4xl md:text-5xl text-black">{playersCount}/15</p>
          </div>
        </div>

        {/* Missing players message */}
        {playersRemaining > 0 && (
          <div className="flex justify-center mb-6">
            <div className="inline-block border border-black px-6 py-3">
              <p className="text-sm text-gray-700">
                Te faltan <span className="font-bold text-black">{playersRemaining}</span> jugadores para completar tu equipo
              </p>
            </div>
          </div>
        )}

        {/* Rugby field */}
        <RugbyField
          selectedPlayers={new Map(
            Array.from(selectedPlayers.entries()).map(([pos, player]) => [
              pos,
              { id: player.id, nombre: player.nombre },
            ])
          )}
          onSlotClick={handleSlotClick}
          onRemovePlayer={handleRemovePlayer}
        />
      </main>

      {/* Player selection popup */}
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
