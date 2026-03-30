import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"
import { BarChart3, Users, Trophy, Zap, Shield, Star } from "lucide-react"
import DreamTeam from "@/components/dream-team" // Asegurate de que el archivo se llame así

// Forzamos que la página siempre traiga data fresca de la DB
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StatsPage() {
  const supabase = await createClient()

  // 1. Traer Configuración (Para saber qué fecha mostrar y el estado del mercado)
  const { data: config } = await supabase
    .from("config_juego")
    .select("*")
    .eq("id", 1)
    .single()

  const fechaActiva = config?.fecha_activa || 4
  const mercadoAbierto = config?.mercado_abierto || false

  // 2. Traer el XV Ideal (Filtramos por la fecha anterior a la activa)
  // Si estamos en la 4, queremos los puntos de la 3
  const { data: dreamTeamData } = await supabase
    .from('dream_team_titulares')
    .select('*')
    .limit(15)

  // 3. Traer el Censo de Hinchas (Desde la View que creamos)
  const { data: hinchasData } = await supabase
    .from('stats_hinchas_club')
    .select('*')
    .order('cantidad_hinchas', { ascending: false })

  const hinchas = hinchasData || []
  const maxHinchas = hinchas.length > 0 ? hinchas[0].cantidad_hinchas : 1
  const totalUsuarios = hinchas.reduce((acc, curr) => acc + curr.cantidad_hinchas, 0)

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <MainHeader />
      

      <main className="max-w-6xl mx-auto px-4 py-12">
        
        {/* HEADER PRINCIPAL (ESTILO RANKING) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="font-black text-6xl md:text-8xl italic uppercase tracking-tighter leading-[0.8]">
              Analytics <span className="text-white/10">Center</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-6">
              Data Intelligence • Temporada URBA 2026
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md flex items-center gap-4">
              <div className="p-2 bg-emerald-500 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <Users className="w-5 h-5 text-black" />
              </div>
              <div>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none text-left">Comunidad</p>
                <p className="text-xl font-black italic">{totalUsuarios} <span className="text-xs not-italic font-medium text-emerald-500">HC</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* COLUMNA IZQUIERDA: XV IDEAL (CARTAS MODERNAS) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                  XV Ideal <span className="text-gray-600 font-bold">Fecha {fechaActiva - 1}</span>
                </h2>
              </div>
              <div className="hidden md:block bg-white/5 px-4 py-1 rounded-full border border-white/10">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Top Performers</p>
              </div>
            </div>
            
            <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-opacity group-hover:opacity-100 opacity-50" />
              
              {/* Renderizado de las Cartas */}
              <DreamTeam jugadores={dreamTeamData || []} />
            </div>
          </div>

          {/* COLUMNA DERECHA: CENSO HINCHADAS (STYLE RANKING) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-3 px-2">
              <Shield className="w-6 h-6 text-emerald-500" />
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Censo <span className="text-gray-600">Hinchas</span></h2>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-8 shadow-2xl sticky top-24">
              <div className="space-y-4">
                {hinchas.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="group flex items-center justify-between p-4 bg-white/[0.03] border border-transparent hover:border-emerald-500/30 hover:bg-white/5 rounded-3xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-black text-white/10 italic w-6">{(idx + 1).toString().padStart(2, '0')}</span>
                      <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center bg-black rounded-xl border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                        <img 
                          src={`/public/escudos/${item.club.toLowerCase().trim().replace(/\s+/g, '-')}.png`} 
                          alt={item.club}
                          className="w-7 h-7 object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"
                          onError={(e) => { (e.currentTarget.style.display = 'none') }}
                        />
                      </div>
                      <span className="font-black uppercase italic text-sm tracking-tighter">{item.club}</span>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xl font-black text-white italic leading-none">{item.cantidad_hinchas}</span>
                        <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                      </div>
                      {/* Barra de progreso visual */}
                      <div className="w-16 h-1 bg-white/5 rounded-full mt-2 ml-auto overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                          style={{ width: `${(item.cantidad_hinchas / maxHinchas) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer de la Card de Hinchas */}
              <div className="mt-12 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.6em] leading-none">
                  Headcoach Analytics
                </p>
        
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Animación del Banner */}
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