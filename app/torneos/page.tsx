"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Plus, Users, X } from "lucide-react"

interface League {
  id: string
  name: string
  code: string
  members: number
}

interface LeagueRanking {
  position: number
  team: string
  manager: string
  lastWeek: number
  total: number
}

const mockLeagues: League[] = [
  { id: "1", name: "Los Pumas Fantasy", code: "PUMAS24", members: 12 },
  { id: "2", name: "Rugby Bros", code: "RBROS99", members: 8 },
  { id: "3", name: "URBA Elite", code: "ELITE01", members: 24 },
]

const mockRankings: LeagueRanking[] = [
  { position: 1, team: "Los Wallabies", manager: "Juan P.", lastWeek: 87, total: 542 },
  { position: 2, team: "Try Hard FC", manager: "Martin G.", lastWeek: 72, total: 528 },
  { position: 3, team: "Scrum Masters", manager: "Diego L.", lastWeek: 68, total: 515 },
  { position: 4, team: "Line Out Kings", manager: "Pablo R.", lastWeek: 81, total: 498 },
  { position: 5, team: "Tackle Titans", manager: "Lucas M.", lastWeek: 65, total: 487 },
]

export default function TorneosPage() {
  const [leagues] = useState<League[]>(mockLeagues)
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null)
  const [newLeagueName, setNewLeagueName] = useState("")
  const [joinCode, setJoinCode] = useState("")

  const handleCreateLeague = () => {
    if (newLeagueName.trim()) {
      // TODO: Create league via API
      setNewLeagueName("")
    }
  }

  const handleJoinLeague = () => {
    if (joinCode.trim()) {
      // TODO: Join league via API
      setJoinCode("")
    }
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl mb-8 tracking-tight">TUS LIGAS</h1>

        {/* Create / Join section */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Create League */}
          <div className="bg-muted p-4 border border-border">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-3">Crear Liga</h3>
            <div className="flex gap-2">
              <Input
                placeholder="NOMBRE DE LA LIGA"
                value={newLeagueName}
                onChange={(e) => setNewLeagueName(e.target.value)}
                className="flex-1 h-10 text-sm tracking-wider"
              />
              <Button onClick={handleCreateLeague} className="h-10 px-4">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Join League */}
          <div className="bg-muted p-4 border border-border">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-3">Unirse a Liga</h3>
            <div className="flex gap-2">
              <Input
                placeholder="CODIGO DE LIGA"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="flex-1 h-10 text-sm tracking-wider uppercase"
              />
              <Button onClick={handleJoinLeague} className="h-10 px-4">
                UNIRSE
              </Button>
            </div>
          </div>
        </div>

        {/* Leagues list */}
        <div className="space-y-3">
          {leagues.map((league) => (
            <button
              key={league.id}
              onClick={() => setSelectedLeague(league)}
              className="w-full flex items-center justify-between p-4 bg-muted border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-card flex items-center justify-center border border-border">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">{league.name}</p>
                  <p className="text-xs text-muted-foreground">Codigo: {league.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-sm">{league.members}</span>
              </div>
            </button>
          ))}
        </div>

        {/* League ranking modal */}
        {selectedLeague && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setSelectedLeague(null)}
            />
            <div className="relative w-full max-w-lg bg-background border border-border max-h-[80vh] overflow-hidden flex flex-col">
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h2 className="font-display text-xl tracking-tight">{selectedLeague.name}</h2>
                  <p className="text-xs text-muted-foreground">Ranking de la liga</p>
                </div>
                <button
                  onClick={() => setSelectedLeague(null)}
                  className="p-2 hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Ranking table */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-card text-card-foreground">
                    <tr className="text-xs uppercase tracking-wider">
                      <th className="text-left p-3 font-bold">#</th>
                      <th className="text-left p-3 font-bold">Equipo</th>
                      <th className="text-right p-3 font-bold">Ult.</th>
                      <th className="text-right p-3 font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockRankings.map((rank) => (
                      <tr
                        key={rank.position}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-3">
                          <span className={`font-bold ${rank.position === 1 ? "text-foreground" : "text-muted-foreground"}`}>
                            {rank.position === 1 && (
                              <Trophy className="w-4 h-4 inline mr-1" />
                            )}
                            {rank.position}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-sm">{rank.team}</p>
                          <p className="text-xs text-muted-foreground">{rank.manager}</p>
                        </td>
                        <td className="p-3 text-right font-medium text-sm">{rank.lastWeek}</td>
                        <td className="p-3 text-right font-bold">{rank.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
