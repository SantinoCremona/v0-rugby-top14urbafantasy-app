"use client"

import { MainHeader } from "@/components/main-header"
import { 
  Clock, DollarSign, Trophy, CheckCircle2, 
  ShieldAlert, Target, Star, ArrowLeft, Trash2, Users, Info, TrendingUp, RefreshCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ComoJugarPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-emerald-500 selection:text-black">
      <MainHeader />
      
      <main className="max-w-4xl mx-auto px-6 py-12 pb-24">
        <div className="space-y-16">
          {/* HEADER SECCIÓN */}
          <div className="text-center space-y-4">
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
              ¿Cómo <span className="text-emerald-500">Jugar?</span>
            </h1>
            <p className="text-[12px] text-gray-500 font-black uppercase tracking-[0.4em]">Guia de Juego • Headcoach</p>
          </div>

          {/* PASOS PRINCIPALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1A3A2A]/20 border border-white/10 p-8 rounded-[40px] space-y-4">
              <Clock className="w-8 h-8 text-emerald-500" />
              <h3 className="text-xl font-black italic uppercase">Calendario</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                El mercado abre los <span className="text-white font-bold">Lunes</span>. Tenés tiempo hasta los <span className="text-white font-bold">Sabados a las 11:00hs</span> para confirmar tu XV. Durante el sábado y domingo, el mercado permanece <span className="text-rose-500 font-bold italic underline uppercase">cerrado</span>.
              </p>
            </div>

            <div className="bg-[#1A3A2A]/20 border border-white/10 p-8 rounded-[40px] space-y-4">
              <DollarSign className="w-8 h-8 text-emerald-500" />
              <h3 className="text-xl font-black italic uppercase">Presupuesto</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Contás con <span className="text-white font-bold">$10.000</span> virtuales. Podés elegir un máximo de <span className="text-white font-bold">4 jugadores por club</span>. Te conviene fichar jugadores marcados como <span className="text-emerald-500 font-bold uppercase italic">TITULAR</span>.
              </p>
            </div>
          </div>

          {/* NUEVA SECCIÓN: MERCADO DINÁMICO */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 md:p-12 rounded-[48px] space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <TrendingUp className="w-16 h-16 text-emerald-500" />
              <div>
                <h3 className="text-3xl font-black italic uppercase">Mercado en Tiempo Real</h3>
                <p className="text-gray-400 font-medium">Los precios se recalculan cada lunes según el rendimiento de la última fecha y el resultado del club.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { tier: "ELITE", precio: "$800", desc: "Top 3 (Simples) / Top 6 (Dobles) de la fecha." },
                { tier: "TITULAR", precio: "$700", desc: "Rendimiento sólido y consistente." },
                { tier: "GANGA", precio: "$500", desc: "Resto del ranking. ¡Oportunidad de compra!" }
              ].map((item) => (
                <div key={item.tier} className="bg-white/5 p-6 rounded-[30px] border border-white/5">
                  <h4 className="text-emerald-500 font-black italic uppercase text-lg">{item.tier}</h4>
                  <p className="text-2xl font-black mb-2">{item.precio}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-6 rounded-[30px] border border-dashed border-white/20">
              <RefreshCcw className="w-6 h-6 text-emerald-500 flex-shrink-0" />
              <p className="text-xs font-bold uppercase text-gray-300">
                <span className="text-white font-black">VOLATILIDAD:</span> Un jugador que hoy vale <span className="text-emerald-500">$800</span> puede caer a <span className="text-rose-500">$500</span> la semana siguiente si su equipo pierde o tiene un mal desempeño. ¡Atento al fixture!
              </p>
            </div>
          </div>

          {/* TABLA DE PUNTUACIÓN ACTUALIZADA */}
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
                    ["Try Apoyado", "+5"],
                    ["Asistencia de Try", "+3"],
                    ["Turnover ganado", "+2"],
                    ["Scrum ganado", "+1"],
                    ["Line ganado", "+1 (Solo Fwd)"],
                    ["Penal / Conversión", "+3 / +2"],
                    ["Victoria / MVP", "+2 / +5"],
                  ].map(([label, pts]) => (
                    <li key={label} className="flex justify-between items-center border-b border-white/5 pb-2 text-[11px] font-bold uppercase tracking-tighter">
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
                    ["Tarjeta Amarilla / Roja", "-5 / -10"],
                    ["Turnover perdido", "-2 (Solo Fwd)"],
                    ["Derrota del Equipo", "-2"],
                    ["Kick Errado (Penal/Conv)", "-2"],
                    ["Equipo Incompleto", "-5 por slot"],
                  ].map(([label, pts]) => (
                    <li key={label} className="flex justify-between items-center border-b border-white/5 pb-2 text-[11px] font-bold uppercase tracking-tighter">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-rose-500 font-black italic">{pts}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* SECCIÓN FINAL */}
          <footer className="text-center pt-10">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="h-20 px-16 bg-white text-black rounded-[24px] font-black uppercase italic tracking-widest hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
            >
              ¡Entendido, a la cancha!
            </Button>
          </footer>
        </div>
      </main>
    </div>
  )
}
