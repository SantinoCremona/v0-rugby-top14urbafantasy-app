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
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Verificamos que el usuario venga de un link válido de recuperación
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert("El link es inválido o expiró. Por favor, pedí uno nuevo.")
        router.push("/recuperar")
      } else {
        setIsAuthorized(true)
      }
    }
    checkSession()
  }, [supabase, router])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("¡Contraseña actualizada con éxito! Ya podés entrar.")
      router.push("/")
    }
    setLoading(false)
  }

  if (!isAuthorized) return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/[0.02] border border-white/10 p-10 rounded-[40px] shadow-2xl text-center">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none">
          Nueva <span className="text-white/20">Clave</span>
        </h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8">
          Elegí una contraseña segura para tu cuenta de Headcoach.
        </p>

        <form onSubmit={handleUpdate} className="space-y-6 text-left">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <Input 
              type="password" 
              required
              placeholder="CONTRASEÑA (MIN. 6 CARACT.)" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-16 bg-white/5 border-white/10 rounded-2xl pl-12 font-bold focus:border-emerald-500 transition-all text-white placeholder:text-gray-700"
            />
          </div>
          <Button disabled={loading} className="w-full h-16 rounded-2xl bg-emerald-500 text-black font-black italic uppercase text-lg hover:bg-emerald-400 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)]">
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "ACTUALIZAR Y ENTRAR"}
          </Button>
        </form>
      </div>
    </div>
  )
}
