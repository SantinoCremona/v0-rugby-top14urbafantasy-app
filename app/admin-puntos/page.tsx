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

  // 1. Carga de jugadores (Volvemos a la lógica que te funcionaba)
  useEffect(() => {
    async function getJugadores() {
      const { data, error } = await supabase
        .from("jugadores")
        .select("*")
        .eq("club", clubSeleccionado) // Usamos .eq de nuevo si te funcionaba mejor
      
      if (data) setJugadores(data)
      if (error) console.error("Error:", error)
    }
    getJugadores()
  }, [clubSeleccionado])

  // 2. Función para guardar (Ajustada para puntos_fecha e int8)
  async function guardarPlanilla() {
    const inserts = Object.entries(puntosTemp).map(([id, pts]) => ({
      jugador_id: parseInt(id), // ID a número
      fecha_num: fechaActual,   // Nombre columna SQL
      puntos: parseInt(pts) || 0
    }))

    if (inserts.length === 0) return alert("No hay datos")

    const { error } = await supabase.from("puntos_fecha").insert(inserts)
    
    if (!error) {
      alert("¡Puntos cargados con éxito!")
      setPuntosTemp({}) 
    } else {
      alert("Error: " + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <MainHeader />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
          <h1 className="font-display text-4xl italic uppercase">Carga por Club</h1>
          <select 
            className="border-2 border-black p-2 font-bold"
            value={clubSeleccionado}
            onChange={(e) => setClubSeleccionado(e.target.value)}
          >
            <option value="CASI">CASI</option>
            <option value="SIC">SIC</option>
            <option value="Hindu">Hindu</option>
            <option value="Belgrano">Belgrano</option>
            <option value="Alumni">Alumni</option>
            <option value="CUBA">CUBA</option>
            <option value="Newman">Newman</option>
            {/* Agregá el resto tal cual están en tu base de datos */}
          </select>
        </div>

        <div className="grid gap-2">
          {jugadores.length > 0 ? jugadores.map(j => (
            <div key={j.id} className="flex items-center justify-between border-2 border-black p-3">
              <span className="font-bold uppercase text-sm">{j.apellido}, {j.nombre}</span>
              <input 
                type="number" 
                placeholder="0"
                className="w-20 border-2 border-black p-1 text-center font-display text-xl"
                // No usamos "value" aquí para evitar que React bloquee el input si el estado se lía
                onChange={(e) => setPuntosTemp({...puntosTemp, [j.id]: e.target.value})}
              />
            </div>
          )) : (
            <p className="text-center py-10 italic text-gray-400">
              No hay jugadores para {clubSeleccionado}. 
              Fijate si el nombre en el "option" es igual al de la base de datos.
            </p>
          )}
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
