"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import type { Player } from "@/components/player-card"

interface MarketPanelProps {
  players: Player[]
  onSign: (player: Player) => void
  isOpen: boolean
  onClose: () => void
  targetPosition: number | null
}

export function MarketPanel({ players, onSign, isOpen, onClose, targetPosition }: MarketPanelProps) {
  const [search, setSearch] = useState("")

  const filteredPlayers = players.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:relative md:inset-auto">
      {/* Backdrop for mobile */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm md:hidden" onClick={onClose} />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l border-border flex flex-col md:relative md:w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-display text-lg tracking-tight">MERCADO</h3>
            {targetPosition && (
              <p className="text-xs text-muted-foreground">Posicion {targetPosition}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted transition-colors md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="BUSCAR JUGADOR"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-sm tracking-wider"
            />
          </div>
        </div>

        {/* Player list */}
        <div className="flex-1 overflow-y-auto">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{player.nombre}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{player.posicion}</span>
                  <span className="text-xs text-muted-foreground">|</span>
                  <span className="text-xs font-medium">${player.precio.toLocaleString()}</span>
                </div>
              </div>
              <Button
                onClick={() => onSign(player)}
                className="ml-2 h-8 px-4 text-xs font-bold tracking-wider"
              >
                FICHAR
              </Button>
            </div>
          ))}

          {filteredPlayers.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No se encontraron jugadores
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
