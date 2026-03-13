"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainHeader } from "@/components/main-header"

export default function MisPuntosPage() {
  const supabase = createClient()
  const [jugadoresConPuntos, setJugadoresConPuntos] = useState([])
  const [fechaActual, setFechaActual] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarDetallePuntos() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Traer los jugadores del equipo del usuario
      const { data: equipo } = await supabase
        .from("equipos_usuarios")
        .select(`
          jugador_id,
          jugadores (
            id, nombre, apellido, club, posicion
          )
        `)
        .eq("user_id", user.id)

      if (!equipo) return

      const idsJugadores = equipo.map(e => e.jugador_id)

      // 2. Traer los puntos de esos jugadores para la fecha seleccionada
      const { data: puntos } = await supabase
        .from("puntos_fecha")
        .select("*")
        .in("jugador_id", idsJugadores)
        .eq("fecha_num", fechaActual)

      // 3. Unir la información
      const detalle = equipo.map(e => {
        const p = puntos?.find(p => p.jugador_id === e.jugador_id)
        return {
          ...e.jugadores,
          puntosEnFecha: p ? p.puntos : 0
        }
      })

      setJugadoresConPuntos(detalle)
      setLoading(false)
    }
    cargarDetallePuntos()
  }, [fechaActual])

  const totalFecha = jugadoresConPuntos.reduce((acc, j) => acc + j.puntosEnFecha, 0)

  return (
    <div className="min-h-screen bg-white">
      <MainHeader />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex justify-between items-end mb-8 border-b-4 border-black pb-4">
          <div>
            <h1 className="font-display text-4xl italic uppercase">Mi Puntaje</h1>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3].map(n => (
                <button 
                  key={n} 
                  onClick={() => setFechaActual(n)}
                  className={`px-3 py-1 border-2 border-black font-bold text-xs ${fechaActual === n ? 'bg-black text-white' : ''}`}
                >
                  F{n}
                </button>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase">Total Fecha {fechaActual}</p>
            <p className="font-display text-5xl italic leading-none">{totalFecha}</p>
          </div>
        </div>

        <div className="space-y-2">
          {jugadoresConPuntos.map(j => (
            <div key={j.id} className="flex justify-between border-2 border-black p-3 items-center">
              <div>
                <p className="font-bold uppercase text-sm">{j.apellido}, {j.nombre}</p>
                <p className="text-[10px] text-gray-500 uppercase">{j.club}</p>
              </div>
              <span className="font-display text-2xl italic">+{j.puntosEnFecha}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
