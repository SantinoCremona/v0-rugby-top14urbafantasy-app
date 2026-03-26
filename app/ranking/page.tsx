import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"
import { Shield, Users, Star } from "lucide-react"
import { RankingView } from "@/components/ranking-view"

// Forzamos que la página siempre traiga data fresca de la DB
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RankingGeneralPage() {
  const supabase = await createClient()

  // 1. Obtenemos el usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  
  // 2. Buscamos su club para el filtro de la pestaña "Mi Club"
  const { data: perfilUsuario } = await supabase
    .from('perfiles')
    .select('club')
    .eq('id', user?.id)
    .single()

  // 3. Traemos el ranking. Agregamos 'id' para que el componente pueda resaltar tu fila
  const { data: rankingData, error } = await supabase
    .from('perfiles')
    .select('id, nombre_equipo, puntos_acumulados, club')
    .order('puntos_acumulados', { ascending: false })

  if (error) console.error("Error fetching ranking:", error)

  // Mapeamos los datos para asegurar que el ID del perfil se pase como user_id
  const ranking = (rankingData || []).map(r => ({
    user_id: r.id,
    nombre_equipo: r.nombre_equipo,
    puntos_acumulados: r.puntos_acumulados,
    club: r.club
  }))

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <MainHeader />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em]">En Vivo</span>
            </div>
            <h1 className="font-black text-6xl md:text-7xl italic uppercase tracking-tighter leading-none">
              Ranking <span className="text-white/20">General</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-4">
              Temporada URBA 2026 • Top 14
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
            <div className="p-2 bg-white rounded-lg">
              <Users className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">Comunidad</p>
              <p className="text-xl font-black italic">{ranking.length} <span className="text-sm not-italic font-medium text-gray-400">HC</span></p>
            </div>
          </div>
        </div>

        {ranking.length > 0 ? (
          <RankingView 
            initialRanking={ranking} 
            userClub={perfilUsuario?.club || "CASI"} 
            currentUserId={user?.id} // Pasamos tu ID para el resaltado esmeralda
          />
        ) : (
          <div className="mt-20 py-20 border border-dashed border-white/10 rounded-[40px] text-center">
            <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white/10" />
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em]">Aún no hay equipos inscriptos</p>
          </div>
        )}
      </main>
    </div>
  )
}
