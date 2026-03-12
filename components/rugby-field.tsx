"use client"

import { Plus, X } from "lucide-react"

interface PlayerSlot {
  position: number
  name: string | null
  x: number
  y: number
}

interface RugbyFieldProps {
  selectedPlayers: Map<number, { id: string; nombre: string }>
  onSlotClick: (position: number) => void
  onRemovePlayer: (position: number) => void
}

// Rugby positions layout (15 players)
const positions: PlayerSlot[] = [
  // Backs (Tres Cuartos)
  { position: 15, name: "Fullback", x: 50, y: 90 },
  { position: 14, name: "Wing", x: 85, y: 75 },
  { position: 13, name: "Centro", x: 65, y: 65 },
  { position: 12, name: "Centro", x: 35, y: 65 },
  { position: 11, name: "Wing", x: 15, y: 75 },
  { position: 10, name: "Apertura", x: 50, y: 50 },
  { position: 9, name: "Medio", x: 35, y: 40 },
  // Forwards (Pack)
  { position: 8, name: "N8", x: 50, y: 28 },
  { position: 7, name: "Ala", x: 70, y: 25 },
  { position: 6, name: "Ala", x: 30, y: 25 },
  { position: 5, name: "Segunda", x: 60, y: 18 },
  { position: 4, name: "Segunda", x: 40, y: 18 },
  { position: 3, name: "Pilar", x: 65, y: 10 },
  { position: 2, name: "Hooker", x: 50, y: 10 },
  { position: 1, name: "Pilar", x: 35, y: 10 },
]

export function RugbyField({ selectedPlayers, onSlotClick, onRemovePlayer }: RugbyFieldProps) {
  return (
    <div className="relative w-full aspect-[3/4] max-w-md mx-auto bg-card border border-border">
      {/* Field lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Field outline */}
        <rect x="5" y="5" width="90" height="90" fill="none" stroke="white" strokeWidth="0.3" opacity="0.3" />
        {/* Try lines */}
        <line x1="5" y1="15" x2="95" y2="15" stroke="white" strokeWidth="0.3" opacity="0.3" />
        <line x1="5" y1="85" x2="95" y2="85" stroke="white" strokeWidth="0.3" opacity="0.3" />
        {/* 22m lines */}
        <line x1="5" y1="30" x2="95" y2="30" stroke="white" strokeWidth="0.2" opacity="0.2" />
        <line x1="5" y1="70" x2="95" y2="70" stroke="white" strokeWidth="0.2" opacity="0.2" />
        {/* Halfway */}
        <line x1="5" y1="50" x2="95" y2="50" stroke="white" strokeWidth="0.3" opacity="0.3" />
        {/* Center circle */}
        <circle cx="50" cy="50" r="5" fill="none" stroke="white" strokeWidth="0.2" opacity="0.2" />
      </svg>

      {/* Player slots */}
      {positions.map((slot) => {
        const player = selectedPlayers.get(slot.position)
        const hasPlayer = !!player

        return (
          <div
            key={slot.position}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
          >
            {hasPlayer ? (
              <button
                onClick={() => onRemovePlayer(slot.position)}
                className="group relative w-10 h-10 md:w-12 md:h-12 bg-primary text-primary-foreground border-2 border-primary flex items-center justify-center transition-all hover:bg-destructive hover:border-destructive"
              >
                <span className="text-xs font-bold group-hover:hidden">{slot.position}</span>
                <X className="w-4 h-4 hidden group-hover:block" />
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[8px] md:text-[10px] text-foreground font-medium truncate max-w-[60px] block">
                    {player.nombre.split(" ")[0]}
                  </span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => onSlotClick(slot.position)}
                className="w-10 h-10 md:w-12 md:h-12 border-2 border-dashed border-muted-foreground/40 flex items-center justify-center transition-all hover:border-foreground hover:bg-muted/20 group"
              >
                <Plus className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="sr-only">Fichar posicion {slot.position}</span>
              </button>
            )}
            {!hasPlayer && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[8px] text-muted-foreground">{slot.position}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
