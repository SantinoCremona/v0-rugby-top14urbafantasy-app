"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Loader2, AlertCircle } from "lucide-react"

export default function UpdatePasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      // 1. Intentamos ver si ya hay una sesión activa (por el link del mail)
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        // 2. Si no hay sesión, intentamos canjear el código de la URL manualmente
        const query = new URLSearchParams(window.location.search)
        const code = query.get("code")
        
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            setErrorMsg("El enlace expiró o ya fue usado. Pedí uno nuevo.")
          }
        } else {
          setErrorMsg("No se encontró un código de acceso válido.")
        }
      }
      setVerifying(false)
    }

    checkSession()
  }, [supabase])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres")
        return
    }

    setLoading(true)
    setErrorMsg(null)

    const { error } = await supabase.auth.updateUser({ 
      password: newPassword 
    })

    if (error) {
      setErrorMsg("Error al actualizar: " + error.message)
    } else {
      alert("¡Contraseña actualizada! Ya podés iniciar sesión.")
      await supabase.auth.signOut()
      router.push("/")
    }
    setLoading(false)
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/[0.02] border border-white/10 p-10 rounded-[40px] shadow-2xl text-center">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-8">
          Nueva <span className="text-white/20">Clave</span>
        </h1>
        
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-500 text-sm text-left">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <Input 
              type="password" 
              required
              placeholder="ELEGÍ TU NUEVA CLAVE" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-16 bg-white/5 border-white/10 rounded-2xl pl-12 font-bold focus:border-emerald-500 transition-all uppercase"
            />
          </div>
          <Button 
            type="submit"
            disabled={loading || !!errorMsg} 
            className="w-full h-16 rounded-2xl bg-emerald-500 text-black font-black italic uppercase text-lg hover:bg-emerald-400 transition-all shadow-xl"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "CAMBIAR CONTRASEÑA"}
          </Button>
          
          {errorMsg && (
            <Button 
                variant="ghost" 
                onClick={() => router.push('/')}
                className="text-white/40 hover:text-white"
            >
                VOLVER AL INICIO
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}
