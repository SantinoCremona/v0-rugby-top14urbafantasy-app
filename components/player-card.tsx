"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, Plus, Check } from "lucide-react"

export interface Player {
  id: number
  nombre: string
  posicion: string
  precio: number
  puntos_totales: number
  foto_url: string | null
  tendencia: "subiendo" | "bajando" | "estable"
}

interface PlayerCardProps {
  player: Player
  isSelected: boolean
  onToggleSelect: (player: Player) => void
}

const positionColors: Record<string, string> = {
  "Pilar": "bg-red-500",
  "Hooker": "bg-red-600",
  "Segunda Línea": "bg-orange-500",
  "Ala": "bg-yellow-500",
  "Octavo": "bg-yellow-600",
  "Medio Scrum": "bg-emerald-500",
  "Apertura": "bg-teal-500",
  "Centro": "bg-cyan-500",
  "Wing": "bg-blue-500",
  "Fullback": "bg-indigo-500",
}

export function PlayerCard({ player, isSelected, onToggleSelect }: PlayerCardProps) {
  const getTrendIcon = () => {
    switch (player.tendencia) {
      case "subiendo":
        return <TrendingUp className="h-4 w-4 text-primary" />
      case "bajando":
        return <TrendingDown className="h-4 w-4 text-destructive" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const positionColor = positionColors[player.posicion] || "bg-muted"

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 ${
        isSelected ? "ring-2 ring-primary shadow-lg shadow-primary/20" : ""
      }`}
    >
      {/* Header with position badge */}
      <div className="relative h-32 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
        <div className={`absolute top-2 left-2 ${positionColor} text-primary-foreground text-xs font-bold px-2 py-1 rounded`}>
          {player.posicion}
        </div>
        
        {/* Price trend indicator */}
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-1">
          {getTrendIcon()}
        </div>

        {/* Player silhouette/avatar */}
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
          {player.foto_url ? (
            <img 
              src={player.foto_url} 
              alt={player.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">
                {player.nombre.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Player info */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg text-foreground truncate text-balance">
          {player.nombre}
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Precio</p>
            <p className="text-xl font-bold text-primary">
              ${player.precio.toLocaleString('es-AR')}M
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Puntos</p>
            <p className="text-xl font-bold text-foreground">
              {player.puntos_totales}
            </p>
          </div>
        </div>

        <Button 
          onClick={() => onToggleSelect(player)}
          variant={isSelected ? "default" : "outline"}
          className={`w-full transition-all ${
            isSelected 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          }`}
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Seleccionado
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Fichar
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
