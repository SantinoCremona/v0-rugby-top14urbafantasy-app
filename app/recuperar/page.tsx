"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle2, Loader2, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function RecuperarPage() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // IMPORTANTE: El redirectTo debe apuntar a tu página de actualización
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/actualizar-contrasena`,
    })

    if (error) {
      alert("Error: " + error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/[0.02] border border-white/10 p-10 rounded-[40px] shadow-2xl text-center">
        <Link href="/login" className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-white mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Volver al Login
        </Link>

        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none">
          Recuperar <span className="text-white/20">Acceso</span>
        </h1>

        {!sent ? (
          <form onSubmit={handleReset} className="space-y-6 text-left">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed text-center">
              Ingresá tu mail y te mandaremos un link para resetear tu XV.
            </p>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <Input 
                type="email" 
                required
                placeholder="TU@MAIL.COM" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-16 bg-white/5 border-white/10 rounded-2xl pl-12 font-bold focus:border-emerald-500 transition-all uppercase placeholder:text-gray-700"
              />
            </div>
            <Button disabled={loading} className="w-full h-16 rounded-2xl bg-white text-black font-black italic uppercase text-lg hover:bg-emerald-500 transition-all shadow-xl">
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "ENVIAR LINK"}
            </Button>
          </form>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300 py-10">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <p className="text-white font-bold uppercase tracking-widest text-sm">
              ¡Mail enviado!<br/>
              <span className="text-gray-500 text-xs">Revisá tu bandeja de entrada y spam.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
