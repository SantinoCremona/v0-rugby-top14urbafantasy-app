"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PartidoProde, VotoProde } from "@/types/prode"
import { CheckCircle2, Loader2 } from "lucide-react"

export function ProdeForm({ partidos, userId }: { partidos: PartidoProde[], userId?: string }) {
  const supabase = createClient()
  const [votos, setVotos] = useState<Record<string, VotoProde>>({})
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSelect = (id: string, key: keyof VotoProde, val: any) => {
    setVotos(prev => ({ ...prev, [id]: { ...prev[id], [key]: val } }))
  }

  const completo = partidos.length > 0 && partidos.every(p => votos[p.id]?.ganador && votos[p.id]?.margen)

  const enviar = async () => {
    if (!userId || !completo) return
    setLoading(true)
    
    const payload = partidos.map(p => ({
      user_id: userId,
      partido_id: p.id,
      ganador_elegido: votos[p.id].ganador,
      margen_elegido: votos[p.id].margen
    }))

    const { error } = await supabase.from('pronosticos_prode').upsert(payload, { onConflict: 'user_id, partido_id' })

    if (error) {
      console.error(error)
      alert("Error al subir. Probá de nuevo.")
    } else {
      setEnviado(true)
    }
    setLoading(false)
  }

  if (enviado) return (
    <div className="py-20 text-center border border-[#deff9a]/20 bg-[#deff9a]/5 rounded-[40px]">
      <CheckCircle2 className="w-16 h-16 text-[#deff9a] mx-auto mb-4" />
      <h2 className="text-4xl font-black italic uppercase tracking-tighter">Pronóstico enviado</h2>
      <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-2">Sumamos tus puntos el lunes</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {partidos.map(p => (
        <div key={p.id} className="bg-white/5 border border-white/10 rounded-[32px] p-8">
          <div className="flex justify-between items-center mb-8 font-black italic text-2xl uppercase tracking-tighter">
            <span>{p.local}</span>
            <span className="text-[#deff9a] text-xs">VS</span>
            <span>{p.visitante}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {(['L', 'E', 'V'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => handleSelect(p.id, 'ganador', opt)}
                className={`py-4 rounded-xl font-black italic transition-all ${votos[p.id]?.ganador === opt ? "bg-[#deff9a] text-black" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}
              >
                {opt === 'L' ? 'LOCAL' : opt === 'E' ? 'EMPATE' : 'VISITA'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Margen</span>
            <div className="flex-1 grid grid-cols-4 gap-2">
              {['1-7', '8-15', '16-25', '+25'].map(m => (
                <button
                  key={m}
                  onClick={() => handleSelect(p.id, 'margen', m)}
                  className={`py-2 rounded-lg text-[10px] font-black ${votos[p.id]?.margen === m ? "bg-white text-black" : "bg-white/5 text-gray-600 border border-white/5"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button
        disabled={!completo || loading}
        onClick={enviar}
        className={`w-full py-8 rounded-[32px] font-black italic text-2xl transition-all ${completo && !loading ? "bg-[#deff9a] text-black shadow-[0_0_40px_rgba(222,255,154,0.2)]" : "bg-white/5 text-white/10"}`}
      >
        {loading ? <Loader2 className="animate-spin mx-auto" /> : "ENVIAR PRONÓSTICOS"}
      </button>
    </div>
  )
}