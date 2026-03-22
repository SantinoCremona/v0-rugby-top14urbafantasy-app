"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainHeader } from "@/components/main-header"
import { Star, Users, Info } from "lucide-react"

export default function AdminPuntosMasivos() {
  const supabase = createClient()
  const [jugadores, setJugadores] = useState([])
  const [clubSeleccionado, setClubSeleccionado] = useState("CASI") 
  const [puntosTemp, setPuntosTemp] = useState({}) 
  const [performanceSubjetiva, setPerformanceSubjetiva] = useState({}) // <-- NUEVO: NOTA SUBJETIVA
  const [soloTitulares, setSoloTitulares] = useState(true) // <-- NUEVO: FILTRO TITULARES
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
      let query = supabase
        .from("jugadores")
        .select(`
          *,
          equipos_usuarios!inner(id)
        `) // El !inner asegura que solo traiga los que tienen al menos 1 relación en equipos
        .eq("club", clubSeleccionado)
      
      // Si no querés filtrar solo titulares, cambiamos la query
      if (!soloTitulares) {
        query = supabase.from("jugadores").select("*").eq("club", clubSeleccionado)
      }

      const { data } = await query
      
      if (data) {
        const ordenados = data.sort((a, b) => 
          (ordenPosiciones[a.posicion] || 99) - (ordenPosiciones[b.posicion] || 99)
        )
        setJugadores(ordenados)
      }
    }
    getJugadores()
  }, [clubSeleccionado, soloTitulares])

  const sumarPunto = (id, cantidad) => {
    const actual = parseInt(puntosTemp[id] || 0)
    setPuntosTemp({ ...puntosTemp, [id]: actual + cantidad })
  }

  const actualizarPerformance = (id, nota) => {
    const notaNum = parseInt(nota) || 0
    setPerformanceSubjetiva({ ...performanceSubjetiva, [id]: notaNum })
  }

  // Al guardar, sumamos los puntos de acciones + la nota subjetiva
  async function guardarPlanilla() {
    const inserts = jugadores.map(j => {
      const ptsAcciones = parseInt(puntosTemp[j.id] || 0)
      const ptsSubjetivos = parseInt(performanceSubjetiva[j.id] || 0)
      
      return {
        jugador_id: j.id,
        fecha_num: config.fecha_activa,
        puntos: ptsAcciones + ptsSubjetivos
      }
    }).filter(i => i.puntos !== 0 || performanceSubjetiva[i.jugador_id])

    if (inserts.length === 0) return alert("No hay datos para guardar")
    
    const { error } = await supabase.from("puntos_fecha").upsert(inserts, { onConflict: 'jugador_id, fecha_num' })
    
    if (!error) {
      alert(`¡Puntos + Performance guardados en Fecha ${config.fecha_activa}!`)
      setPuntosTemp({})
      setPerformanceSubjetiva({})
    } else alert("Error: " + error.message)
  }

  // ... (funciones cambiarFecha, toggleMercado, ejecutarCierre iguales)

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-40">
      <MainHeader />
      <main className="max-w-7xl mx-auto px-4 py-10">
        
        {/* PANEL CONTROL (Igual al anterior pero con Toggle Titulares) */}
        <div className="mb-8 border-4 border-black p-6 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-6">
             {/* ... controles de fecha ... */}
             <button 
              onClick={() => setSoloTitulares(!soloTitulares)}
              className={`px-4 py-2 border-2 border-black font-black text-[10px] uppercase flex items-center gap-2 ${soloTitulares ? 'bg-black text-white' : 'bg-white'}`}
             >
               <Users className="w-3 h-3" />
               {soloTitulares ? "Solo Titulares (On)" : "Todos los Jugadores"}
             </button>
          </div>
          <button onClick={toggleMercado} className={`px-8 py-4 font-display text-2xl italic uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${config.mercado_abierto ? 'bg-green-400' : 'bg-red-500 text-white'}`}>
            {config.mercado_abierto ? "🔓 MERCADO ABIERTO" : "🔒 MERCADO CERRADO"}
          </button>
        </div>

        {/* SELECTOR CLUB */}
        <div className="bg-white border-4 border-black p-4 mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
           <select className="w-full lg:w-64 border-4 border-black p-3 font-black uppercase bg-white text-xl" value={clubSeleccionado} onChange={(e) => setClubSeleccionado(e.target.value)}>
             {["CASI", "SIC", "Hindu", "Belgrano", "Alumni", "CUBA", "Newman", "BIEI", "Atletico del Rosario", "Los Matreros", "Regatas", "Champagnat", "La Plata", "Los Tilos"].map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>

        {/* LISTADO DE JUGADORES */}
        <div className="grid gap-4">
          {jugadores.map(j => (
            <div key={j.id} className="border-4 border-black p-4 bg-white grid grid-cols-1 lg:grid-cols-12 items-center gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 transition-colors">
              
              {/* Info Jugador */}
              <div className="lg:col-span-3">
                <p className="font-black uppercase text-lg leading-tight">{j.nombre}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-black text-white text-[9px] px-1.5 py-0.5 font-black uppercase italic">{j.posicion}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{j.club}</span>
                </div>
              </div>

              {/* COLUMNA SUBJETIVA (Tu opinión) */}
              <div className="lg:col-span-2 bg-emerald-50 border-2 border-emerald-500 p-2 rounded-xl flex flex-col items-center justify-center">
                <p className="text-[8px] font-black text-emerald-700 uppercase mb-1 flex items-center gap-1">
                  <Star className="w-2 h-2 fill-emerald-700" /> Nota Performance
                </p>
                <input 
                  type="number"
                  min="0" max="10"
                  placeholder="1-10"
                  value={performanceSubjetiva[j.id] || ""}
                  onChange={(e) => actualizarPerformance(j.id, e.target.value)}
                  className="w-16 bg-white border-2 border-emerald-500 text-center font-display text-2xl outline-none text-emerald-600 rounded-lg"
                />
              </div>

              {/* ACCIONES RÁPIDAS (Try, Conv, etc) */}
              <div className="lg:col-span-5 flex flex-wrap gap-1">
                <button onClick={() => sumarPunto(j.id, 5)} className="px-2 py-1 border border-black text-[9px] font-black bg-white hover:bg-yellow-300 transition-colors">TRY +5</button>
                <button onClick={() => sumarPunto(j.id, 2)} className="px-2 py-1 border border-black text-[9px] font-black bg-white hover:bg-yellow-300 transition-colors">CONV +2</button>
                <button onClick={() => sumarPunto(j.id, 3)} className="px-2 py-1 border border-black text-[9px] font-black bg-white hover:bg-yellow-300 transition-colors">PEN +3</button>
                <button onClick={() => sumarPunto(j.id, -5)} className="px-2 py-1 border border-black text-[9px] font-black bg-red-50 hover:bg-red-500 hover:text-white transition-colors">AMA -5</button>
                <button onClick={() => sumarPunto(j.id, -10)} className="px-2 py-1 border border-black text-[9px] font-black bg-red-100 hover:bg-red-700 hover:text-white transition-colors">ROJA -10</button>
              </div>

              {/* TOTAL CALCULADO */}
              <div className="lg:col-span-2 flex flex-col items-end">
                <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Total Jugador</p>
                <div className="bg-black text-white px-6 py-2 border-2 border-black flex items-center gap-3 rounded-xl">
                  <span className="font-display text-3xl italic text-yellow-400">
                    {(parseInt(puntosTemp[j.id] || 0) + parseInt(performanceSubjetiva[j.id] || 0))}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* BOTÓN FLOTANTE GUARDAR */}
        <button onClick={guardarPlanilla} className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-black text-white p-6 font-display text-4xl italic uppercase border-4 border-black shadow-[10px_10px_0px_0px_rgba(34,197,94,1),10px_10px_0px_4px_rgba(0,0,0,1)] z-50 active:translate-y-2 active:shadow-none transition-all">
          GUARDAR FECHA {config.fecha_activa}
        </button>
      </main>
    </div>
  )
}
