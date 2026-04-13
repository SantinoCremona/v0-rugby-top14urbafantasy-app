"use client"

import { Plus, X } from "lucide-react"

interface RugbyFieldProps {
  selectedPlayers: Map<number, { id: number; nombre: string; club?: string; puntos?: number; es_capitan?: boolean }>
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
      {/* CAMPO DE JUEGO PRINCIPAL: VERDE INGLÉS */}
      <div className="relative bg-[#143D1A] border-4 border-white/30 overflow-hidden shadow-2xl rounded-sm">
        
        {/* TEXTURA DE CÉSPED (Corte de franjas vertical/horizontal) */}
        <div className="absolute inset-0 pointer-events-none" 
             style={{ 
               backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 50%, transparent 50%)`, 
               backgroundSize: '100% 100px' 
             }} 
        />

        {/* --- LÍNEAS TÉCNICAS BLANCAS --- */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {/* Mitad de cancha - Sin Círculo */}
          <div className="absolute top-1/2 left-0 right-0 border-t-[3px] border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
          
          {/* Líneas de 10 metros (punteadas más visibles) */}
          <div className="absolute top-[40%] left-0 right-0 border-t-[1.5px] border-dashed border-white" />
          <div className="absolute top-[60%] left-0 right-0 border-t-[1.5px] border-dashed border-white" />

          {/* Líneas de 22 metros */}
          <div className="absolute top-[22%] left-0 right-0 border-t-[2px] border-white" />
          <div className="absolute top-[78%] left-0 right-0 border-t-[2px] border-white" />
        </div>

        {/* --- LAS H (POSTES BLANCO PURO) --- */}
        {/* H Superior */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-12 z-20">
          <div className="w-1.5 h-14 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
          <div className="w-1.5 h-14 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
          <div className="absolute top-7 left-0 right-0 h-1.5 bg-white shadow-lg" />
        </div>

        {/* H Inferior */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-12 z-20">
          <div className="w-1.5 h-14 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.5)]" />
          <div className="w-1.5 h-14 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.5)]" />
          <div className="absolute bottom-7 left-0 right-0 h-1.5 bg-white shadow-lg" />
        </div>

        {/* IN-GOALS: Más limpios */}
        <div className="relative border-b-2 border-white/50 py-3 text-center bg-black/20">
        </div>

        <div className="relative px-4 py-10 md:py-16">
          <div className="flex flex-col gap-8 md:gap-14 relative z-10">
            {fieldRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2 md:gap-8">
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
                            rounded-full font-black text-[11px] italic border-2 border-[#143D1A]
                            shadow-2xl transition-transform group-hover/slot:scale-110
                            ${puntos >= 0 ? 'bg-white text-black' : 'bg-red-500 text-white'}
                          `}>
                            {puntos}
                          </div>
                        )}
                    
                            
                        {/* BUSCÁ ESTA PARTE DENTRO DEL RETURN */}
                        {hasPlayer ? (
                          <button
                            // CAMBIO: Ahora el click abre el menú de gestión en lugar de borrar
                            onClick={() => onSlotClick(slot.position, slot.positionType, slot.label)}
                            className="group relative w-14 h-14 md:w-16 md:h-16 bg-black/40 border-2 border-white/30 rounded-full flex items-center justify-center transition-all hover:border-yellow-400 shadow-2xl overflow-hidden backdrop-blur-sm"
                          >
                            {/* LOGO DEL CLUB */}
                            <img 
                              src={getLogoPath(player.club)} 
                              alt={player.club}
                              className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = `<span class="text-[10px] font-black text-white/70">${player.club?.substring(0,3)}</span>`;
                              }}
                            />

                            {/* BADGE DE CAPITÁN C (USANDO es_capitan Y CORREGIDO) */}
                        {hasPlayer && esCapitan && (
                          <div className="absolute -top-1.5 -left-1.5 z-40 w-8 h-8 flex items-center justify-center bg-yellow-400 text-black rounded-full font-black text-[13px] italic border-[3px] border-[#143D1A] shadow-[0_4px_14px_rgba(250,204,21,0.5)] animate-pulse">
                            C
                          </div>
                        )}
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

                      {/* NOMBRES: Apellido con Sombra */}
                      <div className="mt-2.5 flex flex-col items-center text-center">
                        {hasPlayer ? (
                          <>
                            <span className="text-[10px] md:text-[11px] text-white font-black uppercase italic tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                              {player.nombre.split(" ").slice(-1)[0]}
                            </span>
                            <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5 drop-shadow-md">
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

        <div className="relative border-t-2 border-white/50 py-3 text-center bg-black/20">
        </div>
      </div>
    </div>
  )
}
