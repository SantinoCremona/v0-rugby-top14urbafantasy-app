"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { MainHeader } from "@/components/main-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Plus, Users, X, Share2, Loader2, Shield, Hash, Star, ChevronLeft, Camera, Image as ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function TorneosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-emerald-500" /></div>}>
      <TorneosContent />
    </Suspense>
  )
}

function TorneosContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [leagues, setLeagues] = useState<any[]>([])
  const [selectedLeague, setSelectedLeague] = useState<any | null>(null)
  const [ranking, setRanking] = useState<any[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newLeagueName, setNewLeagueName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingRanking, setLoadingRanking] = useState(false)
  const [fetching, setFetching] = useState(true)

  // --- LÓGICA DE AUTO-JOIN ---
  useEffect(() => {
    const checkJoinRequest = async () => {
      const code = searchParams.get('join')
      if (!code) {
        fetchLeagues()
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return // El middleware ya se encarga de mandarlo al login

      try {
        // 1. Buscamos la liga
        const { data: liga } = await supabase
          .from('ligas')
          .select('id')
          .eq('codigo_invitacion', code.toUpperCase())
          .single()

        if (liga) {
          // 2. Intentamos unirlo
          const { error: joinError } = await supabase
            .from('liga_miembros')
            .insert([{ liga_id: liga.id, user_id: user.id }])

          // Si no hay error (o si ya era miembro), limpiamos la URL y cargamos
          if (!joinError || (joinError as any).code === '23505') {
            router.replace('/torneos') // Limpiamos el ?join= de la barra
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        fetchLeagues()
      }
    }

    checkJoinRequest()
  }, [searchParams])

  // --- RESTO DE FUNCIONES (fetchLeagues, handleCreate, etc) IGUAL QUE ANTES ---
  async function fetchLeagues() {
    setFetching(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setFetching(false); return; }
    const { data } = await supabase
      .from('liga_miembros')
      .select(`liga_id, ligas:liga_id ( id, nombre, codigo_invitacion, logo_url )`)
      .eq('user_id', user.id)
    if (data) setLeagues(data.map((item: any) => item.ligas).filter(Boolean))
    setFetching(false)
  }

  const handleShareWhatsApp = (league: any) => {
    const shareUrl = `${window.location.origin}/torneos?join=${league.codigo_invitacion}`
    const message = `¡Sumate a mi torneo "${league.nombre}" en Headcoach! 🏉\n\nEntrá acá para unirte directo: ${shareUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleCreateLeague = async () => {
    if (!newLeagueName.trim()) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Inicia sesión")
      let publicUrl = null
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`
        const { error: uploadError } = await supabase.storage.from('logos-ligas').upload(filePath, selectedFile)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('logos-ligas').getPublicUrl(filePath)
        publicUrl = urlData.publicUrl
      }
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      const { data: liga, error: errorLiga } = await supabase.from('ligas').insert([{ nombre: newLeagueName, codigo_invitacion: code, creador_id: user.id, logo_url: publicUrl }]).select().single()
      if (errorLiga) throw errorLiga
      await supabase.from('liga_miembros').insert([{ liga_id: liga.id, user_id: user.id }])
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

  const handleViewRanking = async (league: any) => {
    setSelectedLeague(league)
    setLoadingRanking(true)
    try {
      const { data: miembros } = await supabase.from('liga_miembros').select('user_id').eq('liga_id', league.id);
      const { data: puntosData } = await supabase.from('ranking_usuarios').select('user_id, nombre_equipo, puntos_totales');
      const formattedRanking = (miembros || []).map((m: any) => {
        const datosUsuario = puntosData?.find(p => p.user_id === m.user_id);
        return { user_id: m.user_id, nombre_equipo: datosUsuario?.nombre_equipo || "Manager sin XV", puntos_totales: datosUsuario?.puntos_totales || 0 }
      }).sort((a: any, b: any) => b.puntos_totales - a.puntos_totales);
      setRanking(formattedRanking);
    } catch (e) { console.error(e); setRanking([]); } finally { setLoadingRanking(false); }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-white selection:text-black">
      <MainHeader />
      <main className="max-w-5xl mx-auto px-6 py-12">
        {selectedLeague ? (
          /* --- VISTA DETALLE --- */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setSelectedLeague(null)} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white mb-8">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver a mis torneos
            </button>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-[24px] overflow-hidden flex items-center justify-center shadow-2xl">
                   {selectedLeague.logo_url ? <img src={selectedLeague.logo_url} className="w-full h-full object-cover" alt="Logo" /> : <Trophy className="w-10 h-10 text-black" />}
                </div>
                <div>
                  <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">{selectedLeague.nombre}</h2>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md text-center">
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Código Invitación</p>
                  <p className="text-2xl font-black text-white tracking-widest uppercase">{selectedLeague.codigo_invitacion}</p>
                </div>
                <Button onClick={() => handleShareWhatsApp(selectedLeague)} className="w-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 rounded-xl h-10 font-black uppercase tracking-widest text-[10px] transition-all">
                  <Share2 className="w-3.5 h-3.5 mr-2" /> Compartir con Amigos
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {ranking.map((res, idx) => (
                <div key={res.user_id} className={`flex items-center justify-between p-6 rounded-2xl border ${idx === 0 ? "bg-yellow-500/10 border-yellow-500/50" : "bg-white/[0.02] border-white/5"}`}>
                  <div className="flex items-center gap-6">
                    <span className={`text-2xl font-black italic ${idx === 0 ? "text-yellow-500" : "text-white/20"}`}>#{idx + 1}</span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${idx === 0 ? "bg-yellow-500 text-black border-yellow-500" : "bg-white/5 border-white/10 text-white"}`}><Shield className="w-5 h-5" /></div>
                    <span className={`text-lg md:text-2xl font-black italic uppercase tracking-tighter ${idx === 0 ? "text-yellow-500" : "text-white"}`}>{res.nombre_equipo}</span>
                  </div>
                  <span className={`text-3xl font-black italic ${idx === 0 ? "text-yellow-500" : "text-emerald-400"}`}>{res.puntos_totales}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* --- VISTA LOBBY --- */
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
              ) : leagues.length === 0 ? (
                <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-[40px] p-24 text-center">
                   <Trophy className="w-12 h-12 text-white/5 mx-auto mb-4" />
                   <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">No participas en torneos privados</p>
                </div>
              ) : (
                leagues.map((league) => (
                  <div key={league.id} className="group bg-white/[0.02] border border-white/5 p-8 rounded-[32px] flex flex-col md:flex-row items-center justify-between hover:bg-white/[0.04] transition-all duration-300 shadow-xl">
                    <div className="flex items-center gap-8 mb-6 md:mb-0">
                      <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        {league.logo_url ? <img src={league.logo_url} className="w-full h-full object-cover" alt="Logo" /> : <Trophy className="w-8 h-8 text-black" />}
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
      {showCreateModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in">
          <div className="bg-[#0A0A0B] border border-white/10 p-10 w-full max-w-md rounded-[32px] shadow-2xl text-center">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-10">Nuevo <span className="text-white/20">Torneo</span></h2>
            <div className="flex flex-col items-center mb-8">
              <button onClick={() => fileInputRef.current?.click()} className="w-28 h-28 bg-white/5 border-2 border-dashed border-white/10 rounded-[32px] overflow-hidden flex flex-col items-center justify-center hover:border-emerald-500 transition-all group relative">
                {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" /> : <><Camera className="w-8 h-8 text-gray-600 mb-2 group-hover:text-emerald-500 transition-colors" /><span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Foto</span></>}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
            <Input placeholder="NOMBRE DE LA LIGA" value={newLeagueName} onChange={(e) => setNewLeagueName(e.target.value)} className="h-16 bg-white/5 border-white/10 rounded-2xl font-black text-center text-lg mb-8 uppercase text-white" />
            <Button onClick={handleCreateLeague} disabled={loading} className="w-full h-16 rounded-2xl font-black italic uppercase text-lg bg-white text-black hover:bg-gray-200 shadow-2xl">
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "CREAR TORNEO"}
            </Button>
            <button onClick={() => setShowCreateModal(false)} className="mt-6 text-xs font-bold text-gray-600 uppercase hover:text-white transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in">
          <div className="bg-[#0A0A0B] border border-white/10 p-10 w-full max-w-md rounded-[32px] shadow-2xl text-center">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-10">Unirse a <span className="text-white/20">Torneo</span></h2>
            <Input placeholder="CÓDIGO DE ACCESO" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} className="h-16 bg-white/5 border-white/10 rounded-2xl font-black text-center text-lg mb-8 uppercase text-white" />
            <Button onClick={handleJoinLeague} disabled={loading} className="w-full h-16 rounded-2xl font-black italic uppercase text-lg bg-emerald-500 text-black hover:bg-emerald-400 shadow-2xl">
              {loading ? <Loader2 className="animate-spin w-6 h-6 text-black" /> : "INGRESAR AL XV"}
            </Button>
            <button onClick={() => setShowJoinModal(false)} className="mt-6 text-xs font-bold text-gray-600 uppercase hover:text-white transition-colors">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}
