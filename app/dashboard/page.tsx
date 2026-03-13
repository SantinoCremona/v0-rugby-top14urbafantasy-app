import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./dashboard-client"
import type { Player } from "@/components/player-card"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // 1. Traer la configuración del juego (Mercado y Fecha Activa)
  const { data: config } = await supabase
    .from("config_juego")
    .select("*")
    .eq("id", 1)
    .single()

  // 2. Traer todos los jugadores
  const { data: jugadores, error } = await supabase
    .from("jugadores")
    .select("*")
    .order("puntos_totales", { ascending: false })

  if (error) {
    console.error("Error fetching players:", error)
  }

  // 3. Traer el usuario actual
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
  const puntosMap = new Map((jugadores || []).map(j => [j.id, j.puntos_totales || 0]))
  const { data: todosLosEquipos } = await supabase
    .from('equipos_usuarios')
    .select('user_id, jugador_id')

  const puntosPorUsuario: Record<string, number> = {}
  todosLosEquipos?.forEach(item => {
    const pts = puntosMap.get(item.jugador_id) || 0
    puntosPorUsuario[item.user_id] = (puntosPorUsuario[item.user_id] || 0) + pts
  })

  const rankingOrdenado = Object.entries(puntosPorUsuario)
    .map(([id, pts]) => ({ id, pts }))
    .sort((a, b) => b.pts - a.pts)

  const miPosicion = rankingOrdenado.findIndex(u => u.id === user?.id) + 1
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

  // Pasamos todos los datos al Client Component, incluyendo el estado del mercado
  return (
    <DashboardClient 
      players={players} 
      savedTeam={savedTeamData} 
      rankingPos={rankingFinal}
      mercadoAbierto={config?.mercado_abierto ?? true} // Nuevo prop
      fechaActiva={config?.fecha_activa ?? 1}        // Nuevo prop
    />
  )
}
