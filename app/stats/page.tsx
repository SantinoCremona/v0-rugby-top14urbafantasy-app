import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"
import { DreamTeamField } from "@/components/dream-team-field"
import { Trophy, Users, Shield, Zap } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StatsPage() {
  const supabase = await createClient()

  // 1. Configuración
  const { data: config } = await supabase.from("config_juego").select("*").single()
  const fechaActiva = config?.fecha_activa || 4

  // 2. Traer XV Ideal (View: dream_team_titulares)
  const { data: dreamData } = await supabase
    .from('dream_team_titulares')
    .select('nombre, posicion, club, puntos')

  // 3. Traer Hinchas (View: stats_hinchas_club)
  const { data: hinchasData } = await supabase
    .from('stats_hinchas_club')
    .select('*')
    .order('cantidad_hinchas', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-emerald-500 selection:text-black">
      <MainHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-2">
          <div>
            <h1 className="font-black text-6xl md:text-8xl italic uppercase tracking-tighter leading-[0.8]">
              Stats <span className="text-white/10">Center</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-6">
              Headcoach Data • Temporada 2026
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* XV IDEAL (CANCHA) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3 px-4">
              <Trophy className="w-6 h-6 text-emerald-500" />
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">XV Ideal <span className="text-gray-600">Fecha {fechaActiva - 1}</span></h2>
            </div>
            
            <div className="bg-[#111113] border border-white/5 rounded-[40px] p-4 md:p-10 shadow-2xl">
               <DreamTeamField jugadores={dreamData || []} />
            </div>
          </div>

          {/* HINCHADAS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3 px-4">
              <Shield className="w-6 h-6 text-emerald-500" />
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Hinchas</h2>
            </div>

            <div className="bg-[#111113] border border-white/5 rounded-[40px] p-8 shadow-2xl sticky top-24">
              <div className="space-y-4">
                {hinchasData?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-3xl border border-transparent hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black text-white/10 italic w-6">{(idx + 1)}</span>
                      <img 
                        src={`/escudos/${item.club.toLowerCase().trim().replace(/\s+/g, '-')}.png`} 
                        className="w-7 h-7 object-contain" 
                        alt=""
                        onError={(e) => { (e.currentTarget.style.display = 'none') }}
                      />
                      <span className="font-black uppercase italic text-sm tracking-tighter">{item.club}</span>
                    </div>
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