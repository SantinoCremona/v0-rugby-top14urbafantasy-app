import { createClient } from "@/lib/supabase/server"

import { MainHeader } from "@/components/main-header"

import { Trophy, Shield, Users, Medal, Star } from "lucide-react"



export default async function RankingGeneralPage() {

  const supabase = await createClient()



  const { data: rankingData, error } = await supabase

    .from('perfiles')

    .select('nombre_equipo, puntos_acumulados')

    .order('puntos_acumulados', { ascending: false })



  if (error) console.error("Error fetching ranking:", error)

  const ranking = rankingData || []



  return (

    <div className="min-h-screen bg-[#0A0A0B] text-white">

      <MainHeader />

      

      <main className="max-w-5xl mx-auto px-4 py-12">

        

        {/* HEADER DE PÁGINA */}

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



        {/* TABLA DE POSICIONES ESTILO CARDS */}

        <div className="space-y-3">

          {/* Header de Columnas */}

          <div className="grid grid-cols-12 px-8 mb-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">

            <div className="col-span-2">Posición</div>

            <div className="col-span-7 md:col-span-8">Equipo</div>

            <div className="col-span-3 md:col-span-2 text-right">Puntos Totales</div>

          </div>



          {ranking.map((equipo, index) => {

            const esPrimero = index === 0;

            const esPodio = index < 3;



            return (

              <div 

                key={index} 

                className={`grid grid-cols-12 items-center px-6 py-5 rounded-2xl border transition-all duration-300 ${

                  esPrimero 

                  ? "bg-white border-white text-black shadow-[0_0_30px_rgba(255,255,255,0.1)]" 

                  : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"

                }`}

              >

                {/* Posición */}

                <div className="col-span-2 flex items-center gap-3">

                  <span className={`text-2xl font-black italic ${esPrimero ? "text-black" : "text-white/40"}`}>

                    #{index + 1}

                  </span>

                  {esPrimero && <Trophy className="w-5 h-5 text-black fill-black" />}

                  {esPodio && !esPrimero && <Medal className="w-4 h-4 text-emerald-400" />}

                </div>



                {/* Nombre Equipo */}

                <div className="col-span-7 md:col-span-8 flex items-center gap-4">

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${

                    esPrimero ? "bg-black border-black text-white" : "bg-white/5 border-white/10 text-white/30"

                  }`}>

                    <Shield className="w-5 h-5" />

                  </div>

                  <div>

                    <span className={`text-base md:text-xl font-black uppercase italic leading-none block ${

                      esPrimero ? "text-black" : "text-white"

                    }`}>

                      {equipo.nombre_equipo || "XV SIN NOMBRE"}

                    </span>

                    <span className={`text-[9px] font-bold uppercase tracking-widest ${

                      esPrimero ? "text-black/50" : "text-gray-600"

                    }`}>

                      URBA FANTASY LEAGUE

                    </span>

                  </div>

                </div>



                {/* Puntos */}

                <div className="col-span-3 md:col-span-2 text-right">

                  <p className={`text-2xl md:text-4xl font-black italic tracking-tighter ${

                    esPrimero ? "text-black" : "text-emerald-400"

                  }`}>

                    {equipo.puntos_acumulados || 0}

                  </p>

                </div>

              </div>

            )

          })}

        </div>



        {/* Empty State */}

        {ranking.length === 0 && (

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
