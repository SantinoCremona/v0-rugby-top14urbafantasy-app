"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainHeader } from "@/components/main-header"
import { Power, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export default function AdminPuntosMasivos() {
  const supabase = createClient()
  const [jugadores, setJugadores] = useState([])
  const [clubSeleccionado, setClubSeleccionado] = useState("CASI") 
  const [puntosTemp, setPuntosTemp] = useState({}) 
  
  // Estados para la configuración del juego
  const [config, setConfig] = useState({ id: 1, fecha_activa: 1, mercado_abierto: true })
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [isClosing, setIsClosing] = useState(false)

  // 1. Cargar Configuración Inicial
  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from("config_juego").select("*").eq("id", 1).single()
      if (data) setConfig(data)
      setLoadingConfig(false)
    }
    fetchConfig()
  }, [])

  // 2. Cargar jugadores del club
  useEffect(() => {
    async function getJugadores() {
      const { data, error } = await supabase
        .from("jugadores")
        .select("*")
        .eq("club", clubSeleccionado)
        .order("apellido", { ascending: true })
      
      if (data) setJugadores(data)
      if (error) console.error("Error:", error)
    }
    getJugadores()
  }, [clubSeleccionado])

  // --- NUEVA FUNCIÓN: ACTUALIZAR ESTADO (TITULAR/DUDA/ETC) ---
  async function actualizarEstado(jugadorId: number, nuevoEstado: string) {
    const { error } = await supabase
      .from("jugadores")
      .update({ tendencia: nuevoEstado }) // Usamos la columna tendencia para el estado visual
      .eq("id", jugadorId)
    
    if (!error) {
      setJugadores(jugadores.map(j => j.id === jugadorId ? { ...j, tendencia: nuevoEstado } : j))
    }
  }

  // --- NUEVA FUNCIÓN: CIERRE DE FECHA (EJECUTA EL SQL) ---
  async function ejecutarCierre() {
    if (!confirm(`¿Estás seguro de cerrar la Fecha ${config.fecha_activa}? Esto sumará los puntos a todos los perfiles.`)) return
    
    setIsClosing(true)
    const { error } = await supabase.rpc('cierre_de_fecha', { fecha_a_cerrar: config.fecha_activa })
    
    if (error) {
      alert("Error al cerrar fecha: " + error.message)
    } else {
      alert(`¡Fecha ${config.fecha_activa} cerrada exitosamente! Los rankings han sido actualizados.`)
    }
    setIsClosing(false)
  }

  async function toggleMercado() {
    const nuevoEstado = !config.mercado_abierto
    const { error } = await supabase
      .from("config_juego")
      .update({ mercado_abierto: nuevoEstado })
      .eq("id", 1)
    
    if (!error) setConfig({ ...config, mercado_abierto: nuevoEstado })
  }

  async function cambiarFecha(delta: number) {
    const nuevaFecha = config.fecha_activa + delta
    if (nuevaFecha < 1) return

    const { error } = await supabase
      .from("config_juego")
      .update({ fecha_activa: nuevaFecha })
      .eq("id", 1)
    
    if (!error) setConfig({ ...config, fecha_activa: nuevaFecha })
  }

  async function guardarPlanilla() {
    const inserts = Object.entries(puntosTemp).map(([id, pts]) => ({
      jugador_id: parseInt(id),
      fecha_num: config.fecha_activa,
      puntos: parseInt(pts) || 0
    }))

    if (inserts.length === 0) return alert("No hay datos para cargar")

    const { error } = await supabase.from("puntos_fecha").insert(inserts)
    
    if (!error) {
      alert(`¡Puntos de la Fecha ${config.fecha_activa} cargados!`)
      setPuntosTemp({}) 
    } else {
      alert("Error: " + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <MainHeader />
      <main className="max-w-4xl mx-auto px-4 py-10">
        
        {/* PANEL DE CONTROL */}
        <div className="mb-10 border-4 border-black p-6 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="font-display text-2xl italic uppercase mb-4 border-b-2 border-black">Comando de Fecha</h2>
          <div className="flex flex-wrap gap-6 items-center justify-between">
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase">Fecha Activa</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => cambiarFecha(-1)} className="px-2 border-2 border-black font-bold hover:bg-black hover:text-white">-</button>
                  <span className="font-display text-4xl italic">{config.fecha_activa}</span>
                  <button onClick={() => cambiarFecha(1)} className="px-2 border-2 border-black font-bold hover:bg-black hover:text-white">+</button>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={toggleMercado}
                className={`px-4 py-2 font-display text-lg italic uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-1 ${config.mercado_abierto ? 'bg-green-400' : 'bg-red-500 text-white'}`}
              >
                {config.mercado_abierto ? "🔓 Abierto" : "🔒 Cerrado"}
              </button>

              <button 
                onClick={ejecutarCierre}
                disabled={isClosing}
                className="px-4 py-2 bg-yellow-400 font-display text-lg italic uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white disabled:opacity-50"
              >
                {isClosing ? "PROCESANDO..." : "🏁 CERRAR FECHA"}
              </button>
            </div>
          </div>
        </div>

        {/* CARGA DE PUNTOS Y ESTADOS */}
        <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
          <h1 className="font-display text-4xl italic uppercase">Carga de Puntos</h1>
          <select 
            className="border-2 border-black p-2 font-bold bg-white outline-none"
            value={clubSeleccionado}
            onChange={(e) => setClubSeleccionado(e.target.value)}
          >
            {["CASI", "SIC", "Hindu", "Belgrano", "Alumni", "CUBA", "Newman", "BIEI", "Atletico del Rosario", "Los Matreros", "Regatas BV", "Champagnat", "La Plata", "Los Tilos"].map(club => (
              <option key={club} value={club}>{club}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-2 mb-32">
          {jugadores.length > 0 ? jugadores.map(j => (
            <div key={j.id} className="flex items-center justify-between border-2 border-black p-3 hover:bg-gray-50 transition-colors bg-white">
              <div className="flex flex-col">
                <span className="font-bold uppercase text-sm">{j.apellido} {j.nombre}</span>
                <div className="flex gap-2 mt-1">
                  {/* BOTONES DE ESTADO RÁPIDO */}
                  <button onClick={() => actualizarEstado(j.id, 'subiendo')} className={`p-1 border ${j.tendencia === 'subiendo' ? 'bg-green-400 border-black' : 'border-gray-200 opacity-30'}`} title="Titular Confirmado"><CheckCircle2 size={14}/></button>
                  <button onClick={() => actualizarEstado(j.id, 'estable')} className={`p-1 border ${j.tendencia === 'estable' ? 'bg-yellow-400 border-black' : 'border-gray-200 opacity-30'}`} title="Duda"><AlertCircle size={14}/></button>
                  <button onClick={() => actualizarEstado(j.id, 'bajando')} className={`p-1 border ${j.tendencia === 'bajando' ? 'bg-red-400 border-black' : 'border-gray-200 opacity-30'}`} title="No Juega"><XCircle size={14}/></button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-400">PTS</span>
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-20 border-2 border-black p-1 text-center font-display text-xl focus:bg-yellow-400 outline-none"
                  onChange={(e) => setPuntosTemp({...puntosTemp, [j.id]: e.target.value})}
                />
              </div>
            </div>
          )) : (
            <p className="text-center py-10 italic text-gray-400">Seleccioná un club para cargar...</p>
          )}
        </div>

        <button 
          onClick={guardarPlanilla}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-black text-white p-5 font-display text-3xl italic uppercase hover:bg-yellow-400 hover:text-black transition-all border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1),8px_8px_0px_4px_rgba(0,0,0,1)] z-50"
        >
          CONFIRMAR PUNTOS FECHA {config.fecha_activa}
        </button>
      </main>
    </div>
  )
}
