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

  // --- ACCIONES MASIVAS ACTUALIZADAS ---
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

  // Nuevo: Solo para Forwards (Scrum y Line)
  const aplicarBonoForwards = () => {
    const nuevosPuntos = { ...puntosTemp }
    const posForwards = ['Pilar', 'Hooker', 'Segunda', 'Ala', 'N8']
    jugadores.forEach(j => {
      if (posForwards.includes(j.posicion)) {
        nuevosPuntos[j.id] = (parseInt(nuevosPuntos[j.id]) || 10) + 5
      }
    })
    setPuntosTemp(nuevosPuntos)
  }

  async function ejecutarCierre() {
    if (!confirm(`¿Cerrar Fecha ${config.fecha_activa}?`)) return
    setIsClosing(true)
    try {
      const { error } = await supabase.rpc('cierre_de_fecha', { fecha_a_cerrar: config.fecha_activa })
      if (error) alert(error.message)
      else alert("¡Ranking actualizado!")
    } finally {
      setIsClosing(false)
    }
  }

  async function guardarPlanilla() {
    const inserts = Object.entries(puntosTemp).map(([id, pts]) => ({
      jugador_id: parseInt(id),
      fecha_num: config.fecha_activa,
      puntos: parseInt(pts) || 0
    }))
    const { error } = await supabase.from("puntos_fecha").insert(inserts)
    if (!error) {
      alert(`¡Puntos guardados!`)
      setPuntosTemp({}) 
    } else alert(error.message)
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <MainHeader />
      <main className="max-w-6xl mx-auto px-4 py-10 pb-44">
        
        {/* PANEL CONTROL */}
        <div className="mb-8 border-4 border-black p-6 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase text-gray-400">Fecha en curso</p>
              <div className="flex items-center gap-2">
                <span className="font-display text-5xl italic px-2">{config.fecha_activa}</span>
              </div>
            </div>
            <button onClick={ejecutarCierre} disabled={isClosing} className="px-6 py-3 bg-blue-600 text-white border-4 border-black font-display italic uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
              {isClosing ? "CERRANDO..." : "🏆 CERRAR RANKING"}
            </button>
          </div>
        </div>

        {/* ACCIONES POR CLUB */}
        <div className="bg-white border-4 border-black p-4 mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <select className="border-4 border-black p-3 font-black uppercase text-xl" value={clubSeleccionado} onChange={(e) => setClubSeleccionado(e.target.value)}>
              {["CASI", "SIC", "Hindu", "Belgrano", "Alumni", "CUBA", "Newman", "BIEI", "Atletico del Rosario", "Los Matreros", "Regatas", "Champagnat", "La Plata", "Los Tilos"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={resetBase10} className="bg-white px-3 py-2 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">⚙️ BASE 10</button>
              <button onClick={() => aplicarResultado(2)} className="bg-green-400 px-3 py-2 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">🏆 VIC +2</button>
              <button onClick={() => aplicarResultado(-2)} className="bg-red-200 px-3 py-2 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">❌ DER -2</button>
              <button onClick={aplicarBonoForwards} className="bg-emerald-500 text-white px-3 py-2 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">🏉 SCRUM/LINE +5 (FWDS)</button>
            </div>
          </div>
        </div>

        {/* LISTADO JUGADORES */}
        <div className="grid gap-3">
          {jugadores.map(j => (
            <div key={j.id} className="border-2 border-black p-3 bg-white flex flex-col xl:flex-row xl:items-center justify-between gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-56">
                <p className="font-black uppercase text-sm leading-none">{j.nombre}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{j.posicion}</p>
              </div>

              <div className="flex flex-wrap gap-1 items-center">
                {/* ATAQUE */}
                <button onClick={() => sumarPunto(j.id, 5)} className="px-2 py-1 border border-black text-[9px] font-black bg-yellow-100">TRY +5</button>
                {['Centro', 'Wing', 'Fullback', 'Apertura'].includes(j.posicion) && (
                  <button onClick={() => sumarPunto(j.id, 3)} className="px-2 py-1 border border-black text-[9px] font-black bg-yellow-400">1RA FASE +3</button>
                )}
                <button onClick={() => sumarPunto(j.id, 3)} className="px-2 py-1 border border-black text-[9px] font-black bg-gray-100">ASIST +3</button>
                
                {/* PATEADOR */}
                <button onClick={() => sumarPunto(j.id, 2)} className="px-2 py-1 border border-black text-[9px] font-black bg-blue-100">KICK +2</button>
                <button onClick={() => sumarPunto(j.id, -2)} className="px-2 py-1 border border-black text-[9px] font-black bg-orange-200 italic text-orange-800">ERRADA -2</button>
                
                {/* ELITE */}
                <button onClick={() => sumarPunto(j.id, 5)} className="px-2 py-1 border-2 border-blue-500 text-[9px] font-black text-blue-600 uppercase italic">MVP +5</button>
                <button onClick={() => sumarPunto(j.id, 5)} className="px-2 py-1 border border-black text-[9px] font-black bg-purple-100 hover:bg-purple-300">PERF +5</button>
                <button onClick={() => sumarPunto(j.id, 1)} className="px-2 py-1 border border-black text-[9px] font-black bg-purple-50 hover:bg-purple-300">PERF +1</button>

                {/* DISCIPLINA */}
                <button onClick={() => sumarPunto(j.id, -5)} className="px-2 py-1 border border-black text-[9px] font-black bg-red-400 text-white">AMA -5</button>

                <div className="ml-3 bg-black text-white px-3 py-1 border-2 border-black flex items-center gap-2">
                  <input 
                    type="number" 
                    value={puntosTemp[j.id] || 0} 
                    onChange={(e) => setPuntosTemp({...puntosTemp, [j.id]: parseInt(e.target.value)})} 
                    className="w-12 bg-transparent text-center font-display text-xl text-yellow-400 outline-none" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={guardarPlanilla} className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-black text-white p-6 font-display text-3xl italic uppercase border-4 border-black shadow-[10px_10px_0px_0px_rgba(34,197,94,1),10px_10px_0px_4px_rgba(0,0,0,1)] z-50">
          GUARDAR FECHA {config.fecha_activa}
        </button>
      </main>
    </div>
  )
}
