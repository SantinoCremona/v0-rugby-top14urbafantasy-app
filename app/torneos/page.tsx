"use client"

import { useState, useEffect } from "react"
import { MainHeader } from "@/components/main-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Plus, Users, X, Copy, Share2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface League {
  id: string
  nombre: string
  codigo_invitacion: string
}

export default function TorneosPage() {
  const supabase = createClient()
  const [leagues, setLeagues] = useState<League[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newLeagueName, setNewLeagueName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchLeagues()
  }, [])

  async function fetchLeagues() {
    setFetching(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setFetching(false); return; }

    // Consulta corregida para traer la relación de ligas
    const { data, error } = await supabase
      .from('liga_miembros')
      .select(`
        liga_id,
        ligas:liga_id (
          id,
          nombre,
          codigo_invitacion
        )
      `)
      .eq('user_id', user.id)

    if (data) {
      // Mapeamos para limpiar la estructura de la respuesta
      const formatted = data.map((item: any) => item.ligas).filter(Boolean)
      setLeagues(formatted)
    }
    setFetching(false)
  }

  const handleCreateLeague = async () => {
    if (!newLeagueName.trim()) return
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Debes iniciar sesión")

      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      const { data: liga, error: errorLiga } = await supabase
        .from('ligas')
        .insert([{ nombre: newLeagueName, codigo_invitacion: code, creador_id: user.id }])
        .select()
        .single()

      if (errorLiga) throw errorLiga

      await supabase.from('liga_miembros').insert([{ liga_id: liga.id, user_id: user.id }])

      setNewLeagueName("")
      setShowCreateModal(false)
      fetchLeagues()
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
      if (!user) throw new Error("Debes iniciar sesión")

      const { data: liga, error: errorBusqueda } = await supabase
        .from('ligas')
        .select('id, nombre')
        .eq('codigo_invitacion', joinCode.toUpperCase())
        .single()

      if (!liga) throw new Error("Código no válido")

      const { error: errorJoin } = await supabase
        .from('liga_miembros')
        .insert([{ liga_id: liga.id, user_id: user.id }])

      if (errorJoin) throw new Error("Ya estás en esta liga")

      setJoinCode("")
      setShowJoinModal(false)
      fetchLeagues()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-black pb-20">
      <MainHeader />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="border-b-8 border-black pb-6 mb-12">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none">
            TUS <span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>LIGAS</span>
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" /> Compite por la gloria
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="h-20 bg-yellow-400 text-black border-4 border-black hover:bg-black hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 font-black italic text-xl"
          >
            <Plus className="w-6 h-6 mr-3 stroke-[3px]" />
            CREAR LIGA
          </Button>
          <Button 
            onClick={() => setShowJoinModal(true)}
            className="h-20 bg-white text-black border-4 border-black hover:bg-black hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 font-black italic text-xl"
          >
            <Share2 className="w-6 h-6 mr-3 stroke-[3px]" />
            UNIRSE A LIGA
          </Button>
        </div>

        <div className="grid gap-6">
          {fetching ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin w-10 h-10" /></div>
          ) : leagues.length === 0 ? (
            <div className="bg-white border-4 border-black border-dashed p-16 text-center">
              <p className="font-black italic text-gray-400 text-2xl uppercase">No hay ligas activas</p>
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
                    <h3 className="text-2xl font-black italic uppercase leading-none mb-2">{league.nombre}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black bg-yellow-400 border border-black px-2 py-0.5 uppercase">
                        CÓDIGO: {league.codigo_invitacion}
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(league.codigo_invitacion)
                          alert("Código copiado al portapapeles")
                        }}
                        className="p-1 hover:bg-black hover:text-white border border-black transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <Button className="w-full md:w-auto bg-black text-white font-black uppercase italic h-12 px-8 border-2 border-black">
                  VER RANKING
                </Button>
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODAL CREAR LIGA */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-4 border-black p-8 w-full max-w-md shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-stroke-black">NUEVA LIGA</h2>
              <button onClick={() => setShowCreateModal(false)} className="hover:rotate-90 transition-transform"><X className="w-8 h-8"/></button>
            </div>
            <p className="text-[10px] font-bold uppercase mb-2 text-gray-500">Nombre de la competición</p>
            <Input 
              placeholder="EJ: LIGA DE LOS SÁBADOS" 
              value={newLeagueName}
              onChange={(e) => setNewLeagueName(e.target.value)}
              className="h-14 border-4 border-black font-black mb-6 text-lg focus:ring-0"
            />
            <Button 
              onClick={handleCreateLeague} 
              disabled={loading}
              className="w-full h-16 bg-yellow-400 text-black font-black italic uppercase text-xl border-4 border-black hover:bg-black hover:text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
            >
              {loading ? "CREANDO..." : "CONFIRMAR LIGA"}
            </Button>
          </div>
        </div>
      )}

      {/* MODAL UNIRSE A LIGA */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-4 border-black p-8 w-full max-w-md shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-stroke-black">UNIRSE</h2>
              <button onClick={() => setShowJoinModal(false)} className="hover:rotate-90 transition-transform"><X className="w-8 h-8"/></button>
            </div>
            <p className="text-[10px] font-bold uppercase mb-2 text-gray-500">Ingresá el código secreto</p>
            <Input 
              placeholder="CÓDIGO" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="h-14 border-4 border-black font-black mb-6 text-2xl text-center uppercase focus:ring-0"
            />
            <Button 
              onClick={handleJoinLeague}
              disabled={loading}
              className="w-full h-16 bg-black text-white font-black italic uppercase text-xl border-4 border-black hover:bg-yellow-400 hover:text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
            >
              {loading ? "BUSCANDO..." : "ENTRAR AL XV"}
            </Button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .text-stroke-black { -webkit-text-stroke: 1.5px black; color: transparent; }
      `}</style>
    </div>
  )
}
