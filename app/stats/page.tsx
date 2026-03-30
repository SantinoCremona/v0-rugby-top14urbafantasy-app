import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"
import { Trophy, Users, Shield, Zap, Star } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StatsPage() {
  const supabase = await createClient()

  // 1. Configuración del Juego
  const { data: config } = await supabase.from("config_juego").select("*").eq("id", 1).single()
  const fechaActiva = config?.fecha_activa || 4

  // 2. Traer XV Ideal desde la View
  const { data: dreamData } = await supabase
    .from('dream_team_titulares')
    .select('nombre, posicion, club, puntos')
    .order('puntos', { ascending: false }) // Los mejores arriba

  // 3. Traer Censo de Hinchas
  const { data: hinchasData } = await supabase
    .from('stats_hinchas_club')
    .select('*')
    .order('cantidad_hinchas', { ascending: false })

  const hinchas = hinchasData || []
  const maxHinchas = hinchas.length > 0 ? hinchas[0].cantidad_hinchas : 1

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <MainHeader />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* HEADER ESTILO HEADCOACH */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="font-black text-6xl md:text-8xl italic uppercase tracking-tighter leading-[0.8]">
              Analytics <span className="text-white/10">Center</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-6">
              Data Intelligence • Temporada 2026
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-md flex items-center gap-4">
            <div className="p-2 bg-emerald-500 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none">MVP Fecha {fechaActiva - 1}</p>
              <p className="text-xl font-black italic uppercase text-emerald-500">Top XV</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* SECCIÓN XV IDEAL (CARTAS) */}
          <div className="lg:col-span-8 space-y-8">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter px-2">
              XV Ideal <span className="text-gray-600">Dream Team</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dreamData?.map((player, idx) => (
                <div key={idx} className="relative group bg-[#111113] border border-white/5 rounded-[28px] p-1 transition-all hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                  <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-white/[0.03] to-transparent rounded-[24px]">
                    
                    {/* Badge de Posición */}
                    <div className="absolute top-4 left-4 z-10 bg-white text-black font-black text-[8px] px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      {player.posicion}
                    </div>

                    {/* Escudo Club */}
                    <div className="w-16 h-16 flex-shrink-0 bg-black rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                      <img 
                        src={`/escudos/${player.club.toLowerCase().trim().replace(/\s+/g, '-')}.png`} 
                        alt={player.club}
                        className="w-10 h-10 object-contain z-10"
                        onError={(e) => { (e.currentTarget.style.display = 'none') }}
                      />
                      {idx < 3 && <div className="absolute inset-0 bg-emerald-500/10 blur-xl" />}
                    </div>

                    {/* Info Jugador */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-lg text-white uppercase italic leading-none truncate tracking-tighter">
                        {player.nombre}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{player.club}</span>
                        {idx < 3 && <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" />}
                      </div>
                    </div>

                    {/* Puntos */}
                    <div className="text-right pl-4 border-l border-white/5">
                      <div className="flex items-center justify-end gap-1">
                        <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                        <span className="text-3xl font-black text-white italic leading-none tracking-tighter">
                          {player.puntos}
                        </span>
                      </div>
                      <p className="text-[8px] font-black text-gray-600 uppercase mt-1">Pts</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN HINCHADAS (DERECHA) */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter px-2">Hinchas</h2>
            <div className="bg-[#111113] border border-white/5 rounded-[40px] p-8 shadow-2xl sticky top-24">
              <div className="space-y-4">
                {hinchas.map((item, idx) => (
                  <div key={idx} className="group flex items-center justify-between p-4 bg-white/[0.03] border border-transparent hover:border-emerald-500/30 rounded-3xl transition-all">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black text-white/10 italic">{(idx + 1)}</span>
                      <img 
                        src={`/escudos/${item.club.toLowerCase().trim().replace(/\s+/g, '-')}.png`} 
                        className="w-7 h-7 object-contain" 
                        alt=""
                        onError={(e) => { (e.currentTarget.style.display = 'none') }}
                      />
                      <span className="font-black uppercase italic text-sm tracking-tighter">{item.club}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-emerald-500 italic">{item.cantidad_hinchas}</span>
                      <div className="w-12 h-0.5 bg-emerald-500/20 rounded-full mt-1">
                        <div className="h-full bg-emerald-500" style={{ width: `${(item.cantidad_hinchas/maxHinchas)*100}%` }} />
                      </div>
                    </div>
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