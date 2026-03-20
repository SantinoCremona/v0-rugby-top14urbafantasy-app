"use client"

import { useState, useEffect } from "react"
import { Timer, Lock } from "lucide-react"

export function MarketTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [isClosed, setIsClosed] = useState(false)

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date()
      const target = new Date()

      // Buscamos el próximo Viernes (5) a las 20:00:00
      target.setDate(now.getDate() + ((5 + 7 - now.getDay()) % 7))
      target.setHours(20, 0, 0, 0)

      // Si ya pasó el viernes de esta semana, apuntamos al del próximo
      if (now > target) {
        target.setDate(target.getDate() + 7)
      }

      const difference = target.getTime() - now.getTime()

      if (difference <= 0) {
        setIsClosed(true)
      } else {
        setIsClosed(false)
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    const timer = setInterval(calculateTime, 1000)
    calculateTime()

    return () => clearInterval(timer)
  }, [])

  if (isClosed) {
    return (
      <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-2xl">
        <Lock className="w-4 h-4 text-rose-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest italic">Mercado Cerrado</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.05)]">
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-none mb-1">Cierre de Mercado</span>
        <div className="flex items-center gap-1.5">
          <Timer className="w-4 h-4 text-emerald-400" />
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black italic text-white leading-none">
              {timeLeft.days > 0 && `${timeLeft.days}d `}
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}