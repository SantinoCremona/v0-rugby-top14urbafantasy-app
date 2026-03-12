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

  // 2. Traer el equipo que el usuario ya tenga guardado
  const { data: { user } } = await supabase.auth.getUser()
  let savedTeamData = []
  
  if (user) {
    const { data: teamData } = await supabase
      .from('equipos_usuarios')
      .select('posicion_en_campo, jugador_id')
      .eq('user_id', user.id)
    
    savedTeamData = teamData || []
  }

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

  // Pasamos los jugadores y los datos del equipo guardado al componente de cliente
  return <DashboardClient players={players} savedTeam={savedTeamData} />
}
