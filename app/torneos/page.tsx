"use client"

import { useState, useEffect } from "react"
import { MainHeader } from "@/components/main-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Plus, Users, X, Copy, Crown, Share2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface League {
  id: string
  nombre: string
  codigo_invitacion: string
  miembros_count?: number
}

export default function TorneosPage() {
  const supabase = createClient()
  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newLeagueName, setNewLeagueName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [loading, setLoading] = useState(false)

  // Cargar ligas reales del usuario
  useEffect(() => {
    fetchLeagues()
  }, [])

  async function fetchLeagues() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('liga_miembros')
      .select(`
        ligas (
          id,
          nombre,
          codigo_invitacion
        )
      `)
      .eq('user_id', user.id)

    if (data) {
      const formattedLeagues = data.map((item: any) => item.ligas)
      setLeagues(formattedLeagues)
    }
  }

  const handleCreateLeague = async () => {
    if (!newLeagueName.trim()) return
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      // 1. Crear la liga
      const { data: liga, error: errorLiga } = await supabase
        .from('ligas')
        .insert([{ nombre: newLeagueName, codigo_invitacion: code, creador_id: user.id }])
        .select()
        .single()

      if (errorLiga) throw errorLiga

      // 2. Unirse automáticamente
      await supabase.from('liga_miembros').insert([{ liga_id: liga.id, user_id: user.id }])

      setNewLeagueName("")
      setShowCreateModal(false)
      fetchLeagues()
      alert(`Liga "${liga.nombre}" creada con éxito!`)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinLeague = async () => {
    if (!joinCode.trim()) return
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      // Buscar liga
      const { data: liga, error: errorBusqueda } = await supabase
        .from('ligas')
        .select('id, nombre')
        .eq('codigo_invitacion', joinCode.toUpperCase())
        .single()

      if (!liga) throw new Error("Código de liga no encontrado")

      // Unirse
      const { error: errorJoin } = await supabase
        .from('liga_miembros')
        .insert([{ liga_id: liga.id, user_id: user.id }])

      if (errorJoin) throw new Error("Ya perteneces a esta liga")

      setJoinCode("")
      setShowJoinModal(false)
      fetchLeagues()
      alert(`Te uniste a ${liga.nombre}`)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-black">
      <MainHeader />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* HEADER ESTILO POSTER */}
        <div className="border-b-8 border-black pb-6 mb-12">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none">
            TUS <span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>LIGAS</span>
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest mt-4">Compite con amigos por la gloria</p>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="h-20 bg-yellow-400 text-black border-4 border-black hover:bg-black hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 font-black italic text-xl"
          >
            <Plus className="w-6 h-6 mr-3 stroke-[3px]" />
            CREAR NUEVA LIGA
          </Button>
          <Button 
            onClick={() => setShowJoinModal(true)}
            variant="outline"
            className="h-20 bg-white text-black border-4 border-black hover:bg-black hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 font-black italic text-xl"
          >
            <Share2 className="w-6 h-6 mr-3 stroke-[3px]" />
            UNIRSE A LIGA
          </Button>
        </div>

        {/* LISTA DE LIGAS */}
        <div className="grid gap-4">
          {leagues.length === 0 ? (
            <div className="bg-white border-4 border-black border-dashed p-12 text-center">
              <p className="font-black italic text-gray-400 text-2xl uppercase">Aún no tienes ligas...</p>
            </div>
          ) : (
            leagues.map((league) => (
              <div 
                key={league.id}
                className="group flex flex-col md:flex-row items-center justify-between p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div className="w-16 h-16 bg-black text-white flex items-center justify-center rotate-[-3deg] group-hover:rotate-0 transition-transform">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase leading-none mb-1">{league.nombre}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-gray-200 px-2 py-0.5 rounded uppercase tracking-tighter text-gray-600">
                        Código: {league.codigo_invitacion}
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(league.codigo_invitacion)
                          alert("Código copiado")
                        }}
                        className="p-1 hover:bg-yellow-400 border border-black transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setSelectedLeague(league)}
                  className="w-full md:w-auto bg-black text-white border-2 border-black font-black uppercase italic h-12 px-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none"
                >
                  Ver Ranking
                </Button>
              </div>
            ))
          )}
        </div>

        {/* MODALES REUTILIZANDO EL ESTILO NEOBRUTALISTA */}
        {/* (Aquí irían los modales con bordes de 4px, sombras negras y títulos itálicos) */}
      </main>

      {/* Estilos para el texto vacío (Stroke) */}
      <style jsx global>{`
        .text-stroke-black { -webkit-text-stroke: 2px black; }
      `}</style>
    </div>
  )
}
