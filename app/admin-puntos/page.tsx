"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainHeader } from "@/components/main-header"

export default function AdminPuntosMasivos() {
  const supabase = createClient()
  const [jugadores, setJugadores] = useState([])
  const [clubSeleccionado, setClubSeleccionado] = useState("CASI") 
  const [puntosTemp, setPuntosTemp] = useState({}) 
  const [config, setConfig] = useState({ id: 1, fecha_activa: 1, mercado_abierto: true })
  const [isClosing, setIsClosing] = useState(false)

  const ordenPosiciones = {
    'Pilar': 1, 'Hooker': 2, 'Segunda': 3, 'Ala': 4, 'N8': 5,
    'Medio': 6, 'Apertura': 7, 'Centro': 8, 'Wing': 9, 'Fullback': 10
  }

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from("config_juego").select("*").eq("id", 1).single()
      if (data) setConfig(data)
    }
    fetchConfig()
  }, [])

  useEffect(() => {
    async function getJugadores() {
      const { data, error } = await supabase
        .from("jugadores")
        .select("*")
        .eq("club", clubSeleccionado)
      
      if (data) {
        const ordenados = data.sort((a, b) => 
          (ordenPosiciones[a.posicion] || 99) - (ordenPosiciones[b.posicion] || 99)
        )
        setJugadores(ordenados)
      }
    }
    getJugadores()
  }, [clubSeleccionado])

  const sumarPunto = (id, cantidad) => {
    const actual = parseInt(puntosTemp[id] || 0)
    setPuntosTemp({ ...puntosTemp, [id]: actual + cantidad })
  }

  // --- NUEVAS ACCIONES MASIVAS SEGÚN REGLAS 2026 ---
  const resetBase10 = () => {
    const nuevosPuntos = { ...puntosTemp }
    jugadores.forEach(j => { nuevosPuntos[j.id] = 10 })
    setPuntosTemp(nuevosPuntos)
  }

  const aplicarResultado = (cantidad) => {
    const nuevosPuntos = { ...puntosTemp }
    jugadores.forEach(j => {
      nuevosPuntos[j.id] = (parseInt(nuevosPuntos[j.id]) || 10) + cantidad
    })
    setPuntosTemp(nuevosPuntos)
  }

  const aplicarBonus = (cantidad) => {
    const nuevosPuntos = { ...puntosTemp }
    jugadores.forEach(j => {
      nuevosPuntos[j.id] = (parseInt(nuevosPuntos[j.id]) || 10) + cantidad
    })
    setPuntosTemp(nuevosPuntos)
  }

  async function ejecutarCierre() {
    if (!confirm(`¿Cerrar Fecha ${config.fecha_activa}? Esto actualiza el Ranking General.`)) return
    setIsClosing(true)
    const { error } = await supabase.rpc('cierre_de_fecha', { fecha_a_cerrar: config.fecha_activa })
    if (!error) alert("¡Ranking actualizado!")
    else alert("Error: " + error.message)
    setIsClosing(false)
  }

  async function toggleMercado() {
    const nuevoEstado = !config.mercado_abierto
    const { error } = await supabase.from("config_juego").update({ mercado_abierto: nuevoEstado }).eq("id", 1)
    if (!error) setConfig({ ...config, mercado_abierto: nuevoEstado })
  }

  async function cambiarFecha(delta: number) {
    const nuevaFecha = config.fecha_activa + delta
    if (nuevaFecha < 1) return
    const { error } = await supabase.from("config_juego").update({ fecha_activa: nuevaFecha }).eq("id", 1)
    if (!error) setConfig({ ...config, fecha_activa: nuevaFecha })
  }

  async function guardarPlanilla() {
    const inserts = Object.entries(puntosTemp).map(([id, pts]) => ({
      jugador_id: parseInt(id),
      fecha_num: config.fecha_activa,
      puntos: parseInt(pts) || 0
    }))
    if (inserts.length === 0) return alert("No hay datos")
    const { error } = await supabase.from("puntos_fecha").insert(inserts)
    if (!error) {
      alert(`¡Puntos guardados correctamente!`)
      setPuntosTemp({}) 
    } else alert("Error: " + error.message)
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <MainHeader />
      <main className="max-w-6xl mx-auto px-4 py-10 pb-44">
        
        {/* PANEL CONTROL FECHA */}
        <div className="mb-8 border-4 border-black p-6 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Fecha en curso</p>
              <div className="flex items-center gap-2">
                <button onClick={() => cambiarFecha(-1)} className="px-3 py-1 border-2 border-black font-bold hover:bg-black hover:text-white">-</button>
                <span className="font-display text-5xl italic px-2">{config.fecha_activa}</span>
                <button onClick={() => cambiarFecha(1)} className="px-3 py-1 border-2 border-black font-bold hover:bg-black hover:text-white">+</button>
              </div>
            </div>
            <button onClick={ejecutarCierre} disabled={isClosing} className="px-6 py-3 bg-blue-600 text-white border-4 border-black font-display italic uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
              {isClosing ? "CERRANDO..." : "🏆 CERRAR RANKING"}
            </button>
          </div>
          <button onClick={toggleMercado} className={`px-8 py-4 font-display text-2xl italic uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${config.mercado_abierto ? 'bg-green-400' : 'bg-red-500 text-white'}`}>
            {config.mercado_abierto ? "🔓 MERCADO ABIERTO" : "🔒 MERCADO CERRADO"}
          </button>
        </div>

        {/* ACCIONES POR CLUB */}
        <div className="bg-white border-4 border-black p-4 mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <select className="w-full lg:w-64 border-4 border-black p-3 font-black uppercase bg-white text-xl" value={clubSeleccionado} onChange={(e) => setClubSeleccionado(e.target.value)}>
              {["CASI", "SIC", "Hindu", "Belgrano", "Alumni", "CUBA", "Newman", "BIEI", "Atletico del Rosario", "Los Matreros", "Regatas", "Champagnat", "La Plata", "Los Tilos"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={resetBase10} className="bg-white px-3 py-2 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">⚙️ SET BASE 10</button>
              <button onClick={() => aplicarResultado(2)} className="bg-green-400 px-3 py-2 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">🏆 VICTORIA +2</button>
              <button onClick={() => aplicarResultado(-2)} className="bg-red-100 px-3 py-2 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">❌ DERROTA -2</button>
              <button onClick={() => aplicarBonus(2)} className="bg-yellow-400 px-3 py-2 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">🔥 BONUS OFF +2</button>
              <button onClick={() => aplicarBonus(1)} className="bg-blue-300 px-3 py-2 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">🛡️ BONUS DEF +1</button>
            </div>
          </div>
        </div>

        {/* LISTADO DE JUGADORES */}
        <div className="grid gap-3">
          {jugadores.map(j => (
            <div key={j.id} className="border-2 border-black p-3 bg-white flex flex-col xl:flex-row xl:items-center justify-between gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50">
              <div className="w-64">
                <p className="font-black uppercase text-sm leading-none">{j.nombre}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{j.posicion} | {j.club}</p>
              </div>

              <div className="flex flex-wrap gap-1 items-center">
                {/* ACCIONES DE SUMA */}
                <button onClick={() => sumarPunto(j.id, 5)} className="px-2 py-1 border border-black text-[9px] font-black bg-gray-100 hover:bg-yellow-300">TRY +5</button>
                <button onClick={() => sumarPunto(j.id, 2)} className="px-2 py-1 border border-black text-[9px] font-black bg-gray-100 hover:bg-yellow-300">CONV +2</button>
                <button onClick={() => sumarPunto(j.id, 3)} className="px-2 py-1 border border-black text-[9px] font-black bg-gray-100 hover:bg-yellow-300">PEN +3</button>
                <button onClick={() => sumarPunto(j.id, 5)} className="px-2 py-1 border border-black text-[9px] font-black bg-gray-100 hover:bg-yellow-300">DROP +5</button>
                <button onClick={() => sumarPunto(j.id, 5)} className="px-2 py-1 border-2 border-blue-500 text-[9px] font-black bg-white text-blue-600 hover:bg-blue-50">MVP +5</button>
                
                {/* ACCIONES DE RESTA */}
                <button onClick={() => sumarPunto(j.id, -2)} className="px-2 py-1 border border-black text-[9px] font-black bg-orange-100 hover:bg-orange-300 italic">ERRADA -2</button>
                <button onClick={() => sumarPunto(j.id, -5)} className="px-2 py-1 border border-black text-[9px] font-black bg-red-100 hover:bg-red-500 hover:text-white">AMA -5</button>
                <button onClick={() => sumarPunto(j.id, -10)} className="px-2 py-1 border border-black text-[9px] font-black bg-red-200 hover:bg-red-700 hover:text-white">ROJA -10</button>
                
                <div className="ml-3 bg-black text-white px-4 py-1 border-2 border-black flex items-center gap-2">
                  <span className="text-[10px] font-black italic">TOTAL:</span>
                  <input 
                    type="number" 
                    value={puntosTemp[j.id] || 0} 
                    onChange={(e) => setPuntosTemp({...puntosTemp, [j.id]: parseInt(e.target.value)})} 
                    className="w-14 bg-transparent text-center font-display text-xl outline-none text-yellow-400" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={guardarPlanilla} className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-black text-white p-6 font-display text-4xl italic uppercase border-4 border-black shadow-[10px_10px_0px_0px_rgba(34,197,94,1),10px_10px_0px_4px_rgba(0,0,0,1)] z-50 active:translate-y-2 active:shadow-none transition-all">
          GUARDAR PLANILLA FECHA {config.fecha_activa}
        </button>
      </main>
    </div>
  )
}
