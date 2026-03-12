"use client"

import { X, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Player } from "@/components/player-card"

interface PlayerSelectionPopupProps {
  isOpen: boolean
  onClose: () => void
  positionType: string
  players: Player[]
  onSelectPlayer: (player: Player) => void
  remainingBudget: number
}

export function PlayerSelectionPopup({
  isOpen,
  onClose,
  positionType,
  players,
  onSelectPlayer,
  remainingBudget
}: PlayerSelectionPopupProps) {
  if (!isOpen) return null

  // Filter players by position type
  const filteredPlayers = players.filter(p => p.posicion === positionType)

  const getTrendIcon = (tendencia: string) => {
    switch (tendencia) {
      case "subiendo":
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case "bajando":
        return <TrendingDown className="h-3 w-3 text-red-500" />
      default:
        return <Minus className="h-3 w-3 text-gray-500" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white border border-black max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black bg-black text-white">
          <div>
            <h2 className="font-display text-lg tracking-tight uppercase">{positionType}</h2>
            <p className="text-xs text-gray-400">Selecciona un jugador</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Budget indicator */}
        <div className="px-4 py-2 bg-gray-100 border-b border-black">
          <p className="text-xs text-gray-600">Presupuesto disponible: <span className="font-bold text-black">${remainingBudget.toLocaleString('es-AR')}</span></p>
        </div>

        {/* Players list */}
        <div className="flex-1 overflow-y-auto">
          {filteredPlayers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">No hay jugadores disponibles para esta posicion</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPlayers.map((player) => {
                const canAfford = player.precio <= remainingBudget
                return (
                  <button
                    key={player.id}
                    onClick={() => canAfford && onSelectPlayer(player)}
                    disabled={!canAfford}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                      canAfford 
                        ? "hover:bg-gray-100" 
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Player avatar */}
                      <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-sm">
                        {player.nombre.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-black uppercase tracking-wide">{player.nombre}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{player.puntos_totales} pts</span>
                          {getTrendIcon(player.tendencia)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg text-black">${player.precio.toLocaleString('es-AR')}</p>
                      {!canAfford && (
                        <p className="text-[10px] text-red-500 uppercase">Sin fondos</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full h-10 border-black text-black hover:bg-black hover:text-white"
          >
            CANCELAR
          </Button>
        </div>
      </div>
    </div>
  )
}
