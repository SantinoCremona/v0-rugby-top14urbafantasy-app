import { Star, Zap, Shield } from "lucide-react"

interface JugadorDream {
  nombre: string
  posicion: string
  club: string
  puntos: number
}

export function DreamTeam({ jugadores }: { jugadores: JugadorDream[] }) {
  if (!jugadores || jugadores.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-white/10 rounded-[40px] bg-white/[0.01]">
        <Shield className="w-12 h-12 text-white/5 mx-auto mb-4" />
        <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">
          Esperando resultados de la fecha...
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jugadores.map((j, idx) => (
        <div 
          key={idx} 
          className="relative group bg-[#0F0F11] border border-white/5 rounded-[24px] p-1 overflow-hidden transition-all duration-500 hover:border-emerald-500/50"
        >
          {/* Badge de Posición */}
          <div className="absolute top-3 left-3 z-10 bg-emerald-500 text-black font-black text-[9px] px-2 py-0.5 rounded-full uppercase italic tracking-tighter">
            {j.posicion}
          </div>

          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-white/[0.03] to-transparent rounded-[20px]">
            {/* Escudo */}
            <div className="relative w-16 h-16 flex-shrink-0 bg-black rounded-2xl border border-white/10 flex items-center justify-center">
              <img 
                src={`/escudos/${j.club.toLowerCase().trim().replace(/\s+/g, '-')}.png`} 
                alt={j.club}
                className="w-10 h-10 object-contain z-10"
                onError={(e) => { (e.currentTarget.style.display = 'none') }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-lg text-white uppercase italic leading-none truncate tracking-tighter">
                {j.nombre}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{j.club}</span>
                {idx < 3 && <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" />}
              </div>
            </div>

            {/* Puntos */}
            <div className="text-right pl-4 border-l border-white/5">
              <div className="flex items-center justify-end gap-1 text-white">
                <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                <span className="text-3xl font-black italic leading-none tracking-tighter">
                  {j.puntos}
                </span>
              </div>
              <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">Puntos</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}