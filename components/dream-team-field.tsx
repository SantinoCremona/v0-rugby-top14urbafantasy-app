"use client"

import { Shield, Trophy } from "lucide-react"

interface PlayerDream {
  nombre: string
  posicion: string
  club: string
  puntos: number
  posicion_en_campo?: string // Usaremos esto para ubicarlo
}

interface DreamTeamFieldProps {
  jugadores: PlayerDream[]
}

const fieldRows = [
  { players: [{ label: "FULLBACK", type: "Fullback" }] },
  {
    players: [
      { label: "WING IZQ", type: "Wing" },
      { label: "CENTRO EXT", type: "Centro" },
      { label: "CENTRO INT", type: "Centro" },
      { label: "WING DER", type: "Wing" },
    ]
  },
  {
    players: [
      { label: "APERTURA", type: "Apertura" },
      { label: "MEDIO SCRUM", type: "Medio" },
    ]
  },
  {
    players: [
      { label: "ALA IZQ", type: "Ala" },
      { label: "OCTAVO", type: "N8" },
      { label: "ALA DER", type: "Ala" },
    ]
  },
  {
    players: [
      { label: "2DA IZQ", type: "Segunda" },
      { label: "2DA DER", type: "Segunda" },
    ]
  },
  {
    players: [
      { label: "PILAR IZQ", type: "Pilar" },
      { label: "HOOKER", type: "Hooker" },
      { label: "PILAR DER", type: "Pilar" },
    ]
  },
]

export function DreamTeamField({ jugadores }: DreamTeamFieldProps) {
  
  const getLogoPath = (clubName?: string) => {
    if (!clubName) return "";
    const fileName = clubName.toLowerCase().trim().replace(/\s+/g, '-');
    return `/escudos/${fileName}.png`;
  };

  // Mapeamos los jugadores por posición para ubicarlos en la cancha
  // Nota: La View debe devolver la posición exacta o el tipo para matchear
  const getPlayerByLabel = (label: string) => {
    return jugadores.find(j => j.posicion.toUpperCase() === label.toUpperCase());
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-2">
      <div className="relative bg-[#143D1A] border-4 border-white/30 overflow-hidden shadow-2xl rounded-sm">
        
        {/* TEXTURA DE CÉSPED */}
        <div className="absolute inset-0 pointer-events-none" 
             style={{ 
               backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 50%, transparent 50%)`, 
               backgroundSize: '100% 100px' 
             }} 
        />

        {/* LÍNEAS TÉCNICAS */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-1/2 left-0 right-0 border-t-[3px] border-white" />
          <div className="absolute top-[22%] left-0 right-0 border-t-[2px] border-white" />
          <div className="absolute top-[78%] left-0 right-0 border-t-[2px] border-white" />
        </div>

        <div className="relative px-2 py-8 md:py-12">
          <div className="flex flex-col gap-6 md:gap-10 relative z-10">
            {fieldRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1 md:gap-6">
                {row.players.map((slot) => {
                  const player = getPlayerByLabel(slot.label)
                  const hasPlayer = !!player

                  return (
                    <div key={slot.label} className="flex flex-col items-center w-20 md:w-24">
                      <div className="relative">
                        {hasPlayer && (
                          <div className="absolute -top-1 -right-1 z-30 w-7 h-7 flex items-center justify-center rounded-full font-black text-[11px] italic border-2 border-[#143D1A] bg-emerald-500 text-black shadow-xl">
                            {player.puntos}
                          </div>
                        )}

                        <div className={`
                          w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm border-2
                          ${hasPlayer ? 'bg-black/60 border-emerald-500/50' : 'bg-black/20 border-white/10 border-dashed'}
                        `}>
                          {hasPlayer ? (
                            <img 
                              src={getLogoPath(player.club)} 
                              alt={player.club}
                              className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                            />
                          ) : (
                            <Shield className="w-5 h-5 text-white/10" />
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex flex-col items-center text-center">
                        {hasPlayer ? (
                          <>
                            <span className="text-[9px] md:text-[10px] text-white font-black uppercase italic tracking-tight drop-shadow-md">
                              {player.nombre.split(" ").slice(-1)[0]}
                            </span>
                            <span className="text-[7px] text-emerald-400 font-bold uppercase tracking-tighter">
                              {player.club}
                            </span>
                          </>
                        ) : (
                          <span className="text-[7px] text-white/30 font-bold uppercase tracking-widest italic">
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
      </div>
    </div>
  )
}