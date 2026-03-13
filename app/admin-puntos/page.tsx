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

  // Definimos el orden lógico de las posiciones de rugby
  const ordenPosiciones = {
    'Pilar': 1,
    'Hooker': 2,
    'Segunda': 3,
    'Ala': 4,
    'N8': 5,
    'Medio': 6,
    'Apertura': 7,
    'Centro': 8,
    'Wing': 9,
    'Fullback': 10
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
        // Ordenamos los jugadores por el peso de su posición definido arriba
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

  // BOTÓN: +10 Base a todos
  const darBaseATodos = () => {
    const nuevosPuntos = { ...puntosTemp }
    jugadores.forEach(j => {
      const actual = parseInt(nuevosPuntos[j.id] || 0)
      nuevosPuntos[j.id] = actual + 10
    })
    setPuntosTemp(nuevosPuntos)
  }

  // BOTÓN: +2 Victoria a todos
  const darVictoriaATodos = () => {
    const nuevosPuntos = { ...puntosTemp }
    jugadores.forEach(j => {
      const actual = parseInt(nuevosPuntos[j.id] || 0)
      nuevosPuntos[j.id] = actual + 2
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
      alert(`¡Puntos guardados!`)
      setPuntosTemp({}) 
    } else alert("Error: " + error.message)
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <MainHeader />
      <main className="max-w-5xl mx-auto px-4 py-10 pb-40">
        
        {/* PANEL SUPERIOR */}
        <div className="mb-10 border-4 border-black p-6 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase">Fecha</p>
              <div className="flex items-center gap-2">
                <button onClick={() => cambiarFecha(-1)} className="px-2 border-2 border-black font-bold">-</button>
                <span className="font-display text-4xl italic">{config.fecha_activa}</span>
                <button onClick={() => cambiarFecha(1)} className="px-2 border-2 border-black font-bold">+</button>
              </div>
            </div>
            <button onClick={ejecutarCierre} disabled={isClosing} className="px-4 py-2 bg-blue-500 text-white border-4 border-black font-display italic uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {isClosing ? "..." : "🏆 CERRAR RANKING"}
            </button>
          </div>
          <button onClick={toggleMercado} className={`px-6 py-3 font-display text-xl italic uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${config.mercado_abierto ? 'bg-green-400' : 'bg-red-500 text-white'}`}>
            {config.mercado_abierto ? "🔓 ABIERTO" : "🔒 CERRADO"}
          </button>
        </div>

        {/* ACCIONES MASIVAS POR CLUB */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b-4 border-black pb-4 gap-4">
          <div className="flex items-center gap-4">
            <select className="border-2 border-black p-2 font-bold bg-white" value={clubSeleccionado} onChange={(e) => setClubSeleccionado(e.target.value)}>
              {["CASI", "SIC", "Hindu", "Belgrano", "Alumni", "CUBA", "Newman", "BIEI", "Atletico del Rosario", "Los Matreros", "Regatas BV", "Champagnat", "La Plata", "Los Tilos"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={darBaseATodos} className="bg-yellow-400 px-4 py-2 border-2 border-black font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ⚡ +10 BASE
            </button>
            <button onClick={darVictoriaATodos} className="bg-green-400 px-4 py-2 border-2 border-black font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              🏆 +2 VICTORIA
            </button>
          </div>
        </div>

        {/* LISTADO DE JUGADORES */}
        <div className="grid gap-3">
          {jugadores.map(j => (
            <div key={j.id} className="border-2 border-black p-3 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-48">
                <p className="font-black uppercase text-sm leading-none">{j.nombre}</p>
                <p className="text-[9px] font-bold text-gray-500">{j.posicion}</p>
              </div>
              <div className="flex flex-wrap gap-1 items-center">
                <button onClick={() => sumarPunto(j.id, 5)} className="px-2 py-1 border border-black text-[9px] font-bold bg-gray-50 hover:bg-yellow-200">TRY+5</button>
                <button onClick={() => sumarPunto(j.id, 2)} className="px-2 py-1 border border-black text-[9px] font-bold bg-gray-50 hover:bg-yellow-200">CONV+2</button>
                <button onClick={() => sumarPunto(j.id, 3)} className="px-2 py-1 border border-black text-[9px] font-bold bg-gray-50 hover:bg-yellow-200">P/D+3</button>
                <button onClick={() => sumarPunto(j.id, 1)} className="px-2 py-1 border border-black text-[9px] font-bold bg-gray-50 hover:bg-yellow-200">TAC+1</button>
                <button onClick={() => sumarPunto(j.id, -5)} className="px-2 py-1 border border-black text-[9px] font-bold bg-red-50 hover:bg-red-400">AMAR-5</button>
                <div className="ml-2 bg-yellow-400 px-2 py-1 border-2 border-black flex items-center gap-2">
                  <span className="text-[10px] font-black">TOTAL:</span>
                  <input type="number" value={puntosTemp[j.id] || 0} onChange={(e) => setPuntosTemp({...puntosTemp, [j.id]: e.target.value})} className="w-10 bg-transparent text-center font-bold outline-none" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={guardarPlanilla} className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-black text-white p-5 font-display text-3xl italic uppercase border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1),8px_8px_0px_4px_rgba(0,0,0,1)] z-50">
          CONFIRMAR PUNTOS FECHA {config.fecha_activa}
        </button>
      </main>
    </div>
  )
}
