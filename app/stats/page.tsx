import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"
import { DreamTeamCards } from "@/components/dream-team-cards" // Importamos el componente
import { Trophy, Shield } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StatsPage() {
  const supabase = await createClient()

  // 1. Configuración (Fecha Activa)
  const { data: configData } = await supabase
    .from("config_juego")
    .select("fecha_activa")
    .eq("id", 1)
  
  const fechaActiva = configData?.[0]?.fecha_activa || 4

  // 2. Traer XV Ideal desde la View (dream_team_titulares)
  const { data: dreamData } = await supabase
    .from('dream_team_titulares')
    .select('nombre, posicion, club, puntos')
    .order('puntos', { ascending: false })

  // 3. Traer Censo de Hinchas
  const { data: hinchasData } = await supabase
    .from('stats_hinchas_club')
    .select('club, cantidad_hinchas')
    .order('cantidad_hinchas', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <MainHeader />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-2">
          <div>
            <h1 className="font-black text-6xl md:text-8xl italic uppercase tracking-tighter leading-[0.8]">
              Stats <span className="text-white/10">Center</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-6">
              Data Intelligence • Temporada 2026
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* XV IDEAL USANDO EL COMPONENTE */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-3 px-2">
               <Trophy className="w-6 h-6 text-emerald-500" />
               <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                 XV Ideal <span className="text-gray-600 font-bold text-2xl ml-2 italic">F{fechaActiva - 1}</span>
               </h2>
            </div>

            <div className="bg-[#111113]/50 border border-white/5 rounded-[40px] p-6 md:p-10 shadow-2xl">
               <DreamTeamCards jugadores={dreamData || []} />
            </div>
          </div>

          {/* HINCHADAS */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3 px-2">
              <Shield className="w-6 h-6 text-emerald-500" />
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Hinchas</h2>
            </div>
            <div className="bg-[#111113]/50 border border-white/5 rounded-[40px] p-8">
              <div className="space-y-4">
                {hinchasData?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-3xl border border-transparent hover:border-emerald-500/20 transition-all">
                    <span className="font-black uppercase italic text-sm tracking-tighter">{item.club}</span>
                    <span className="text-xl font-black text-emerald-500 italic">{item.cantidad_hinchas}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}