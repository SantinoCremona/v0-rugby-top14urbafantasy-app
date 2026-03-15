"use client"

import { useState, useEffect } from "react"
import { MainHeader } from "@/components/main-header"
import { RugbyField } from "@/components/rugby-field"
import { PlayerSelectionPopup } from "@/components/player-selection-popup"
import { Save, Trash2, Lock, Trophy, Wallet, Users, Info, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Player } from "@/components/player-card"
import { createClient } from "@/lib/supabase/client"

const INITIAL_BUDGET = 10000

interface PlayerWithPoints extends Player {
  puntos_actuales?: number
}

interface DashboardClientProps {
  players: PlayerWithPoints[]
  savedTeam?: any[]
  rankingPos: number
  mercadoAbierto: boolean
  fechaActiva: number
  puntosFecha: number
}

export function DashboardClient({ players, savedTeam, rankingPos, mercadoAbierto, fechaActiva }: DashboardClientProps) {
  const supabase = createClient()
  const [selectedPlayers, setSelectedPlayers] = useState<Map<number, PlayerWithPoints>>(new Map())
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [targetPosition, setTargetPosition] = useState<number | null>(null)
  const [targetPositionType, setTargetPositionType] = useState<string>("")
  const [loading, setLoading] = useState(false)

  // Carga y vinculación de puntos (Lógica optimizada)
  useEffect(() => {
    async function cargarDatos() {
      if (savedTeam && savedTeam.length > 0) {
        const { data: puntosData } = await supabase
          .from("puntos_fecha")
          .select("jugador_id, puntos")
          .eq("fecha_num", fechaActiva)

        const newMap = new Map()
        savedTeam.forEach(item => {
          const pInfo = players.find(p => p.id === item.jugador_id)
          if (pInfo) {
            const pts = puntosData?.find(pd => pd.jugador_id === pInfo.id)?.puntos || 0
            newMap.set(parseInt(item.posicion_en_campo), { ...pInfo, puntos_actuales: pts })
          }
        })
        setSelectedPlayers(newMap)
      }
    }
    cargarDatos()
  }, [savedTeam, players, fechaActiva, supabase])

  const totalSpent = Array.from(selectedPlayers.values()).reduce((sum, p) => sum + p.precio, 0)
  const remainingBudget = INITIAL_BUDGET - totalSpent
  const ptsTotalesCancha = Array.from(selectedPlayers.values()).reduce((sum, p) => sum + (p.puntos_actuales || 0), 0)

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-black font-sans selection:bg-yellow-300">
      <MainHeader />

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* CABECERA DINÁMICA */}
        <div className="relative mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black pb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-yellow-400 border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Live Season 2026
                </span>
                <span className="bg-black text-white px-3 py-1 text-xs font-black uppercase tracking-tighter">
                  Fecha {fechaActiva}
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.8]">
                TU XV <span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>IDEAL</span>
              </h1>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => {/* Lógica Guardar */}}
                disabled={!mercadoAbierto || remainingBudget < 0}
                className="h-16 bg-black text-white px-8 border-4 border-black hover:bg-yellow-400 hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                <Save className="w-6 h-6 mr-3" />
                <span className="text-xl font-black italic uppercase">Confirmar Equipo</span>
              </Button>
            </div>
          </div>
        </div>

        {/* DASHBOARD STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Puntos Fecha", val: ptsTotalesCancha, icon: Trophy, bg: "bg-yellow-400" },
            { label: "Presupuesto", val: `$${remainingBudget}`, icon: Wallet, bg: "bg-white", alert: remainingBudget < 0 },
            { label: "Ranking", val: `#${rankingPos}`, icon: Info, bg: "bg-white" },
            { label: "Titulares", val: `${selectedPlayers.size}/15`, icon: Users, bg: "bg-white" }
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-32`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{stat.label}</span>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className={`text-4xl font-black italic leading-none ${stat.alert ? 'text-red-600' : ''}`}>{stat.val}</p>
            </div>
          ))}
        </div>

        {/* CAMPO DE JUEGO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div className="bg-[#1a472a] border-[6px] border-black p-4 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
               {/* Decoración de pasto */}
               <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.1) 50px, rgba(255,255,255,0.1) 100px)' }}></div>
               <RugbyField
                  selectedPlayers={new Map(Array.from(selectedPlayers.entries()).map(([pos, player]) => [
                    pos, { id: player.id, nombre: player.nombre, club: player.club, puntos: player.puntos_actuales || 0 }
                  ]))}
                  onSlotClick={handleSlotClick}
                  onRemovePlayer={handleRemovePlayer}
               />
            </div>
          </div>

          {/* REGLAS PRO */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-6 border-l-8 border-black pl-4">
                Reglas del <br/>Vesutario
              </h3>
              
              <div className="space-y-4">
                <RuleItem 
                  icon={<Wallet className="w-5 h-5"/>} 
                  title="Tope Salarial" 
                  desc="No podés superar los $10.000. Gestioná bien tus estrellas."
                />
                <RuleItem 
                  icon={<Users className="w-5 h-5"/>} 
                  title="Identidad de Club" 
                  desc="Máximo 4 jugadores por club. Diversificá tu estrategia."
                />
                <RuleItem 
                  icon={<AlertTriangle className="w-5 h-5 text-red-600"/>} 
                  title="Cierre de Libro" 
                  desc="Los cambios se bloquean al inicio del primer partido."
                  highlight
                />
                <RuleItem 
                  icon={<CheckCircle2 className="w-5 h-5 text-green-600"/>} 
                  title="Confirmación" 
                  desc="Si no apretás 'Confirmar', tus cambios no entran a la cancha."
                />
              </div>
            </div>

            {/* Banner de Ayuda */}
            <div className="bg-black text-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(253,224,71,1)]">
              <p className="font-bold text-xs uppercase tracking-widest text-yellow-400 mb-2">¿Cómo sumás?</p>
              <ul className="text-[11px] space-y-2 font-mono uppercase">
                <li>• Try: 8 Puntos</li>
                <li>• Conversión: 2 Puntos</li>
                <li>• Penal/Drop: 3 Puntos</li>
                <li>• Amarilla: -2 Puntos</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <PlayerSelectionPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        positionType={targetPositionType}
        players={players} // Aquí va tu lógica de filtrado
        onSelectPlayer={handleSelectPlayer}
        remainingBudget={remainingBudget}
      />
    </div>
  )
}

function RuleItem({ icon, title, desc, highlight = false }: { icon: any, title: string, desc: string, highlight?: boolean }) {
  return (
    <div className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 ${highlight ? 'bg-red-50' : 'bg-white'}`}>
      <div className="flex gap-3 items-center mb-1">
        {icon}
        <h4 className="font-black uppercase text-xs tracking-tighter">{title}</h4>
      </div>
      <p className="text-[11px] leading-tight font-medium text-gray-600">{desc}</p>
    </div>
  )
}
