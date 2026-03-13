"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainHeader } from "@/components/main-header"
import { Save, Search, TrendingUp } from "lucide-react"

export default function AdminPuntos() {
  const supabase = createClient()
  const [jugadores, setJugadores] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [cargando, setCargando] = useState(false)

  useEffect(() => { fetchJugadores() }, [])

  async function fetchJugadores() {
    const { data } = await supabase.from("jugadores").select("*").order("apellido")
    if (data) setJugadores(data)
  }

  async function actualizarPuntos(id: string, pts: number) {
    setCargando(true)
    await supabase.from("jugadores").update({ puntos_totales: pts }).eq("id", id)
    setCargando(false)
    // Opcional: mostrar un check de "guardado"
  }

  const filtrados = jugadores.filter(j => 
    `${j.nombre} ${j.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <MainHeader />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8 border-b-4 border-black pb-4">
          <TrendingUp className="w-8 h-8" />
          <h1 className="font-display text-4xl italic uppercase tracking-tighter">Carga de Puntos</h1>
        </div>

        <input 
          type="text" 
          placeholder="BUSCAR JUGADOR..." 
          className="w-full p-4 border-4 border-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-yellow-50 font-bold uppercase"
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="space-y-4">
          {filtrados.map(j => (
            <div key={j.id} className="border-4 border-black p-4 flex items-center justify-between shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
              <div>
                <p className="font-display text-xl italic uppercase">{j.apellido}, {j.nombre}</p>
                <p className="text-xs font-bold text-gray-500 uppercase">{j.club} • {j.posicion}</p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  className="w-20 p-2 border-2 border-black text-center font-display text-2xl"
                  defaultValue={j.puntos_totales || 0}
                  onBlur={(e) => actualizarPuntos(j.id, parseInt(e.target.value) || 0)}
                />
                <span className="font-bold text-xs uppercase">Pts</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}