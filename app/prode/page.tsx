import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"
import { ProdeForm } from "@/components/prode-form"
import { PartidoProde } from "@/types/prode"

export const dynamic = 'force-dynamic'

export default async function ProdePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: partidosData } = await supabase
    .from('partidos_prode')
    .select('*')
    .eq('categoria', 'PRIMERA_A')
    .eq('fecha_numero', 7)
    .order('created_at', { ascending: true })

  const partidos: PartidoProde[] = partidosData || []

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-urbanist">
      <MainHeader />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <span className="bg-[#deff9a] text-black text-[10px] font-black px-2 py-0.5 uppercase italic">
            Road to 500
          </span>
          <h1 className="font-black text-7xl md:text-8xl italic uppercase tracking-tighter leading-[0.8] mt-4">
            Prode <span className="text-white/10">Primera A</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-6">
            Fecha 7 • Sábado 9 Mayo • Headcoach
          </p>
        </div>

        <ProdeForm partidos={partidos} userId={user?.id} />
      </main>
    </div>
  )
}