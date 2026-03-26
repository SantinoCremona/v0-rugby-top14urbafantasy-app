"use client"

import { useState, useEffect } from "react"
import { MainHeader } from "@/components/main-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Plus, Users, X, Share2, Loader2, Shield, Hash, Star, ChevronLeft, Image as ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface League {
  id: string
  nombre: string
  codigo_invitacion: string
  logo_url?: string // Nuevo campo
}

interface RankingMember {
  user_id: string
  nombre_equipo: string
  puntos_totales: number
}

export default function TorneosPage() {
  const supabase = createClient()
  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null)
  const [ranking, setRanking] = useState<RankingMember[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newLeagueName, setNewLeagueName] = useState("")
  const [newLeagueLogo, setNewLeagueLogo] = useState("") // Nuevo estado para el logo
  const [joinCode, setJoinCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingRanking, setLoadingRanking] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchLeagues()
  }, [])

  async function fetchLeagues() {
    setFetching(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setFetching(false); return; }

    const { data } = await supabase
      .from('liga_miembros')
      .select(`
        liga_id,
        ligas:liga_id ( id, nombre, codigo_invitacion, logo_url )
      `)
      .eq('user_id', user.id)

    if (data) {
      const formatted = data.map((item: any) => item.ligas).filter(Boolean)
      setLeagues(formatted)
    }
    setFetching(false)
  }

  const handleShareWhatsApp = (league: League) => {
    const message = `¡Sumate a mi torneo "${league.nombre}" en Headcoach! 🏉\n\nCódigo de acceso: ${league.codigo_invitacion}\n\nIngresá acá: ${window.location.origin}/torneos`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleViewRanking = async (league: League) => {
    setSelectedLeague(league)
    setLoadingRanking(true)
    try {
      const { data: miembros } = await supabase.from('liga_miembros').select('user_id').eq('liga_id', league.id);
      const { data: puntosData } = await supabase.from('ranking_usuarios').select('user_id, nombre_equipo, puntos_totales');

      const formattedRanking = (miembros || []).map((m: any) => {
        const datosUsuario = puntosData?.find(p => p.user_id === m.user_id);
        return {
          user_id: m.user_id,
          nombre_equipo: datosUsuario?.nombre_equipo || "Manager sin XV",
          puntos_totales: datosUsuario?.puntos_totales || 0
        }
      }).sort((a, b) => b.puntos_totales - a.puntos_totales);
      setRanking(formattedRanking);
    } catch (e) { console.error(e); setRanking([]); } finally { setLoadingRanking(false); }
  }

  const handleCreateLeague = async () => {
    if (!newLeagueName.trim()) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Inicia sesión")
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      const { data: liga, error: errorLiga } = await supabase
        .from('ligas')
        .insert([{ 
          nombre: newLeagueName, 
          codigo_invitacion: code, 
          creador_id: user.id,
          logo_url: newLeagueLogo.trim() || null // Guardamos el logo
        }])
        .select().single()

      if (errorLiga) throw errorLiga
      await supabase.from('liga_miembros').insert([{ liga_id: liga.id, user_id: user.id }])
      
      setNewLeagueName("")
      setNewLeagueLogo("")
      setShowCreateModal(false)
      fetchLeagues()
    } catch (error: any) { alert(error.message) } finally { setLoading(false) }
  }

  const handleJoinLeague = async () => {
    if (!joinCode.trim()) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Inicia sesión")
      const { data: liga } = await supabase.from('ligas').select('id, nombre').eq('codigo_invitacion', joinCode.toUpperCase()).single()
      if (!liga) throw new Error("Código inválido")
      await supabase.from('liga_miembros').insert([{ liga_id: liga.id, user_id: user.id }])
      setJoinCode("")
      setShowJoinModal(false)
      fetchLeagues()
    } catch (error: any) { alert(error.message) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-white selection:text-black">
      <MainHeader />
      <main className="max-w-5xl mx-auto px-6 py-12">
        {selectedLeague ? (
          /* --- VISTA DETALLE LIGA --- */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setSelectedLeague(null)} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors mb-8">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver a mis torneos
            </button>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="flex items-center gap-6">
                {/* LOGO DINÁMICO EN EL DETALLE */}
                <div className="w-20 h-20 bg-white rounded-[24px] overflow-hidden flex items-center justify-center shadow-2xl">
                   {selectedLeague.logo_url ? (
                     <img src={selectedLeague.logo_url} className="w-full h-full object-cover" alt="Logo" />
                   ) : (
                     <Trophy className="w-10 h-10 text-black" />
                   )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em]">Torneo Privado</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">{selectedLeague.nombre}</h2>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1 text-center">Código Invitación</p>
                  <p className="text-2xl font-black text-white tracking-widest uppercase">{selectedLeague.codigo_invitacion}</p>
                </div>
                <Button onClick={() => handleShareWhatsApp(selectedLeague)} className="w-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 rounded-xl h-10 font-black uppercase tracking-widest text-[10px] transition-all">
                  <Share2 className="w-3.5 h-3.5 mr-2" /> Compartir con Amigos
                </Button>
              </div>
            </div>

            {loadingRanking ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4"><Loader2 className="animate-spin w-10 h-10 text-white/20" /></div>
            ) : (
              <div className="space-y-3">
                {ranking.map((res, idx) => (
                  <div key={res.user_id} className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${idx === 0 ? "bg-yellow-500/10 border-yellow-500/50" : "bg-white/[0.02] border-white/5"}`}>
                    <div className="flex items-center gap-6">
                      <span className={`text-2xl font-black italic ${idx === 0 ? "text-yellow-500" : "text-white/20"}`}>#{idx + 1}</span>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${idx === 0 ? "bg-yellow-500 text-black border-yellow-500" : "bg-white/5 border-white/10 text-white"}`}><Shield className="w-5 h-5" /></div>
                      <span className={`text-lg md:text-2xl font-black italic uppercase tracking-tighter ${idx === 0 ? "text-yellow-500" : "text-white"}`}>{res.nombre_equipo}</span>
                    </div>
                    <span className={`text-3xl font-black italic ${idx === 0 ? "text-yellow-500" : "text-emerald-400"}`}>{res.puntos_totales}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* --- VISTA LISTA LOBBY --- */
          <>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <h1 className="text-7xl md:text-8xl font-black italic tracking-tighter leading-none uppercase text-white">Tor<span className="text-white/20">neos</span></h1>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mt-4 flex items-center gap-2 leading-none"><Star className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> Crea tu torneo y competí con tus amigos.</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowJoinModal(true)} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl px-6 h-14 font-black uppercase tracking-widest text-[11px] transition-all"><Users className="w-4 h-4 mr-2" /> Unirse</Button>
                <Button onClick={() => setShowCreateModal(true)} className="bg-white text-black hover:bg-gray-200 rounded-2xl px-8 h-14 font-black uppercase tracking-widest text-[11px] transition-all shadow-xl active:scale-95"><Plus className="w-4 h-4 mr-2" /> Crear Torneo</Button>
              </div>
            </div>

            <div className="grid gap-4">
              {fetching ? (
                <div className="py-24 flex justify-center"><Loader2 className="animate-spin w-10 h-10 text-white/10" /></div>
              ) : (
                leagues.map((league) => (
                  <div key={league.id} className="group bg-white/[0.02] border border-white/5 p-8 rounded-[32px] flex flex-col md:flex-row items-center justify-between hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                    <div className="flex items-center gap-8 mb-6 md:mb-0">
                      {/* LOGO DINÁMICO EN LA LISTA */}
                      <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        {league.logo_url ? (
                          <img src={league.logo_url} className="w-full h-full object-cover" alt="Logo" />
                        ) : (
                          <Trophy className="w-8 h-8 text-black" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white group-hover:text-emerald-400 transition-colors">{league.nombre}</h3>
                        <div className="flex items-center gap-2 mt-2">
                           <Hash className="w-3 h-3 text-gray-600" />
                           <span className="text-[11px] font-black text-gray-500 tracking-[0.2em] uppercase">Código: {league.codigo_invitacion}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <Button onClick={() => handleShareWhatsApp(league)} variant="outline" className="bg-emerald-500/5 hover:bg-emerald-500 text-emerald-400 hover:text-black border-emerald-500/20 rounded-2xl w-14 h-14 p-0 transition-all"><Share2 className="w-5 h-5" /></Button>
                      <Button onClick={() => handleViewRanking(league)} className="flex-1 md:flex-none bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[11px] transition-all">Ver Tabla</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* --- MODALES --- */}
      {(showCreateModal || showJoinModal) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0A0A0B] border border-white/10 p-10 w-full max-w-md rounded-[32px] shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                {showCreateModal ? "Nueva" : "Unirse a"} <span className="text-white/20">Torneo</span>
              </h2>
              <button onClick={() => {setShowCreateModal(false); setShowJoinModal(false)}} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6 text-white"/></button>
            </div>
            
            <div className="space-y-4 mb-8">
              <Input 
                placeholder={showCreateModal ? "NOMBRE DE LA LIGA" : "CÓDIGO DE ACCESO"}
                value={showCreateModal ? newLeagueName : joinCode}
                onChange={(e) => showCreateModal ? setNewLeagueName(e.target.value) : setJoinCode(e.target.value.toUpperCase())}
                className="h-16 bg-white/5 border-white/10 rounded-2xl font-black text-center text-lg focus:border-white transition-all uppercase tracking-widest text-white placeholder:text-gray-700"
              />

              {showCreateModal && (
                <div className="relative">
                  <Input 
                    placeholder="URL DEL LOGO (OPCIONAL)"
                    value={newLeagueLogo}
                    onChange={(e) => setNewLeagueLogo(e.target.value)}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold text-sm pl-12 focus:border-emerald-500 transition-all text-white placeholder:text-gray-700"
                  />
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>

            <Button onClick={showCreateModal ? handleCreateLeague : handleJoinLeague} disabled={loading} className={`w-full h-16 rounded-2xl font-black italic uppercase text-lg shadow-2xl transition-all ${showCreateModal ? "bg-white text-black hover:bg-gray-200" : "bg-emerald-500 text-black hover:bg-emerald-400"}`}>
              {loading ? <Loader2 className="animate-spin w-6 h-6 text-black" /> : showCreateModal ? "CREAR TORNEO" : "INGRESAR AL XV"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
