"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainHeader } from "@/components/main-header"

export default function AdminPuntosMasivos() {
  const supabase = createClient()
  const [jugadores, setJugadores] = useState([])
  const [clubSeleccionado, setClubSeleccionado] = useState("CASI") 
  const [fechaActual, setFechaActual] = useState(1)
  const [puntosTemp, setPuntosTemp] = useState({}) 
  const [cargando, setCargando] = useState(false)

  const CLUBES = ["CASI", "SIC", "Hindu", "Belgrano", "Alumni", "BIEI", "Atletico del Rosario", "Los Matreros", "Regatas BV", "Champagnat", "La Plata", "Los Tilos", "CUBA", "Newman"]

  // 1. Cargar jugadores del club seleccionado
  useEffect(() => {
    async function getJugadores() {
      const { data } = await supabase
        .from("jugadores")
        .select("*")
        .ilike("club", clubSeleccionado)
        .order("apellido", { ascending: true })
      
      setJugadores(data || [])
    }
    getJugadores()
  }, [clubSeleccionado])

  // 2. Función para guardar puntos en la tabla puntos_fecha
  async function guardarPlanilla() {
    setCargando(true)
    
    // Creamos el array de objetos para insertar
    const inserts = Object.entries(puntosTemp)
      .filter(([_, pts]) => pts !== "" && pts !== "0") 
      .map(([id, pts]) => ({
        jugador_id: parseInt(id), // Convertimos el ID (string) a número (int8)
        fecha_num: fechaActual,   // Columna en tu tabla SQL
        puntos: parseInt(pts)
      }))

    if (inserts.length === 0) {
      alert("No hay puntos para guardar.")
      setCargando(false)
      return
    }

    // Insertamos en la tabla puntos_fecha
    const { error } = await supabase.from("puntos_fecha").insert(inserts)
    
    if (error) {
      alert("Error de Supabase: " + error.message)
      console.error(error)
    } else {
      alert(`¡Éxito! Puntos de ${clubSeleccionado} (Fecha ${fechaActual}) guardados.`)
      setPuntosTemp({}) // Limpiamos los inputs después de guardar
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <MainHeader />
      <main className="max-w-4xl mx-auto px-4 py-10">
        
        {/* Header de control */}
        <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4 bg-gray-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl italic uppercase leading-none">Carga de Puntos</h1>
            <div className="flex items-center gap-2 font-bold text-sm">
               <span>JORNADA:</span>
               <input 
                type="number" 
                value={fechaActual}
                onChange={(e) => setFechaActual(parseInt(e.target.value))}
                className="w-14 border-2 border-black text-center bg-white"
               />
            </div>
          </div>
          
          <select 
            className="border-2 border-black p-2 font-bold uppercase bg-white cursor-pointer hover:bg-yellow-50"
            value={clubSeleccionado}
            onChange={(e) => setClubSeleccionado(e.target.value)}
          >
            {CLUBES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Lista de Jugadores */}
        <div className="grid gap-2 mb-24">
          {jugadores.map(j => (
            <div key={j.id} className="flex items-center justify-between border-2 border-black p-4 bg-white hover:border-yellow-400 transition-all">
              <div className="flex flex-col">
                <span className="font-display text-xl uppercase italic leading-none">{j.apellido}, {j.nombre}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{j.posicion}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-400">PTS</span>
                <input 
                  type="number" 
                  placeholder="0"
                  value={puntosTemp[j.id] || ""}
                  className="w-24 border-2 border-black p-2 text-center font-display text-2xl outline-none focus:bg-yellow-400 focus:border-black"
                  onChange={(e) => setPuntosTemp({...puntosTemp, [j.id]: e.target.value})}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Botón flotante para guardar */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
          <button 
            onClick={guardarPlanilla}
            disabled={cargando}
            className="max-w-4xl mx-auto w-full bg-black text-white p-5 font-display text-3xl italic uppercase border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)] hover:bg-yellow-400 hover:text-black active:translate-y-1 transition-all disabled:opacity-50"
          >
            {cargando ? "GUARDANDO DATOS..." : `CONFIRMAR FECHA ${fechaActual} - ${clubSeleccionado}`}
          </button>
        </div>
      </main>
    </div>
  )
}
