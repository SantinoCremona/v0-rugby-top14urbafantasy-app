"use client"

import { Zap, Shield } from "lucide-react"

interface DreamPlayer {
  nombre: string
  posicion: string
  club: string
  puntos: number
}

const ORDEN_POSICIONES: Record<string, number> = {
  "Pilar": 1, "Hooker": 2, "Segunda": 3, "Ala": 4, "N8": 5,
  "Medio": 6, "Apertura": 7, "Centro": 8, "Wing": 9, "Fullback": 10
};

export function DreamTeamCards({ jugadores }: { jugadores: DreamPlayer[] }) {
  if (!jugadores || jugadores.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed border-white/10 rounded-[32px]">
        <Shield className="w-8 h-8 text-white/5 mx-auto mb-3" />
        <p className="text-gray-500 font-black uppercase tracking-widest text-[8px]">Esperando resultados...</p>
      </div>
    )
  }

  const jugadoresOrdenados = [...jugadores].sort((a, b) => {
    return (ORDEN_POSICIONES[a.posicion] || 99) - (ORDEN_POSICIONES[b.posicion] || 99);
  });

  return (
    <div className="grid grid-cols-1 gap-2 md:gap-3">
      {jugadoresOrdenados.map((player, idx) => (
        <div key={idx} className="bg-[#111113] border border-white/5 rounded-xl md:rounded-[20px] p-3 md:p-4 flex items-center gap-3 md:gap-4 group">
          <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 bg-black rounded-lg md:rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
            <img 
              src={`/escudos/${player.club.toLowerCase().trim().replace(/\s+/g, '-')}.png`} 
              alt=""
              className="w-6 h-6 md:w-8 md:h-8 object-contain"
              onError={(e) => { (e.currentTarget.style.display = 'none') }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[6px] md:text-[7px] font-black bg-white text-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                {player.posicion}
              </span>
              <span className="text-[7px] md:text-[9px] font-bold text-gray-600 uppercase tracking-widest truncate">
                {player.club}
              </span>
            </div>
            <h3 className="font-black text-sm md:text-lg text-white uppercase italic truncate">
              {player.nombre}
            </h3>
          </div>
          <div className="text-right pl-3 border-l border-white/5 min-w-[55px] md:min-w-[70px]">
            <div className="flex items-center justify-end gap-1 text-emerald-500 font-black italic">
              <Zap className="w-3 h-3 md:w-4 md:h-4 fill-emerald-500" />
              <span className="text-xl md:text-3xl leading-none">{player.puntos}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}