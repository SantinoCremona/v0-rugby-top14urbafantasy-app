"use client"

import { useState, useMemo } from "react"
import { PlayerCard, type Player } from "./player-card"
import { PositionFilter } from "./position-filter"
import { TeamSummary } from "./team-summary"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TransferMarketProps {
  players: Player[]
}

const BUDGET = 100 // 100M budget
const MAX_PLAYERS = 15

type SortOption = "precio-asc" | "precio-desc" | "puntos-desc" | "nombre-asc"

export function TransferMarket({ players }: TransferMarketProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("puntos-desc")

  const positions = useMemo(() => {
    const posSet = new Set(players.map(p => p.posicion))
    return Array.from(posSet).sort()
  }, [players])

  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = players

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by position
    if (selectedPosition) {
      filtered = filtered.filter(p => p.posicion === selectedPosition)
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "precio-asc":
          return a.precio - b.precio
        case "precio-desc":
          return b.precio - a.precio
        case "puntos-desc":
          return b.puntos_totales - a.puntos_totales
        case "nombre-asc":
          return a.nombre.localeCompare(b.nombre)
        default:
          return 0
      }
    })

    return sorted
  }, [players, searchQuery, selectedPosition, sortBy])

  const handleToggleSelect = (player: Player) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.some(p => p.id === player.id)
      if (isSelected) {
        return prev.filter(p => p.id !== player.id)
      }
      if (prev.length >= MAX_PLAYERS) {
        return prev
      }
      return [...prev, player]
    })
  }

  const handleRemovePlayer = (playerId: number) => {
    setSelectedPlayers(prev => prev.filter(p => p.id !== playerId))
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 text-balance">
            Mercado de Pases
          </h1>
          <p className="text-muted-foreground">
            Arma tu equipo de fantasy seleccionando {MAX_PLAYERS} jugadores con un presupuesto de ${BUDGET}M
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          {/* Search and Sort Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar jugador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-48 bg-input border-border">
                <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="puntos-desc">Mayor Puntos</SelectItem>
                <SelectItem value="precio-desc">Mayor Precio</SelectItem>
                <SelectItem value="precio-asc">Menor Precio</SelectItem>
                <SelectItem value="nombre-asc">Nombre A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Position Filter */}
          <PositionFilter
            positions={positions}
            selectedPosition={selectedPosition}
            onSelect={setSelectedPosition}
          />
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAndSortedPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              isSelected={selectedPlayers.some(p => p.id === player.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>

        {filteredAndSortedPlayers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No se encontraron jugadores con esos filtros
            </p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 shrink-0">
        <TeamSummary
          selectedPlayers={selectedPlayers}
          budget={BUDGET}
          maxPlayers={MAX_PLAYERS}
          onRemovePlayer={handleRemovePlayer}
        />
      </div>
    </div>
  )
}
