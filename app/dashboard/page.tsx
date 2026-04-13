// dashboard/page.tsx
export const revalidate = 0;

import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./dashboard-client"
import type { Player } from "@/components/player-card"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: config } = await supabase
    .from("config_juego")
    .select("*")
    .eq("id", 1)
    .single()

  const fechaActual = config?.fecha_activa ?? 1

  const { data: jugadores, error } = await supabase
    .from("jugadores")
    .select("*")
    .order("puntos_totales", { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()
  let savedTeamData = []
  let totalPuntosFechaActual = 0
  
  if (user) {
    const { data: teamData } = await supabase
      .from('equipos_usuarios')
      .select('posicion_en_campo, jugador_id, is_captain') // <-- Agregamos is_captain
      .eq('user_id', user.id)
      .eq('fecha_num', fechaActual)
    
    savedTeamData = teamData || []

    if (savedTeamData.length > 0) {
      const idsMisJugadores = savedTeamData.map(item => item.jugador_id)
      const { data: puntosData } = await supabase
        .from("puntos_fecha")
        .select("puntos, jugador_id")
        .in("jugador_id", idsMisJugadores)
        .eq("fecha_num", fechaActual)

      // Cálculo de puntos considerando duplicación por capitán
      totalPuntosFechaActual = savedTeamData.reduce((acc, item) => {
        const pData = puntosData?.find(pd => pd.jugador_id === item.jugador_id);
        const puntosBase = pData?.puntos || 0;
        return acc + (item.is_captain ? puntosBase * 2 : puntosBase);
      }, 0);
    }
  }

  const { data: rankings } = await supabase
    .from('perfiles')
    .select('id, puntos_acumulados')
    .order('puntos_acumulados', { ascending: false })

  const miPosicion = rankings?.findIndex(p => p.id === user?.id) + 1
  const rankingFinal = miPosicion > 0 ? miPosicion : (rankings?.length || 0) + 1

  const players: Player[] = (jugadores || []).map((j) => ({
    id: j.id,
    nombre: j.nombre,
    club: j.club,
    posicion: j.posicion,
    precio: j.precio,
    puntos_totales: j.puntos_totales,
    foto_url: j.foto_url,
    tendencia: j.tendencia as "subiendo" | "bajando" | "estable",
    estado: j.estado,
  }))

  return (
    <DashboardClient 
      players={players} 
      savedTeam={savedTeamData} 
      rankingPos={rankingFinal}
      mercadoAbierto={config?.mercado_abierto ?? true}
      fechaActiva={fechaActual}
      puntosFecha={totalPuntosFechaActual}
    />
  )
}
