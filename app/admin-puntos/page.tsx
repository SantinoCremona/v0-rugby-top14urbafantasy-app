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
        .order('nombre', { ascending: true })
      
      if (data) setJugadores(data)
      if (error) console.error("Error:", error)
    }
    getJugadores()
  }, [clubSeleccionado])

  // Función para sumar puntos rápidamente
  const sumarPunto = (id, cantidad) => {
    const actual = parseInt(puntosTemp[id] || 0)
    setPuntosTemp({ ...puntosTemp, [id]: actual + cantidad })
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
      <main className="max-w-5xl mx-auto px-4 py-10">
        
        {/* PANEL DE CONTROL */}
        <div className="mb-10 border-4 border-black p-6 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-wrap gap-6 items-center justify-between">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase">Fecha Activa</p>
              <div className="flex items-center gap-2">
                <button onClick={() => cambiarFecha(-1)} className="px-2 border-2 border-black font-bold">-</button>
                <span className="font-display text-4xl italic">{config.fecha_activa}</span>
                <button onClick={() => cambiarFecha(1)} className="px-2 border-2 border-black font-bold">+</button>
              </div>
            </div>

            <button 
              onClick={toggleMercado}
              className={`px-6 py-3 font-display text-xl italic uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${config.mercado_abierto ? 'bg-green-400' : 'bg-red-500 text-white'}`}
            >
              {config.mercado_abierto ? "🔓 Mercado Abierto" : "🔒 Mercado Cerrado"}
            </button>
          </div>
        </div>

        {/* SELECTOR DE CLUB */}
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

        {/* LISTA DE JUGADORES CON BOTONERA */}
        <div className="grid gap-4 mb-32">
          {jugadores.map(j => (
            <div key={j.id} className="border-2 border-black p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <p className="font-black uppercase text-lg leading-none">{j.nombre}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase">{j.posicion} | {j.club}</p>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <button onClick={() => sumarPunto(j.id, 5)} className="px-2 py-1 border-2 border-black text-[10px] font-black hover:bg-yellow-400 bg-gray-100">+5 TRY</button>
                <button onClick={() => sumarPunto(j.id, 2)} className="px-2 py-1 border-2 border-black text-[10px] font-black hover:bg-yellow-400 bg-gray-100">+2 CONV</button>
                <button onClick={() => sumarPunto(j.id, 3)} className="px-2 py-1 border-2 border-black text-[10px] font-black hover:bg-yellow-400 bg-gray-100">+3 PEN/D</button>
                <button onClick={() => sumarPunto(j.id, 1)} className="px-2 py-1 border-2 border-black text-[10px] font-black hover:bg-yellow-400 bg-gray-100">+1 TACKLE</button>
                <button onClick={() => sumarPunto(j.id, 2)} className="px-2 py-1 border-2 border-black text-[10px] font-black hover:bg-green-400 bg-gray-100">+2 VICT</button>
                <button onClick={() => sumarPunto(j.id, -5)} className="px-2 py-1 border-2 border-black text-[10px] font-black hover:bg-red-500 hover:text-white bg-gray-100">-5 AMAR</button>
                
                <div className="ml-4 flex items-center gap-2 border-l-2 border-black pl-4">
                  <span className="text-[10px] font-black italic">TOTAL:</span>
                  <input 
                    type="number" 
                    value={puntosTemp[j.id] || 0}
                    onChange={(e) => setPuntosTemp({...puntosTemp, [j.id]: e.target.value})}
                    className="w-16 border-2 border-black p-1 text-center font-display text-xl bg-yellow-400"
                  />
                </div>
              </div>
            </div>
          ))}
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
