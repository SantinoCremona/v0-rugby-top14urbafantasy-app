"use client"

import { useState, useEffect } from "react"
import { MainHeader } from "@/components/main-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Plus, Users, X, Star, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface RankingItem {
  id: string
  position: number
  team: string
  total: number
}

export default function TorneosPage() {
  const supabase = createClient()
  
  // Estados para Modales
  [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newLeagueName, setNewLeagueName] = useState("")
  const [joinCode, setJoinCode] = useState("")

  // Estados para Datos Reales
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar datos reales desde Supabase
  useEffect(() => {
    async function fetchRanking() {
      setLoading(true)
      try {
        // 1. Jugadores y puntos
        const { data: jugadores } = await supabase.from("jugadores").select("id, puntos_totales")
        const puntosMap = new Map(jugadores?.map(j => [j.id, j.puntos_totales || 0]) || [])

        // 2. Equipos y Perfiles
        const { data: todosLosEquipos } = await supabase.from('equipos_usuarios').select('user_id, jugador_id')
        const { data: perfiles } = await supabase.from('perfiles').select('id, nombre_equipo')

        // 3. Calcular Ranking
        const calculado = (perfiles || []).map(perfil => {
          const equipoUser = (todosLosEquipos || []).filter(e => e.user_id === perfil.id)
          const totalPuntos = equipoUser.reduce((acc, item) => acc + (puntosMap.get(item.jugador_id) || 0), 0)
          
          return {
            id: perfil.id,
            team: perfil.nombre_equipo || "XV Sin Nombre",
            total: totalPuntos,
            position: 0
          }
        })
        .sort((a, b) => b.total - a.total)
        .map((item, index) => ({ ...item, position: index + 1 }))

        setRanking(calculado)
      } catch (error) {
        console.error("Error cargando ranking:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRanking()
  }, [])

  const handleCreateLeague = () => {
    if (newLeagueName.trim()) {
      alert(`Liga "${newLeagueName}" creada! (Lógica de base de datos próximamente)`)
      setNewLeagueName("")
      setShowCreateModal(false)
    }
  }

  const handleJoinLeague = () => {
    if (joinCode.trim()) {
      alert(`Unido a la liga con código: ${joinCode}`)
      setJoinCode("")
      setShowJoinModal(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <MainHeader />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-end gap-3 mb-8">
          <Trophy className="w-10 h-10 text-black mb-1" />
          <div>
            <h1 className="font-display text-4xl md:text-5xl tracking-tighter italic uppercase leading-none">Torneos</h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Top 14 URBA • Temporada 2026</p>
          </div>
        </div>

        {/* Botones de Ligas Privadas (Tu código original) */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button 
            onClick={() => setShowCreateModal(true)} 
            className="h-14 bg-black text-white hover:bg-gray-800 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            <Plus className="w-5 h-5 mr-2" /> CREAR LIGA
          </Button>
          <Button 
            onClick={() => setShowJoinModal(true)} 
            variant="outline" 
            className="h-14 border-2 border-black text-black hover:bg-gray-100 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            <Users className="w-5 h-5 mr-2" /> UNIRSE
          </Button>
        </div>

        {/* RANKING GENERAL (Datos Fusionados) */}
        <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="bg-black text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <h2 className="font-display text-xl uppercase italic tracking-tight">Ranking General</h2>
            </div>
            {!loading && <span className="text-[10px] font-bold uppercase">{ranking.length} Equipos Participando</span>}
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 flex justify-center items-center">
                <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-black text-[10px] uppercase tracking-widest font-bold">
                    <th className="p-4 w-20 text-center">Pos</th>
                    <th className="p-4 border-l-2 border-black">Equipo</th>
                    <th className="p-4 text-right border-l-2 border-black w-32">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((item) => (
                    <tr key={item.id} className="border-b-2 border-black last:border-b-0 hover:bg-yellow-50 transition-colors">
                      <td className={`p-4 text-center font-display text-3xl italic ${item.position <= 3 ? 'bg-yellow-400' : 'bg-white'}`}>
                        #{item.position}
                      </td>
                      <td className="p-4 border-l-2 border-black font-display text-xl uppercase italic">
                        {item.team}
                      </td>
                      <td className="p-4 text-right font-display text-4xl border-l-2 border-black bg-gray-50/50">
                        {item.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* MODALES (Tu código original) */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <div className="relative w-full max-w-md bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between p-4 border-b-4 border-black bg-black text-white">
                <h2 className="font-display text-xl italic uppercase">Crear Liga Privada</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-800 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 italic">Nombre de tu liga</label>
                  <Input placeholder="Ej: Amigos del Club" value={newLeagueName} onChange={(e) => setNewLeagueName(e.target.value)} className="h-12 border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                </div>
                <Button onClick={handleCreateLeague} className="w-full h-14 bg-black text-white hover:bg-gray-800 font-bold uppercase italic tracking-tighter text-xl">Crear Liga</Button>
              </div>
            </div>
          </div>
        )}

        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowJoinModal(false)} />
            <div className="relative w-full max-w-md bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between p-4 border-b-4 border-black bg-black text-white">
                <h2 className="font-display text-xl italic uppercase">Unirse con Código</h2>
                <button onClick={() => setShowJoinModal(false)} className="p-2 hover:bg-gray-800 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 italic">Ingresa el código</label>
                  <Input placeholder="Ej: PUMAS24" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} className="h-12 border-2 border-black rounded-none uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                </div>
                <Button onClick={handleJoinLeague} className="w-full h-14 bg-black text-white hover:bg-gray-800 font-bold uppercase italic tracking-tighter text-xl">Validar Código</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
