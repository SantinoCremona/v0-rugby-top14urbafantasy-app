"use client"

import { MainHeader } from "@/components/main-header"
import { 
  Clock, DollarSign, Trophy, CheckCircle2, 
  ShieldAlert, Target, Star, ArrowLeft, Trash2, Users, Info
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
          <span className="text-[10px] font-black uppercase tracking-widest">Volver a la cancha</span>
        </button>

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
                El mercado abre los <span className="text-white font-bold">Lunes</span>. Tenés tiempo hasta los <span className="text-white font-bold">Viernes a las 23:30hs</span> para confirmar tu XV. Durante el sábado y domingo, el mercado permanece <span className="text-rose-500 font-bold italic underline uppercase">cerrado</span>.
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

          {/* CONTROLES DE CAMPO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] flex items-start gap-4">
              <Trash2 className="w-8 h-8 text-rose-500 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-black uppercase mb-1">Vaciar Equipo</h4>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-tight">Borra todo tu equipo y te permite volver a seleccionar a todods tus jugadores.</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] flex items-start gap-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-black uppercase mb-1">Confirmar XV</h4>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-tight">Crucial: Si no apretás este botón antes del cierre del mercado, tu equipo o tus cambios no se guardarán en la base de datos.</p>
              </div>
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
                    ["Try Penal (Scrum/Maul)", "+3 a los Forwards"],
                    ["Try de Primera Fase", "+3 a los Backs"],
                    ["Penal / Conversión", "+3 / +2"],
                    ["Victoria / MVP", "+2 / +5"],
                    ["Bonus Ofensivo/Defensivo", "+2 / +1"]
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
                    ["Derrota del Equipo", "-2"],
                    ["Kick Errado (Penal/Conv)", "-2"],
                    ["Equipo Incompleto", "-5 por slot"],
                    ["Derrota por Bonus", "-2"]
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

          {/* LIGAS Y NIVELACIÓN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[40px] space-y-4 border-dashed">
              <Users className="w-8 h-8 text-gray-400" />
              <h3 className="text-xl font-black italic uppercase">Torneos Privados</h3>
              <p className="text-[11px] text-gray-500 uppercase leading-relaxed font-bold">
                Creá tu propio torneo y compartí el código de invitación por wpp con amigos o seguidores. Es la mejor forma de competir mano a mano con tu grupo cercano.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[40px] space-y-4 border-dashed">
              <Info className="w-8 h-8 text-gray-400" />
              <h3 className="text-xl font-black italic uppercase">Puntos Base</h3>
              <p className="text-[11px] text-gray-500 uppercase leading-relaxed font-bold">
                ¿Te uniste tarde? ¡No hay drama! El sistema te asigna automáticamente los <span className="text-white">puntos de nivelación</span> (el puntaje mínimo histórico) para que no arranques de cero.
              </p>
            </div>
          </div>

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