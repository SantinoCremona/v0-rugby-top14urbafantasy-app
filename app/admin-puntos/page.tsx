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

  const ordenPosiciones = {
    'Pilar': 1, 'Hooker': 2, 'Segunda': 3, 'Ala': 4, 'N8': 5,
    'Medio': 6, 'Apertura': 7, 'Centro': 8, 'Wing': 9, 'Fullback': 10
  }

  const posForwards = ['Pilar', 'Hooker', 'Segunda', 'Ala', 'N8']

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from("config_juego").select("*").eq("id", 1).single()
      if (data) setConfig(data)
    }
    fetchConfig()
  }, [])

  useEffect(() => {
    async function getJugadores() {
      const { data } = await supabase.from("jugadores").select("*").eq("club", clubSeleccionado)
      if (data) {
        const ordenados = data.sort((a, b) => (ordenPosiciones[a.posicion] || 99) - (ordenPosiciones[b.posicion] || 99))
        setJugadores(ordenados)
      }
    }
    getJugadores()
  }, [clubSeleccionado])

  const sumarPunto = (id, cantidad) => {
    const actual = parseInt(puntosTemp[id] || 0)
    setPuntosTemp({ ...puntosTemp, [id]: actual + cantidad })
  }

  // --- ACCIONES MASIVAS ---
  const resetBase10 = () => {
    const nuevos = { ...puntosTemp }; jugadores.forEach(j => nuevos[j.id] = 10); setPuntosTemp(nuevos)
  }

  const aplicarResultado = (cantidad) => {
    const nuevos = { ...puntosTemp }; jugadores.forEach(j => nuevos[j.id] = (parseInt(nuevos[j.id]) || 10) + cantidad); setPuntosTemp(nuevos)
  }

  const aplicarBonusEquipo = (puntos) => {
    const nuevos = { ...puntosTemp }; jugadores.forEach(j => nuevos[j.id] = (parseInt(nuevos[j.id]) || 10) + puntos); setPuntosTemp(nuevos)
  }

  const aplicarFijasFwds = () => {
    const nuevos = { ...puntosTemp }
    jugadores.forEach(j => {
      if (posForwards.includes(j.posicion)) nuevos[j.id] = (parseInt(nuevos[j.id]) || 10) + 5
    })
    setPuntosTemp(nuevos)
  }

  const aplicarTryPenalFwds = () => {
    const nuevos = { ...puntosTemp }
    jugadores.forEach(j => {
      if (posForwards.includes(j.posicion)) nuevos[j.id] = (parseInt(nuevos[j.id]) || 10) + 3
    })
    setPuntosTemp(nuevos)
  }

  async function guardarPlanilla() {
    const inserts = Object.entries(puntosTemp).map(([id, pts]) => ({
      jugador_id: parseInt(id), fecha_num: config.fecha_activa, puntos: parseInt(pts) || 0
    }))
    const { error } = await supabase.from("puntos_fecha").insert(inserts)
    if (!error) { alert("¡Guardado!"); setPuntosTemp({}) } else alert(error.message)
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-40">
      <MainHeader />
      <main className="max-w-6xl mx-auto px-4 py-10">
        
        {/* PANEL CONTROL */}
        <div className="mb-8 border-4 border-black p-6 bg-gray-50 flex items-center justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button onClick={() => setConfig({...config, fecha_activa: config.fecha_activa - 1})} className="w-10 h-10 border-4 border-black font-black">-</button>
              <span className="font-display text-4xl italic px-4">FECHA {config.fecha_activa}</span>
              <button onClick={() => setConfig({...config, fecha_activa: config.fecha_activa + 1})} className="w-10 h-10 border-4 border-black font-black">+</button>
            </div>
            <button onClick={() => setConfig({...config, mercado_abierto: !config.mercado_abierto})} className={`px-4 py-2 border-4 border-black font-black uppercase ${config.mercado_abierto ? 'bg-green-400' : 'bg-red-500 text-white'}`}>
              {config.mercado_abierto ? "🔓 Abierto" : "🔒 Cerrado"}
            </button>
          </div>
        </div>

        {/* MASIVOS */}
        <div className="bg-white border-4 border-black p-4 mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-wrap gap-4 items-center">
          <select className="border-4 border-black p-2 font-black uppercase" value={clubSeleccionado} onChange={(e) => setClubSeleccionado(e.target.value)}>
            {["CASI", "SIC", "Hindu", "Belgrano", "Alumni", "CUBA", "Newman", "BIEI", "Atletico del Rosario", "Los Matreros", "Regatas", "Champagnat", "La Plata", "Los Tilos"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={resetBase10} className="bg-white px-2 py-1 border-2 border-black font-black text-[10px]">BASE 10</button>
          <button onClick={() => aplicarResultado(2)} className="bg-green-400 px-2 py-1 border-2 border-black font-black text-[10px]">VIC +2</button>
          <button onClick={() => aplicarResultado(-2)} className="bg-red-200 px-2 py-1 border-2 border-black font-black text-[10px]">DER -2</button>
          <button onClick={() => aplicarBonusEquipo(1)} className="bg-yellow-200 px-2 py-1 border-2 border-black font-black text-[10px]">BONUS +1</button>
          <button onClick={aplicarFijasFwds} className="bg-blue-400 px-2 py-1 border-2 border-black font-black text-[10px]">💪 FIJAS +5 (FWD)</button>
          <button onClick={aplicarTryPenalFwds} className="bg-orange-400 px-2 py-1 border-2 border-black font-black text-[10px]">🏉 TRY PENAL +3 (FWD)</button>
        </div>

        {/* LISTA */}
        <div className="grid gap-2">
          {jugadores.map(j => (
            <div key={j.id} className="border-2 border-black p-2 bg-white flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-40"><p className="font-black uppercase text-xs">{j.nombre}</p></div>
              <div className="flex gap-1">
                <button onClick={() => sumarPunto(j.id, 5)} className="px-2 py-1 border border-black text-[9px] font-black bg-yellow-100">TRY +5</button>
                {['Centro', 'Wing', 'Fullback', 'Apertura'].includes(j.posicion) && <button onClick={() => sumarPunto(j.id, 3)} className="px-2 py-1 border border-black text-[9px] font-black bg-yellow-400">1RA FASE +3</button>}
                <button onClick={() => sumarPunto(j.id, 2)} className="px-2 py-1 border border-black text-[9px] font-black bg-blue-100">CONV +2</button>
                <button onClick={() => sumarPunto(j.id, 3)} className="px-2 py-1 border border-black text-[9px] font-black bg-blue-300">PENAL +3</button>
                <button onClick={() => sumarPunto(j.id, -2)} className="px-2 py-1 border border-black text-[9px] font-black bg-orange-100 italic">ERR -2</button>
                <button onClick={() => sumarPunto(j.id, 5)} className="px-2 py-1 border border-black text-[9px] font-black bg-purple-200">PERF +5</button>
                <button onClick={() => sumarPunto(j.id, -5)} className="px-2 py-1 border border-black text-[9px] font-black bg-red-400 text-white">AMA -5</button>
                <button onClick={() => sumarPunto(j.id, -10)} className="px-2 py-1 border border-black text-[9px] font-black bg-red-600 text-white font-bold">ROJA -10</button>
                <input type="number" value={puntosTemp[j.id] || 0} onChange={(e) => setPuntosTemp({...puntosTemp, [j.id]: parseInt(e.target.value) || 0})} className="w-10 bg-black text-yellow-400 text-center font-bold text-sm" />
              </div>
            </div>
          ))}
        </div>

        <button onClick={guardarPlanilla} className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] bg-black text-white p-4 font-display text-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(34,197,94,1)]">GUARDAR FECHA {config.fecha_activa}</button>
      </main>
    </div>
  )
}
