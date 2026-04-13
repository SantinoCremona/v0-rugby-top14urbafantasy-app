export const revalidate = 0; // Fuerza a Next.js a leer datos frescos siempre

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

  const fechaActual = config?.fecha_activa ?? 1

  // 2. Traer todos los jugadores
  const { data: jugadores, error } = await supabase
    .from("jugadores")
    .select("*")
    .order("puntos_totales", { ascending: false })

  if (error) {
    console.error("Error fetching players:", error)
  }

  // 3. Traer el usuario actual y su equipo
  const { data: { user } } = await supabase.auth.getUser()
  let savedTeamData = []
  let totalPuntosFechaActual = 0
  
  if (user) {
    const { data: teamData } = await supabase
      .from('equipos_usuarios')
      // AGREGAMOS: is_captain en el select
      .select('posicion_en_campo, jugador_id, is_captain') 
      .eq('user_id', user.id)
      .eq('fecha_num', fechaActual) 
    
    savedTeamData = teamData || []

    // --- LÓGICA DE PUNTOS DE LA FECHA ACTUAL (Con Capitán x2) ---
    if (savedTeamData.length > 0) {
      const idsMisJugadores = savedTeamData.map(item => item.jugador_id)
      
      const { data: puntosData } = await supabase
        .from("puntos_fecha")
        .select("puntos, jugador_id") // Traemos el ID para matchear
        .in("jugador_id", idsMisJugadores)
        .eq("fecha_num", fechaActual)

      // Calculamos el total recorriendo el equipo guardado para ver quién es capitán
      totalPuntosFechaActual = savedTeamData.reduce((acc, item) => {
        const pData = puntosData?.find(pd => pd.jugador_id === item.jugador_id);
        const puntosBase = pData?.puntos || 0;
        
        // Si el jugador es capitán, sumamos el doble
        const puntosFinales = item.is_captain ? puntosBase * 2 : puntosBase;
        
        return acc + puntosFinales;
      }, 0);
    }
  }

  // --- LÓGICA DE RANKING ACTUALIZADA (Basada en Perfiles) ---
  const { data: rankings } = await supabase
    .from('perfiles')
    .select('id, puntos_acumulados')
    .order('puntos_acumulados', { ascending: false })

  const miPosicion = rankings?.findIndex(p => p.id === user?.id) + 1
  const rankingFinal = miPosicion > 0 ? miPosicion : (rankings?.length || 0) + 1
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
    estado: j.estado, 
  }))

  // Pasamos todos los datos al Client Component
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
