"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainHeader } from "@/components/main-header"

export default function AdminPuntosMasivos() {
  const supabase = createClient()
  const [jugadores, setJugadores] = useState([])
  const [clubSeleccionado, setClubSeleccionado] = useState("CASI") 
  const [puntosTemp, setPuntosTemp] = useState({}) 
  
  // Estados para la configuración del juego
  const [config, setConfig] = useState({ id: 1, fecha_activa: 1, mercado_abierto: true })
  const [loadingConfig, setLoadingConfig] = useState(true)

  // 1. Cargar Configuración Inicial (Mercado y Fecha)
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
      
      if (data) setJugadores(data)
      if (error) console.error("Error:", error)
    }
    getJugadores()
  }, [clubSeleccionado])

  // --- FUNCIONES DE CONTROL DE JUEGO ---
  
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

  // --- FUNCIÓN DE GUARDAR PUNTOS ---
  async function guardarPlanilla() {
    const inserts = Object.entries(puntosTemp).map(([id, pts]) => ({
      jugador_id: parseInt(id),
      fecha_num: config.fecha_activa, // Usamos la fecha activa de la config
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
        
        {/* PANEL DE CONTROL (CONFIGURACIÓN) */}
        <div className="mb-10 border-4 border-black p-6 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="font-display text-2xl italic uppercase mb-4 border-b-2 border-black">Comando de Fecha</h2>
          <div className="flex flex-wrap gap-6 items-center justify-between">
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase">Fecha Activa</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => cambiarFecha(-1)} className="px-2 border-2 border-black font-bold">-</button>
                  <span className="font-display text-4xl italic">{config.fecha_activa}</span>
                  <button onClick={() => cambiarFecha(1)} className="px-2 border-2 border-black font-bold">+</button>
                </div>
              </div>
            </div>

            <button 
              onClick={toggleMercado}
              className={`px-6 py-3 font-display text-xl italic uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-1 ${config.mercado_abierto ? 'bg-green-400' : 'bg-red-500 text-white'}`}
            >
              {config.mercado_abierto ? "🔓 Mercado Abierto" : "🔒 Mercado Cerrado"}
            </button>
          </div>
        </div>

        {/* CARGA DE PUNTOS */}
        <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
          <h1 className="font-display text-4xl italic uppercase">Carga de Puntos</h1>
          <select 
            className="border-2 border-black p-2 font-bold bg-white"
            value={clubSeleccionado}
            onChange={(e) => setClubSeleccionado(e.target.value)}
          >
            <option value="CASI">CASI</option>
            <option value="SIC">SIC</option>
            <option value="Hindu">Hindu</option>
            <option value="Belgrano">Belgrano</option>
            <option value="Alumni">Alumni</option>
            <option value="CUBA">CUBA</option>
            <option value="Newman">Newman</option>
            <option value="BIEI">BIEI</option>
            <option value="Atletico del Rosario">Atletico del Rosario</option>
            <option value="Los Matreros">Los Matreros</option>
            <option value="Regatas BV">Regatas BV</option>
            <option value="Champagnat">Champagnat</option>
            <option value="La Plata">La Plata</option>
            <option value="Los Tilos">Los Tilos</option>
          </select>
        </div>

        <div className="grid gap-2 mb-20">
          {jugadores.length > 0 ? jugadores.map(j => (
            <div key={j.id} className="flex items-center justify-between border-2 border-black p-3 hover:bg-gray-50 transition-colors">
              <span className="font-bold uppercase text-sm">{j.apellido} {j.nombre}</span>
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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-black text-white p-5 font-display text-3xl italic uppercase hover:bg-yellow-400 hover:text-black transition-all border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1),8px_8px_0px_4px_rgba(0,0,0,1)]"
        >
          CONFIRMAR PUNTOS FECHA {config.fecha_activa}
        </button>
      </main>
    </div>
  )
}
