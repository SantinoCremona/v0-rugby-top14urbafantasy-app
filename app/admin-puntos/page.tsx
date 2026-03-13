"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainHeader } from "@/components/main-header"

export default function AdminPuntosMasivos() {
  const supabase = createClient()
  const [jugadores, setJugadores] = useState([])
  const [clubSeleccionado, setClubSeleccionado] = useState("CASI") // Ejemplo
  const [fechaActual, setFechaActual] = useState(1)
  const [puntosTemp, setPuntosTemp] = useState({}) // Guarda lo que vas escribiendo

  // 1. Buscás los jugadores de UN SOLO CLUB para no volverte loco
  useEffect(() => {
    async function getJugadores() {
      const { data } = await supabase
        .from("jugadores")
        .select("*")
        .eq("club", clubSeleccionado)
      setJugadores(data)
    }
    getJugadores()
  }, [clubSeleccionado])

  // 2. Función para guardar toda la fecha junta
  async function guardarPlanilla() {
    const inserts = Object.entries(puntosTemp).map(([id, pts]) => ({
      jugador_id: id,
      fecha_numero: fechaActual,
      puntos: parseInt(pts)
    }))

    const { error } = await supabase.from("puntos_fecha").insert(inserts)
    
    if (!error) {
      alert("¡Puntos de la fecha cargados con éxito!")
      // Opcional: Una función en Supabase debería sumar esto al total del jugador
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <MainHeader />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
          <h1 className="font-display text-4xl italic uppercase italic">Carga por Club</h1>
          <select 
            className="border-2 border-black p-2 font-bold"
            onChange={(e) => setClubSeleccionado(e.target.value)}
          >
            <option value="CASI">CASI</option>
            <option value="SIC">SIC</option>
            <option value="HINDU">HINDU</option>
            {/* ... todos los clubes */}
          </select>
        </div>

        <div className="grid gap-2">
          {jugadores.map(j => (
            <div key={j.id} className="flex items-center justify-between border-2 border-black p-3">
              <span className="font-bold uppercase text-sm">{j.apellido}, {j.nombre}</span>
              <input 
                type="number" 
                placeholder="0"
                className="w-20 border-2 border-black p-1 text-center font-display text-xl"
                onChange={(e) => setPuntosTemp({...puntosTemp, [j.id]: e.target.value})}
              />
            </div>
          ))}
        </div>

        <button 
          onClick={guardarPlanilla}
          className="mt-8 w-full bg-black text-white p-4 font-display text-2xl italic hover:bg-yellow-400 hover:text-black transition-colors"
        >
          GUARDAR PUNTOS FECHA {fechaActual}
        </button>
      </main>
    </div>
  )
}