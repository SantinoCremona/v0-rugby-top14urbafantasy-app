import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"
import { ProdeForm } from "@/components/prode-form"
import { Trophy, CalendarDays, Users } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProdePrimeraAPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Traemos los partidos de la Fecha 7
  const { data: partidos } = await supabase
    .from('partidos_prode')
    .select('*')
    .eq('categoria', 'PRIMERA_A')
    .eq('fecha_numero', 7)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-[#deff9a] selection:text-black">
      <MainHeader />
      
      <main className="max-w-5xl mx-auto px-6 py-12 pb-24">
        <div className="space-y-16">
          
          {/* HEADER SECCIÓN ESTILO HEADCOACH */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#deff9a]/10 border border-[#deff9a]/20 px-4 py-1 rounded-full">
              <span className="text-[#deff9a] text-[10px] font-black uppercase tracking-[0.2em]">Road to 500 Followers</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase leading-none">
              Prode <span className="text-white/10">Primera A</span>
            </h1>
            <p className="text-[12px] text-gray-500 font-black uppercase tracking-[0.4em]">Fecha 7 • Temporada 2026</p>
          </div>

          {/* INFO RÁPIDA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] flex items-center gap-4">
              <CalendarDays className="w-6 h-6 text-[#deff9a]" />
              <div>
                <p className="text-[10px] text-gray-500 font-black uppercase">Cierre de Pronósticos</p>
                <p className="text-sm font-bold uppercase">Sábado 11:00hs</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] flex items-center gap-4">
              <Trophy className="w-6 h-6 text-[#deff9a]" />
              <div>
                <p className="text-[10px] text-gray-500 font-black uppercase">Acierto Exacto</p>
                <p className="text-sm font-bold uppercase">+8 Puntos</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] flex items-center gap-4">
              <Users className="w-6 h-6 text-[#deff9a]" />
              <div>
                <p className="text-[10px] text-gray-500 font-black uppercase">Participantes</p>
                <p className="text-sm font-bold uppercase">Categoría Única</p>
              </div>
            </div>
          </div>

          {/* FORMULARIO DE PRONÓSTICOS */}
          <div className="bg-white/[0.02] border border-white/10 rounded-[48px] p-2 md:p-8">
            <ProdeForm 
              partidos={partidos || []} 
              userId={user?.id}
            />
          </div>

          <footer className="text-center">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.3em]">
              Los resultados se validan oficialmente el lunes por la mesa técnica.
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}