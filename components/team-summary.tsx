"use client"

import type { Player } from "./player-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Users, Wallet } from "lucide-react"

interface TeamSummaryProps {
  selectedPlayers: Player[]
  budget: number
  maxPlayers: number
  onRemovePlayer: (playerId: number) => void
}

export function TeamSummary({ 
  selectedPlayers, 
  budget, 
  maxPlayers, 
  onRemovePlayer 
}: TeamSummaryProps) {
  const totalSpent = selectedPlayers.reduce((acc, p) => acc + p.precio, 0)
  const remaining = budget - totalSpent
  const totalPoints = selectedPlayers.reduce((acc, p) => acc + p.puntos_totales, 0)

  return (
    <Card className="p-4 bg-card border-border sticky top-4">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        Mi Equipo
      </h2>

      {/* Budget Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground flex items-center gap-1">
            <Wallet className="h-4 w-4" />
            Presupuesto
          </span>
          <span className={remaining < 0 ? "text-destructive font-bold" : "text-foreground"}>
            ${remaining.toLocaleString('es-AR')}M restantes
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              remaining < 0 ? "bg-destructive" : "bg-primary"
            }`}
            style={{ width: `${Math.min((totalSpent / budget) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Player Count */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <span className="text-muted-foreground">Jugadores</span>
        <span className={`font-bold ${
          selectedPlayers.length === maxPlayers ? "text-primary" : "text-foreground"
        }`}>
          {selectedPlayers.length} / {maxPlayers}
        </span>
      </div>

      {/* Total Points */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <span className="text-muted-foreground">Puntos Totales</span>
        <span className="font-bold text-foreground">{totalPoints}</span>
      </div>

      {/* Selected Players List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {selectedPlayers.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            Selecciona jugadores del mercado
          </p>
        ) : (
          selectedPlayers.map((player) => (
            <div 
              key={player.id} 
              className="flex items-center justify-between bg-secondary/50 rounded p-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {player.nombre}
                </p>
                <p className="text-xs text-muted-foreground">
                  {player.posicion} - ${player.precio}M
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => onRemovePlayer(player.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Confirm Button */}
      {selectedPlayers.length > 0 && (
        <Button 
          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={remaining < 0 || selectedPlayers.length !== maxPlayers}
        >
          Confirmar Equipo
        </Button>
      )}
    </Card>
  )
}
