"use client"



import { useState } from "react"

import { MainHeader } from "@/components/main-header"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { Trophy, Plus, Users, X } from "lucide-react"
import { useState, useEffect } from "react" // <--- Agregá useEffect
import { Trophy, Plus, Users, X, Star } from "lucide-react" // <--- Agregá Star
import { createClient } from "@/lib/supabase/client" // <--- Importá tu cliente


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

  const [showCreateModal, setShowCreateModal] = useState(false)

  const [showJoinModal, setShowJoinModal] = useState(false)

  const [newLeagueName, setNewLeagueName] = useState("")

  const [joinCode, setJoinCode] = useState("")



  const handleCreateLeague = () => {

    if (newLeagueName.trim()) {

      // TODO: Create league via API

      alert(`Liga "${newLeagueName}" creada!`)

      setNewLeagueName("")

      setShowCreateModal(false)

    }

  }



  const handleJoinLeague = () => {

    if (joinCode.trim()) {

      // TODO: Join league via API

      alert(`Unido a la liga con codigo: ${joinCode}`)

      setJoinCode("")

      setShowJoinModal(false)

    }

  }



  return (

    <div className="min-h-screen bg-white">

      <MainHeader />

      

      <main className="max-w-4xl mx-auto px-4 py-6">

        <h1 className="font-display text-3xl md:text-4xl mb-8 tracking-tight text-black italic">TUS LIGAS</h1>



        {/* Create / Join buttons */}

        <div className="grid grid-cols-2 gap-4 mb-8">

          <Button 

            onClick={() => setShowCreateModal(true)}

            className="h-14 bg-black text-white hover:bg-gray-800 font-bold tracking-wider"

          >

            <Plus className="w-5 h-5 mr-2" />

            CREAR LIGA

          </Button>

          <Button 

            onClick={() => setShowJoinModal(true)}

            variant="outline"

            className="h-14 border-2 border-black text-black hover:bg-black hover:text-white font-bold tracking-wider"

          >

            <Users className="w-5 h-5 mr-2" />

            UNIRSE

          </Button>

        </div>



        {/* Leagues list */}

        <div className="space-y-3">

          {leagues.map((league) => (

            <button

              key={league.id}

              onClick={() => setSelectedLeague(league)}

              className="w-full flex items-center justify-between p-4 bg-white border border-black hover:bg-gray-100 transition-colors text-left"

            >

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 bg-black text-white flex items-center justify-center">

                  <Trophy className="w-6 h-6" />

                </div>

                <div>

                  <p className="font-bold text-sm uppercase tracking-wide">{league.name}</p>

                  <p className="text-xs text-gray-500">Codigo: {league.code}</p>

                </div>

              </div>

              <div className="flex items-center gap-1 text-gray-500">

                <Users className="w-4 h-4" />

                <span className="text-sm font-bold">{league.members}</span>

              </div>

            </button>

          ))}

        </div>



        {/* Create League Modal */}

        {showCreateModal && (

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div

              className="absolute inset-0 bg-black/80 backdrop-blur-sm"

              onClick={() => setShowCreateModal(false)}

            />

            <div className="relative w-full max-w-md bg-white border border-black">

              <div className="flex items-center justify-between p-4 border-b border-black bg-black text-white">

                <h2 className="font-display text-lg tracking-tight">CREAR LIGA</h2>

                <button

                  onClick={() => setShowCreateModal(false)}

                  className="p-2 hover:bg-gray-800 transition-colors"

                >

                  <X className="w-5 h-5" />

                </button>

              </div>

              <div className="p-4 space-y-4">

                <div>

                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Nombre de la liga</label>

                  <Input

                    placeholder="Ej: Los Pumas Fantasy"

                    value={newLeagueName}

                    onChange={(e) => setNewLeagueName(e.target.value)}

                    className="h-12 border-black"

                  />

                </div>

                <Button 

                  onClick={handleCreateLeague}

                  className="w-full h-12 bg-black text-white hover:bg-gray-800 font-bold tracking-wider"

                >

                  CREAR LIGA

                </Button>

              </div>

            </div>

          </div>

        )}



        {/* Join League Modal */}

        {showJoinModal && (

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div

              className="absolute inset-0 bg-black/80 backdrop-blur-sm"

              onClick={() => setShowJoinModal(false)}

            />

            <div className="relative w-full max-w-md bg-white border border-black">

              <div className="flex items-center justify-between p-4 border-b border-black bg-black text-white">

                <h2 className="font-display text-lg tracking-tight">UNIRSE A LIGA</h2>

                <button

                  onClick={() => setShowJoinModal(false)}

                  className="p-2 hover:bg-gray-800 transition-colors"

                >

                  <X className="w-5 h-5" />

                </button>

              </div>

              <div className="p-4 space-y-4">

                <div>

                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">Codigo de la liga</label>

                  <Input

                    placeholder="Ej: PUMAS24"

                    value={joinCode}

                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}

                    className="h-12 border-black uppercase"

                  />

                </div>

                <Button 

                  onClick={handleJoinLeague}

                  className="w-full h-12 bg-black text-white hover:bg-gray-800 font-bold tracking-wider"

                >

                  UNIRSE

                </Button>

              </div>

            </div>

          </div>

        )}



        {/* League ranking modal */}

        {selectedLeague && (

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            <div

              className="absolute inset-0 bg-black/80 backdrop-blur-sm"

              onClick={() => setSelectedLeague(null)}

            />

            <div className="relative w-full max-w-lg bg-white border border-black max-h-[80vh] overflow-hidden flex flex-col">

              {/* Modal header */}

              <div className="flex items-center justify-between p-4 border-b border-black bg-black text-white">

                <div>

                  <h2 className="font-display text-xl tracking-tight">{selectedLeague.name}</h2>

                  <p className="text-xs text-gray-400">Ranking de la liga</p>

                </div>

                <button

                  onClick={() => setSelectedLeague(null)}

                  className="p-2 hover:bg-gray-800 transition-colors"

                >

                  <X className="w-5 h-5" />

                </button>

              </div>



              {/* Ranking table */}

              <div className="flex-1 overflow-y-auto">

                <table className="w-full">

                  <thead className="sticky top-0 bg-black text-white">

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

                        className="border-b border-gray-200 hover:bg-gray-100 transition-colors"

                      >

                        <td className="p-3">

                          <span className={`font-bold ${rank.position === 1 ? "text-black" : "text-gray-500"}`}>

                            {rank.position === 1 && (

                              <Trophy className="w-4 h-4 inline mr-1" />

                            )}

                            {rank.position}

                          </span>

                        </td>

                        <td className="p-3">

                          <p className="font-medium text-sm text-black">{rank.team}</p>

                          <p className="text-xs text-gray-500">{rank.manager}</p>

                        </td>

                        <td className="p-3 text-right font-medium text-sm">{rank.lastWeek}</td>

                        <td className="p-3 text-right font-bold text-black">{rank.total}</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}
      {/* --- COMIENZO RANKING GENERAL REAL --- */}
        <div className="mt-12 mb-8 flex items-center gap-2">
          <Star className="w-6 h-6 fill-black" />
          <h2 className="font-display text-2xl italic uppercase">Ranking General</h2>
        </div>

        <div className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white text-[10px] uppercase tracking-widest">
                <th className="p-3 w-12 text-center">Pos</th>
                <th className="p-3">Equipo</th>
                <th className="p-3 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {rankingGeneral.map((item) => (
                <tr key={item.position} className="border-b border-black last:border-0 hover:bg-gray-50">
                  <td className={`p-3 text-center font-display text-xl italic ${item.position <= 3 ? 'bg-yellow-400' : ''}`}>
                    #{item.position}
                  </td>
                  <td className="p-3 font-bold text-sm uppercase italic">
                    {item.team || "Sin nombre"}
                  </td>
                  <td className="p-3 text-right font-display text-2xl">
                    {item.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* --- FIN RANKING GENERAL REAL --- */}
      </main>

    </div>

  )

}
