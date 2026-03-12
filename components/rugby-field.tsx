"use client"

import { Plus, X } from "lucide-react"

interface PlayerSlot {
  position: number
  label: string
  positionType: string
}

interface RugbyFieldProps {
  selectedPlayers: Map<number, { id: number; nombre: string }>
  onSlotClick: (position: number, positionType: string, label: string) => void
  onRemovePlayer: (position: number) => void
}

// Rugby positions layout matching the reference image exactly - from top to bottom
const fieldRows = [
  // Row 1: Fullback (top, in goal area)
  {
    players: [
      { position: 15, label: "FULLBACK", positionType: "Fullback" },
    ]
  },
  // Row 2: Back line (4 players)
  {
    players: [
      { position: 11, label: "WING IZQ", positionType: "Wing" },
      { position: 13, label: "CENTRO EXT", positionType: "Centro" },
      { position: 12, label: "CENTRO INT", positionType: "Centro" },
      { position: 14, label: "WING DER", positionType: "Wing" },
    ]
  },
  // Row 3: Half backs (2 players)
  {
    players: [
      { position: 10, label: "APERTURA", positionType: "Apertura" },
      { position: 9, label: "MEDIO SCRUM", positionType: "Medio" },
    ]
  },
  // Row 4: Back row (3 players)
  {
    players: [
      { position: 6, label: "ALA IZQ", positionType: "Ala" },
      { position: 8, label: "OCTAVO", positionType: "N8" },
      { position: 7, label: "ALA DER", positionType: "Ala" },
    ]
  },
  // Row 5: Locks (2 players)
  {
    players: [
      { position: 4, label: "2DA IZQ", positionType: "Segunda" },
      { position: 5, label: "2DA DER", positionType: "Segunda" },
    ]
  },
  // Row 6: Front row (3 players) - bottom
  {
    players: [
      { position: 1, label: "PILAR IZQ", positionType: "Pilar" },
      { position: 2, label: "HOOKER", positionType: "Hooker" },
      { position: 3, label: "PILAR DER", positionType: "Pilar" },
    ]
  },
]

export function RugbyField({ selectedPlayers, onSlotClick, onRemovePlayer }: RugbyFieldProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative bg-[#1e5631] border border-white/20 overflow-hidden">
        {/* IN-GOAL area at top */}
        <div className="relative border-b border-dashed border-white/30 py-2 px-2">
          <span className="text-[10px] md:text-xs text-white/50 tracking-wider">IN-GOAL</span>
        </div>

        {/* Field content */}
        <div className="relative px-4 py-4 md:px-8 md:py-6">
          {/* Field lines */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Horizontal dashed lines */}
            <div className="absolute top-[16%] left-0 right-0 border-t border-dashed border-white/20" />
            <div className="absolute top-[33%] left-0 right-0 border-t border-dashed border-white/20" />
            <div className="absolute top-[50%] left-0 right-0 border-t border-white/30">
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 border border-white/30 rounded-full" />
            </div>
            <div className="absolute top-[66%] left-0 right-0 border-t border-dashed border-white/20" />
            <div className="absolute top-[83%] left-0 right-0 border-t border-dashed border-white/20" />
          </div>

          {/* Player rows */}
          <div className="flex flex-col gap-4 md:gap-6">
            {fieldRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-4 md:gap-8">
                {row.players.map((slot) => {
                  const player = selectedPlayers.get(slot.position)
                  const hasPlayer = !!player

                  return (
                    <div key={slot.position} className="flex flex-col items-center">
                      {hasPlayer ? (
                        <button
                          onClick={() => onRemovePlayer(slot.position)}
                          className="group relative w-11 h-11 md:w-14 md:h-14 bg-[#2d5a3d] border-2 border-dashed border-white/50 rounded-full flex items-center justify-center transition-all hover:bg-red-900/50 hover:border-red-400"
                        >
                          <span className="text-white text-[10px] md:text-xs font-bold group-hover:hidden">
                            {player.nombre.split(" ")[0].substring(0, 3).toUpperCase()}
                          </span>
                          <X className="w-4 h-4 text-red-400 hidden group-hover:block" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onSlotClick(slot.position, slot.positionType, slot.label)}
                          className="w-11 h-11 md:w-14 md:h-14 border-2 border-dashed border-white/50 rounded-full flex items-center justify-center transition-all hover:border-white hover:bg-white/10 group"
                        >
                          <Plus className="w-4 h-4 md:w-5 md:h-5 text-white/70 group-hover:text-white transition-colors" />
                        </button>
                      )}
                      <span className="mt-1.5 text-[8px] md:text-[10px] text-white/80 font-medium tracking-wider whitespace-nowrap uppercase">
                        {slot.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom try line area */}
        <div className="relative border-t border-white/30 py-2 px-2 flex justify-end">
          <span className="text-[10px] md:text-xs text-white/50 tracking-wider font-bold">TU XV</span>
        </div>
      </div>
    </div>
  )
}
