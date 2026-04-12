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

  // --- CONFIGURACIÓN Y CARGA ---
  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from("config_juego").select("*").eq("id", 1).single()
      if (data) setConfig(data)
    }
    fetchConfig()
  }, [])

  useEffect(() => {
    async function getJugadores() {
      const { data } = await supabase
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

  // --- CONTROLES DE FECHA Y MERCADO ---
  async function cambiarFecha(delta) {
    const nuevaFecha = config.fecha_activa + delta
    if (nuevaFecha < 1) return
    const { error } = await supabase.from("config_juego").update({ fecha_activa: nuevaFecha }).eq("id", 1)
    if (!error) setConfig({ ...config, fecha_activa: nuevaFecha })
  }

  async function toggleMercado() {
    const nuevoEstado = !config.mercado_abierto
    const { error } = await supabase.from("config_juego").update({ mercado_abierto: nuevoEstado }).eq("id", 1)
    if (!error) setConfig({ ...config, mercado_abierto: nuevoEstado })
  }

  // --- ACCIONES MASIVAS (REGLAS URBA) ---
  const resetBase10 = () => {
    const nuevos = { ...puntosTemp }; jugadores.forEach(j => nuevos[j.id] = 10); setPuntosTemp(nuevos)
  }

  const aplicarResultado = (cantidad) => {
    const nuevos = { ...puntosTemp }; jugadores.forEach(j => nuevos[j.id] = (parseInt(nuevos[j.id]) || 10) + cantidad); setPuntosTemp(nuevos)
  }

  const aplicarBonusEquipo = (puntos) => {
    const nuevos = { ...puntosTemp }; jugadores.forEach(j => nuevos[j.id] = (parseInt(nuevos[j.id]) || 10) + puntos); setPuntosTemp(nuevos)
  }

  const aplicarTryPenalFwds = () => {
    const nuevos = { ...puntosTemp }
    const posFwds = ['Pilar', 'Hooker', 'Segunda', 'Ala', 'N8']
    jugadores.forEach(j => {
      if (posFwds.includes(j.posicion)) nuevos[j.id] = (parseInt(nuevos[j.id]) || 10) + 3
    })
    setPuntosTemp(nuevos)
  }

  // --- GUARDADO ---
  async function guardarPlanilla() {
    const inserts = Object.entries(puntosTemp).map(([id, pts]) => ({
      jugador_id: parseInt(id), fecha_num: config.fecha_activa, puntos: parseInt(pts) || 0
    }))
    if (inserts.length === 0) return alert("No hay datos para guardar")
    const { error } = await supabase.from("puntos_fecha").insert(inserts)
    if (!error) {
      alert(`¡Puntos guardados para la Fecha ${config.fecha_activa}!`)
      setPuntosTemp({}) 
    } else alert("Error: " + error.message)
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-40">
      <MainHeader />
      <main className="max-w-6xl mx-auto px-4 py-10">
        
        {/* PANEL CONTROL: FECHA Y MERCADO */}
        <div className="mb-8 border-4 border-black p-6 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Control de Fecha</p>
              <div className="flex items-center gap-3">
                <button onClick={() => cambiarFecha(-1)} className="w-10 h-10 border-4 border-black font-black text-2xl hover:bg-black hover:text-white transition-colors">-</button>
                <span className="font-display text-5xl italic min-w-[60px] text-center">{config.fecha_activa}</span>
                <button onClick={() => cambiarFecha(1)} className="w-10 h-10 border-4 border-black font-black text-2xl hover:bg-black hover:text-white transition-colors">+</button>
              </div>
            </div>
            
            <button 
              onClick={toggleMercado} 
              className={`px-6 py-3 font-display text-xl italic uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none ${config.mercado_abierto ? 'bg-green-400' : 'bg-red-500 text-white'}`}
            >
              {config.mercado_abierto ? "🔓 Mercado Abierto" : "🔒 Mercado Cerrado"}
            </button>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-gray-400">Club Seleccionado</p>
            <p className="font-display text-3xl italic text-blue-600">{clubSeleccionado}</p>
          </div>
        </div>

        {/* ACCIONES MASIVAS */}
        <div className="bg-white border-4 border-black p-4 mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <select 
              className="w-full lg:w-64 border-4 border-black p-3 font-black uppercase text-xl bg-white" 
              value={clubSeleccionado} 
              onChange={(e) => setClubSeleccionado(e.target.value)}
            >
              {["CASI", "SIC", "Hindu", "Belgrano", "Alumni", "CUBA", "Newman", "BIEI", "Atletico del Rosario", "Los Matreros", "Regatas", "Champagnat", "La Plata", "Los Tilos"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={resetBase10} className="bg-white px-3 py-2 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">⚙️ Base 10</button>
              <button onClick={() => aplicarResultado(2)} className="bg-green-400 px-3 py-2 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">🏆 Victoria +2</button>
              <button onClick={() => aplicarResultado(-2)} className="bg-red-200 px-3 py-2 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">❌ Derrota -2</button>
              <button onClick={() => aplicarBonusEquipo(1)} className="bg-yellow-200 px-3 py-2 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">⭐ Bonus +1</button>
              <button onClick={aplicarTryPenalFwds} className="bg-orange-400 px-3 py-2 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">🏉 Try Penal (FWDS) +3</button>
            </div>
          </div>
        </div>

        {/* LISTADO DE JUGADORES */}
        <div className="grid gap-3">
          {jugadores.map(j => (
            <div key={j.id} className="border-2 border-black p-3 bg-white flex flex-col xl:flex-row xl:items-center justify-between gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50">
              <div className="w-52">
                <p className="font-black uppercase text-sm leading-none">{j.nombre}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{j.posicion}</p>
              </div>

              <div className="flex flex-wrap gap-1 items-center">
                {/* ATAQUE */}
                <button onClick={() => sumarPunto(j.id, 5)} className="px-2 py-1 border border-black text-[9px] font-black bg-yellow-100 hover:bg-yellow-200">TRY +5</button>
                {['Centro', 'Wing', 'Fullback', 'Apertura'].includes(j.posicion) && (
                  <button onClick={() => sumarPunto(j.id, 3)} className="px-2 py-1 border border-black text-[9px] font-black bg-yellow-400 hover:bg-yellow-500 uppercase">1ra Fase +3</button>
                )}
                <button onClick={() => sumarPunto(j.id, 3)} className="px-2 py-1 border border-black text-[9px] font-black bg-gray-100 hover:bg-gray-200">ASIST +3</button>
                
                {/* KICKS */}
                <button onClick={() => sumarPunto(j.id, 2)} className="px-2 py-1 border border-black text-[9px] font-black bg-blue-100 hover:bg-blue-200">CONV +2</button>
                <button onClick={() => sumarPunto(j.id, 3)} className="px-2 py-1 border border-black text-[9px] font-black bg-blue-300 hover:bg-blue-400">PENAL +3</button>
                <button onClick={() => sumarPunto(j.id, -2)} className="px-2 py-1 border border-black text-[9px] font-black bg-orange-200 italic hover:bg-orange-300">ERRADA -2</button>
                
                {/* PERFORMANCE */}
                <button onClick={() => sumarPunto(j.id, 5)} className="px-2 py-1 border-2 border-blue-500 text-[9px] font-black text-blue-600 uppercase hover:bg-blue-50">MVP +5</button>
                <button onClick={() => sumarPunto(j.id, 5)} className="px-2 py-1 border border-black text-[9px] font-black bg-purple-200 hover:bg-purple-300">PERF +5</button>
                <button onClick={() => sumarPunto(j.id, 1)} className="px-2 py-1 border border-black text-[9px] font-black bg-purple-100 hover:bg-purple-300">PERF +1</button>
                <button onClick={() => sumarPunto(j.id, -5)} className="px-2 py-1 border border-black text-[9px] font-black bg-red-400 text-white font-bold">AMA -5</button>

                {/* TOTAL */}
                <div className="ml-3 bg-black text-white px-3 py-1 border-2 border-black flex items-center gap-2">
                  <input 
                    type="number" 
                    value={puntosTemp[j.id] || 0} 
                    onChange={(e) => setPuntosTemp({...puntosTemp, [j.id]: parseInt(e.target.value) || 0})} 
                    className="w-12 bg-transparent text-center font-display text-xl text-yellow-400 outline-none" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTÓN FLOTANTE GUARDAR */}
        <button 
          onClick={guardarPlanilla} 
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-black text-white p-6 font-display text-3xl italic uppercase border-4 border-black shadow-[10px_10px_0px_0px_rgba(34,197,94,1),10px_10px_0px_4px_rgba(0,0,0,1)] z-50 hover:translate-y-1 hover:shadow-none transition-all"
        >
          Guardar Planilla Fecha {config.fecha_activa}
        </button>
      </main>
    </div>
  )
}
