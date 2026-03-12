import { createClient } from "@/lib/supabase/server"
import { TransferMarket } from "@/components/transfer-market"
import type { Player } from "@/components/player-card"

export default async function Page() {
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
    posicion: j.posicion,
    precio: j.precio,
    puntos_totales: j.puntos_totales,
    foto_url: j.foto_url,
    tendencia: j.tendencia as "subiendo" | "bajando" | "estable",
  }))

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg">CASI Fantasy</h1>
              <p className="text-xs text-muted-foreground">Rugby 2026</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm text-primary font-medium">Mercado</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Mi Equipo</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Clasificacion</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <TransferMarket players={players} />
      </div>
    </main>
  )
}
