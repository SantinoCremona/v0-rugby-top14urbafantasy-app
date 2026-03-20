"use client"

import { Plus, X } from "lucide-react"

interface RugbyFieldProps {
  selectedPlayers: Map<number, { id: number; nombre: string; club?: string; puntos?: number }>
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
    <div className="w-full max-w-2xl mx-auto p-2">
      {/* CONTENEDOR PRINCIPAL: Verde Musgo Profundo */}
      <div className="relative bg-[#2c722c] border border-white/5 overflow-hidden shadow-2xl rounded-[40px]">
        
        {/* TEXTURA DE CÉSPED SUTIL */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

        {/* IN-GOAL SUPERIOR */}
        <div className="relative border-b border-white/5 py-4 text-center bg-white/[0.02]">
          <span className="text-[9px] text-white/20 tracking-[0.5em] font-black uppercase">In-Goal Visitante</span>
        </div>

        <div className="relative px-4 py-10 md:px-8 md:py-14">
          
          {/* LÍNEAS TÉCNICAS DEL CAMPO (Blanco sutil) */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            {/* 22 Metros superior */}
            <div className="absolute top-[22%] left-0 right-0 border-t border-dashed border-white/30" />
            {/* Mitad de cancha */}
            <div className="absolute top-[50%] left-0 right-0 border-t-2 border-white/40">
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white/20 rounded-full" />
            </div>
            {/* 22 Metros inferior */}
            <div className="absolute top-[78%] left-0 right-0 border-t border-dashed border-white/30" />
          </div>

          <div className="flex flex-col gap-10 md:gap-14 relative z-10">
            {fieldRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-3 md:gap-8">
                {row.players.map((slot) => {
                  const player = selectedPlayers.get(slot.position)
                  const hasPlayer = !!player
                  const puntos = player?.puntos ?? 0

                  return (
                    <div key={slot.position} className="flex flex-col items-center w-20 md:w-24 group/slot">
                      <div className="relative">
                        
                        {/* BADGE DE PUNTOS: Estética Blanca/Negra */}
                        {hasPlayer && (
                          <div className={`
                            absolute -top-1 -right-1 z-30
                            w-7 h-7 flex items-center justify-center
                            rounded-lg font-black text-[11px] italic
                            shadow-xl transition-transform group-hover/slot:scale-110
                            ${puntos >= 0 ? 'bg-white text-black' : 'bg-red-500 text-white'}
                          `}>
                            {puntos}
                          </div>
                        )}

                        {hasPlayer ? (
                          /* SLOT CON JUGADOR: Estilo Premium Blanco */
                          <button
                            onClick={() => onRemovePlayer(slot.position)}
                            className="group relative w-14 h-14 md:w-16 md:h-16 bg-white border-2 border-white rounded-[20px] flex items-center justify-center transition-all hover:bg-red-500 hover:border-red-500 shadow-xl overflow-hidden"
                          >
                            <span className="text-black text-xl font-black group-hover:hidden italic">
                              {slot.position}
                            </span>
                            <X className="w-8 h-8 text-white hidden group-hover:block animate-in fade-in zoom-in duration-200" />
                            {/* Brillo decorativo */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                          </button>
                        ) : (
                          /* SLOT VACÍO: Estilo Minimalista Oscuro */
                          <button
                            onClick={() => onSlotClick(slot.position, slot.positionType, slot.label)}
                            className="w-14 h-14 md:w-16 md:h-16 border-2 border-dashed border-white/10 bg-black/20 rounded-[20px] flex items-center justify-center transition-all hover:border-white/40 hover:bg-white/5 group"
                          >
                            <Plus className="w-5 h-5 text-white/20 group-hover:text-white transition-all group-hover:rotate-90" />
                          </button>
                        )}
                      </div>

                      {/* ETIQUETAS: Tipografía limpia */}
                      <div className="mt-3 flex flex-col items-center text-center">
                        {hasPlayer ? (
                          <>
                            <span className="text-[10px] md:text-[11px] text-white font-black uppercase tracking-tight leading-tight">
                              {player.nombre.split(" ").slice(-1)[0]}
                            </span>
                            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                              {player.club}
                            </span>
                          </>
                        ) : (
                          <span className="text-[8px] text-white/30 font-bold tracking-widest uppercase">
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

        {/* LÍNEA DE H (IN-GOAL LOCAL) */}
        <div className="relative border-t border-white/5 py-4 flex justify-center bg-white/[0.02]">
          <span className="text-[9px] text-white/20 tracking-[0.8em] font-black uppercase">In-Goal Local</span>
        </div>
      </div>
    </div>
  )
}
