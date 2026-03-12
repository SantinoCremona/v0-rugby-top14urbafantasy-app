"use client"

import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, Plus, Check } from "lucide-react"

export interface Player {
  id: number
  nombre: string
  posicion: string
  precio: number
  club: string
  puntos_totales: number
  foto_url: string | null
  tendencia: "subiendo" | "bajando" | "estable"
}

interface PlayerCardProps {
  player: Player
  isSelected: boolean
  onToggleSelect: (player: Player) => void
}

export function PlayerCard({ player, isSelected, onToggleSelect }: PlayerCardProps) {
  const getTrendIcon = () => {
    switch (player.tendencia) {
      case "subiendo":
        return <TrendingUp className="h-4 w-4" />
      case "bajando":
        return <TrendingDown className="h-4 w-4 text-muted-foreground" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div 
      className={`relative overflow-hidden border transition-all hover:bg-muted ${
        isSelected ? "border-foreground bg-muted" : "border-border"
      }`}
    >
      {/* Header with position badge */}
      <div className="relative h-28 bg-card flex items-center justify-center">
        <div className="absolute top-2 left-2 bg-foreground text-background text-xs font-bold px-2 py-1 uppercase tracking-wider">
          {player.posicion}
        </div>
        
        {/* Price trend indicator */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {getTrendIcon()}
        </div>

        {/* Player avatar */}
        <div className="w-16 h-16 bg-muted flex items-center justify-center overflow-hidden border border-border">
          {player.foto_url ? (
            <img 
              src={player.foto_url} 
              alt={player.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-display text-2xl text-card-foreground">
              {player.nombre.split(' ').map(n => n[0]).join('')}
            </span>
          )}
        </div>
      </div>

      {/* Player info */}
      <div className="p-4 space-y-3 bg-background">
        <h3 className="font-bold text-sm uppercase tracking-wide truncate">
          {player.nombre}
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Precio</p>
            <p className="font-display text-lg">
              ${player.precio.toLocaleString('es-AR')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Puntos</p>
            <p className="font-display text-lg">
              {player.puntos_totales}
            </p>
          </div>
        </div>

        <Button 
          onClick={() => onToggleSelect(player)}
          variant={isSelected ? "default" : "outline"}
          className="w-full h-9 text-xs font-bold uppercase tracking-wider"
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
    </div>
  )
}
