"use client"

import { Zap, Shield } from "lucide-react"

interface DreamPlayer {
  nombre: string
  posicion: string
  club: string
  puntos: number
}

const ORDEN_POSICIONES: Record<string, number> = {
  "Pilar": 1,
  "Hooker": 2,
  "Segunda": 3,
  "Ala": 4,
  "N8": 5,
  "Medio": 6,
  "Apertura": 7,
  "Centro": 8,
  "Wing": 9,
  "Fullback": 10
};

export function DreamTeamCards({ jugadores }: { jugadores: DreamPlayer[] }) {
  if (!jugadores || jugadores.length === 0) {
    return (
      <div className="py-12 md:py-20 text-center border border-dashed border-white/10 rounded-[32px] md:rounded-[40px]">
        <Shield className="w-8 h-8 md:w-12 md:h-12 text-white/5 mx-auto mb-3 md:mb-4" />
        <p className="text-gray-500 font-black uppercase tracking-widest text-[8px] md:text-[10px]">
          Esperando resultados de la fecha...
        </p>
      </div>
    )
  }

  const jugadoresOrdenados = [...jugadores].sort((a, b) => {
    return (ORDEN_POSICIONES[a.posicion] || 99) - (ORDEN_POSICIONES[b.posicion] || 99);
  });

  return (
    <div className="grid grid-cols-1 gap-2 md:gap-3">
      {jugadoresOrdenados.map((player, idx) => {
        // Extraemos el apellido (última palabra) para destacarlo si quisieras, 
        // pero acá dejamos el nombre completo con buena escala.
        return (
          <div key={idx} className="bg-[#111113] border border-white/5 rounded-2xl md:rounded-[28px] p-3 md:p-5 flex items-center gap-3 md:gap-4 group hover:border-emerald-500/50 transition-all">
            
            {/* Escudo: Mas compacto en mobile */}
            <div className="w-10 h-10 md:w-14 md:h-14 flex-shrink-0 bg-black rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden">
              <img 
                src={`/escudos/${player.club.toLowerCase().trim().replace(/\s+/g, '-')}.png`} 
                alt=""
                className="w-7 h-7 md:w-9 md:h-9 object-contain z-10"
                onError={(e) => { (e.currentTarget.style.display = 'none') }}
              />
            </div>

            {/* Info Jugador: Prioridad al Apellido/Nombre */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                <span className="text-[6px] md:text-[8px] font-black bg-white text-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                  {player.posicion}
                </span>
                <span className="text-[8px] md:text-[10px] font-bold text-gray-600 uppercase tracking-widest truncate">
                  {player.club}
                </span>
              </div>
              <h3 className="font-black text-sm md:text-xl text-white uppercase italic truncate leading-none drop-shadow-md">
                {player.nombre}
              </h3>
            </div>

            {/* Puntos: Destacados y compactos */}
            <div className="text-right pl-3 md:pl-4 border-l border-white/5 min-w-[55px] md:min-w-[80px]">
              <div className="flex items-center justify-end gap-1 text-emerald-500 font-black italic">
                <Zap className="w-3 h-3 md:w-4 md:h-4 fill-emerald-500" />
                <span className="text-xl md:text-3xl leading-none">{player.puntos}</span>
              </div>
              <p className="text-[7px] md:text-[8px] font-black text-gray-700 uppercase tracking-widest mt-0.5">Pts</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}