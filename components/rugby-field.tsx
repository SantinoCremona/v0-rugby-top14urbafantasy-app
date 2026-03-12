"use client"

import { Plus, X } from "lucide-react"

interface PlayerSlot {
  position: number
  label: string
  x: number
  y: number
  positionType: string
}

interface RugbyFieldProps {
  selectedPlayers: Map<number, { id: number; nombre: string }>
  onSlotClick: (position: number, positionType: string) => void
  onRemovePlayer: (position: number) => void
}

// Rugby positions layout matching the reference image exactly
const positions: PlayerSlot[] = [
  // Back line (top row)
  { position: 11, label: "WING IZQ", x: 20, y: 8, positionType: "Wing" },
  { position: 13, label: "CENTRO EXT", x: 37, y: 8, positionType: "Centro" },
  { position: 12, label: "CENTRO INT", x: 54, y: 8, positionType: "Centro" },
  { position: 14, label: "WING DER", x: 71, y: 8, positionType: "Wing" },
  // Half backs
  { position: 10, label: "APERTURA", x: 37, y: 22, positionType: "Apertura" },
  { position: 9, label: "MEDIO SCRUM", x: 54, y: 22, positionType: "Medio" },
  // Back row
  { position: 6, label: "ALA IZQ", x: 25, y: 40, positionType: "Ala" },
  { position: 8, label: "OCTAVO", x: 45, y: 40, positionType: "N8" },
  { position: 7, label: "ALA DER", x: 65, y: 40, positionType: "Ala" },
  // Locks
  { position: 4, label: "2DA IZQ", x: 35, y: 56, positionType: "Segunda" },
  { position: 5, label: "2DA DER", x: 55, y: 56, positionType: "Segunda" },
  // Front row
  { position: 1, label: "PILAR IZQ", x: 25, y: 72, positionType: "Pilar" },
  { position: 2, label: "HOOKER", x: 45, y: 72, positionType: "Hooker" },
  { position: 3, label: "PILAR DER", x: 65, y: 72, positionType: "Pilar" },
  // Fullback
  { position: 15, label: "FULLBACK", x: 45, y: 92, positionType: "Fullback" },
]

export function RugbyField({ selectedPlayers, onSlotClick, onRemovePlayer }: RugbyFieldProps) {
  return (
    <div className="relative w-full aspect-[4/5] max-w-2xl mx-auto bg-[#1a472a] overflow-hidden">
      {/* Field markings */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* In-goal area at top */}
        <rect x="5" y="2" width="90" height="6" fill="none" stroke="white" strokeWidth="0.15" strokeDasharray="1,1" opacity="0.4" />
        <text x="8" y="4.5" fill="white" fontSize="2" opacity="0.4">IN-GOAL</text>
        
        {/* Field outline */}
        <rect x="5" y="8" width="90" height="84" fill="none" stroke="white" strokeWidth="0.2" opacity="0.4" />
        
        {/* Try line (top) */}
        <line x1="5" y1="8" x2="95" y2="8" stroke="white" strokeWidth="0.3" opacity="0.5" />
        
        {/* 22m line */}
        <line x1="5" y1="18" x2="95" y2="18" stroke="white" strokeWidth="0.15" strokeDasharray="1,1" opacity="0.3" />
        
        {/* 10m line */}
        <line x1="5" y1="35" x2="95" y2="35" stroke="white" strokeWidth="0.15" strokeDasharray="1,1" opacity="0.3" />
        
        {/* Halfway line */}
        <line x1="5" y1="50" x2="95" y2="50" stroke="white" strokeWidth="0.2" opacity="0.4" />
        <circle cx="50" cy="50" r="3" fill="none" stroke="white" strokeWidth="0.15" opacity="0.3" />
        
        {/* 10m line (bottom) */}
        <line x1="5" y1="65" x2="95" y2="65" stroke="white" strokeWidth="0.15" strokeDasharray="1,1" opacity="0.3" />
        
        {/* 22m line (bottom) */}
        <line x1="5" y1="82" x2="95" y2="82" stroke="white" strokeWidth="0.15" strokeDasharray="1,1" opacity="0.3" />
        
        {/* Try line (bottom) */}
        <line x1="5" y1="92" x2="95" y2="92" stroke="white" strokeWidth="0.3" opacity="0.5" />
        
        {/* In-goal area at bottom */}
        <rect x="5" y="92" width="90" height="6" fill="none" stroke="white" strokeWidth="0.15" strokeDasharray="1,1" opacity="0.4" />
        
        {/* TU XV label */}
        <text x="88" y="95" fill="white" fontSize="2.5" fontWeight="bold" opacity="0.5">TU XV</text>
      </svg>

      {/* Player slots */}
      {positions.map((slot) => {
        const player = selectedPlayers.get(slot.position)
        const hasPlayer = !!player

        return (
          <div
            key={slot.position}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
          >
            {hasPlayer ? (
              <button
                onClick={() => onRemovePlayer(slot.position)}
                className="group relative w-12 h-12 md:w-14 md:h-14 bg-[#2d5a3d] border-2 border-dashed border-white/40 rounded-full flex items-center justify-center transition-all hover:bg-red-900/50 hover:border-red-500"
              >
                <span className="text-white text-xs font-bold group-hover:hidden">
                  {player.nombre.split(" ")[0].substring(0, 3).toUpperCase()}
                </span>
                <X className="w-4 h-4 text-red-400 hidden group-hover:block" />
              </button>
            ) : (
              <button
                onClick={() => onSlotClick(slot.position, slot.positionType)}
                className="w-12 h-12 md:w-14 md:h-14 border-2 border-dashed border-white/40 rounded-full flex items-center justify-center transition-all hover:border-white hover:bg-white/10 group"
              >
                <Plus className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
              </button>
            )}
            <span className="mt-1 text-[8px] md:text-[10px] text-white/70 font-medium tracking-wider whitespace-nowrap">
              {slot.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
