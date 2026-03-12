import { createClient } from "@/lib/supabase/server"
import { MainHeader } from "@/components/main-header"

export default async function RankingPage() {
  const supabase = await createClient()

  // Traemos TODO de las tres tablas
  const { data: perfiles } = await supabase.from('perfiles').select('*')
  const { data: equipos } = await supabase.from('equipos_usuarios').select('*')
  const { data: jugadores } = await supabase.from('jugadores').select('id, puntos_totales')

  // Creamos el mapa de puntos
  const puntosMap = new Map(jugadores?.map(j => [j.id, j.puntos_totales || 0]))

  // Calculamos el ranking para CADA perfil encontrado
  const ranking = (perfiles || []).map(perfil => {
    const misJugadores = (equipos || []).filter(e => e.user_id === perfil.id)
    const total = misJugadores.reduce((acc, curr) => acc + (puntosMap.get(curr.jugador_id) || 0), 0)
    
    return {
      id: perfil.id,
      nombreEquipo: perfil.nombre_equipo || "Equipo sin nombre",
      puntos: total
    }
  }).sort((a, b) => b.puntos - a.puntos)

  return (
    <div className="min-h-screen bg-white">
      <MainHeader />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="font-display text-4xl italic border-b-4 border-black mb-6 uppercase">
          Tabla General ({ranking.length})
        </h1>
        
        <div className="border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-black text-white uppercase text-xs">
              <tr>
                <th className="p-4 w-16">Pos</th>
                <th className="p-4">Equipo</th>
                <th className="p-4 text-right">Pts</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((user, i) => (
                <tr key={user.id} className="border-b-2 border-black last:border-0 font-display italic">
                  <td className="p-4 text-2xl border-r-2 border-black">{i + 1}</td>
                  <td className="p-4 text-xl uppercase leading-none">{user.nombreEquipo}</td>
                  <td className="p-4 text-right text-3xl">{user.puntos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
