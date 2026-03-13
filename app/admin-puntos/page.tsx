"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainHeader } from "@/components/main-header"
import { LayoutList, Save, ShieldCheck } from "lucide-react"

// Lista de clubes para el selector (asegurate que coincidan con los de tu DB)
const CLUBES = ["ALUMNI", "BELGRANO", "CASI", "CUBA", "HINDÚ", "SIC", "NEWMAN", "PUCARÁ", "REGINA", "SAN LUIS", "SIC", "CASI"]

export default function AdminPuntosClub() {
  const supabase = createClient()
  const [jugadores, setJugadores] = useState<any[]>([])
  const [clubSeleccionado, setClubSeleccionado] = useState(CLUBES[0])
  const [fechaActual, setFechaActual] = useState(1)
  const [puntosTemp, setPuntosTemp] = useState<{ [key: number]: string }>({})
  const [loading, setLoading] = useState(false)

  // Cargar jugadores cada vez que cambie el club
  useEffect(() => {
    async function fetchJugadores() {
      const { data } = await supabase
        .from("jugadores")
        .select("*")
        .eq("club", clubSeleccionado)
        .order("apellido")
      
      if (data) {
        setJugadores(data)
        // No limpiamos puntosTemp para permitir cargar varios clubes antes de guardar
      }
    }
    fetchJugadores()
  }, [clubSeleccionado])

  async function guardarFecha() {
    setLoading(true)
    
    const inserts = Object.entries(puntosTemp)
      .filter(([_, pts]) => pts !== "" && pts !== "0") 
      .map(([id, pts]) => ({
        jugador_id: parseInt(id),
        fecha_num: fechaActual,
        puntos: parseInt(pts)
      }))

    if (inserts.length === 0) {
      alert("No hay puntos nuevos para guardar.")
      setLoading(false)
      return
    }

    const { error } = await supabase.from("puntos_fecha").insert(inserts)

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert(`¡Puntos de la Fecha ${fechaActual} cargados correctamente!`)
      setPuntosTemp({}) // Limpiar después de guardar
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <MainHeader />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* ENCABEZADO DE CONTROL */}
        <div className="bg-white border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-black uppercase mb-2 tracking-tighter text-gray-400 font-sans">1. Elegir Club</label>
            <select 
              value={clubSeleccionado}
              onChange={(e) => setClubSeleccionado(e.target.value)}
              className="w-full p-3 border-4 border-black font-display text-2xl italic uppercase bg-white outline-none cursor-pointer"
            >
              {CLUBES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="w-32">
            <label className="block text-xs font-black uppercase mb-2 tracking-tighter text-gray-400 font-sans">2. Fecha N°</label>
            <input 
              type="number" 
              value={fechaActual} 
              onChange={(e) => setFechaActual(parseInt(e.target.value))}
              className="w-full p-3 border-4 border-black font-display text-3xl italic text-center outline-none"
            />
          </div>
        </div>

        {/* LISTADO DE JUGADORES DEL CLUB */}
        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-32">
          <div className="bg-black text-white p-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-yellow-400" />
            <h2 className="font-display text-xl italic uppercase tracking-tight">Plantel: {clubSeleccionado}</h2>
          </div>
          
          <div className="divide-y-2 divide-black">
            {jugadores.length > 0 ? jugadores.map(j => (
              <div key={j.id} className="flex items-center justify-between p-4 hover:bg-yellow-50 transition-colors">
                <div>
                  <p className="font-display text-2xl italic uppercase leading-none">{j.apellido}, {j.nombre}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{j.posicion}</p>
                </div>
                
                <div className="flex items-center gap-4 bg-gray-100 p-2 border-2 border-black">
                  <span className="text-[10px] font-black uppercase text-gray-500">Puntos</span>
                  <input 
                    type="number"
                    placeholder="0"
                    value={puntosTemp[j.id] || ""}
                    onChange={(e) => setPuntosTemp({...puntosTemp, [j.id]: e.target.value})}
                    className="w-20 bg-white border-2 border-black p-1 text-center font-display text-2xl italic outline-none focus:ring-2 ring-yellow-400"
                  />
                </div>
              </div>
            )) : (
              <div className="p-10 text-center italic text-gray-400">No se encontraron jugadores para este club.</div>
            )}
          </div>
        </div>

        {/* BOTÓN FLOTANTE DE GUARDADO */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
          <button 
            onClick={guardarFecha}
            disabled={loading}
            className="w-full max-w-4xl mx-auto block bg-black text-white p-6 font-display text-3xl italic uppercase tracking-tighter border-4 border-black shadow-[8px_8px_0px_0px_rgba(254,240,138,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:bg-yellow-400 active:text-black"
          >
            {loading ? "PROCESANDO..." : `GUARDAR PUNTOS DE ${clubSeleccionado}`}
          </button>
        </div>
      </main>
    </div>
  )
}
