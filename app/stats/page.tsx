import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"
import { DreamTeamCards } from "@/components/dream-team-cards"
import { Trophy, Shield, Users } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StatsPage() {
  const supabase = await createClient()

  const { data: configData } = await supabase
    .from("config_juego")
    .select("fecha_activa")
    .eq("id", 1)
  
  const fechaActiva = configData?.[0]?.fecha_activa || 4

  const { data: dreamData } = await supabase
    .from('dream_team_titulares')
    .select('nombre, posicion, club, puntos')

  const { data: hinchasData } = await supabase
    .from('stats_hinchas_club')
    .select('club, cantidad_hinchas')
    .order('cantidad_hinchas', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <MainHeader />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-16">
          <h1 className="font-black text-6xl md:text-8xl italic uppercase tracking-tighter leading-[0.8]">
            Analytics <span className="text-white/10">Center</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* XV IDEAL */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-3 px-2">
               <Trophy className="w-6 h-6 text-emerald-500" />
               <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                 XV Ideal <span className="text-gray-600 font-bold text-2xl ml-2 italic text-emerald-500/50">F{fechaActiva - 1}</span>
               </h2>
            </div>

            <div className="bg-[#111113]/50 border border-white/5 rounded-[40px] p-6 md:p-10">
               <DreamTeamCards jugadores={dreamData || []} />
            </div>
          </div>

          {/* HINCHADAS CON ESCUDO */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3 px-2">
              <Users className="w-6 h-6 text-emerald-500" />
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Hinchas</h2>
            </div>
            <div className="bg-[#111113]/50 border border-white/5 rounded-[40px] p-6">
              <div className="space-y-3">
                {hinchasData?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-3xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-white/20 italic w-4">{(idx + 1)}</span>
                      <img 
                        src={`/escudos/${item.club.toLowerCase().trim().replace(/\s+/g, '-')}.png`} 
                        className="w-6 h-6 object-contain" 
                        alt=""
                        onError={(e) => { (e.currentTarget.style.display = 'none') }}
                      />
                      <span className="font-black uppercase italic text-xs tracking-tighter">{item.club}</span>
                    </div>
                    <span className="text-lg font-black text-emerald-500 italic">{item.cantidad_hinchas}</span>
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