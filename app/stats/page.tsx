import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"
import { BarChart3, Users, Trophy, Zap } from "lucide-react"
import DreamTeam from "@/components/DreamTeam" // Asegurate que la ruta sea correcta

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StatsPage() {
  const supabase = await createClient()

  // 1. Traemos el censo de hinchas desde la View
  const { data: hinchasData } = await supabase
    .from('stats_hinchas_club')
    .select('*')

  const hinchas = hinchasData || []
  const maxHinchas = hinchas.length > 0 ? hinchas[0].cantidad_hinchas : 1

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <MainHeader />
      
      {/* BANNER DINÁMICO DE MERCADO */}
      <div className="bg-emerald-500 py-2 overflow-hidden border-y border-black relative z-10">
        <div className="whitespace-nowrap animate-marquee font-black uppercase italic text-black text-[10px] tracking-widest">
          MERCADO ABIERTO • ARMÁ TU EQUIPO PARA LA FECHA 4 • ELIGE A TUS CRACKS • MERCADO ABIERTO • ARMÁ TU EQUIPO PARA LA FECHA 4 • 
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Principal */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h1 className="font-black text-6xl md:text-8xl italic uppercase tracking-tighter leading-[0.8]">
              Analytics <span className="text-white/10">Center</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-6">
              Data Intelligence • Temporada 2026
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md flex items-center gap-4">
              <div className="p-2 bg-emerald-500 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <BarChart3 className="w-5 h-5 text-black" />
              </div>
              <div>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none">Status</p>
                <p className="text-lg font-black italic uppercase text-emerald-500">Live</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* COLUMNA IZQUIERDA: DREAM TEAM */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Trophy className="w-5 h-5 text-emerald-500" />
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">XV Ideal <span className="text-gray-600">Fecha 3</span></h2>
            </div>
            
            <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-8 shadow-2xl backdrop-blur-sm">
              {/* Pasamos el componente que ya creamos antes */}
              <DreamTeam />
            </div>
          </div>

          {/* COLUMNA DERECHA: HINCHADAS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Users className="w-5 h-5 text-emerald-500" />
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Censo <span className="text-gray-600">Hinchas</span></h2>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-8 shadow-2xl backdrop-blur-sm sticky top-24">
              <div className="space-y-6">
                {hinchas.map((item, idx) => (
                  <div key={idx} className="group flex items-center justify-between gap-4 p-4 rounded-3xl bg-white/[0.03] border border-transparent hover:border-emerald-500/30 hover:bg-white/5 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-black text-white/10 italic w-8">{(idx + 1).toString().padStart(2, '0')}</span>
                      <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center bg-black rounded-xl border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                        <img 
                          src={`/escudos/${item.club.toLowerCase().replace(/\s+/g, '-')}.png`} 
                          alt={item.club}
                          className="w-7 h-7 object-contain"
                          onError={(e) => { (e.currentTarget.style.display = 'none') }}
                        />
                      </div>
                      <span className="font-black uppercase italic text-sm tracking-tight">{item.club}</span>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xl font-black text-white italic">{item.cantidad_hinchas}</span>
                        <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                      </div>
                      {/* Barra de progreso visual */}
                      <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" 
                          style={{ width: `${(item.cantidad_hinchas / maxHinchas) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.5em] leading-none">
                  Headcoach Analytics Division
                </p>
                <p className="text-[8px] text-gray-800 font-medium uppercase mt-2">
                  UCEMA Digital Business Project
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* CSS para el Marquee */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  )
}