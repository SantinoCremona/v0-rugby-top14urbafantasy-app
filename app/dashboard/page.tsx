import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./dashboard-client"
import type { Player } from "@/components/player-card"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: jugadores, error } = await supabase
    .from("jugadores")
    .select("*")
    .order("puntos_totales", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching players:", error)
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

  return <DashboardClient players={players} />
}
