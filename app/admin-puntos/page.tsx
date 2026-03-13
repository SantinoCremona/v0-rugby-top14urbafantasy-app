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
    }
    getJugadores()
  }, [clubSeleccionado])

  // Sumar puntos a un jugador específico
  const sumarPunto = (id, cantidad) => {
    const actual = parseInt(puntosTemp[id] || 0)
    setPuntosTemp({ ...puntosTemp, [id]: actual + cantidad })
  }

  // BOTÓN MÁGICO: +10 a todos los del club actual
  const darBaseATodos = () => {
    const nuevosPuntos = { ...puntosTemp }
    jugadores.forEach(j => {
      const actual = parseInt(nuevosPuntos[j.id] || 0)
      nuevosPuntos[j.id] = actual + 10
    })
    setPuntosTemp(nuevosPuntos)
  }

  // FUNCIÓN PARA CERRAR FECHA (Llama a la función de SQL)
  async function ejecutarCierre() {
    if (!confirm(`¿Estás seguro de cerrar la Fecha ${config.fecha_activa}? Esto actualizará el Ranking General.`)) return
    
    setIsClosing(true)
    const { error } = await supabase.rpc('cierre_de_fecha', { fecha_a_cerrar: config.fecha_activa })
    
    if (!error) {
      alert("¡Fecha cerrada y Ranking actualizado con éxito!")
    } else {
      alert("Error al cerrar: " + error.message)
    }
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

    if (inserts.length === 0) return alert("No hay datos para cargar")
    const { error } = await supabase.from("puntos_fecha").insert(inserts)
    
    if (!error) {
      alert(`¡Puntos cargados correctamente!`)
      setPuntosTemp({}) 
    } else {
      alert("Error: " + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <MainHeader />
      <main className="max-w-5xl mx-auto px-4 py-10 pb-40">
        
        {/* PANEL DE CONTROL */}
        <div className="mb-10 border-4 border-black p-6 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase">Fecha Activa</p>
              <div className="flex items-center gap-2">
                <button onClick={() => cambiarFecha(-1)} className="px-2 border-2 border-black font-bold">-</button>
                <span className="font-display text-4xl italic">{config.fecha_activa}</span>
                <button onClick={() => cambiarFecha(1)} className="px-2 border-2 border-black font-bold">+</button>
              </div>
            </div>

            <button 
              onClick={ejecutarCierre}
              disabled={isClosing}
              className="px-4 py-2 bg-blue-500 text-white border-4 border-black font-display italic uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-600 disabled:opacity-50"
            >
              {isClosing ? "Procesando..." : "🏆 Cerrar Fecha / Ranking"}
            </button>
          </div>

          <button 
            onClick={toggleMercado}
            className={`px-6 py-3 font-display text-xl italic uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${config.mercado_abierto ? 'bg-green-400' : 'bg-red-500 text-white'}`}
          >
            {config.mercado_abierto ? "🔓 Mercado Abierto" : "🔒 Mercado Cerrado"}
          </button>
        </div>

        {/* SELECTOR Y BOTÓN BASE */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b-4 border-black pb-4 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-4xl italic uppercase">Puntos</h1>
            <select 
              className="border-2 border-black p-2 font-bold bg-white"
              value={clubSeleccionado}
              onChange={(e) => setClubSeleccionado(e.target.value)}
            >
              {["CASI", "SIC", "Hindu", "Belgrano", "Alumni", "CUBA", "Newman", "BIEI", "Atletico del Rosario", "Los Matreros", "Regatas", "Champagnat", "La Plata", "Los Tilos"].map(club => (
                <option key={club} value={club}>{club}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={darBaseATodos}
            className="bg-yellow-400 px-6 py-2 border-4 border-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
          >
            ⚡ DAR +10 BASE A TODO {clubSeleccionado}
          </button>
        </div>

        {/* LISTA DE JUGADORES */}
        <div className="grid gap-4">
          {jugadores.map(j => (
            <div key={j.id} className="border-2 border-black p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="min-w-[200px]">
                <p className="font-black uppercase text-lg leading-none">{j.nombre}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase">{j.posicion}</p>
              </div>

              <div className="flex flex-wrap gap-1 items-center">
                <button onClick={() => sumarPunto(j.id, 5)} className="px-2 py-1 border-2 border-black text-[9px] font-black bg-gray-100 hover:bg-yellow-300">TRY+5</button>
                <button onClick={() => sumarPunto(j.id, 2)} className="px-2 py-1 border-2 border-black text-[9px] font-black bg-gray-100 hover:bg-yellow-300">CONV+2</button>
                <button onClick={() => sumarPunto(j.id, 3)} className="px-2 py-1 border-2 border-black text-[9px] font-black bg-gray-100 hover:bg-yellow-300">P/D+3</button>
                <button onClick={() => sumarPunto(j.id, 1)} className="px-2 py-1 border-2 border-black text-[9px] font-black bg-gray-100 hover:bg-yellow-300">TAC+1</button>
                <button onClick={() => sumarPunto(j.id, 2)} className="px-2 py-1 border-2 border-black text-[9px] font-black bg-green-100 hover:bg-green-300">VIC+2</button>
                <button onClick={() => sumarPunto(j.id, -5)} className="px-2 py-1 border-2 border-black text-[9px] font-black bg-red-100 hover:bg-red-400">AMAR-5</button>
                
                <div className="ml-2 flex items-center gap-2 border-l-2 border-black pl-4 bg-yellow-400 p-1">
                  <span className="text-[10px] font-black italic">TOTAL:</span>
                  <input 
                    type="number" 
                    value={puntosTemp[j.id] || 0}
                    onChange={(e) => setPuntosTemp({...puntosTemp, [j.id]: e.target.value})}
                    className="w-14 bg-transparent text-center font-display text-xl outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTÓN FLOTANTE GUARDAR */}
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
