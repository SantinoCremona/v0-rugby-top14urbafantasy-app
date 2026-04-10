"use client"

import { useState, useEffect } from "react" // Importamos useEffect
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Loader2 } from "lucide-react"

export default function UpdatePasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)

  // ESTE ES EL CAMBIO CLAVE: Intercambiar el código de la URL por una sesión
  useEffect(() => {
    const exchangeCodeForSession = async () => {
      // Buscamos el ?code= en la URL
      const query = new URLSearchParams(window.location.search)
      const code = query.get("code")

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          alert("El enlace ha expirado o es inválido. Pedí uno nuevo.")
          router.push("/")
        }
      }
      setVerifying(false)
    }

    exchangeCodeForSession()
  }, [supabase, router])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Ahora que el useEffect ya hizo el "exchange", esto va a funcionar
    const { error } = await supabase.auth.updateUser({ 
      password: newPassword 
    })

    if (error) {
      alert("Error al actualizar: " + error.message)
    } else {
      alert("¡Contraseña actualizada con éxito! Ya podés entrar.")
      // Cerramos sesión para limpiar el estado y mandamos al login
      await supabase.auth.signOut()
      router.push("/")
    }
    setLoading(false)
  }

  // Mientras verifica el código, mostramos un estado de carga sutil
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
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <Input 
              type="password" 
              required
              placeholder="NUEVA CONTRASEÑA" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-16 bg-white/5 border-white/10 rounded-2xl pl-12 font-bold focus:border-emerald-500 transition-all uppercase"
            />
          </div>
          <Button 
            type="submit"
            disabled={loading} 
            className="w-full h-16 rounded-2xl bg-emerald-500 text-black font-black italic uppercase text-lg hover:bg-emerald-400 transition-all shadow-xl"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "ACTUALIZAR Y ENTRAR"}
          </Button>
        </form>
      </div>
    </div>
  )
}
