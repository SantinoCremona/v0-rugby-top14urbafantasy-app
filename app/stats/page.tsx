import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"
import { BarChart3, Users, Trophy, Shield, Zap } from "lucide-react"
import { DreamTeam } from "@/components/dream-team"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StatsPage() {
  const supabase = await createClient()

  // 1. Configuración (Fecha Activa)
  const { data: config } = await supabase
    .from("config_juego")
    .select("*")
    .eq("id", 1)
    .single()

  const fechaActiva = config?.fecha_activa || 4

  // 2. Traer el XV Ideal de la View 'dream_team_titulares'
  // IMPORTANTE: Asegurate que la VIEW en Supabase devuelva: nombre, posicion, club, puntos
  const { data: dreamTeamData } = await supabase
    .from('dream_team_titulares')
    .select('nombre, posicion, club, puntos')
    .limit(15)

  // 3. Traer el Censo de Hinchas
  const { data: hinchasData } = await supabase
    .from('stats_hinchas_club')
    .select('club, cantidad_hinchas')
    .order('cantidad_hinchas', { ascending: false })

  const hinchas = hinchasData || []
  const maxHinchas = hinchas.length > 0 ? hinchas[0].cantidad_hinchas : 1
  const totalUsuarios = hinchas.reduce((acc, curr) => acc + curr.cantidad_hinchas, 0)

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <MainHeader />
      
      {/* Banner de Mercado Abierto (Si aplica) */}
      {config?.mercado_abierto && (
        <div className="bg-emerald-500 py-2 overflow-hidden border-y border-black relative z-10 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <div className="whitespace-nowrap animate-marquee font-black uppercase italic text-black text-[10px] tracking-[0.2em]">
            MERCADO ABIERTO • ARMÁ TU EQUIPO PARA LA FECHA {fechaActiva} • ELIGE A TUS CRACKS • 
            MERCADO ABIERTO • ARMÁ TU EQUIPO PARA LA FECHA {fechaActiva} •
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Encabezado Estilo Ranking */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="font-black text-6xl md:text-8xl italic uppercase tracking-tighter leading-[0.8]">
              Analytics <span className="text-white/10">Center</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-6">
              Temporada 2026 • Data Intelligence
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md flex items-center gap-4">
            <div className="p-2 bg-emerald-500 rounded-xl">
              <Users className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none">Comunidad</p>
              <p className="text-xl font-black italic">{totalUsuarios} <span className="text-[10px] text-emerald-500 uppercase not-italic">Hinchas</span></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* XV IDEAL (Columna Izquierda) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-3 px-2">
              <Trophy className="w-6 h-6 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                XV Ideal <span className="text-gray-600">Fecha {fechaActiva - 1}</span>
              </h2>
            </div>
            
            <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
               <DreamTeam jugadores={dreamTeamData || []} />
            </div>
          </div>

          {/* CENSO HINCHADAS (Columna Derecha) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-3 px-2">
              <Shield className="w-6 h-6 text-emerald-500" />
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Censo <span className="text-gray-600">Hinchas</span></h2>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-8 shadow-2xl sticky top-24">
              <div className="space-y-4">
                {hinchas.map((item, idx) => (
                  <div key={idx} className="group flex items-center justify-between p-4 bg-white/[0.03] border border-transparent hover:border-emerald-500/30 rounded-3xl transition-all">
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-black text-white/10 italic w-6">{(idx + 1).toString().padStart(2, '0')}</span>
                      <div className="w-10 h-10 bg-black rounded-xl border border-white/10 flex items-center justify-center p-1">
                        <img 
                          src={`/escudos/${item.club.toLowerCase().trim().replace(/\s+/g, '-')}.png`} 
                          alt={item.club}
                          className="w-7 h-7 object-contain opacity-80 group-hover:opacity-100"
                          onError={(e) => { (e.currentTarget.style.display = 'none') }}
                        />
                      </div>
                      <span className="font-black uppercase italic text-sm tracking-tighter">{item.club}</span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 text-white">
                        <span className="text-xl font-black italic">{item.cantidad_hinchas}</span>
                        <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                      </div>
                      <div className="w-12 h-1 bg-white/5 rounded-full mt-2 ml-auto overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${(item.cantidad_hinchas / maxHinchas) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Estilos del Marquee */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 35s linear infinite;
        }
      `}</style>
    </div>
  )
}