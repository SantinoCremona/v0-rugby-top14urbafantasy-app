"use client"

import { Plus, X } from "lucide-react"

interface PlayerSlot {
  position: number
  label: string
  positionType: string
}

interface RugbyFieldProps {
  // Añadimos 'club' a la interfaz para que se pueda mostrar
  selectedPlayers: Map<number, { id: number; nombre: string; club?: string }>
  onSlotClick: (position: number, positionType: string, label: string) => void
  onRemovePlayer: (position: number) => void
}

const fieldRows = [
  { players: [{ position: 15, label: "FULLBACK", positionType: "Fullback" }] },
  {
    players: [
      { position: 11, label: "WING IZQ", positionType: "Wing" },
      { position: 13, label: "CENTRO EXT", positionType: "Centro" },
      { position: 12, label: "CENTRO INT", positionType: "Centro" },
      { position: 14, label: "WING DER", positionType: "Wing" },
    ]
  },
  {
    players: [
      { position: 10, label: "APERTURA", positionType: "Apertura" },
      { position: 9, label: "MEDIO SCRUM", positionType: "Medio" },
    ]
  },
  {
    players: [
      { position: 6, label: "ALA IZQ", positionType: "Ala" },
      { position: 8, label: "OCTAVO", positionType: "N8" },
      { position: 7, label: "ALA DER", positionType: "Ala" },
    ]
  },
  {
    players: [
      { position: 4, label: "2DA IZQ", positionType: "Segunda" },
      { position: 5, label: "2DA DER", positionType: "Segunda" },
    ]
  },
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
      <div className="relative bg-[#1e5631] border border-white/20 overflow-hidden shadow-2xl rounded-sm">
        <div className="relative border-b border-dashed border-white/30 py-2 px-2 text-center">
          <span className="text-[10px] md:text-xs text-white/40 tracking-[0.3em] font-bold">IN-GOAL VISITANTE</span>
        </div>

        <div className="relative px-4 py-8 md:px-8 md:py-10">
          {/* Líneas de campo */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[33%] left-0 right-0 border-t border-white/10" />
            <div className="absolute top-[50%] left-0 right-0 border-t-2 border-white/20">
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-white/20 rounded-full" />
            </div>
            <div className="absolute top-[66%] left-0 right-0 border-t border-white/10" />
          </div>

          <div className="flex flex-col gap-8 md:gap-12 relative z-10">
            {fieldRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2 md:gap-6">
                {row.players.map((slot) => {
                  const player = selectedPlayers.get(slot.position)
                  const hasPlayer = !!player

                  return (
                    <div key={slot.position} className="flex flex-col items-center w-20 md:w-24">
                      {hasPlayer ? (
                        <button
                          onClick={() => onRemovePlayer(slot.position)}
                          className="group relative w-12 h-12 md:w-14 md:h-14 bg-white border-2 border-black rounded-full flex items-center justify-center transition-all hover:bg-red-600 hover:border-white shadow-lg"
                        >
                          {/* Muestra el número de posición */}
                          <span className="text-black text-lg md:text-xl font-black group-hover:hidden">
                            {slot.position}
                          </span>
                          <X className="w-6 h-6 text-white hidden group-hover:block" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onSlotClick(slot.position, slot.positionType, slot.label)}
                          className="w-12 h-12 md:w-14 md:h-14 border-2 border-dashed border-white/40 rounded-full flex items-center justify-center transition-all hover:border-white hover:bg-white/10 group"
                        >
                          <Plus className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                        </button>
                      )}

                      {/* Etiquetas debajo del jugador */}
                      <div className="mt-2 flex flex-col items-center text-center">
                        {hasPlayer ? (
                          <>
                            <span className="text-[9px] md:text-[10px] text-white font-bold uppercase leading-tight drop-shadow-md">
                              {player.nombre.split(" ").slice(-1)[0]} {/* Solo el apellido */}
                            </span>
                            <span className="text-[7px] md:text-[8px] text-white/70 uppercase tracking-tighter">
                              {player.club}
                            </span>
                          </>
                        ) : (
                          <span className="text-[8px] md:text-[9px] text-white/40 font-medium tracking-wider uppercase">
                            {slot.label}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="relative border-t border-white/30 py-2 px-2 flex justify-center">
          <span className="text-[10px] md:text-xs text-white/40 tracking-[0.5em] font-bold">H-LINE</span>
        </div>
      </div>
    </div>
  )
}
