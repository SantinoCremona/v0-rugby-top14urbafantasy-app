import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"
import { DreamTeamField } from "@/components/dream-team-field"
import { Trophy, Users, Shield } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StatsPage() {
  const supabase = await createClient()

  // 1. Configuración con manejo de error
  const { data: configData, error: configError } = await supabase.from("config_juego").select("*")
  const config = configData && configData.length > 0 ? configData[0] : null
  const fechaActiva = config?.fecha_activa || 4

  // 2. Traer XV Ideal
  const { data: dreamData, error: dreamError } = await supabase
    .from('dream_team_titulares')
    .select('nombre, posicion, club, puntos')

  if (dreamError) console.error("Error en View Dream Team:", dreamError)

  // 3. Traer Hinchas
  const { data: hinchasData, error: hinchasError } = await supabase
    .from('stats_hinchas_club')
    .select('*')
    .order('cantidad_hinchas', { ascending: false })

  if (hinchasError) console.error("Error en View Hinchas:", hinchasError)

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <MainHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-16">
          <h1 className="font-black text-6xl md:text-8xl italic uppercase tracking-tighter leading-[0.8]">
            Stats <span className="text-white/10">Center</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div className="bg-[#111113] border border-white/5 rounded-[40px] p-4 md:p-10">
               {/* Si no hay data, pasamos array vacío para que el componente muestre el estado 'esperando' */}
               <DreamTeamField jugadores={dreamData || []} />
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-[#111113] border border-white/5 rounded-[40px] p-8">
              <h2 className="text-2xl font-black uppercase italic mb-6">Hinchas</h2>
              <div className="space-y-4">
                {hinchasData?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-3xl">
                    <span className="font-black uppercase italic text-sm">{item.club}</span>
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