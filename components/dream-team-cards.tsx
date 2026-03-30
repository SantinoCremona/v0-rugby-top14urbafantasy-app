"use client"

import { Zap, Star, Shield } from "lucide-react"

interface DreamPlayer {
  nombre: string
  posicion: string
  club: string
  puntos: number
}

// Definimos el orden lógico del Rugby (Pilar a Fullback)
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
      <div className="py-20 text-center border border-dashed border-white/10 rounded-[40px]">
        <Shield className="w-12 h-12 text-white/5 mx-auto mb-4" />
        <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">
          Esperando resultados de la fecha...
        </p>
      </div>
    )
  }

  // Ordenamos los jugadores antes de mapearlos
  const jugadoresOrdenados = [...jugadores].sort((a, b) => {
    const ordenA = ORDEN_POSICIONES[a.posicion] || 99;
    const ordenB = ORDEN_POSICIONES[b.posicion] || 99;
    return ordenA - ordenB;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jugadoresOrdenados.map((player, idx) => (
        <div key={idx} className="bg-[#111113] border border-white/5 rounded-[28px] p-5 flex items-center gap-4 group hover:border-emerald-500/50 transition-all">
          <div className="w-14 h-14 flex-shrink-0 bg-black rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden">
            <img 
              src={`/escudos/${player.club.toLowerCase().trim().replace(/\s+/g, '-')}.png`} 
              alt=""
              className="w-9 h-9 object-contain z-10"
              onError={(e) => { (e.currentTarget.style.display = 'none') }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black bg-white text-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                {player.posicion}
              </span>
              <h3 className="font-black text-base text-white uppercase italic truncate">
                {player.nombre}
              </h3>
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{player.club}</p>
          </div>
          <div className="text-right pl-4 border-l border-white/5">
            <div className="flex items-center justify-end gap-1 text-emerald-500 font-black italic">
              <Zap className="w-3 h-3 fill-emerald-500" />
              <span className="text-2xl">{player.puntos}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}