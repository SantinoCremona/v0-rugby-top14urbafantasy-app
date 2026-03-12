"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { Player } from "@/components/player-card"

interface MercadoClientProps {
  players: Player[]
}

const positions = ["Todos", "Pilar", "Hooker", "Segunda", "Ala", "N8", "Medio", "Apertura", "Centro", "Wing", "Fullback"]

export function MercadoClient({ players }: MercadoClientProps) {
  const [search, setSearch] = useState("")
  const [selectedPosition, setSelectedPosition] = useState("Todos")
  const [sortBy, setSortBy] = useState<"precio" | "puntos">("puntos")

  const filteredPlayers = players
    .filter((p) => {
      const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase())
      const matchesPosition = selectedPosition === "Todos" || p.posicion === selectedPosition
      return matchesSearch && matchesPosition
    })
    .sort((a, b) => {
      if (sortBy === "precio") return b.precio - a.precio
      return b.puntos_totales - a.puntos_totales
    })

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "subiendo") return <TrendingUp className="w-4 h-4 text-foreground" />
    if (trend === "bajando") return <TrendingDown className="w-4 h-4 text-muted-foreground" />
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6">
        <h1 className="font-display text-3xl md:text-4xl mb-6 tracking-tight">MERCADO</h1>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="BUSCAR JUGADOR"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 text-sm tracking-wider"
            />
          </div>

          {/* Position filters */}
          <div className="flex flex-wrap gap-2">
            {positions.map((pos) => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                  selectedPosition === pos
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("puntos")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
                sortBy === "puntos"
                  ? "bg-card text-card-foreground border-card"
                  : "bg-background text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              Por Puntos
            </button>
            <button
              onClick={() => setSortBy("precio")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
                sortBy === "precio"
                  ? "bg-card text-card-foreground border-card"
                  : "bg-background text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              Por Precio
            </button>
          </div>
        </div>

        {/* Players grid */}
        <div className="grid gap-3">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-4 bg-muted border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-card flex items-center justify-center border border-border">
                  <span className="font-display text-lg text-card-foreground">
                    {player.nombre.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-bold">{player.nombre}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs bg-card text-card-foreground px-2 py-0.5">
                      {player.posicion}
                    </span>
                    <span className="text-xs text-muted-foreground">{player.puntos_totales} pts</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <TrendIcon trend={player.tendencia} />
                    <span className="font-display text-lg">${player.precio.toLocaleString()}</span>
                  </div>
                </div>
                <Button className="h-10 px-6 font-bold text-xs tracking-wider">
                  FICHAR
                </Button>
              </div>
            </div>
          ))}

          {filteredPlayers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron jugadores
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
