"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainHeader } from "@/components/main-header"
import { Save, Search } from "lucide-react"

export default function AdminPuntosPage() {
  const supabase = createClient()
  const [jugadores, setJugadores] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [fechaActual, setFechaActual] = useState(1)
  const [puntosTemp, setPuntosTemp] = useState<{ [key: number]: string }>({})
  const [loading, setLoading] = useState(false)

  // 1. Cargar jugadores
  useEffect(() => {
    async function fetchJugadores() {
      const { data } = await supabase.from("jugadores").select("*").order("apellido")
      if (data) setJugadores(data)
    }
    fetchJugadores()
  }, [])

  // 2. Función para guardar en la nueva tabla puntos_fecha
  async function guardarFecha() {
    setLoading(true)
    
    // Filtramos solo los que tienen puntos escritos para no mandar basura
    const inserts = Object.entries(puntosTemp)
      .filter(([_, pts]) => pts !== "") 
      .map(([id, pts]) => ({
        jugador_id: parseInt(id), // Aquí la corrección para int8
        fecha_num: fechaActual,
        puntos: parseInt(pts) || 0
      }))

    if (inserts.length === 0) {
      alert("No cargaste puntos para ningún jugador")
      setLoading(false)
      return
    }

    const { error } = await supabase.from("puntos_fecha").insert(inserts)

    if (error) {
      alert("Error al guardar: " + error.message)
    } else {
      alert(`¡Puntos de la Fecha ${fechaActual} guardados y Ranking actualizado!`)
      setPuntosTemp({}) // Limpia los inputs
    }
    setLoading(false)
  }

  const filtrados = jugadores.filter(j => 
    `${j.nombre} ${j.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">
      <MainHeader />
      <main className="max-w-3xl mx-auto px-4 py-10">
        
        {/* Selector de Fecha */}
        <div className="flex items-center gap-4 mb-8 bg-black text-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400">Jornada Actual</label>
            <input 
              type="number" 
              value={fechaActual} 
              onChange={(e) => setFechaActual(parseInt(e.target.value))}
              className="bg-transparent text-4xl font-display italic outline-none w-20"
            />
          </div>
          <div className="h-12 w-[2px] bg-gray-700 mx-2" />
          <p className="text-sm font-bold uppercase italic leading-tight">Carga masiva de puntos por jugador</p>
        </div>

        <input 
          type="text" 
          placeholder="BUSCAR POR NOMBRE O APELLIDO..." 
          className="w-full p-4 border-4 border-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none font-bold uppercase"
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="space-y-2 mb-20">
          {filtrados.map(j => (
            <div key={j.id} className="border-2 border-black p-3 flex items-center justify-between hover:bg-gray-50">
              <div className="flex-1">
                <p className="font-bold uppercase text-sm leading-none">{j.apellido}, {j.nombre}</p>
                <p className="text-[10px] text-gray-500 font-bold">{j.club}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400">PTS</span>
                <input 
                  type="number" 
                  value={puntosTemp[j.id] || ""}
                  placeholder="0"
                  className="w-20 p-2 border-2 border-black text-center font-display text-xl focus:bg-yellow-400 outline-none transition-colors"
                  onChange={(e) => setPuntosTemp({...puntosTemp, [j.id]: e.target.value})}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Botón Flotante para Guardar */}
        <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4">
          <button 
            onClick={guardarFecha}
            disabled={loading}
            className="w-full max-w-md bg-black text-white p-5 font-display text-2xl italic uppercase tracking-tighter border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1),8px_8px_0px_4px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black transition-all active:translate-y-1 disabled:opacity-50"
          >
            {loading ? "GUARDANDO..." : `GUARDAR FECHA ${fechaActual}`}
          </button>
        </div>
      </main>
    </div>
  )
}
