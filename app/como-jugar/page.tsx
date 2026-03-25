"use client"

import { MainHeader } from "@/components/main-header"
import { 
  Clock, DollarSign, Trophy, CheckCircle2, 
  ShieldAlert, Target, Star, ArrowLeft 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ComoJugarPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-emerald-500 selection:text-black">
      <MainHeader />
      
      <main className="max-w-4xl mx-auto px-6 py-12 pb-24">
        {/* BOTÓN VOLVER */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-emerald-400 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Volver al Campo</span>
        </button>

        <div className="space-y-16">
          {/* HEADER SECCIÓN */}
          <div className="text-center space-y-4">
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
              ¿Cómo <span className="text-emerald-500">Jugar?</span>
            </h1>
            <p className="text-[12px] text-gray-500 font-black uppercase tracking-[0.4em]">Guía Oficial Headcoach • URBA Top 12</p>
          </div>

          {/* PASOS PRINCIPALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1A3A2A]/20 border border-white/10 p-8 rounded-[40px] space-y-4 relative overflow-hidden">
              <Clock className="w-8 h-8 text-emerald-500" />
              <h3 className="text-xl font-black italic uppercase italic">Calendario</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                El mercado abre los <span className="text-white font-bold">Lunes</span>. Tenés tiempo de armar tu equipo hasta los <span className="text-white font-bold">Viernes a las 23:59hs</span>, momento en que el mercado se cierra para la fecha.
              </p>
            </div>

            <div className="bg-[#1A3A2A]/20 border border-white/10 p-8 rounded-[40px] space-y-4">
              <DollarSign className="w-8 h-8 text-emerald-500" />
              <h3 className="text-xl font-black italic uppercase italic">Presupuesto</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Contás con <span className="text-white font-bold">$10.000</span> virtuales para fichar a tus 15 jugadores. Además, podés elegir un máximo de <span className="text-white font-bold">4 jugadores por club</span>.
              </p>
            </div>
          </div>

          {/* BANNER CONFIRMACIÓN */}
          <div className="bg-emerald-500 p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-8 text-black shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 className="w-16 h-16 flex-shrink-0" />
            <div>
              <p className="font-black italic uppercase text-2xl leading-none mb-2">Punto Clave: Confirmar XV</p>
              <p className="text-xs font-bold uppercase tracking-tight leading-tight opacity-80">
                No basta con elegir a los jugadores. Debes presionar el botón <span className="underline">"Confirmar XV Titular"</span> para que tus cambios queden guardados en la base de datos antes del cierre del mercado.
              </p>
            </div>
          </div>

          {/* TABLA DE PUNTUACIÓN */}
          <div className="bg-[#141416] border border-white/10 rounded-[48px] overflow-hidden shadow-2xl">
            <div className="bg-white/5 px-8 py-8 border-b border-white/10 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-gray-500" />
              <h3 className="text-2xl font-black italic uppercase tracking-[0.1em]">Sistema de Puntuación</h3>
            </div>
            
            <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-16">
              {/* SUMA */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Aciertos (Suman)</h4>
                </div>
                <ul className="space-y-4">
                  {[
                    ["Base por jugar", "+10"],
                    ["Victoria del Equipo", "+2"],
                    ["Try Apoyado / Drop", "+5"],
                    ["Penal / Conversión", "+3 / +2"],
                    ["Bonus Ofensivo", "+2"],
                    ["Bonus Defensivo", "+1"],
                    ["MVP del Partido", "+5"]
                  ].map(([label, pts]) => (
                    <li key={label} className="flex justify-between items-center border-b border-white/5 pb-2 text-xs font-bold uppercase tracking-tighter">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-white font-black italic">{pts}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* RESTA */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest">Penalizaciones (Restan)</h4>
                </div>
                <ul className="space-y-4">
                  {[
                    ["Derrota del Equipo", "-2"],
                    ["Derrota por Bonus", "-2"],
                    ["Kick Errado (Penal/Conv)", "-2"],
                    ["Tarjeta Amarilla", "-5"],
                    ["Tarjeta Roja", "-10"],
                    ["Equipo Incompleto", "-5 por slot"]
                  ].map(([label, pts]) => (
                    <li key={label} className="flex justify-between items-center border-b border-white/5 pb-2 text-xs font-bold uppercase tracking-tighter">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-rose-500 font-black italic">{pts}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* REGLAMENTO RÁPIDO */}
                  <section id="reglas" className="mt-20 space-y-12">
                    <div className="text-center space-y-4">
                      <h2 className="text-6xl font-black italic tracking-tighter uppercase">Reglas <span className="text-white/20">del Juego</span></h2>
                      <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em]">Temporada 2026 - Urba Top 14</p>
                    </div>
          
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[32px] space-y-4">
                        <div className="flex items-center gap-3 text-emerald-400">
                          <Clock className="w-5 h-5" />
                          <h3 className="font-black italic uppercase tracking-widest text-sm">Calendario</h3>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed uppercase font-bold tracking-tight">
                          El mercado abre los <span className="text-white">Lunes</span>. Cierra los <span className="text-white">Viernes noche</span> hasta el <span className="text-white">Domingo</span> (Carga de puntos).
                        </p>
                      </div>
          
                      <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[32px] space-y-4">
                        <div className="flex items-center gap-3 text-emerald-400">
                          <DollarSign className="w-5 h-5" />
                          <h3 className="font-black italic uppercase tracking-widest text-sm">Presupuesto</h3>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed uppercase font-bold tracking-tight">
                          Presupuesto máximo de <span className="text-white">$10.000</span>. Límite de <span className="text-white">4 jugadores</span> por club.
                        </p>
                      </div>
                    </div>
          
                    <div className="bg-emerald-500 p-8 rounded-[32px] flex items-center gap-6 text-black shadow-[0_20px_40px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="w-12 h-12 flex-shrink-0" />
                      <div>
                        <p className="font-black italic uppercase text-xl leading-none mb-1">Confirmar XV</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">
                          Debes presionar el botón de confirmar XV para que se guarde tu equipo y los cambios que hagas fecha a fecha también.
                        </p>
                      </div>
                    </div>
          
                    <div className="bg-white/[0.02] border border-white/10 rounded-[40px] overflow-hidden">
                      <div className="bg-white/5 px-8 py-6 border-b border-white/10">
                        <h3 className="font-black italic uppercase tracking-[0.2em] text-center">Tabla de Puntuación</h3>
                      </div>
                      
                      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Aciertos (Suma)</h4>
                          <ul className="space-y-3">
                            {[
                              ["Base por jugar", "+10"],
                              ["Victoria del Equipo", "+2"],
                              ["Try Apoyado / Drop", "+5"],
                              ["Penal / Conversión", "+3 / +2"],
                              ["Bonus Ofensivo", "+2"],
                              ["Bonus Defensivo", "+1"],
                              ["MVP del Partido", "+5"]
                            ].map(([label, pts]) => (
                              <li key={label} className="flex justify-between items-center border-b border-white/5 pb-2 text-[11px] font-bold uppercase tracking-tighter">
                                <span className="text-gray-400">{label}</span>
                                <span className="text-white italic font-black">{pts}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
          
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Penalizaciones (Resta)</h4>
                          <ul className="space-y-3">
                            {[
                              ["Derrota del Equipo", "-2"],
                              ["Derrota por Bonus", "-2"],
                              ["Kick Errado", "-2"],
                              ["Tarjeta Amarilla", "-5"],
                              ["Tarjeta Roja", "-10"]
                            ].map(([label, pts]) => (
                              <li key={label} className="flex justify-between items-center border-b border-white/5 pb-2 text-[11px] font-bold uppercase tracking-tighter">
                                <span className="text-gray-400">{label}</span>
                                <span className="text-rose-500 italic font-black">{pts}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

          <footer className="text-center pt-10">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="h-16 px-12 bg-white text-black rounded-2xl font-black uppercase italic tracking-widest hover:bg-emerald-400 transition-all"
            >
              ¡Entendido, quiero jugar!
            </Button>
          </footer>
        </div>
      </main>
    </div>
  )
}