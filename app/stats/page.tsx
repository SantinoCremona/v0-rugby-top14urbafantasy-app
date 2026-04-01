import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"
import { DreamTeamCards } from "@/components/dream-team-cards" // <--- ACÁ ESTÁ EL IMPORT
import { Shield, Zap, Users } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StatsPage() {
  const supabase = await createClient()

  // Buscamos config
  const { data: configData } = await supabase.from("config_juego").select("fecha_activa").eq("id", 1)
  const fechaActiva = configData?.[0]?.fecha_activa || 4

  // Buscamos jugadores de la View
  const { data: dreamData } = await supabase.from('dream_team_titulares').select('nombre, posicion, club, puntos')
  
  // Buscamos hinchas
  const { data: hinchasData } = await supabase.from('stats_hinchas_club').select('*').order('cantidad_hinchas', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <MainHeader />
      
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col gap-2 mb-10 md:mb-16 px-2 text-center md:text-left">
          <h1 className="font-black text-5xl sm:text-7xl md:text-9xl italic uppercase tracking-tighter leading-[0.85] md:leading-[0.8]">
            Dream<span className="text-white/10">Fans</span>
          </h1>
          <p className="text-emerald-500 font-bold uppercase text-[8px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] flex items-center justify-center md:justify-start gap-2">
            <Zap className="w-3 h-3 fill-emerald-500" /> Official Headcoach Analytics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            <div className="flex items-center justify-between px-2">
               <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter">
                 <span className="text-emerald-500">Dream</span> Team
               </h2>
               <span className="text-gray-500 font-black italic text-sm md:text-xl uppercase tracking-widest">Fecha{fechaActiva - 1}</span>
            </div>

            <div className="bg-[#111113]/50 border border-white/5 rounded-[32px] md:rounded-[40px] p-4 md:p-10 shadow-2xl">
               {/* LLAMAMOS AL COMPONENTE IMPORTADO */}
               <DreamTeamCards jugadores={dreamData || []} />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter px-2 text-gray-500">
               Fans <span className="text-white">Ranking</span>
            </h2>

            <div className="bg-[#111113]/50 border border-white/5 rounded-[32px] md:rounded-[40px] p-5 md:p-8 lg:sticky lg:top-24">
              <div className="space-y-3 md:space-y-4">
                {hinchasData?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 md:p-4 bg-white/[0.03] rounded-2xl md:rounded-3xl border border-transparent hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-white/10 italic w-4">{(idx + 1)}</span>
                    <span className="font-black uppercase italic text-[10px] md:text-sm tracking-tighter truncate max-w-[100px]">{item.club}</span>                  
                    </div>                   
                    <span className="text-lg md:text-xl font-black text-emerald-500 italic leading-none">{item.cantidad_hinchas}</span>
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
