"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainHeader } from "@/components/main-header"

export default function MisPuntos() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [fechaVisualizada, setFechaVisualizada] = useState(1)
  const [detallesFecha, setDetallesFecha] = useState<any[]>([])
  const [puntosTotales, setPuntosTotales] = useState(0)

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      // 1. Obtener los jugadores que el usuario tiene HOY (o los que tenía fijados para la fecha)
      const { data: misJugadores } = await supabase
        .from("equipos_usuarios")
        .select(`
          jugador_id,
          jugadores (
            id,
            nombre,
            apellido,
            club,
            posicion,
            puntos_totales
          )
        `)
        .eq("user_id", user.id)

      if (!misJugadores) return

      // 2. Obtener los puntos que esos jugadores hicieron específicamente en la fecha seleccionada
      const ids = misJugadores.map(m => m.jugador_id)
      const { data: puntosDeLaFecha } = await supabase
        .from("puntos_fecha")
        .select("*")
        .in("jugador_id", ids)
        .eq("fecha_num", fechaVisualizada)

      // 3. Cruzar los datos para mostrar la tabla
      const resumen = misJugadores.map(m => {
        const puntosEnFecha = puntosDeLaFecha?.find(p => p.jugador_id === m.jugador_id)?.puntos || 0
        return {
          ...m.jugadores,
          puntosEnFecha
        }
      })

      setDetallesFecha(resumen)

      // 4. Calcular acumulado total del equipo (suma de los puntos_totales de sus jugadores actuales)
      const total = resumen.reduce((acc, curr) => acc + (curr.puntos_totales || 0), 0)
      setPuntosTotales(total)
    }
    getData()
  }, [fechaVisualizada])

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />
      <main className="max-w-4xl mx-auto px-4 py-10">
        
        <div className="bg-black text-white p-6 mb-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="font-display text-4xl italic uppercase">Resumen de Equipo</h1>
          <p className="text-yellow-400 font-bold uppercase tracking-widest text-sm">Puntos Acumulados: {puntosTotales}</p>
        </div>

        {/* Selector de Fecha */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map(f => (
            <button 
              key={f}
              onClick={() => setFechaVisualizada(f)}
              className={`px-6 py-2 font-bold border-2 border-black transition-all ${fechaVisualizada === f ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
            >
              FECHA {f}
            </button>
          ))}
        </div>

        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-black">
                <th className="p-4 font-display italic uppercase">Jugador</th>
                <th className="p-4 font-display italic uppercase text-center">Pts Fecha {fechaVisualizada}</th>
                <th className="p-4 font-display italic uppercase text-center">Total Global</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {detallesFecha.map((j) => (
                <tr key={j.id} className="hover:bg-yellow-50">
                  <td className="p-4">
                    <p className="font-bold uppercase text-sm">{j.apellido}, {j.nombre}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{j.club} - {j.posicion}</p>
                  </td>
                  <td className="p-4 text-center font-display text-2xl italic">{j.puntosEnFecha}</td>
                  <td className="p-4 text-center font-bold text-gray-400">{j.puntos_totales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
