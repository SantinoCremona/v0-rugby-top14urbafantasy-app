"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainHeader } from "@/components/main-header"

const CLUBES = [
  "CASI", "SIC", "Hindu", "Belgrano", "Alumni", "BIEI", 
  "Atletico del Rosario", "Los Matreros", "Regatas BV", 
  "Champagnat", "La Plata", "Los Tilos", "CUBA", "Newman"
]

export default function AdminPuntosMasivos() {
  const supabase = createClient()
  const [jugadores, setJugadores] = useState<any[]>([])
  const [clubSeleccionado, setClubSeleccionado] = useState("CASI")
  const [fechaActual, setFechaActual] = useState(1)
  const [puntosTemp, setPuntosTemp] = useState<{[key: string]: string}>({})
  const [cargando, setCargando] = useState(false)

  // 1. Buscás los jugadores usando .ilike para evitar errores de mayúsculas
  useEffect(() => {
    async function getJugadores() {
      const { data, error } = await supabase
        .from("jugadores")
        .select("*")
        .ilike("club", clubSeleccionado)
        .order("apellido", { ascending: true })
      
      if (error) {
        console.error("Error cargando jugadores:", error)
      } else {
        setJugadores(data || [])
      }
    }
    getJugadores()
  }, [clubSeleccionado])

  // 2. Función para guardar compatible con int8 y puntos_fecha
  async function guardarPlanilla() {
    setCargando(true)
    
    // Transformamos el objeto temporal en el array para Supabase
    const inserts = Object.entries(puntosTemp)
      .filter(([_, pts]) => pts !== "" && pts !== "0") // Solo enviamos si hay puntos
      .map(([id, pts]) => ({
        jugador_id: parseInt(id), // <-- IMPORTANTE: Convertimos el ID (string del objeto) a número (int8)
        fecha_num: fechaActual,   // <-- Nombre exacto de la columna en SQL
        puntos: parseInt(pts)
      }))

    if (inserts.length === 0) {
      alert("No hay puntos cargados para enviar.")
      setCargando(false)
      return
    }

    const { error } = await supabase.from("puntos_fecha").insert(inserts)
    
    if (error) {
      alert("Error al guardar: " + error.message)
    } else {
      alert(`¡Puntos de la Fecha ${fechaActual} para el club ${clubSeleccionado} cargados!`)
      setPuntosTemp({}) // Limpiamos los inputs
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <MainHeader />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
          <div>
            <h1 className="font-display text-4xl italic uppercase">Carga por Club</h1>
            <div className="flex items-center gap-2 mt-2">
               <span className="text-xs font-bold uppercase">Fecha N°</span>
               <input 
                type="number" 
                value={fechaActual} 
                onChange={(e) => setFechaActual(parseInt(e.target.value))}
                className="w-12 border-2 border-black text-center font-bold"
               />
            </div>
          </div>

          <select 
            className="border-4 border-black p-3 font-display text-2xl italic uppercase outline-none bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            value={clubSeleccionado}
            onChange={(e) => setClubSeleccionado(e.target.value)}
          >
            {CLUBES.map(club => (
              <option key={club} value={club}>{club}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 mb-24">
          {jugadores.length > 0 ? (
            jugadores.map(j => (
              <div key={j.id} className="flex items-center justify-between border-2 border-black p-4 hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white transition-all">
                <div>
                  <span className="font-display text-xl uppercase italic">{j.apellido}, {j.nombre}</span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{j.posicion}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black">PTS</span>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={puntosTemp[j.id] || ""}
                    className="w-20 border-2 border-black p-2 text-center font-display text-2xl outline-none focus:bg-yellow-400"
                    onChange={(e) => setPuntosTemp({...puntosTemp, [j.id]: e.target.value})}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center border-4 border-dashed border-gray-200 italic text-gray-400">
              No se encontraron jugadores para {clubSeleccionado}. 
              Verificá si el nombre coincide exactamente en la base de datos.
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t-2 border-black">
          <button 
            onClick={guardarPlanilla}
            disabled={cargando}
            className="max-w-4xl mx-auto w-full bg-black text-white p-5 font-display text-3xl italic uppercase hover:bg-yellow-400 hover:text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 transition-all disabled:opacity-50"
          >
            {cargando ? "GUARDANDO..." : `CONFIRMAR FECHA ${fechaActual} - ${clubSeleccionado}`}
          </button>
        </div>
      </main>
    </div>
  )
}
