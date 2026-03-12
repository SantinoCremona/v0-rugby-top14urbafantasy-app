"use client"

import { Button } from "@/components/ui/button"

interface PositionFilterProps {
  positions: string[]
  selectedPosition: string | null
  onSelect: (position: string | null) => void
}

export function PositionFilter({ positions, selectedPosition, onSelect }: PositionFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedPosition === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelect(null)}
        className={selectedPosition === null 
          ? "bg-primary text-primary-foreground" 
          : "border-border text-foreground hover:bg-secondary"
        }
      >
        Todos
      </Button>
      {positions.map((position) => (
        <Button
          key={position}
          variant={selectedPosition === position ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(position)}
          className={selectedPosition === position 
            ? "bg-primary text-primary-foreground" 
            : "border-border text-foreground hover:bg-secondary"
          }
        >
          {position}
        </Button>
      ))}
    </div>
  )
}
