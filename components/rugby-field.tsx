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
  
  const getLogoPath = (clubName?: string) => {
    if (!clubName) return "";
    const fileName = clubName.toLowerCase().trim().replace(/\s+/g, '-');
    return `/escudos/${fileName}.png`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-2">
      {/* CAMPO DE JUEGO PRINCIPAL */}
      <div className="relative bg-[#2D5A27] border-4 border-white/20 overflow-hidden shadow-2xl rounded-sm">
        
        {/* TEXTURA DE CÉSPED (Corte de franjas horizontal) */}
        <div className="absolute inset-0 pointer-events-none" 
             style={{ 
               backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.05) 50%, transparent 50%)`, 
               backgroundSize: '100% 120px' 
             }} 
        />

        {/* --- LÍNEAS TÉCNICAS DEL RUGBY --- */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          {/* Mitad de cancha */}
          <div className="absolute top-1/2 left-0 right-0 border-t-2 border-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white rounded-full" />
          
          {/* Líneas de 10 metros (punteadas) */}
          <div className="absolute top-[42%] left-0 right-0 border-t border-dashed border-white" />
          <div className="absolute top-[58%] left-0 right-0 border-t border-dashed border-white" />

          {/* Líneas de 22 metros */}
          <div className="absolute top-[22%] left-0 right-0 border-t-2 border-white" />
          <div className="absolute top-[78%] left-0 right-0 border-t-2 border-white" />
        </div>

        {/* --- LAS H (POSTES) --- */}
        {/* H Superior */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-12 opacity-40">
          <div className="w-1.5 h-16 bg-white shadow-lg" />
          <div className="w-1.5 h-16 bg-white shadow-lg" />
          <div className="absolute top-8 left-0 right-0 h-1.5 bg-white shadow-lg" />
        </div>

        {/* H Inferior */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-12 opacity-40">
          <div className="w-1.5 h-16 bg-white shadow-lg" />
          <div className="w-1.5 h-16 bg-white shadow-lg" />
          <div className="absolute bottom-8 left-0 right-0 h-1.5 bg-white shadow-lg" />
        </div>

        {/* IN-GOALS */}
        <div className="relative border-b border-white/40 py-4 text-center bg-black/10">
          <span className="text-[9px] text-white/40 tracking-[0.8em] font-black uppercase">Visitante</span>
        </div>

        <div className="relative px-4 py-12 md:py-16">
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
                        {/* BADGE DE PUNTOS */}
                        {hasPlayer && (
                          <div className={`
                            absolute -top-1 -right-1 z-30
                            w-7 h-7 flex items-center justify-center
                            rounded-full font-black text-[11px] italic border-2 border-[#2D5A27]
                            shadow-xl transition-transform group-hover/slot:scale-110
                            ${puntos >= 0 ? 'bg-white text-black' : 'bg-red-500 text-white'}
                          `}>
                            {puntos}
                          </div>
                        )}

                        {hasPlayer ? (
                          <button
                            onClick={() => onRemovePlayer(slot.position)}
                            className="group relative w-14 h-14 md:w-16 md:h-16 bg-black/40 border-2 border-white/40 rounded-full flex items-center justify-center transition-all hover:bg-red-600 hover:border-white shadow-xl overflow-hidden backdrop-blur-sm"
                          >
                            <img 
                              src={getLogoPath(player.club)} 
                              alt={player.club}
                              className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] group-hover:hidden transition-transform"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = `<span class="text-[10px] font-black text-white/70">${player.club?.substring(0,3)}</span>`;
                              }}
                            />
                            <X className="w-8 h-8 text-white hidden group-hover:block" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onSlotClick(slot.position, slot.positionType, slot.label)}
                            className="w-14 h-14 md:w-16 md:h-16 border-2 border-dashed border-white/20 bg-black/20 rounded-full flex items-center justify-center transition-all hover:border-white/50 hover:bg-white/5 group"
                          >
                            <Plus className="w-5 h-5 text-white/30 group-hover:text-white transition-all group-hover:rotate-90" />
                          </button>
                        )}
                      </div>

                      {/* NOMBRES */}
                      <div className="mt-3 flex flex-col items-center text-center">
                        {hasPlayer ? (
                          <>
                            <span className="text-[10px] md:text-[11px] text-white font-black uppercase italic tracking-tight leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                              {player.nombre.split(" ").slice(-1)[0]}
                            </span>
                            <span className="text-[8px] text-emerald-300 font-bold uppercase tracking-widest mt-0.5 drop-shadow-md">
                              {player.club}
                            </span>
                          </>
                        ) : (
                          <span className="text-[8px] text-white/40 font-bold tracking-widest uppercase">
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

        <div className="relative border-t border-white/40 py-4 text-center bg-black/10">
          <span className="text-[9px] text-white/40 tracking-[0.8em] font-black uppercase">Local</span>
        </div>
      </div>
    </div>
  )
}
