import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./dashboard-client"
import type { Player } from "@/components/player-card"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // 1. Traer todos los jugadores de la base de datos
  const { data: jugadores, error } = await supabase
    .from("jugadores")
    .select("*")
    .order("puntos_totales", { ascending: false })

  if (error) {
    console.error("Error fetching players:", error)
  }

  // 2. Traer el usuario actual
  const { data: { user } } = await supabase.auth.getUser()
  let savedTeamData = []
  
  if (user) {
    const { data: teamData } = await supabase
      .from('equipos_usuarios')
      .select('posicion_en_campo, jugador_id')
      .eq('user_id', user.id)
    
    savedTeamData = teamData || []
  }

  // --- LÓGICA DE RANKING DINÁMICO ---
  
  // A. Crear un mapa de puntos por ID de jugador para calcular rápido
  const puntosMap = new Map((jugadores || []).map(j => [j.id, j.puntos_totales || 0]))

  // B. Traer TODOS los equipos de TODOS los usuarios
  const { data: todosLosEquipos } = await supabase
    .from('equipos_usuarios')
    .select('user_id, jugador_id')

  // C. Calcular la sumatoria de puntos por cada DT
  const puntosPorUsuario: Record<string, number> = {}
  
  todosLosEquipos?.forEach(item => {
    const pts = puntosMap.get(item.jugador_id) || 0
    puntosPorUsuario[item.user_id] = (puntosPorUsuario[item.user_id] || 0) + pts
  })

  // D. Convertir a array, ordenar de mayor a menor y encontrar la posición
  const rankingOrdenado = Object.entries(puntosPorUsuario)
    .map(([id, pts]) => ({ id, pts }))
    .sort((a, b) => b.pts - a.pts)

  // Encontrar el índice del usuario actual en el ranking (sumamos 1 porque el índice empieza en 0)
  const miPosicion = rankingOrdenado.findIndex(u => u.id === user?.id) + 1
  
  // Si el usuario no tiene equipo aún, lo ponemos al final de la lista
  const rankingFinal = miPosicion > 0 ? miPosicion : (rankingOrdenado.length + 1)

  // --- FIN LÓGICA RANKING ---

  const players: Player[] = (jugadores || []).map((j) => ({
    id: j.id,
    nombre: j.nombre,
    club: j.club,
    posicion: j.posicion,
    precio: j.precio,
    puntos_totales: j.puntos_totales,
    foto_url: j.foto_url,
    tendencia: j.tendencia as "subiendo" | "bajando" | "estable",
  }))

  // Pasamos los jugadores, el equipo guardado y la POSICIÓN DEL RANKING
  return (
    <DashboardClient 
      players={players} 
      savedTeam={savedTeamData} 
      rankingPos={rankingFinal} 
    />
  )
}
