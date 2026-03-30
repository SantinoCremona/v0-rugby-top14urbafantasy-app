import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"
import { Trophy, Users, Shield, Zap, Star } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Definimos la interfaz para evitar errores de tipo en el build de Vercel
interface DreamPlayer {
  nombre: string
  posicion: string
  club: string
  puntos: number
}

export default async function StatsPage() {
  const supabase = await createClient()

  // 1. Configuración (Sin .single() para evitar crash si no hay datos)
  const { data: configData } = await supabase
    .from("config_juego")
    .select("fecha_activa")
    .eq("id", 1)
  
  const fechaActiva = configData && configData.length > 0 ? configData[0].fecha_activa : 4

  // 2. Traer XV Ideal desde la View
  const { data: dreamData, error: dreamError } = await supabase
    .from('dream_team_titulares')
    .select('nombre, posicion, club, puntos')
    .order('puntos', { ascending: false })

  if (dreamError) console.error("Error DreamTeam:", dreamError)

  // 3. Traer Censo de Hinchas
  const { data: hinchasData } = await supabase
    .from('stats_hinchas_club')
    .select('club, cantidad_hinchas')
    .order('cantidad_hinchas', { ascending: false })

  const dreamPlayers: DreamPlayer[] = dreamData || []
  const hinchas = hinchasData || []
  const maxHinchas = hinchas.length > 0 ? hinchas[0].cantidad_hinchas : 1

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <MainHeader />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
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
          
          {/* SECCIÓN XV IDEAL (CARTAS) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-3 px-2">
               <Trophy className="w-6 h-6 text-emerald-500" />
               <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                 XV Ideal <span className="text-gray-600">Dream Team</span>
               </h2>
            </div>

            {dreamPlayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dreamPlayers.map((player, idx) => (
                  <div key={idx} className="bg-[#111113] border border-white/5 rounded-[28px] p-5 flex items-center gap-4 group hover:border-emerald-500/50 transition-all">
                    <div className="w-14 h-14 flex-shrink-0 bg-black rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                      <img 
                        src={`/escudos/${player.club.toLowerCase().trim().replace(/\s+/g, '-')}.png`} 
                        alt=""
                        className="w-9 h-9 object-contain z-10"
                        onError={(e) => { (e.currentTarget.style.display = 'none') }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black bg-white text-black px-1.5 py-0.5 rounded uppercase tracking-tighter">{player.posicion}</span>
                        <h3 className="font-black text-base text-white uppercase italic truncate">{player.nombre}</h3>
                      </div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{player.club}</p>
                    </div>
                    <div className="text-right pl-4 border-l border-white/5">
                      <div className="flex items-center justify-end gap-1 text-emerald-500 font-black italic">
                        <Zap className="w-3 h-3 fill-emerald-500" />
                        <span className="text-2xl">{player.puntos}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-[40px]">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Aún no hay datos de la fecha</p>
              </div>
            )}
          </div>

          {/* SECCIÓN HINCHADAS */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter px-2">Hinchas</h2>
            <div className="bg-[#111113] border border-white/5 rounded-[40px] p-8 shadow-2xl">
              <div className="space-y-4">
                {hinchas.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.03] border border-transparent rounded-3xl">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-white/10 italic">{(idx + 1)}</span>
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