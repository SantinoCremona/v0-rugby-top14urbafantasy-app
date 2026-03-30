"use client"

import { Shield } from "lucide-react"

interface PlayerDream {
  nombre: string
  posicion: string
  club: string
  puntos: number
  ranking_pos: number 
}

interface DreamTeamFieldProps {
  jugadores: PlayerDream[]
}

const fieldRows = [
  { players: [{ label: "FULLBACK", type: "Fullback", rank: 1 }] },
  {
    players: [
      { label: "WING IZQ", type: "Wing", rank: 1 },
      { label: "CENTRO EXT", type: "Centro", rank: 1 },
      { label: "CENTRO INT", type: "Centro", rank: 2 },
      { label: "WING DER", type: "Wing", rank: 2 },
    ]
  },
  {
    players: [
      { label: "APERTURA", type: "Apertura", rank: 1 },
      { label: "MEDIO", type: "Medio", rank: 1 }, 
    ]
  },
  {
    players: [
      { label: "ALA IZQ", type: "Ala", rank: 1 },
      { label: "OCTAVO", type: "N8", rank: 1 },
      { label: "ALA DER", type: "Ala", rank: 2 },
    ]
  },
  {
    players: [
      { label: "2DA IZQ", type: "Segunda", rank: 1 },
      { label: "2DA DER", type: "Segunda", rank: 2 },
    ]
  },
  {
    players: [
      { label: "PILAR IZQ", type: "Pilar", rank: 1 },
      { label: "HOOKER", type: "Hooker", rank: 1 },
      { label: "PILAR DER", type: "Pilar", rank: 2 },
    ]
  },
]

export function DreamTeamField({ jugadores }: DreamTeamFieldProps) {
  
  const getLogoPath = (clubName?: string) => {
    if (!clubName) return "";
    const fileName = clubName.toLowerCase().trim().replace(/\s+/g, '-');
    return `/escudos/${fileName}.png`;
  };

  // --- LÓGICA DE ASIGNACIÓN DIRECTA ---
  const getPlayerForSlot = (type: string, rank: number) => {
    return jugadores.find(j => 
      j.posicion.toLowerCase() === type.toLowerCase() && 
      j.ranking_pos === rank
    );
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
                  const player = getPlayerForSlot(slot.type, slot.rank)
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
                              onError={(e) => { (e.currentTarget.style.display = 'none') }}
                            />
                          ) : (
                            <Shield className="w-5 h-5 text-white/10" />
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex flex-col items-center text-center h-10">
                        {hasPlayer ? (
                          <>
                            <span className="text-[9px] md:text-[10px] text-white font-black uppercase italic tracking-tight drop-shadow-md leading-none">
                              {player.nombre.split(" ").slice(-1)[0]}
                            </span>
                            <span className="text-[7px] text-emerald-400 font-bold uppercase tracking-tighter mt-1">
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