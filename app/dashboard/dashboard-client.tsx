"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { RugbyField } from "@/components/rugby-field"
import { MarketPanel } from "@/components/market-panel"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Player } from "@/components/player-card"

const INITIAL_BUDGET = 10000

interface DashboardClientProps {
  players: Player[]
}

export function DashboardClient({ players }: DashboardClientProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Map<number, Player>>(new Map())
  const [isMarketOpen, setIsMarketOpen] = useState(false)
  const [targetPosition, setTargetPosition] = useState<number | null>(null)

  const totalSpent = Array.from(selectedPlayers.values()).reduce((sum, p) => sum + p.precio, 0)
  const remainingBudget = INITIAL_BUDGET - totalSpent
  const totalPoints = Array.from(selectedPlayers.values()).reduce((sum, p) => sum + p.puntos_totales, 0)

  const handleSlotClick = (position: number) => {
    setTargetPosition(position)
    setIsMarketOpen(true)
  }

  const handleSign = (player: Player) => {
    if (targetPosition && remainingBudget >= player.precio) {
      setSelectedPlayers((prev) => {
        const newMap = new Map(prev)
        newMap.set(targetPosition, player)
        return newMap
      })
      setIsMarketOpen(false)
      setTargetPosition(null)
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
    <AppShell>
      <div className="flex flex-col lg:flex-row min-h-full">
        {/* Main content */}
        <div className="flex-1 p-4 md:p-6">
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-card text-card-foreground p-4 border border-border">
              <p className="text-xs text-card-foreground/60 uppercase tracking-wider mb-1">Puntos</p>
              <p className="font-display text-3xl md:text-4xl">{totalPoints}</p>
            </div>
            <div className="bg-card text-card-foreground p-4 border border-border">
              <p className="text-xs text-card-foreground/60 uppercase tracking-wider mb-1">Presupuesto</p>
              <p className="font-display text-3xl md:text-4xl">${remainingBudget.toLocaleString('es-AR')}</p>
            </div>
          </div>

          {/* Rugby field */}
          <div className="mb-6">
            <h2 className="font-display text-xl mb-4 tracking-tight">MI EQUIPO</h2>
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
          </div>

          {/* Mobile market button */}
          <div className="lg:hidden">
            <Button
              onClick={() => setIsMarketOpen(true)}
              className="w-full h-12 font-bold tracking-wider"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              ABRIR MERCADO
            </Button>
          </div>
        </div>

        {/* Market panel - always visible on desktop */}
        <div className="hidden lg:block border-l border-border">
          <MarketPanel
            players={availablePlayers}
            onSign={handleSign}
            isOpen={true}
            onClose={() => {}}
            targetPosition={targetPosition}
          />
        </div>

        {/* Market panel - overlay on mobile */}
        <div className="lg:hidden">
          <MarketPanel
            players={availablePlayers}
            onSign={handleSign}
            isOpen={isMarketOpen}
            onClose={() => {
              setIsMarketOpen(false)
              setTargetPosition(null)
            }}
            targetPosition={targetPosition}
          />
        </div>
      </div>
    </AppShell>
  )
}
