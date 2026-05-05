"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Trophy, CheckCircle2, AlertCircle } from "lucide-react"

interface Partido {
  id: string
  local: string
  visitante: string
  fecha_numero: number
}

interface ProdeFormProps {
  partidos: Partido[]
  userId: string | undefined
}

export function ProdeForm({ partidos, userId }: ProdeFormProps) {
  const supabase = createClient()
  const [votos, setVotos] = useState<Record<string, { ganador: string; margen: string }>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSelection = (partidoId: string, field: 'ganador' | 'margen', value: string) => {
    setVotos(prev => ({
      ...prev,
      [partidoId]: { ...prev[partidoId], [field]: value }
    }))
  }

  const isComplete = partidos.length > 0 && partidos.every(p => votos[p.id]?.ganador && votos[p.id]?.margen)

  const handleSubmit = async () => {
    if (!userId) return
    setStatus('loading')

    try {
      // Preparamos los datos para insertar en masa (upsert)
      const dataToInsert = partidos.map(p => ({
        user_id: userId,
        partido_id: p.id,
        ganador_elegido: votos[p.id].ganador,
        margen_elegido: votos[p.id].margen
      }))

      const { error } = await supabase
        .from('pronosticos_prode')
        .upsert(dataToInsert, { onConflict: 'user_id, partido_id' })

      if (error) throw error
      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-10 p-12 border border-[#deff9a]/20 bg-[#deff9a]/5 rounded-[40px] text-center">
        <CheckCircle2 className="w-16 h-16 text-[#deff9a] mx-auto mb-6" />
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">¡Pronóstico Guardado!</h2>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">
          Road to 500 seguidores para activar el ranking
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {partidos.map((partido) => (
        <div key={partido.id} className="bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-md">
          {/* Equipos */}
          <div className="flex justify-between items-center mb-8 px-2">
            <div className="flex-1">
              <p className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-none">{partido.local}</p>
            </div>
            <div className="px-4">
              <span className="text-[#deff9a] font-black italic text-xs bg-[#deff9a]/10 px-2 py-1 rounded">VS</span>
            </div>
            <div className="flex-1 text-right">
              <p className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-none">{partido.visitante}</p>
            </div>
          </div>

          {/* Selector de Ganador */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {(['L', 'E', 'V'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelection(partido.id, 'ganador', opt)}
                className={`py-4 rounded-xl font-black italic text-sm transition-all duration-200 ${
                  votos[partido.id]?.ganador === opt 
                  ? "bg-[#deff9a] text-black scale-[1.02] shadow-[0_0_20px_rgba(222,255,154,0.2)]" 
                  : "bg-white/5 text-gray-500 hover:bg-white/10 border border-white/5"
                }`}
              >
                {opt === 'L' ? 'LOCAL' : opt === 'E' ? 'EMPATE' : 'VISITA'}
              </button>
            ))}
          </div>

          {/* Selector de Margen */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">Margen de victoria</p>
            <div className="flex-1 grid grid-cols-4 gap-2">
              {['1-7', '8-15', '16-25', '+25'].map((m) => (
                <button
                  key={m}
                  onClick={() => handleSelection(partido.id, 'margen', m)}
                  className={`py-2 rounded-lg text-[10px] font-bold transition-all ${
                    votos[partido.id]?.margen === m 
                    ? "bg-white text-black" 
                    : "bg-white/5 text-gray-600 border border-white/5 hover:text-gray-400"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Botón de Acción */}
      <div className="pt-6">
        <button
          disabled={!isReady || status === 'loading'}
          onClick={handleSubmit}
          className={`w-full py-8 rounded-[32px] font-black italic text-2xl tracking-tighter transition-all duration-300 ${
            isReady && status !== 'loading'
            ? "bg-[#deff9a] text-black shadow-[0_0_40px_rgba(222,255,154,0.3)] hover:scale-[1.01]" 
            : "bg-white/5 text-white/10 cursor-not-allowed"
          }`}
        >
          {status === 'loading' ? "PROCESANDO..." : "ENVIAR PRONÓSTICOS"}
        </button>
        
        {!isReady && (
          <p className="text-center mt-4 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
            Completa todos los partidos para enviar
          </p>
        )}
      </div>
    </div>
  )
}