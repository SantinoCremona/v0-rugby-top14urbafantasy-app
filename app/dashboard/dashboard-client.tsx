"use client"

import { useState, useEffect } from "react"
import { MainHeader } from "@/components/main-header"
import { RugbyField } from "@/components/rugby-field"
import { PlayerSelectionPopup } from "@/components/player-selection-popup"
import { Save, Trash2, Lock, ArrowUpRight, Trophy, Wallet, Users } from "lucide-react"
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

export function DashboardClient({ players, savedTeam, rankingPos, mercadoAbierto, fechaActiva, puntosFecha }: DashboardClientProps) {
  const supabase = createClient()
  const [selectedPlayers, setSelectedPlayers] = useState<Map<number, PlayerWithPoints>>(new Map())
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [targetPosition, setTargetPosition] = useState<number | null>(null)
  const [targetPositionType, setTargetPositionType] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function cargarEquipoYVincularPuntos() {
      if (savedTeam && savedTeam.length > 0) {
        const { data: puntosData } = await supabase
          .from("puntos_fecha")
          .select("jugador_id, puntos")
          .eq("fecha_num", fechaActiva)

        const newMap = new Map()
        savedTeam.forEach(item => {
          const playerInfo = players.find(p => p.id === item.jugador_id)
          if (playerInfo) {
            const puntosDeEsteJugador = puntosData?.find(pd => pd.jugador_id === playerInfo.id)?.puntos || 0
            newMap.set(parseInt(item.posicion_en_campo), {
              ...playerInfo,
              puntos_actuales: puntosDeEsteJugador
            })
          }
        })
        setSelectedPlayers(newMap)
      }
    }
    cargarEquipoYVincularPuntos()
  }, [savedTeam, players, fechaActiva, supabase])

  const totalSpent = Array.from(selectedPlayers.values()).reduce((sum, p) => sum + p.precio, 0)
  const remainingBudget = INITIAL_BUDGET - totalSpent
  const playersCount = selectedPlayers.size
  const puntosEnCanchaTotal = Array.from(selectedPlayers.values())
    .reduce((sum, p) => sum + (p.puntos_actuales || 0), 0)

  const clubCounts = Array.from(selectedPlayers.values()).reduce((acc, p) => {
    acc[p.club] = (acc[p.club] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const handleSlotClick = (position: number, positionType: string) => {
    if (!mercadoAbierto) return 
    setTargetPosition(position)
    setTargetPositionType(positionType)
    setIsPopupOpen(true)
  }

  const handleSelectPlayer = (player: PlayerWithPoints) => {
    if (targetPosition && remainingBudget >= player.precio && mercadoAbierto) {
      setSelectedPlayers((prev) => {
        const newMap = new Map(prev)
        newMap.set(targetPosition, player)
        return newMap
      })
      setIsPopupOpen(false)
    }
  }

  const handleRemovePlayer = (position: number) => {
    if (!mercadoAbierto) return 
    setSelectedPlayers((prev) => {
      const newMap = new Map(prev)
      newMap.delete(position)
      return newMap
    })
  }

  const handleSaveTeam = async () => {
    if (!mercadoAbierto || remainingBudget < 0) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert("Login requerido"); setLoading(false); return; }

    try {
      await supabase.from('equipos_usuarios').delete().eq('user_id', user.id).eq('fecha_num', fechaActiva)
      const updates = Array.from(selectedPlayers.entries()).map(([pos, player]) => ({
        user_id: user.id,
        jugador_id: player.id,
        posicion_en_campo: pos.toString(),
        fecha_num: fechaActiva
      }))
      await supabase.from('equipos_usuarios').insert(updates)
      alert("¡XV Titular confirmado!")
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] selection:bg-yellow-400">
      <MainHeader />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* HEADER SECCIÓN - Estilo Diario Deportivo */}
        <div className="flex flex-col border-b-4 border-black pb-6 mb-8">
          <div className="flex justify-between items-end">
            <div>
              <span className="bg-black text-white px-2 py-1 text-xs font-black uppercase tracking-widest italic">
                Temporada 2026 / Fecha {fechaActiva}
              </span>
              <h1 className="font-display text-5xl md:text-7xl text-black font-black italic tracking-tighter mt-2 leading-none">
                MI EQUIPO <span className="text-stroke-black text-transparent">XV</span>
              </h1>
            </div>
            
            <div className="hidden md:flex flex-col items-end text-right">
              <p className="text-xs font-bold uppercase text-gray-500 tracking-widest">Estado del Mercado</p>
              <div className="flex items-center gap-2">
                 <div className={`w-3 h-3 rounded-full ${mercadoAbierto ? 'bg-green-500 animate-pulse' : 'bg-red-600'}`}></div>
                 <span className="font-black italic uppercase text-xl">{mercadoAbierto ? 'Abierto' : 'Cerrado'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACCIONES RÁPIDAS */}
        <div className="flex flex-wrap gap-4 mb-8 justify-between">
           <div className="flex gap-3">
              <Button 
                onClick={handleSaveTeam} 
                disabled={loading || !mercadoAbierto || remainingBudget < 0}
                className="h-14 bg-black text-white px-8 border-2 border-black hover:bg-white hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
              >
                <Save className="w-5 h-5 mr-3" />
                <span className="font-black italic uppercase">Confirmar XV</span>
              </Button>
              
              <Button 
                onClick={() => {if(confirm("¿Vaciar campo?")) setSelectedPlayers(new Map())}}
                disabled={!mercadoAbierto}
                variant="outline"
                className="h-14 border-2 border-black bg-white hover:bg-red-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </Button>
           </div>
        </div>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* STATS COL (LADO IZQUIERDO O ARRIBA) */}
          <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
            
            {/* CARD PUNTOS */}
            <div className="bg-yellow-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
              <Trophy className="absolute -right-4 -bottom-4 w-24 h-24 text-black/10 group-hover:rotate-12 transition-transform" />
              <p className="font-black uppercase text-xs tracking-widest mb-1">Puntos en Directo</p>
              <div className="flex items-baseline gap-2">
                <p className="font-display text-6xl font-black italic">{puntosEnCanchaTotal}</p>
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </div>

            {/* CARD PRESUPUESTO */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-4 text-gray-400">
                <Wallet className="w-5 h-5" />
                <span className="font-black text-[10px] uppercase tracking-widest text-black">Presupuesto</span>
              </div>
              <p className={`font-display text-4xl font-black italic leading-none ${remainingBudget < 0 ? 'text-red-600' : 'text-black'}`}>
                ${remainingBudget.toLocaleString('es-AR')}
              </p>
              <div className="mt-4 w-full bg-gray-200 h-3 border-2 border-black">
                <div 
                  className="bg-black h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (totalSpent / INITIAL_BUDGET) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* CARD RANKING */}
            <div className="bg-black text-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black uppercase text-[10px] tracking-widest text-gray-500 mb-2">Posición Global</p>
              <p className="font-display text-5xl font-black italic leading-none">#{rankingPos}</p>
            </div>

            {/* CARD JUGADORES */}
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5" />
                <span className="font-black uppercase text-xs tracking-widest">Plantel</span>
              </div>
              <p className="font-display text-4xl font-black italic">{playersCount} / 15</p>
            </div>
          </div>

          {/* CANCHA (CENTRO) */}
          <div className="lg:col-span-9 order-1 lg:order-2">
            <div className="border-4 border-black p-2 bg-[#1e5631] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <RugbyField
                selectedPlayers={new Map(
                  Array.from(selectedPlayers.entries()).map(([pos, player]) => [
                    pos,
                    { 
                      id: player.id, 
                      nombre: player.nombre, 
                      club: player.club,
                      puntos: player.puntos_actuales || 0 
                    },
                  ])
                )}
                onSlotClick={handleSlotClick}
                onRemovePlayer={handleRemovePlayer}
              />
            </div>
          </div>
        </div>
        {/* SECCIÓN REGLAS - ESTILO MANUAL TÁCTICO */}
<section className="mt-20 mb-20">
  <div className="flex items-center gap-4 mb-10">
    <div className="h-1 w-full bg-black"></div>
    <h2 className="font-display text-4xl md:text-5xl font-black italic tracking-tighter whitespace-nowrap">
      MANUAL DE <span className="text-stroke-black text-transparent">JUEGO</span>
    </h2>
    <div className="h-1 w-full bg-black"></div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    
    {/* REGLA 1 */}
    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
      <div className="bg-black text-white w-10 h-10 flex items-center justify-center font-black italic text-xl mb-4">01</div>
      <h3 className="font-black uppercase tracking-tight text-xl mb-3 italic">Armá tu XV</h3>
      <p className="text-sm leading-relaxed font-medium text-gray-800">
        Tenés un presupuesto de <span className="bg-yellow-400 px-1 font-bold">$10.000</span> para elegir a tus 15 titulares. 
        No podés excederte ni un centavo si querés confirmar tu equipo.
      </p>
    </div>

    {/* REGLA 2 */}
    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
      <div className="bg-black text-white w-10 h-10 flex items-center justify-center font-black italic text-xl mb-4">02</div>
      <h3 className="font-black uppercase tracking-tight text-xl mb-3 italic">Límite por Club</h3>
      <p className="text-sm leading-relaxed font-medium text-gray-800">
        Para asegurar la variedad, solo podés elegir un máximo de <span className="bg-black text-white px-1 font-bold">4 jugadores</span> de un mismo club de la URBA. 
      </p>
    </div>

    {/* REGLA 3 */}
    <div className="bg-yellow-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
      <div className="bg-black text-white w-10 h-10 flex items-center justify-center font-black italic text-xl mb-4">03</div>
      <h3 className="font-black uppercase tracking-tight text-xl mb-3 italic">Cierre de Mercado</h3>
      <p className="text-sm leading-relaxed font-black text-black">
        El mercado cierra <span className="uppercase underline">antes del primer partido</span> de cada fecha. 
        Una vez cerrado, no podrás mover ni un pelo de tu equipo hasta que termine la jornada.
      </p>
    </div>

    {/* REGLA 4 */}
    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
      <div className="bg-black text-white w-10 h-10 flex items-center justify-center font-black italic text-xl mb-4">04</div>
      <h3 className="font-black uppercase tracking-tight text-xl mb-3 italic">Sistema de Puntos</h3>
      <p className="text-sm leading-relaxed font-medium text-gray-800">
        Tus jugadores suman por lo que hacen en la vida real: <span className="font-bold">Tries (5pts), Conversiones (2pts), Penales (3pts), Victoria del equipo (2pts)</span> y bonificaciones por victoria de su club.
      </p>
    </div>

    {/* REGLA 5 */}
    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
      <div className="bg-black text-white w-10 h-10 flex items-center justify-center font-black italic text-xl mb-4">05</div>
      <h3 className="font-black uppercase tracking-tight text-xl mb-3 italic">Confirmación</h3>
      <p className="text-sm leading-relaxed font-medium text-gray-800">
        Cada vez que hagas un cambio, <span className="font-bold underline">DEBES darle al botón GUARDAR</span>. Si refrescás la página sin guardar, tus refuerzos se perderán en el vestuario.
      </p>
    </div>

    {/* REGLA 6 */}
    <div className="bg-black text-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(100,100,100,1)] hover:-translate-y-1 transition-transform">
      <div className="bg-white text-black w-10 h-10 flex items-center justify-center font-black italic text-xl mb-4">06</div>
      <h3 className="font-black uppercase tracking-tight text-xl mb-3 italic">Puntos en Directo</h3>
      <p className="text-sm leading-relaxed font-medium text-gray-400">
        Los puntos que ves en el Dashboard son de la <span className="text-white">Fecha Actual</span>. Tu posición en el Ranking Global se actualiza al finalizar todos los partidos.
      </p>
    </div>

  </div>
</section>
      </main>

      <PlayerSelectionPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        positionType={targetPositionType}
        players={players.filter(p => !Array.from(selectedPlayers.values()).some(sp => sp.id === p.id) && (clubCounts[p.club] || 0) < 4)}
        onSelectPlayer={handleSelectPlayer}
        remainingBudget={remainingBudget}
      />

      <style jsx global>{`
        .text-stroke-black {
          -webkit-text-stroke: 2px black;
        }
      `}</style>
    </div>
  )
}
