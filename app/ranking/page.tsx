import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"
import { Trophy, Shield } from "lucide-react"

export default async function RankingGeneralPage() {
  const supabase = await createClient()

  // 1. Buscamos los datos directamente de la tabla perfiles
  // Usamos puntos_acumulados que es la "fuente de verdad" histórica
  const { data: rankingData, error } = await supabase
    .from('perfiles')
    .select('nombre_equipo, puntos_acumulados')
    .order('puntos_acumulados', { ascending: false })

  if (error) {
    console.error("Error fetching ranking:", error)
  }

  const ranking = rankingData || []

  return (
    <div className="min-h-screen bg-white">
      <MainHeader />
      <main className="max-w-4xl mx-auto px-4 py-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b-4 border-black pb-6">
          <div>
            <h1 className="font-display text-5xl italic uppercase tracking-tighter text-black">
              Ranking General
            </h1>
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-2">
              Temporada URBA 2026 • Todos los equipos
            </p>
          </div>
          <div className="bg-black text-white px-4 py-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="font-bold text-sm uppercase">{ranking.length} Inscriptos</span>
          </div>
        </div>

        <div className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase text-[10px] tracking-[0.2em]">
                <th className="p-4 w-20 text-center border-r border-white/20">Pos</th>
                <th className="p-4">Equipo</th>
                <th className="p-4 text-right w-32">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((equipo, index) => {
                const esPodio = index < 3;
                return (
                  <tr key={index} className="border-b-2 border-black last:border-0 hover:bg-yellow-50 transition-colors">
                    <td className={`p-4 text-center font-display text-3xl italic border-r-2 border-black ${esPodio ? 'bg-yellow-400' : 'bg-white'}`}>
                      {index + 1}
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 border border-black flex items-center justify-center">
                        <Shield className="w-4 h-4 text-black text-opacity-30" />
                      </div>
                      <span className="font-display text-xl uppercase italic leading-none">
                        {equipo.nombre_equipo || "XV Sin Nombre"}
                      </span>
                      {index === 0 && <Trophy className="w-5 h-5 text-yellow-600 ml-auto" />}
                    </td>
                    <td className="p-4 text-right font-display text-4xl bg-gray-50/50">
                      {equipo.puntos_acumulados || 0}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {ranking.length === 0 && (
          <div className="mt-10 p-12 border-4 border-dashed border-black text-center italic text-gray-400">
            Aún no hay equipos armados para esta temporada.
          </div>
        )}
      </main>
    </div>
  )
}

// Icono para el badge de usuarios
function Users({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
