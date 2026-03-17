"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Calendar, MapPin, Loader2 } from "lucide-react"

interface Match {
  local: string
  visitante: string
  horario: string
  cancha: string
}

export function FixtureCard() {
  const supabase = createClient()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFixture() {
      // Aquí podrías filtrar por la fecha actual que desees
      const { data, error } = await supabase
        .from('fixture')
        .select('*')
        .eq('fecha_num', 1) 
        .order('horario', { ascending: true });

      if (data) setMatches(data);
      setLoading(false);
    }
    fetchFixture();
  }, []);

  if (loading) return (
    <div className="bg-[#141416] border border-white/10 rounded-[32px] p-12 flex justify-center">
      <Loader2 className="animate-spin text-white/20" />
    </div>
  );

  return (
    <div className="bg-[#141416] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
      <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Próximos Partidos</h3>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {matches.map((match, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex-1 text-right pr-3 text-xs font-black italic uppercase">{match.local}</div>
            <div className="flex flex-col items-center px-3 border-x border-white/5 min-w-[60px]">
              <span className="text-[7px] font-black text-gray-600">VS</span>
              <span className="text-[9px] font-black text-white/40">{match.horario}</span>
            </div>
            <div className="flex-1 text-left pl-3 text-xs font-black italic uppercase">{match.visitante}</div>
          </div>
        ))}
      </div>
    </div>
  )
}