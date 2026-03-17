import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"
import { Trophy, Shield, Users, Medal, Star } from "lucide-react"

export default async function RankingGeneralPage() {
  const supabase = await createClient()

  // Agregamos .limit(10) para traer solo el Top 10
  const { data: rankingData, error } = await supabase
    .from('perfiles')
    .select('nombre_equipo, puntos_acumulados')
    .order('puntos_acumulados', { ascending: false })
    .limit(10)

  if (error) console.error("Error fetching ranking:", error)
  const ranking = rankingData || []

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <MainHeader />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        
        {/* HEADER DE PÁGINA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em]">En Vivo</span>
            </div>
            <h1 className="font-black text-6xl md:text-7xl italic uppercase tracking-tighter leading-none">
              Ranking <span className="text-white/20">General</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-4">
              Temporada URBA 2026 • Top 10 Coaches
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
            <div className="p-2 bg-white rounded-lg">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">Categoría</p>
              <p className="text-xl font-black italic">ELITE <span className="text-sm not-italic font-medium text-gray-400">HC</span></p>
            </div>
          </div>
        </div>

        {/* TABLA DE POSICIONES */}
        <div className="space-y-3">
          {/* Header de Columnas */}
          <div className="grid grid-cols-12 px-8 mb-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
            <div className="col-span-2">Posición</div>
            <div className="col-span-7 md:col-span-8">Equipo</div>
            <div className="col-span-3 md:col-span-2 text-right">Puntos Totales</div>
          </div>

          {ranking.map((equipo, index) => {
            const esPrimero = index === 0;
            const esPodio = index < 3;

            return (
              <div 
                key={index} 
                className={`grid grid-cols-12 items-center px-6 py-5 rounded-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Posición */}
                <div className="col-span-2 flex items-center gap-3">
                  <span className={`text-2xl font-black italic ${esPrimero ? "text-emerald-400" : "text-white/40"}`}>
                    #{index + 1}
                  </span>
                  {esPrimero && <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />}
                </div>

                {/* Nombre Equipo */}
                <div className="col-span-7 md:col-span-8 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    esPrimero ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/30"
                  }`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-base md:text-xl font-black uppercase italic leading-none block text-white">
                      {equipo.nombre_equipo || "XV SIN NOMBRE"}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
                      URBA FANTASY • TOP 10
                    </span>
                  </div>
                </div>

                {/* Puntos */}
                <div className="col-span-3 md:col-span-2 text-right">
                  <p className={`text-2xl md:text-4xl font-black italic tracking-tighter ${
                    esPrimero ? "text-emerald-400" : "text-white"
                  }`}>
                    {equipo.puntos_acumulados || 0}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Informativo */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em]">
            Solo se muestran los 10 mejores promedios de la liga
          </p>
        </div>

        {ranking.length === 0 && (
          <div className="mt-20 py-20 border border-dashed border-white/10 rounded-[40px] text-center text-gray-600">
            Aún no hay equipos en el ranking
          </div>
        )}
      </main>
    </div>
  )
}
